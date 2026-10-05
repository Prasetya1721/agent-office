// ============================================
// AgentOffice - 3D Agent Character (Funko Pop Style)
// Oversized glossy-vinyl head, squat barrel torso,
// stubby limbs & moulded hair — collectible vinyl look.
// ============================================
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import type { Agent } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DECK_Y, LOUNGER_SEAT_TOP } from './OfficeRoom';

interface AgentCharacterProps {
  agent: Agent;
  basePosition: [number, number, number];
  baseRotationY: number;
  isSelected: boolean;
}

const STATUS_TAGS: Record<string, string> = {
  idle: 'standby',
  thinking: 'analisis...',
  working: 'mengetik...',
  discussing: 'diskusi tim',
  done: 'selesai',
  error: 'butuh bantuan',
};

const PANTS = '#2f3a4d';
const BOOT = '#1b2432';
const INK = '#101827';

/**
 * Hair is NOT `avatar.accentColor` — that field is a near-white 100-200 pastel
 * tint (e.g. #fef3c7 cream), so feeding it straight into `Hair` painted every
 * one of the nine agents with washed-out, nearly identical white-blonde hair.
 * Each agent's hair is instead derived from its own `bodyColor`, deepened
 * toward this warm near-black so it reads as actual hair while still keeping
 * a trace of the agent's hue (amber agent -> deep amber hair, and so on).
 */
const HAIR_BASE = '#241c18';
const HAIR_DEPTH = 0.38;

/** Mix two #rrggbb colours; `amount` = 0 -> a, 1 -> b. */
function mixHex(a: string, b: string, amount: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255;
  const ag = (pa >> 8) & 255;
  const ab = pa & 255;
  const br = (pb >> 16) & 255;
  const bg = (pb >> 8) & 255;
  const bb = pb & 255;
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
}

/**
 * Legs stay in the SAME family as the torso so the collectible reads as one
 * figure: trousers are the body colour only slightly deepened (~12%) and the
 * boots a modest step darker (~35%) — never a different hue, so the legs never
 * look like they belong to another toy.
 */
function legColors(bodyColor: string): { pants: string; boot: string } {
  return {
    pants: mixHex(bodyColor, PANTS, 0.12),
    boot: mixHex(bodyColor, BOOT, 0.35),
  };
}

// ------------------------------------------------------------------
// FACING CONVENTION (must match AGENT_CONFIGS / OfficeRoom furniture)
// The model's FRONT is +Z: face features (eyes, nose, smile, glasses)
// and the boots' toes all point toward +Z. Every seat rotationY in
// AGENT_CONFIGS / the zone maps is interpreted with rotY = 0 -> +Z,
// rotY = PI -> -Z. Inside a desk pod the chair sits at local +Z while
// the desk/monitors sit at local 0 (behind the seat), so workstation
// agents use rotY = PI to look AT their screens.
// ------------------------------------------------------------------

/** Funko proportion: the oversized head is ~40% of total figure height. */
const HEAD_R = 0.285;
const EYE_X = 0.098;
const EYE_Y = -0.015;

type HairStyle = 'crop' | 'buzz' | 'long' | 'bun' | 'spiky' | 'beanie';

interface Look {
  hair: HairStyle;
  glasses: boolean;
  hatColor?: string;
}

/** Per-agent silhouette so every collectible reads differently. */
const LOOKS: Record<string, Look> = {
  'lead-engineer': { hair: 'crop', glasses: true },
  'ui-ux-designer': { hair: 'long', glasses: false },
  'frontend-dev': { hair: 'crop', glasses: true },
  'backend-dev': { hair: 'buzz', glasses: true },
  debugger: { hair: 'beanie', glasses: false, hatColor: '#b91c1c' },
  'qa-tester': { hair: 'spiky', glasses: false },
  'product-manager': { hair: 'bun', glasses: false },
  researcher: { hair: 'long', glasses: false },
  'writer-docs': { hair: 'crop', glasses: false },
};

const DEFAULT_LOOK: Look = { hair: 'crop', glasses: false };

/** Tuft layout for the spiky style: [x, y, z, rotX, rotZ] */
const SPIKES: [number, number, number, number, number][] = [
  [-0.16, 0.19, -0.1, 0.3, -0.24],
  [0.16, 0.19, -0.1, 0.3, 0.24],
  [-0.05, 0.22, 0.06, -0.1, -0.42],
  [0.05, 0.22, 0.05, -0.14, 0.42],
];


/** Glossy PVC finish shared by every part of the collectible. */
function Vinyl({
  color,
  gloss = 0.85,
  rough = 0.34,
  emissive = '#000000',
  emissiveIntensity = 0,
}: {
  color: string;
  gloss?: number;
  rough?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={rough}
      metalness={0}
      clearcoat={gloss}
      clearcoatRoughness={0.14}
      reflectivity={0.4}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

/** Moulded hair / headwear clipped over the skull. */
function Hair({ style, color, hatColor }: { style: HairStyle; color: string; hatColor?: string }) {
  const cap = (theta: number, radius = 0.305) => (
    <mesh castShadow>
      <sphereGeometry args={[radius, 32, 20, 0, Math.PI * 2, 0, theta]} />
      <Vinyl color={color} rough={0.45} />
    </mesh>
  );

  return (
    <group>
      {style === 'beanie' ? (
        <>
          {cap(1.5, 0.312)}
          {/* rolled brim */}
          <mesh position={[0, 0.055, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.305, 0.075, 32]} />
            <Vinyl color={hatColor ?? color} rough={0.55} />
          </mesh>
          {/* pom */}
          <mesh position={[0, 0.27, 0]} castShadow>
            <sphereGeometry args={[0.072, 20, 16]} />
            <Vinyl color={hatColor ?? color} rough={0.6} />
          </mesh>
          {/* sideburn peeking below the brim */}
          {[-0.255, 0.255].map((x) => (
            <mesh key={x} position={[x, -0.05, 0.02]} scale={[0.42, 1, 0.85]} castShadow>
              <sphereGeometry args={[0.28, 20, 16]} />
              <Vinyl color={color} rough={0.45} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {cap(style === 'buzz' ? 1.02 : style === 'spiky' ? 1.08 : 1.18)}
          {style === 'spiky' &&
            SPIKES.map(([x, y, z, rx, rz], i) => (
              <mesh key={`spike-${i}`} position={[x, y, z]} rotation={[rx, 0, rz]} castShadow>
                <coneGeometry args={[0.058, 0.15, 14]} />
                <Vinyl color={color} rough={0.45} />
              </mesh>
            ))}
          {style === 'long' && (
            <group>
              {/* back panel */}
              <mesh position={[0, -0.13, -0.2]} scale={[1, 1, 0.62]} castShadow>
                <sphereGeometry args={[0.3, 28, 20]} />
                <Vinyl color={color} rough={0.45} />
              </mesh>
              {/* side curtains framing the face */}
              {[-0.245, 0.245].map((x) => (
                <RoundedBox args={[0.095, 0.33, 0.22]} radius={0.045} position={[x, -0.12, -0.02]} castShadow>
                  <Vinyl color={color} rough={0.45} />
                </RoundedBox>
              ))}
            </group>
          )}
          {style === 'bun' && (
            <mesh position={[0, 0.1, -0.28]} castShadow>
              <sphereGeometry args={[0.115, 22, 16]} />
              <Vinyl color={color} rough={0.45} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

/** Wire-frame glasses — the signature collectible accessory. */
function Glasses() {
  const lens = (x: number) => (
    <group key={`lens-${x}`}>
      <mesh position={[x, EYE_Y, HEAD_R - 0.023]}>
        <torusGeometry args={[0.062, 0.008, 8, 24]} />
        <Vinyl color={INK} gloss={1} rough={0.16} />
      </mesh>
      <mesh position={[x, EYE_Y, HEAD_R - 0.017]}>
        <circleGeometry args={[0.058, 20]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.14} roughness={0.05} side={2} />
      </mesh>
    </group>
  );
  return (
    <group>
      {lens(-EYE_X)}
      {lens(EYE_X)}
      {/* bridge */}
      <mesh position={[0, EYE_Y + 0.006, HEAD_R - 0.023]}>
        <boxGeometry args={[0.058, 0.009, 0.009]} />
        <Vinyl color={INK} gloss={1} rough={0.16} />
      </mesh>
      {/* temples */}
      {[-0.175, 0.175].map((x) => (
        <mesh key={`temple-${x}`} position={[x, EYE_Y + 0.006, HEAD_R - 0.125]}>
          <boxGeometry args={[0.01, 0.01, 0.2]} />
          <Vinyl color={INK} gloss={1} rough={0.16} />
        </mesh>
      ))}
    </group>
  );
}

/** Stubby vinyl arm: short sleeve + rounded mitt hand. */
function FunkoArm({ sleeveColor, skinColor }: { sleeveColor: string; skinColor: string }) {
  return (
    <group>
      <mesh position={[0, -0.1, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.09, 8, 16]} />
        <Vinyl color={sleeveColor} />
      </mesh>
      <mesh position={[0, -0.225, 0]} castShadow>
        <sphereGeometry args={[0.065, 20, 16]} />
        <Vinyl color={skinColor} />
      </mesh>
    </group>
  );
}

// ------------------------------------------------------------------
// ROLE PROPS
// Hair + glasses alone leave nine near-identical silhouettes, so every
// agent also carries one signature prop. Props are moulded in the same
// glossy vinyl as the body so they read as part of the collectible.
//
// Placement: a group at z = +0.235, i.e. in FRONT of the belly. The arm
// groups pivot about X, and a POSITIVE rot.x swings the mitts toward -Z,
// so the volume in front of the torso stays clear of the arms in every
// pose (walk waddle, resting hands, typing, and the "huh?" shrug).
// ------------------------------------------------------------------
type PropKind =
  | 'clipboard'
  | 'palette'
  | 'laptop'
  | 'database'
  | 'magnifier'
  | 'beaker'
  | 'tablet'
  | 'book'
  | 'notebook';

const PROPS: Record<string, PropKind> = {
  'lead-engineer': 'clipboard',
  'ui-ux-designer': 'palette',
  'frontend-dev': 'laptop',
  'backend-dev': 'database',
  'debugger': 'magnifier',
  'qa-tester': 'beaker',
  'product-manager': 'tablet',
  'researcher': 'book',
  'writer-docs': 'notebook',
};

/**
 * Where the two break-zone agents perch on the sofa.
 *
 * The sofa group sits at x = -8.8 with rotationY = PI/2, so its local +Z (the
 * open front of the seat) points at world +X and local z = 0 is world x = -8.8.
 * These two are placed at LOCAL z = +0.15 -- they perch near the front of the
 * cushion, not against the backrest -- because the figure's hip-to-knee reach
 * is only 0.20: any deeper and the knees, shins and boots end up buried inside
 * the cushion with the soles hanging in mid-air above the floor.
 */
const SOFA_SPOTS: Record<string, { pos: [number, number, number]; rotY: number }> = {
  'researcher':  { pos: [-8.65, 0, -1.0], rotY: Math.PI / 2 }, // on sofa facing coffee table
  'writer-docs': { pos: [-8.65, 0,  0.0], rotY: Math.PI / 2 }, // on sofa facing coffee table
};

/**
 * Pelvis height for a seated figure. Derived, not guessed: with the 105deg
 * sitting knee (thigh -1.3 / shin +1.3 -- the pose BOTH the desk chair and the
 * sofa use) the boot sole sits 0.303 below the pelvis, so 0.304 puts both soles
 * flat on the floor (y = 0) while the thigh capsule top (pelvis + 0.02 = 0.324)
 * kisses the 0.32 cushion top. The chair AND the sofa share this number because
 * they share the pose; only their cushions differ (both 0.32 -- see
 * CHAIR_CUSHION_TOP in OfficeRoom.tsx).
 */
const CHAIR_HIP_Y = 0.304;
/** The sofa sits its occupants at the same height as a desk chair -- same pose, same cushion top. */
const SOFA_HIP_Y = CHAIR_HIP_Y;

/**
 * Where idle agents relax in the Ruang Santai east wing (Zone 4). Every `hipY` below
 * is DERIVED from the cushion top of the actual furniture the agent stands on, and
 * every `rotY` is that furniture's own rotation -- which is what keeps an agent from
 * hovering above its seat or sinking through it. See the lounge group in
 * OfficeRoom.tsx; the wing is one floor at three levels and the seat sits on one of
 * them: deck (DECK_Y + cushion), or the flat wing floor (cushion).
 *
 * Because each spot now names REAL furniture, the `hipY` is simply the cushion top
 * plus the drop that spot's pose needs, so the three levels stay consistent:
 *   deck lounger  : DECK_Y + LOUNGER_SEAT_TOP + LOUNGE_SOLE_DROP (reclined legs)
 *   deck armchair : DECK_Y + CHAIR_HIP_Y                    (upright, standard pose)
 *   poolside chair: CHAIR_HIP_Y                            (upright, one step lower)
 */
type LoungeSpot = { pos: [number, number, number]; rotY: number; hipY: number; lounger?: boolean };

/** Hip height of a STANDING figure (see the bodyRef group's authored y). */
const STANDING_HIP_Y = 0.46;

/**
 * World-space footprint of the raised spa deck in the Ruang Santai wing (see the
 * lounge group in OfficeRoom.tsx: a 4.6 x 6.0 slab centred on group-local (-2.9, 0, 0)
 * inside the wing group at world (17, 0, -4)). An agent walking across it must rise
 * DECK_Y, so the standing hip is raised while it is over these bounds.
 */
const DECK_MIN_X = 17 - 2.9 - 2.3;
const DECK_MAX_X = 17 - 2.9 + 2.3;
const DECK_MIN_Z = -4 - 3.0;
const DECK_MAX_Z = -4 + 3.0;

/**
 * Reclined pelvis height above deck, DERIVED from the lounger's seat surface (LOUNGER_SEAT_TOP = 0.31).
 * With the pelvis capsule extending down by 0.09 from the hip, setting the hip at LOUNGER_SEAT_TOP + 0.08
 * (0.39 above deck) places the pelvis bottom (0.31) and thighs/knees/shins flat on top of the cushion
 * without any part penetrating into the foam.
 */
const LOUNGER_HIP_OFFSET = 0.08;

const LOUNGE_SPOTS: Record<string, LoungeSpot> = {
  // --- 2 SUN LOUNGERS on the raised deck, long axis along X, reclined, facing +X ---
  'lead-engineer':  { pos: [12.90, 0, -6.00], rotY: Math.PI / 2, hipY: DECK_Y + LOUNGER_SEAT_TOP + LOUNGER_HIP_OFFSET, lounger: true },
  'ui-ux-designer': { pos: [12.90, 0, -3.60], rotY: Math.PI / 2, hipY: DECK_Y + LOUNGER_SEAT_TOP + LOUNGER_HIP_OFFSET, lounger: true },
  // --- 3 DECK ARMCHAIRS on the raised deck, upright, facing +X toward the pool ---
  'frontend-dev':   { pos: [15.20, 0, -6.20], rotY: Math.PI / 2, hipY: DECK_Y + CHAIR_HIP_Y },
  'backend-dev':    { pos: [15.20, 0, -4.00], rotY: Math.PI / 2, hipY: DECK_Y + CHAIR_HIP_Y },
  'qa-tester':      { pos: [15.20, 0, -1.80], rotY: Math.PI / 2, hipY: DECK_Y + CHAIR_HIP_Y },
  // --- 4 POOLSIDE ARMCHAIRS on the flat wing floor: two north facing +Z, two south facing -Z ---
  'debugger':        { pos: [18.30, 0, -7.50], rotY: 0,       hipY: CHAIR_HIP_Y },
  'product-manager': { pos: [20.50, 0, -7.50], rotY: 0,       hipY: CHAIR_HIP_Y },
  'researcher':      { pos: [18.30, 0, -0.60], rotY: Math.PI, hipY: CHAIR_HIP_Y },
  'writer-docs':     { pos: [20.50, 0, -0.60], rotY: Math.PI, hipY: CHAIR_HIP_Y },
};

/** Paint dabs on the UI/UX palette, typed so the destructure stays numeric. */
const PALETTE_DABS: [number, number, string][] = [
  [-0.032, 0.034, '#ef4444'],
  [0.0, 0.052, '#3b82f6'],
  [0.032, 0.034, '#facc15'],
];

function RoleProp({ kind, tint }: { kind: PropKind; tint: string }) {
  switch (kind) {
    case 'clipboard':
      return (
        <group rotation={[-0.18, 0, 0]}>
          <RoundedBox args={[0.17, 0.2, 0.018]} radius={0.012}>
            <Vinyl color="#f8fafc" rough={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.07, 0.028, 0.03]} radius={0.01} position={[0, 0.1, 0.006]}>
            <Vinyl color={INK} gloss={1} rough={0.2} />
          </RoundedBox>
          {[-0.05, -0.005, 0.04].map((y, i) => (
            <mesh key={`rule-${i}`} position={[-0.012, y, 0.011]}>
              <boxGeometry args={[0.1 - i * 0.022, 0.008, 0.004]} />
              <Vinyl color={tint} rough={0.5} />
            </mesh>
          ))}
        </group>
      );

    case 'palette':
      return (
        <group rotation={[0, 0, 0.28]}>
          {/* artist palette — a flattened sphere reads as a wooden disc */}
          <mesh scale={[1.06, 1, 0.22]} castShadow>
            <sphereGeometry args={[0.088, 24, 18]} />
            <Vinyl color="#f1d9b8" rough={0.55} />
          </mesh>
          {/* thumb hole */}
          <mesh position={[0.052, -0.032, 0.016]}>
            <circleGeometry args={[0.024, 18]} />
            <Vinyl color="#0f172a" rough={0.6} />
          </mesh>
          {/* paint dabs */}
          {PALETTE_DABS.map(([x, y, color], i) => (
            <mesh key={`paint-${i}`} position={[x, y, 0.014]} castShadow>
              <sphereGeometry args={[0.016, 12, 12]} />
              <Vinyl color={color} gloss={1} rough={0.25} />
            </mesh>
          ))}
        </group>
      );

    case 'laptop':
      return (
        <group rotation={[-0.1, 0, 0]}>
          <RoundedBox args={[0.22, 0.014, 0.15]} radius={0.006} position={[0, -0.075, 0.014]}>
            <Vinyl color="#cbd5e1" rough={0.32} />
          </RoundedBox>
          <group position={[0, -0.062, -0.055]} rotation={[-0.22, 0, 0]}>
            <RoundedBox args={[0.22, 0.15, 0.014]} radius={0.008}>
              <Vinyl color="#1e293b" rough={0.3} />
            </RoundedBox>
            <mesh position={[0, 0, 0.009]}>
              <planeGeometry args={[0.19, 0.122]} />
              <meshBasicMaterial color={tint} transparent opacity={0.85} />
            </mesh>
          </group>
        </group>
      );

    case 'database':
      return (
        <group>
          {[0.055, 0, -0.055].map((y, i) => (
            <group key={`db-${i}`} position={[0, y, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.075, 0.075, 0.05, 20]} />
                <Vinyl color={i === 1 ? tint : '#334155'} rough={0.3} />
              </mesh>
              <mesh position={[0, 0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.062, 0.007, 8, 20]} />
                <Vinyl color="#e2e8f0" rough={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'magnifier':
      return (
        <group rotation={[0, 0, -0.5]}>
          <mesh castShadow>
            <torusGeometry args={[0.058, 0.014, 10, 24]} />
            <Vinyl color={INK} gloss={1} rough={0.18} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.05, 24]} />
            <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.05} side={2} />
          </mesh>
          <mesh position={[0, -0.078, 0]} castShadow>
            <capsuleGeometry args={[0.014, 0.06, 6, 12]} />
            <Vinyl color={tint} gloss={0.95} />
          </mesh>
        </group>
      );

    case 'beaker':
      return (
        <group>
          <mesh position={[0, -0.03, 0]} castShadow>
            <cylinderGeometry args={[0.052, 0.062, 0.13, 20]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.32} roughness={0.06} />
          </mesh>
          <mesh position={[0, -0.055, 0]}>
            <cylinderGeometry args={[0.05, 0.058, 0.075, 20]} />
            <Vinyl color="#22c55e" rough={0.2} emissive="#22c55e" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0.037, 0]}>
            <torusGeometry args={[0.052, 0.008, 8, 20]} />
            <Vinyl color="#e2e8f0" rough={0.25} />
          </mesh>
        </group>
      );

    case 'tablet':
      return (
        <group rotation={[-0.14, 0, 0]}>
          <RoundedBox args={[0.18, 0.23, 0.016]} radius={0.014}>
            <Vinyl color="#0f172a" gloss={1} rough={0.16} />
          </RoundedBox>
          <mesh position={[0, 0.012, 0.011]}>
            <planeGeometry args={[0.152, 0.19]} />
            <meshBasicMaterial color={tint} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.076, 0.013]}>
            <planeGeometry args={[0.152, 0.022]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
          </mesh>
          {[-0.02, -0.055, -0.09].map((y, i) => (
            <mesh key={`screen-line-${i}`} position={[-0.014, y, 0.013]}>
              <planeGeometry args={[0.1 - i * 0.022, 0.012]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      );

    case 'book':
      return (
        <group rotation={[-0.2, 0, 0]}>
          {[-1, 1].map((s) => (
            <RoundedBox
              key={`page-${s}`}
              args={[0.115, 0.17, 0.016]}
              radius={0.008}
              position={[s * 0.058, 0, 0]}
              rotation={[0, s * 0.22, 0]}
            >
              <Vinyl color="#f8fafc" rough={0.65} />
            </RoundedBox>
          ))}
          <mesh>
            <boxGeometry args={[0.02, 0.172, 0.026]} />
            <Vinyl color={tint} rough={0.4} />
          </mesh>
          {[-0.04, 0.005, 0.05].map((y, i) =>
            [-1, 1].map((s) => (
              <mesh key={`book-line-${i}-${s}`} position={[s * 0.058, y, 0.012]}>
                <boxGeometry args={[0.085 - i * 0.018, 0.006, 0.004]} />
                <Vinyl color={INK} rough={0.5} />
              </mesh>
            )),
          )}
        </group>
      );

    case 'notebook':
      return (
        <group rotation={[-0.16, 0, 0.08]}>
          <RoundedBox args={[0.17, 0.21, 0.028]} radius={0.01}>
            <Vinyl color={tint} rough={0.42} />
          </RoundedBox>
          <mesh position={[0.012, 0, 0.017]}>
            <boxGeometry args={[0.15, 0.19, 0.012]} />
            <Vinyl color="#fdfdfb" rough={0.62} />
          </mesh>
          {[-0.055, -0.015, 0.025, 0.065].map((y, i) => (
            <mesh key={`note-line-${i}`} position={[0.012, y, 0.024]}>
              <boxGeometry args={[0.11 - i * 0.014, 0.007, 0.004]} />
              <Vinyl color={INK} rough={0.5} />
            </mesh>
          ))}
          <group position={[0.005, -0.012, 0.042]} rotation={[0, 0, -0.38]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.15, 6]} />
              <Vinyl color="#fbbf24" rough={0.35} />
            </mesh>
            <mesh position={[0, 0.09, 0]} castShadow>
              <coneGeometry args={[0.014, 0.035, 6]} />
              <Vinyl color="#f5f5f4" rough={0.45} />
            </mesh>
            <mesh position={[0, 0.113, 0]}>
              <coneGeometry args={[0.005, 0.016, 6]} />
              <Vinyl color={INK} rough={0.4} />
            </mesh>
          </group>
        </group>
      );
  }
}

export function AgentCharacter({
  agent,
  basePosition,
  baseRotationY,
  isSelected,
}: AgentCharacterProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftShinRef = useRef<Group>(null);
  const rightShinRef = useRef<Group>(null);
  const leftBootRef = useRef<Group>(null);
  const rightBootRef = useRef<Group>(null);
  const propRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const setChatAgent = useAppStore((s) => s.setChatAgent);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const collaboration = useAppStore((s) => s.collaboration);
  const isSpeaking = collaboration.isActive && collaboration.activeSpeakerId === agent.id;

  // All rotations are interpreted as: rotY 0 => the model's FRONT faces +Z.
  const getTargetTransform = (): { pos: [number, number, number]; rotY: number; hipY: number; lounger: boolean } => {
    if (agent.roomZone === 'break') {
      const spot = SOFA_SPOTS[agent.id];
      return { pos: spot?.pos || [-7.2, 0, 0.9], rotY: spot?.rotY ?? -Math.PI / 2, hipY: SOFA_HIP_Y, lounger: false };
    }
    if (agent.roomZone === 'lounge') {
      // East wing spa deck + pool. Each spot carries the hip height DERIVED from its
      // own furniture's cushion top (see LOUNGE_SPOTS), so an agent rests ON a seat at
      // every one of the wing's three floor levels. Unknown ids fall back to a deck
      // armchair so a newly-added agent still lands on real furniture.
      const spot = LOUNGE_SPOTS[agent.id];
      return spot
        ? { pos: spot.pos, rotY: spot.rotY, hipY: spot.hipY, lounger: spot.lounger === true }
        : { pos: [15.20, 0, -4.00], rotY: Math.PI / 2, hipY: DECK_Y + CHAIR_HIP_Y, lounger: false };
    }
    if (agent.roomZone === 'meeting') {
      // Boardroom table sits at [8.2, 0, -2.5] and the laptops on its +Z edge
      // face the North row, so the North row looks +Z and the South row looks -Z.
      const meetingSpots: Record<string, { pos: [number, number, number]; rotY: number }> = {
        'product-manager': { pos: [ 6.15, 0, -2.5], rotY: Math.PI / 2 },   // head of table (west) faces +X
        'lead-engineer':   { pos: [ 7.3,  0, -3.55], rotY: 0 },            // north row faces +Z
        'ui-ux-designer':  { pos: [ 8.2,  0, -3.55], rotY: 0 },            // north row faces +Z
        'frontend-dev':    { pos: [ 9.1,  0, -3.55], rotY: 0 },            // north row faces +Z
        'backend-dev':     { pos: [ 7.3,  0, -1.45], rotY: Math.PI },       // south row faces -Z
        'debugger':        { pos: [ 8.2,  0, -1.45], rotY: Math.PI },       // south row faces -Z
        'qa-tester':       { pos: [ 9.1,  0, -1.45], rotY: Math.PI },       // south row faces -Z
        'researcher':      { pos: [10.25, 0, -2.5],  rotY: -Math.PI / 2 },  // head of table (east) faces -X
        'writer-docs':     { pos: [10.25, 0, -1.45], rotY: -Math.PI / 2 },  // east side, clear of Debugger's chair
      };
      const spot = meetingSpots[agent.id];
      return { pos: spot?.pos || [8.2, 0, -2.5], rotY: spot?.rotY ?? Math.PI / 2, hipY: CHAIR_HIP_Y, lounger: false };
    }
    return { pos: basePosition, rotY: baseRotationY, hipY: CHAIR_HIP_Y, lounger: false };
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime + agent.id.charCodeAt(0) * 0.1;
    const { pos: targetPos, rotY: targetRotY, hipY: seatHipY, lounger: onLounger } = getTargetTransform();
    // A sofa is not a chair: it needs its own leg pose and its own seat height,
    // so "am I on the sofa" is decided here once and reused below.
    const onSofa = agent.roomZone === 'break' && SOFA_SPOTS[agent.id] !== undefined;
    // `onLounger` and the seat height come straight from the lounge spot (see
    // LOUNGE_SPOTS): a sun lounger reclines, a deck seat sits upright on the
    // raised deck, and a coping perch sits upright on the flat wing floor.

    if (!groupRef.current) return;

    const cx = groupRef.current.position.x;
    const cz = groupRef.current.position.z;
    const dx = targetPos[0] - cx;
    const dz = targetPos[2] - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isMoving = dist > 0.08;

    if (isMoving) {
      const speed = 0.045;
      groupRef.current.position.x += (dx / dist) * speed;
      groupRef.current.position.z += (dz / dist) * speed;
      const moveAngle = Math.atan2(dx, dz);
      let rotDiff = moveAngle - groupRef.current.rotation.y;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      groupRef.current.rotation.y += rotDiff * 0.18;
      // Funko figures waddle: a chunky side-to-side rock while walking
      groupRef.current.position.y = Math.abs(Math.sin(t * 12)) * 0.035;
      groupRef.current.rotation.z = Math.sin(t * 12) * 0.06;
    } else {
      groupRef.current.position.x = MathUtils.lerp(cx, targetPos[0], 0.18);
      groupRef.current.position.z = MathUtils.lerp(cz, targetPos[2], 0.18);
      let rotDiff = targetRotY - groupRef.current.rotation.y;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      groupRef.current.rotation.y += rotDiff * 0.12;
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
      groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, 0.15);
    }

    // Stubby legs: thigh + shin knee joint so seated poses still read correctly
    if (
      leftLegRef.current &&
      rightLegRef.current &&
      leftShinRef.current &&
      rightShinRef.current &&
      leftBootRef.current &&
      rightBootRef.current
    ) {
      if (isMoving) {
        leftLegRef.current.rotation.x = -Math.sin(t * 12) * 0.25;
        rightLegRef.current.rotation.x = -Math.sin(t * 12 + Math.PI) * 0.25;
        leftShinRef.current.rotation.x = -0.12 - Math.max(0, Math.sin(t * 12)) * 0.28;
        rightShinRef.current.rotation.x = -0.12 - Math.max(0, Math.sin(t * 12 + Math.PI)) * 0.28;
        // Boots keep their moulded tilt while striding so the walk reads cleanly.
        leftBootRef.current.rotation.x = MathUtils.lerp(leftBootRef.current.rotation.x, 0, 0.2);
        rightBootRef.current.rotation.x = MathUtils.lerp(rightBootRef.current.rotation.x, 0, 0.2);
      } else if (onSofa) {
        // Couch pose. The chair pose below is a rigid 90/90 right angle, which is
        // correct for a seat the figure straddles edge-on but reads as a mannequin
        // on a sofa -- AND it lands the soles only 0.245 below the pelvis, so any hip
        // height high enough to clear the cushion leaves the boots hanging in the air.
        // Opening the knee to ~105deg (thigh -74.5deg, shin counter-rotated so the
        // total stays vertical) lengthens the hip-to-sole drop to 0.304, which is
        // exactly what puts both soles flat on the floor at SOFA_HIP_Y.
        leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, -1.3, 0.15);
        rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, -1.3, 0.15);
        leftShinRef.current.rotation.x = MathUtils.lerp(leftShinRef.current.rotation.x, 1.3, 0.15);
        rightShinRef.current.rotation.x = MathUtils.lerp(rightShinRef.current.rotation.x, 1.3, 0.15);
        leftBootRef.current.rotation.x = MathUtils.lerp(leftBootRef.current.rotation.x, 0, 0.15);
        rightBootRef.current.rotation.x = MathUtils.lerp(rightBootRef.current.rotation.x, 0, 0.15);
      } else if (onLounger) {
        // Lounger pose: legs extended forward horizontally along the cushion surface.
        // Paired with bodyRef recline (-0.38 rad), net world leg angle is -1.57 rad (horizontal)
        // so thighs, knees and boots rest smoothly on top of the lounger cushion with zero clipping.
        leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, -1.19, 0.15);
        rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, -1.19, 0.15);
        leftShinRef.current.rotation.x = MathUtils.lerp(leftShinRef.current.rotation.x, 0, 0.15);
        rightShinRef.current.rotation.x = MathUtils.lerp(rightShinRef.current.rotation.x, 0, 0.15);
        leftBootRef.current.rotation.x = MathUtils.lerp(leftBootRef.current.rotation.x, 0, 0.15);
        rightBootRef.current.rotation.x = MathUtils.lerp(rightBootRef.current.rotation.x, 0, 0.15);
      } else {
        // Chair pose. This is the SAME 105deg knee as the couch pose, not the old
        // rigid 90/90: a 90/90 chain only reaches 0.245 below the pelvis, which
        // against a seat cushion (top 0.32) either buries the shins or floats the
        // boots 9.5cm. Opening the knee to ~105deg (thigh -1.3, shin +1.3) makes
        // the hip-to-sole drop 0.303, so at CHAIR_HIP_Y the soles rest flat on the
        // floor exactly as they do on the sofa.
        leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, -1.3, 0.15);
        rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, -1.3, 0.15);
        leftShinRef.current.rotation.x = MathUtils.lerp(leftShinRef.current.rotation.x, 1.3, 0.15);
        rightShinRef.current.rotation.x = MathUtils.lerp(rightShinRef.current.rotation.x, 1.3, 0.15);
        leftBootRef.current.rotation.x = MathUtils.lerp(leftBootRef.current.rotation.x, 0, 0.15);
        rightBootRef.current.rotation.x = MathUtils.lerp(rightBootRef.current.rotation.x, 0, 0.15);
      }
    }

    if (headRef.current) {
      // Nodding "down" for a model whose front is +Z means a POSITIVE rot.x.
      if (agent.status === 'working') {
        headRef.current.rotation.x = 0.2 + Math.sin(t * 5) * 0.05;
        headRef.current.rotation.y = Math.sin(t * 2.5) * 0.06;
      } else if (agent.status === 'thinking') {
        headRef.current.rotation.x = 0.12 + Math.sin(t * 1.2) * 0.07;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.2;
      } else if (agent.status === 'discussing') {
        headRef.current.rotation.x = Math.sin(t * 5) * 0.09;
        headRef.current.rotation.y = Math.sin(t * 3) * 0.24;
      } else if (agent.status === 'done') {
        // Satisfied bob for a finished task
        headRef.current.rotation.x = 0.08 + Math.sin(t * 4) * 0.09;
        headRef.current.rotation.y = 0;
      } else {
        headRef.current.rotation.x = -0.04 + Math.sin(t * 1.2) * 0.02;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
      }
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 1.1) * 0.015;
      // Recline torso when resting on sun lounger against its tilted backrest
      const targetBodyRotX = onLounger && !isMoving ? -0.38 : 0;
      bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, targetBodyRotX, 0.12);

      // Seated vs standing: while walking the hips sit at their standing height
      // (0.46) plus the surface rise under the agent's CURRENT x/z. Deriving the
      // surface from the live position rather than the destination is what stops an
      // agent levitating while it crosses the deck edge: on the flat wing floor the
      // rise is 0, on the raised deck it is DECK_Y. When parked, the hip comes
      // straight from the spot's own seat height (`seatHipY`, derived from the
      // furniture's cushion top in LOUNGE_SPOTS), so every seat -- desk chair, sofa,
      // sun lounger, deck armchair, poolside chair -- lands the soles on the floor.
      const onDeck =
        groupRef.current.position.x > DECK_MIN_X && groupRef.current.position.x < DECK_MAX_X &&
        groupRef.current.position.z > DECK_MIN_Z && groupRef.current.position.z < DECK_MAX_Z;
      const standingHipY = onDeck ? STANDING_HIP_Y + DECK_Y : STANDING_HIP_Y;
      const hipTargetY = isMoving ? standingHipY : seatHipY;
      bodyRef.current.position.y = MathUtils.lerp(bodyRef.current.position.y, hipTargetY, 0.1);
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isMoving) {
        leftArmRef.current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.4;
        rightArmRef.current.rotation.x = Math.sin(t * 12) * 0.4;
        leftArmRef.current.rotation.z = 0.1;
        rightArmRef.current.rotation.z = -0.1;
      } else if (agent.status === 'thinking') {
        // Chin-stroke / hand-rub thinking pose. The model's front is +Z, so a
        // POSITIVE rot.x swings the hands forward, toward the chin.
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0.9, 0.08);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 1.35, 0.08);
        leftArmRef.current.rotation.z = MathUtils.lerp(leftArmRef.current.rotation.z, 0.45, 0.08);
        rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, -0.45, 0.08);
      } else if (agent.status === 'working') {
        // Typing on a keyboard that sits in front of the figure (+Z)
        leftArmRef.current.rotation.x = 0.9 + Math.sin(t * 12) * 0.12;
        rightArmRef.current.rotation.x = 0.9 + Math.cos(t * 12) * 0.12;
        leftArmRef.current.rotation.z = 0.1;
        rightArmRef.current.rotation.z = -0.1;
      } else if (agent.status === 'error') {
        // Arms thrown up in a "huh?" pose
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 1.9, 0.08);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 1.9, 0.08);
        leftArmRef.current.rotation.z = MathUtils.lerp(leftArmRef.current.rotation.z, 0.55, 0.08);
        rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, -0.55, 0.08);
      } else if (onLounger) {
        // Sunbathing: hands laced behind the head while lying back.
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 1.25, 0.08);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 1.25, 0.08);
        leftArmRef.current.rotation.z = MathUtils.lerp(leftArmRef.current.rotation.z, 0.6, 0.08);
        rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, -0.6, 0.08);
      } else {
        // Rest hands comfortably forward
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 0.08);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.08);
        leftArmRef.current.rotation.z = MathUtils.lerp(leftArmRef.current.rotation.z, 0.12, 0.08);
        rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, -0.12, 0.08);
      }
    }

    // The role prop reacts to the agent's status so the desk reads as busy:
    // it taps while typing, tilts while pondering, and settles when idle.
    if (propRef.current) {
      if (agent.status === 'working') {
        propRef.current.position.y = 0.22 + Math.sin(t * 6) * 0.008;
        propRef.current.rotation.z = Math.sin(t * 4) * 0.05;
      } else if (agent.status === 'thinking') {
        propRef.current.position.y = MathUtils.lerp(propRef.current.position.y, 0.22, 0.12);
        propRef.current.rotation.z = 0.18 + Math.sin(t * 1.4) * 0.06;
      } else {
        propRef.current.position.y = MathUtils.lerp(propRef.current.position.y, 0.22, 0.12);
        propRef.current.rotation.z = MathUtils.lerp(propRef.current.rotation.z, 0, 0.12);
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSelectedAgent(agent.id);
    setChatAgent(agent.id);
    setActivePanel('chat');
    setPanelOpen(true);
  };

  const statusLabel =
    agent.status === 'idle'
      ? agent.currentTaskSummary.split('•')[1]?.trim() || STATUS_TAGS[agent.status]
      : STATUS_TAGS[agent.status];

  const bodyColor = agent.avatar.bodyColor;
  const skinColor = agent.avatar.headColor;
  // Derived, NOT avatar.accentColor — see HAIR_BASE above.
  const hairColor = mixHex(bodyColor, HAIR_BASE, HAIR_DEPTH);
  const look = LOOKS[agent.id] ?? DEFAULT_LOOK;
  const prop = PROPS[agent.id];
  const glow = isSelected ? 0.32 : hovered ? 0.16 : 0;

  const { pants: pantsColor, boot: bootColor } = legColors(bodyColor);

  const leg = (side: -1 | 1) => (
    <group ref={side < 0 ? leftLegRef : rightLegRef} position={[side * 0.095, 0, 0]}>
      {/* Thigh */}
      <mesh position={[0, -0.11, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.12, 8, 16]} />
        <Vinyl color={pantsColor} />
      </mesh>
      {/* Knee + shin + chunky boot */}
      <group ref={side < 0 ? leftShinRef : rightShinRef} position={[0, -0.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.072, 16, 16]} />
          <Vinyl color={pantsColor} />
        </mesh>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.062, 0.1, 8, 16]} />
          <Vinyl color={pantsColor} />
        </mesh>
        {/* Chunky boot — toe points toward +Z (the model's front) */}
        <group ref={side < 0 ? leftBootRef : rightBootRef}>
          <RoundedBox args={[0.135, 0.1, 0.2]} radius={0.035} position={[0, -0.2, 0.03]} castShadow>
            <Vinyl color={bootColor} gloss={0.95} rough={0.28} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );

  return (
    <group
      ref={groupRef}
      position={[basePosition[0], 0, basePosition[2]]}
      rotation={[0, baseRotationY, 0]}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* BODY — Funko barrel torso on short stubby legs. The authored y is the
          STANDING hip height; useFrame lerps it to the seated/standing height for the
          current surface (see STANDING_HIP_Y and the pose contract above). */}
      <group ref={bodyRef} position={[0, STANDING_HIP_Y, 0]}>
        {leg(-1)}
        {leg(1)}

        {/* Squat rounded torso */}
        <mesh position={[0, 0.2, 0]} scale={[1, 1, 0.82]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.18, 12, 24]} />
          <Vinyl color={bodyColor} emissive={agent.color} emissiveIntensity={glow} />
        </mesh>

        {/* Collar seam */}
        <mesh position={[0, 0.4, 0]} scale={[1, 1, 0.82]} castShadow>
          <torusGeometry args={[0.088, 0.016, 10, 24]} />
          <Vinyl color={bodyColor} rough={0.5} />
        </mesh>

        {/* Arms — short vinyl tubes with rounded mitts */}
        <group ref={leftArmRef} position={[-0.215, 0.33, 0]}>
          <FunkoArm sleeveColor={bodyColor} skinColor={skinColor} />
        </group>
        <group ref={rightArmRef} position={[0.215, 0.33, 0]}>
          <FunkoArm sleeveColor={bodyColor} skinColor={skinColor} />
        </group>

        {/* ROLE PROP — one signature silhouette per agent, held clear of the arms */}
        {prop && (
          <group ref={propRef} position={[0, 0.22, 0.235]}>
            <RoleProp kind={prop} tint={agent.color} />
          </group>
        )}

        {/* HEAD — oversized Funko skull sitting straight on the torso (no neck) */}
        <group ref={headRef} position={[0, 0.68, 0]}>
          {/* Moulded hair / headwear wraps the skull */}
          <Hair style={look.hair} color={hairColor} hatColor={look.hatColor} />

          {/* Skull */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[HEAD_R, 40, 32]} />
            <Vinyl color={skinColor} emissive={agent.color} emissiveIntensity={glow * 0.5} />
          </mesh>

          {/* Ears — small vinyl nubs on the sides */}
          {[-1, 1].map((s) => (
            <mesh key={`ear-${s}`} position={[s * (HEAD_R - 0.015), -0.02, 0]} scale={[0.55, 1, 0.8]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <Vinyl color={skinColor} />
            </mesh>
          ))}

          {/* Eyes — big solid black ovals, the classic Funko stare (+Z front) */}
          {[-1, 1].map((s) => (
            <group key={`eye-${s}`} position={[s * EYE_X, EYE_Y, HEAD_R - 0.022]}>
              <mesh scale={[1, 1.18, 0.5]}>
                <sphereGeometry args={[0.045, 20, 20]} />
                <meshPhysicalMaterial color={INK} roughness={0.1} clearcoat={1} />
              </mesh>
              {/* Catchlight */}
              <mesh position={[s * 0.014, 0.02, 0.02]}>
                <sphereGeometry args={[0.014, 10, 10]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}

          {/* Blush — a soft vinyl flush moulded onto the cheeks, the detail that
              warms up the classic Funko stare without breaking the toy look */}
          {[-1, 1].map((s) => (
            <mesh key={`blush-${s}`} position={[s * 0.165, -0.07, 0.205]} scale={[1.15, 0.8, 0.4]}>
              <sphereGeometry args={[0.04, 18, 14]} />
              <meshBasicMaterial color="#fb7185" transparent opacity={0.38} />
            </mesh>
          ))}

          {/* Simple curved smile */}
          <mesh position={[0, -0.105, HEAD_R - 0.03]} rotation={[-0.12, 0, 0]}>
            <torusGeometry args={[0.052, 0.0085, 10, 20, Math.PI * 0.85]} />
            <meshBasicMaterial color={INK} />
          </mesh>

          {/* Subtle nose nub */}
          <mesh position={[0, -0.045, HEAD_R + 0.005]} scale={[1, 0.85, 0.9]}>
            <sphereGeometry args={[0.026, 14, 14]} />
            <Vinyl color={skinColor} />
          </mesh>

          {look.glasses && <Glasses />}
        </group>
      </group>

      {/* SELECTION RING */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.46, 0.56, 36]} />
          <meshBasicMaterial color={agent.color} transparent opacity={isSelected ? 0.9 : 0.45} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial color={agent.color} transparent opacity={isSelected ? 0.12 : hovered ? 0.08 : 0.04} />
      </mesh>

      {/* BADGE */}
      <Html position={[0, 1.95, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          className={`agent-overhead-capsule ${isSelected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
          style={{
            borderColor: agent.color,
            boxShadow: isSelected
              ? `0 0 18px ${agent.color}88, 0 4px 14px rgba(0,0,0,0.5)`
              : `0 2px 10px rgba(0,0,0,0.35)`,
          }}
        >
          <span className="agent-capsule-dot" style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }} />
          <span className="agent-capsule-icon">{agent.avatar.icon}</span>
          <span className="agent-capsule-name">
            {agent.name.split(' ')[0]} <span className="agent-capsule-tag">[{agent.shortTag}]</span>
          </span>
          <span className="agent-capsule-divider">&bull;</span>
          <span className="agent-capsule-status">{statusLabel}</span>
        </div>
      </Html>

      {/* SPEECH BALLOON */}
      {isSpeaking && (
        <Html position={[0, 2.5, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className="agent-speech-balloon" style={{ borderColor: agent.color, boxShadow: `0 0 20px ${agent.color}aa` }}>
            <span className="speech-icon">💬</span>
            <span style={{ color: agent.color, fontWeight: 700 }}>{agent.shortTag}:</span>
            <span className="speech-text">Koordinasi sprint aktif...</span>
          </div>
        </Html>
      )}
    </group>
  );
}