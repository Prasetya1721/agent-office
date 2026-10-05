// ============================================
// AgentOffice - 3D Virtual Office HQ
// Main room: Ruangan Kerja + Pojok Kopi + Ruangan Meeting + Taman
// East wing: Ruang Santai & Kolam Renang (its own slab, no overlap)
// High-end Scandinavian tech office matching reference design 1:1
// ============================================
import { RoundedBox, Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

// ------------------------------------------------------------------
// SEATING GEOMETRY CONTRACT (shared by the furniture AND by
// AGENT_CONFIGS in Scene3D.tsx - change them together!)
//
// A work pod sits at (pod.x, 0, pod.z) and contains, in pod-local space:
//   desk  -> z = 0            (desk surface + monitors)
//   chair -> z = SEAT_LOCAL_Z (agent sits ON the chair, facing the desk)
// so an agent's world seat position is (pod.x, 0, pod.z + SEAT_LOCAL_Z)
// with rotY = PI (the model's front, +Z, therefore points across -Z at the
// desk) -- see AGENT_CONFIGS in Scene3D.tsx.
//
// The chair is modelled with its BACKREST at local -Z and its open front at
// +Z, so it MUST be placed with rotationY = Math.PI to match the occupant:
// the backrest then lands behind the agent at pod-local z = SEAT_LOCAL_Z +
// 0.22. At rotationY = 0 it lands between the agent and the desk instead and
// the whole chair reads as sitting backwards.
// ------------------------------------------------------------------
export const DESK_LOCAL_Z = 0;
export const SEAT_LOCAL_Z = 0.95;

/**
 * The ONE seat-surface height every seated agent rests on: the desk chairs, the eight
 * conference chairs, the sofa and the spa armchairs.
 *
 * SEAT HEIGHT CONTRACT — this number is DERIVED from the figure's leg rig in
 * AgentCharacter.tsx, never chosen by eye. In the seated pose (thigh horizontal at
 * -PI/2, shin vertical at +PI/2) the rig measures, from the pelvis:
 *      thigh underside  0.070 below the pelvis   (flat: it beds on a flat cushion)
 *      knee sphere      0.072 below the pelvis   <- the deepest point of the thigh
 *      boot sole        0.275 below the pelvis   <- the lowest point of the whole leg
 * The two constraints "thigh rests ON the cushion" and "soles rest ON the floor" then
 * pin both numbers at once:
 *      seat top = hip - 0.072   and   hip = 0.275 (soles on the floor)
 *      => seat top = 0.275 - 0.072 = 0.203
 * CHAIR_HIP_Y in AgentCharacter.tsx is the 0.275 half of the same pair; if you change
 * one, change both, or the legs will pass through the seat again.
 *
 * It is 0.203 and NOT the conventional 0.42-0.45 because this figure is Funko-proportioned:
 * its entire hip-to-sole reach is only 0.275, so a 0.45 seat would bury the pelvis and
 * both shins inside the cushion while the boots hung far above the floor. A seat can never
 * be taller than the leg that sits on it.
 */
export const CHAIR_CUSHION_TOP = 0.203;

/**
 * The raised spa deck's height in the Ruang Santai wing (Zone 4). The wing is one
 * floor at three levels -- flat y 0, this deck, and the pool water at y -0.12 -- and
 * every seat standing on the deck adds DECK_Y to its own hip, so the occupant's
 * soles land on the deck surface rather than through it. Single source of truth:
 * AgentCharacter.tsx imports this.
 */
export const DECK_Y = 0.18;

/**
 * A sun lounger's flat seat-section top, measured above ITS OWN floor (i.e. above
 * whatever level the lounger stands on).
 *
 * Unlike every other seat, this one is NOT CHAIR_CUSHION_TOP, and it does not have to be:
 * a lounger carries the RECLINED pose, in which the legs lie extended ALONG the seat
 * instead of folding down to the floor. In that pose the leg's lowest point and the
 * thigh's underside are nearly level, so the seat height stops constraining anything and
 * the two numbers are independent. AgentCharacter.tsx derives the reclined hip from this
 * value plus its own measured thigh depth (LOUNGE_CONTACT), so the thigh lands here.
 */
export const LOUNGER_SEAT_TOP = 0.31;
/**
 * 5-wheel Ergonomic Desk Chair. Backrest at -Z, feet gap 0.48.
 *
 * FACING CONTRACT: the seat is modelled with its backrest at local -Z and its open front
 * at +Z, so the group MUST be turned so local +Z lands on the direction the occupant looks.
 * Every call site passes rotationY = Math.PI so the backrest sits behind a -Z-facing sitter.
 * The gas lift, armrests, backrest and headrest below are all positioned FROM
 * CHAIR_CUSHION_TOP, so lowering the seat can never leave the chair floating or its
 * post poking through the cushion.
 */
function ErgonomicDeskChair({
  position,
  rotationY = 0,
  accentColor = '#94a3b8',
}: {
  position: [number, number, number];
  rotationY?: number;
  accentColor?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 5-Wheel Star Base — offset slightly back and rotated so spokes clear boots */}
      <mesh position={[0, 0.035, -0.04]}>
        <cylinderGeometry args={[0.045, 0.05, 0.05, 12]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = (i * Math.PI * 2) / 5 + Math.PI;
        return (
          <group key={`spoke-${i}`} position={[0, 0, -0.04]}>
            <mesh position={[Math.cos(ang) * 0.13, 0.035, Math.sin(ang) * 0.13]} rotation={[0, -ang, 0]}>
              <boxGeometry args={[0.22, 0.024, 0.028]} />
              <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[Math.cos(ang) * 0.23, 0.024, Math.sin(ang) * 0.23]} rotation={[Math.PI / 2, 0, ang]}>
              <cylinderGeometry args={[0.022, 0.022, 0.028, 10]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
      {/* Hydraulic Gas Lift Cylinder — spans star hub to cushion underside */}
      <mesh position={[0, (0.06 + CHAIR_CUSHION_TOP - 0.07) / 2, -0.04]}>
        <cylinderGeometry args={[0.022, 0.026, CHAIR_CUSHION_TOP - 0.13, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Contoured Seat Cushion - front lip at z = +0.12 so shins (z = 0.19) hang freely in front */}
      <RoundedBox args={[0.48, 0.07, 0.30]} radius={0.03} position={[0, CHAIR_CUSHION_TOP - 0.035, -0.03]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </RoundedBox>
      {/* Ergonomic Mesh Backrest - at z = -0.18 supporting the sitter's back */}
      <RoundedBox args={[0.44, 0.48, 0.05]} radius={0.025} position={[0, CHAIR_CUSHION_TOP + 0.36, -0.18]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.85} />
      </RoundedBox>
      {/* Lumbar & Headrest - follows backrest cantilever */}
      <RoundedBox args={[0.26, 0.13, 0.05]} radius={0.02} position={[0, CHAIR_CUSHION_TOP + 0.68, -0.21]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </RoundedBox>
      {/* T-Armrests - outboard of shoulders */}
      {[-0.29, 0.29].map((ax, i) => (
        <group key={`chair-arm-${i}`} position={[ax, CHAIR_CUSHION_TOP + 0.13, -0.03]}>
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[0.026, 0.14, 0.034]} />
            <meshStandardMaterial color="#374151" metalness={0.6} />
          </mesh>
          <RoundedBox args={[0.06, 0.024, 0.20]} radius={0.012} position={[0, 0.035, 0]}>
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}
      {/* Headrest accent pip in the agent's signature colour */}
      <mesh position={[0, CHAIR_CUSHION_TOP + 0.75, -0.185]}>
        <cylinderGeometry args={[0.035, 0.035, 0.014, 12]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Spa armchair for the Ruang Santai wing: teak frame, low cushion, backrest at -Z.
 * Sized with a 0.30m deep cushion ending at z = +0.12 so seated agents' shins (z = 0.19)
 * and boots hang cleanly in front without penetrating the seat cushion or frame.
 */
export const SPA_CUSHION_TOP = CHAIR_CUSHION_TOP;
function SpaArmchair({
  position,
  rotationY = 0,
  cushion = '#f8fafc',
  bolster = '#bae6fd',
}: {
  position: [number, number, number];
  rotationY?: number;
  cushion?: string;
  bolster?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Teak frame legs — back legs at lz = -0.16, front legs at lz = 0.09, keeping well clear of shins/boots */}
      {[[-0.25, -0.16], [0.25, -0.16], [-0.25, 0.09], [0.25, 0.09]].map(([lx, lz], i) => (
        <mesh key={`spa-leg-${i}`} position={[lx, (SPA_CUSHION_TOP - 0.08) / 2, lz]} castShadow>
          <boxGeometry args={[0.045, SPA_CUSHION_TOP - 0.08, 0.045]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
      ))}
      {/* Seat frame rails connecting front and back legs */}
      {[-0.25, 0.25].map((ax, i) => (
        <mesh key={`spa-rail-${i}`} position={[ax, SPA_CUSHION_TOP - 0.098, -0.035]} castShadow>
          <boxGeometry args={[0.04, 0.035, 0.26]} />
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </mesh>
      ))}
      {/* Seat cushion - front edge at z = +0.12 so shins hang cleanly in front with 0 clipping */}
      <RoundedBox args={[0.52, 0.08, 0.30]} radius={0.03} position={[0, SPA_CUSHION_TOP - 0.04, -0.03]} castShadow>
        <meshStandardMaterial color={cushion} roughness={0.75} />
      </RoundedBox>
      {/* Slatted teak backrest at z = -0.18, reclined away from the sitter */}
      <RoundedBox args={[0.5, 0.34, 0.05]} radius={0.025} position={[0, SPA_CUSHION_TOP + 0.24, -0.18]} rotation={[-0.14, 0, 0]} castShadow>
        <meshStandardMaterial color="#92400e" roughness={0.65} />
      </RoundedBox>
      {/* Armrests, outboard of the occupant's arms */}
      {[-0.29, 0.29].map((ax, i) => (
        <RoundedBox key={`spa-arm-${i}`} args={[0.05, 0.04, 0.30]} radius={0.015} position={[ax, SPA_CUSHION_TOP + 0.12, -0.03]} castShadow>
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </RoundedBox>
      ))}
      {/* Rolled bolster pillow tucked against the backrest */}
      <mesh position={[0, SPA_CUSHION_TOP + 0.065, -0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.38, 12]} />
        <meshStandardMaterial color={bolster} roughness={0.7} />
      </mesh>
    </group>
  );
}

export function OfficeRoom() {
  const theme = useAppStore((s) => s.settings.theme);
  const collaboration = useAppStore((s) => s.collaboration);

  const isDark = theme === 'dark';
  const wallColor = isDark ? '#0f172a' : '#f1f5f9';
  const trimColor = isDark ? '#1e293b' : '#cbd5e1';
  const floorWood = isDark ? '#141923' : '#e6d7c3';
  const floorWoodAlt = isDark ? '#0f131c' : '#d8c7b0';
  const glassBorderColor = isDark ? '#020617' : '#0f172a';

  return (
    <group>
      {/* ==================================================== */}
      {/* 1. ARCHITECTURAL ROOM SHELL: FLOOR & 2 BACK WALLS    */}
      {/* Cutaway Isometric Diorama: Open on Front-Left & Front-Right */}
      {/* ==================================================== */}

      {/* Main Floor: Scandinavian Honey Oak Parquet Planks.
          Depth 20 (not 16) so the FOREGROUND TAMAN (garden, z ~ 4.8 .. 8.4) has
          floor under it: centre z = -0.5 spans z -10.5 .. 9.5.
          Width 23 spans x -11.5 .. +11.5; the Ruang Santai wing is a SEPARATE
          slab east of x = +11.5 (see the wing slab below) so the lounge no longer
          overlaps the work pods, whose front row and chairs reach only to z ~ 4.6. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -0.5]} receiveShadow>
        <planeGeometry args={[23, 20]} />
        <meshStandardMaterial
          color={floorWood}
          roughness={0.25}
          metalness={0.12}
        />
      </mesh>

      {/* EAST WING SLAB: Ruang Santai & Kolam Renang. A separate 11 x 13 deck
          east of the main room (x 11.5 .. 22.5, z -10.5 .. 2.5), level with the
          main floor. The glass partition's doorway at z 0 lets agents walk across;
          keeping the lounge out here is what stops it tumpang-tindih with the
          work pods. Its own lighter stone finish reads as a spa terrace. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[17, -0.01, -4]} receiveShadow>
        <planeGeometry args={[11, 13]} />
        <meshStandardMaterial color={isDark ? '#151b26' : '#e7e2d6'} roughness={0.5} metalness={0.08} />
      </mesh>
      {/* Wing/mains floor seam so the two slabs read as deliberate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.5, 0.004, -4]}>
        <planeGeometry args={[0.05, 13]} />
        <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.6} />
      </mesh>

      {/* Floor Wood Plank Seams */}
      {[-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10].map((x) => (
        <mesh key={`seam-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, -0.5]}>
          <planeGeometry args={[0.018, 20]} />
          <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.5} />
        </mesh>
      ))}
      {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((z) => (
        <mesh key={`seam-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]}>
          <planeGeometry args={[23, 0.018]} />
          <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* East wing seams run along Z only, spaced across the wing slab */}
      {[12.5, 15, 17.5, 20, 22].map((x) => (
        <mesh key={`wing-seam-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, -4]}>
          <planeGeometry args={[0.018, 13]} />
          <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.45} />
        </mesh>
      ))}

      {/* ZONE RUGS */}
      {/* Lounge Rug (Soft Pastel Blue in Break Corner) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7.8, 0.005, -0.5]} receiveShadow>
        <planeGeometry args={[4.4, 4.2]} />
        <meshStandardMaterial color={isDark ? '#1e293b' : '#dbeafe'} roughness={0.9} />
      </mesh>

      {/* Executive Rug (Muted Textured Runner under Arka's Suite) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -3.8]} receiveShadow>
        <planeGeometry args={[3.6, 2.8]} />
        <meshStandardMaterial color={isDark ? '#1a2234' : '#e2e8f0'} roughness={0.85} />
      </mesh>

      {/* Meeting Room Carpet (Acoustic Commercial Tile Inset) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.2, 0.005, -1.0]} receiveShadow>
        <planeGeometry args={[5.2, 7.0]} />
        <meshStandardMaterial color={isDark ? '#090d16' : '#cbd5e1'} roughness={0.8} />
      </mesh>

      {/* ==================================================== */}
      {/* WALL 1: BACK-RIGHT WALL (Along Z = -8.5, X: -11 to +11)*/}
      {/* Runs from top-center to top-right on screen          */}
      {/* ==================================================== */}
      <group position={[0, 2.6, -8.5]}>
        {/* Wall Surface */}
        <mesh receiveShadow>
          <boxGeometry args={[22.4, 5.2, 0.28]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Baseboard */}
        <mesh position={[0, -2.53, 0.16]}>
          <boxGeometry args={[22.4, 0.14, 0.05]} />
          <meshStandardMaterial color={trimColor} />
        </mesh>

        {/* Minimalist Round Wall Clock */}
        <group position={[-2.4, 1.2, 0.16]}>
          {/* Outer Black Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* White Dial Face */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.015]}>
            <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Hour & Minute Hands */}
          <mesh position={[0, 0.08, 0.035]}>
            <boxGeometry args={[0.022, 0.20, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.08, 0, 0.035]}>
            <boxGeometry args={[0.18, 0.018, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Red Second Hand */}
          <mesh position={[-0.04, 0.04, 0.04]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.008, 0.22, 0.01]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Center Pin */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.045]}>
            <cylinderGeometry args={[0.02, 0.02, 0.01, 12]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Agile Sprint Cork Notice Board with Post-it Notes */}
        <group position={[0.8, 0.5, 0.16]}>
          <mesh>
            <boxGeometry args={[2.5, 1.4, 0.04]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[2.34, 1.24, 0.02]} />
            <meshStandardMaterial color="#d97706" roughness={0.9} />
          </mesh>
          {[
            { x: -0.80, y:  0.35, c: '#f43f5e' },
            { x: -0.45, y:  0.35, c: '#f59e0b' },
            { x: -0.10, y:  0.35, c: '#10b981' },
            { x:  0.30, y:  0.35, c: '#38bdf8' },
            { x:  0.70, y:  0.35, c: '#a855f7' },
            { x: -0.80, y: -0.15, c: '#38bdf8' },
            { x: -0.45, y: -0.15, c: '#10b981' },
            { x: -0.10, y: -0.15, c: '#f59e0b' },
            { x:  0.40, y: -0.15, c: '#f43f5e' },
          ].map((note, ni) => (
            <mesh key={`postit-${ni}`} position={[note.x, note.y, 0.035]}>
              <planeGeometry args={[0.20, 0.20]} />
              <meshBasicMaterial color={note.c} />
            </mesh>
          ))}
        </group>

        {/* Meeting Room Section: Acoustic Wood Slat Paneling & 75" Presentation Display TV */}
        <group position={[8.2, 0, 0.16]}>
          {/* Vertical Walnut Timber Slats */}
          {[-1.8, -1.5, -1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((sx, si) => (
            <mesh key={`slat-${si}`} position={[sx, 0, 0.015]}>
              <boxGeometry args={[0.06, 2.8, 0.02]} />
              <meshStandardMaterial color="#451a03" roughness={0.4} />
            </mesh>
          ))}

          {/* 75-inch TV Presentation Screen */}
          <group position={[0, 0.1, 0.08]}>
            <RoundedBox args={[3.5, 2.05, 0.06]} radius={0.03} castShadow>
              <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
            </RoundedBox>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[3.65, 2.2]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[3.38, 1.93]} />
              <meshStandardMaterial color="#0b1120" roughness={0.1} />
            </mesh>

            {/* Interactive HTML Sprint Dashboard Screen Overlay */}
            <Html position={[0, 0, 0.045]} transform center distanceFactor={5.5}>
              <div className="meeting-tv-display">
                <div className="tv-header">
                  <span className="tv-live-tag">● LIVE MULTI-AGENT SPRINT</span>
                  <span className="tv-clock">15:03:52</span>
                </div>
                <div className="tv-body">
                  <div className="tv-metric-item">
                    <span className="tv-m-val">9 / 9</span>
                    <span className="tv-m-lbl">Agents Active</span>
                  </div>
                  <div className="tv-metric-item">
                    <span className="tv-m-val">99.8%</span>
                    <span className="tv-m-lbl">SLA Performance</span>
                  </div>
                  <div className="tv-metric-item">
                    <span className="tv-m-val">
                      {collaboration.isActive ? `Step ${collaboration.currentStep}/4` : 'Standby'}
                    </span>
                    <span className="tv-m-lbl">Sprint Status</span>
                  </div>
                </div>
                <div className="tv-footer">
                  Topic: {collaboration.topic || 'Digital Product Roadmap & Architecture'}
                </div>
              </div>
            </Html>
          </group>
        </group>
      </group>

      {/* ==================================================== */}
      {/* WALL 2: BACK-LEFT WALL (Along X = -11.0, Z: -8.5 to +2.5) */}
      {/* Runs from top-center to top-left on screen.          */}
      {/* Stops at Z = +2.5 so foreground is 100% open!        */}
      {/* ==================================================== */}
      <group position={[-11.0, 2.6, -3.0]}>
        {/* Wall Surface (facing +X into the room) */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.28, 5.2, 11.2]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Baseboard */}
        <mesh position={[0.16, -2.53, 0]}>
          <boxGeometry args={[0.05, 0.14, 11.2]} />
          <meshStandardMaterial color={trimColor} />
        </mesh>

        {/* 2 Large Panoramic Windows with Venetian Blinds & Daylight Sky */}
        {[-3.2, 3.2].map((wz, wi) => (
          <group key={`backleft-win-${wi}`} position={[0.16, 0.4, wz]}>
            {/* Sky Backdrop */}
            <mesh position={[-0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[3.2, 3.2]} />
              <meshBasicMaterial color={isDark ? '#0369a1' : '#bae6fd'} />
            </mesh>
            {/* Window Outer Frame */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[3.3, 3.3, 0.06]} />
              <meshStandardMaterial color={trimColor} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Window Glass Pane */}
            <mesh position={[0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[3.15, 3.15]} />
              <meshStandardMaterial
                color="#e0f2fe"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
            {/* White Venetian Blinds Slats */}
            {[-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2].map((sy, si) => (
              <mesh key={`blind-${si}`} position={[0.03, sy, 0]} rotation={[0, Math.PI / 2, 0.2]}>
                <boxGeometry args={[3.15, 0.045, 0.008]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
              </mesh>
            ))}
            {/* Window Sill */}
            <mesh position={[0.08, -1.62, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[3.45, 0.08, 0.22]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Tall Scandinavian Modular Bookshelf between Windows */}
        <group position={[0.28, -0.5, 0]}>
          {/* Bookshelf Frame */}
          <RoundedBox args={[0.42, 3.2, 2.4]} radius={0.03} castShadow>
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </RoundedBox>
          {/* 4 Shelves */}
          {[-0.9, -0.3, 0.3, 0.9].map((sy, i) => (
            <mesh key={`shelf-plank-${i}`} position={[0.02, sy, 0]}>
              <boxGeometry args={[0.40, 0.05, 2.32]} />
              <meshStandardMaterial color="#92400e" roughness={0.5} />
            </mesh>
          ))}
          {/* Colorful Hardcover Books on Shelves */}
          {[-0.6, 0.0, 0.6].map((by, bi) => (
            <group key={`shelf-row-${bi}`} position={[0.04, by + 0.16, -0.8]}>
              {[-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map((bz, bzi) => {
                const bookColors = ['#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#cbd5e1'];
                const h = 0.24 + (bzi % 3) * 0.04;
                return (
                  <mesh key={`book-${bzi}`} position={[0, (h - 0.28) / 2, bz]}>
                    <boxGeometry args={[0.26, h, 0.07]} />
                    <meshStandardMaterial color={bookColors[(bi * 3 + bzi) % bookColors.length]} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      </group>


      {/* ==================================================== */}
      {/* 1b. EAST WING SHELL: back wall + separating partition */}
      {/* The Ruang Santai (Zone 4) lives in its OWN wing east of x = 11.5. This
          shell walls it off from the work room so the two never read as one
          overlapping space, with a wide doorway (z -1.2 .. 1.2) to walk through. */}
      <group>
        {/* Wing back wall (along z = -8.5, x 11.5 .. 22.5) */}
        <group position={[17, 2.6, -8.5]}>
          <mesh receiveShadow>
            <boxGeometry args={[11.2, 5.2, 0.28]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -2.53, 0.16]}>
            <boxGeometry args={[11.2, 0.14, 0.05]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
          {/* Two spa windows looking out on the garden strip beyond */}
          {[-2.6, 2.6].map((wz, wi) => (
            <group key={`wing-win-${wi}`} position={[wz, 0.3, 0.16]}>
              <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[2.4, 2.4]} />
                <meshBasicMaterial color={isDark ? '#0369a1' : '#bae6fd'} />
              </mesh>
              <mesh>
                <boxGeometry args={[2.5, 2.5, 0.06]} />
                <meshStandardMaterial color={trimColor} metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Separating partition (along x = 11.5, z -8.5 .. 2.5) with a doorway */}
        <group position={[11.5, 2.6, -3.0]}>
          {/* North of the doorway */}
          <mesh position={[0, 0, -3.15]} receiveShadow>
            <boxGeometry args={[0.24, 5.2, 5.7]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          {/* South of the doorway */}
          <mesh position={[0, 0, 3.35]} receiveShadow>
            <boxGeometry args={[0.24, 5.2, 3.7]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          {/* Doorway header beam across the 2.4-wide opening at z = 0 */}
          <mesh position={[0, 1.9, 0.1]}>
            <boxGeometry args={[0.24, 1.4, 2.6]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -2.53, -3.15]}>
            <boxGeometry args={[0.05, 0.14, 5.7]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
          <mesh position={[0, -2.53, 3.35]}>
            <boxGeometry args={[0.05, 0.14, 3.7]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
        </group>
      </group>


      {/* ==================================================== */}
      {/* 2. ZONE 1: RUANGAN ISTIRAHAT & POJOK KOPI (LEFT)     */}
      {/* ==================================================== */}
      <group>
        {/* Floating Zone Label */}
        <Html position={[-7.8, 3.4, -0.5]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill break">
            ☕ Pojok Kopi & Istirahat
          </div>
        </Html>

        {/* Designer Scandinavian 2-Seater Sofa.
            FACING CONTRACT (same rule as ErgonomicDeskChair above): the seat is
            modelled with its BACKREST at local -Z and its open front at +Z, so
            the group MUST be turned so local +Z lands on the direction the
            occupants look. SOFA_SPOTS in AgentCharacter.tsx puts the sofa sitters
            at x = -8.82 with rotY = PI/2 (model front +Z => world +X, toward the
            coffee table at x = -7.4), so the group needs rotationY = +PI/2 here:
            local +Z then maps to world +X and the backrest lands behind their
            backs. At -PI/2 the backrest instead lands between the agents and the
            coffee table, i.e. across their chests, which both reads as a backwards
            sofa and hides their faces behind it from the default +X camera.

            SEAT GEOMETRY CONTRACT (local frame, origin on the floor):
              cushion  z -0.44 .. +0.20, top y = CHAIR_CUSHION_TOP (0.203)
              sitters  hip at local z = -0.02, see SOFA_SPOTS in AgentCharacter.tsx
            The cushion top is the same derived 0.203 the desk chairs use (same figure, same
            upright seated pose). The sitters' hip must sit BACK of local z = -0.04: the
            figure's thigh capsule reaches 0.24 forward of the pelvis, so a hip any further
            forward leaves the thigh hanging off the front lip with nothing under it. */}
        <group position={[-8.8, 0, -0.5]} rotation={[0, Math.PI / 2, 0]}>
          {/* Seat cushion, top at CHAIR_CUSHION_TOP; 0.18 thick so it still clears the floor */}
          <RoundedBox args={[2.2, 0.18, 0.64]} radius={0.06} position={[0, CHAIR_CUSHION_TOP - 0.09, -0.12]} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[2.2, 0.52, 0.24]} radius={0.06} position={[0, CHAIR_CUSHION_TOP + 0.21, -0.32]} castShadow>
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </RoundedBox>
          {[-1.12, 1.12].map((ax, i) => (
            <RoundedBox key={`sofa-arm-${i}`} args={[0.20, 0.44, 0.68]} radius={0.05} position={[ax, CHAIR_CUSHION_TOP + 0.11, -0.10]} castShadow>
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </RoundedBox>
          ))}
          {/* Throw Pillows (Mustard & Terracotta) — y follows the cushion top */}
          <mesh position={[-0.7, CHAIR_CUSHION_TOP + 0.18, -0.16]} rotation={[0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.36, 0.36, 0.12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.7} />
          </mesh>
          <mesh position={[0.7, CHAIR_CUSHION_TOP + 0.18, -0.16]} rotation={[0.2, -0.3, 0]} castShadow>
            <boxGeometry args={[0.36, 0.36, 0.12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
        </group>

        {/* Low Scandinavian Oval Coffee Table */}
        <group position={[-7.4, 0, -0.5]}>
          <RoundedBox args={[1.0, 0.05, 1.8]} radius={0.03} position={[0, 0.32, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </RoundedBox>
          {[[-0.38, -0.68], [0.38, -0.68], [-0.38, 0.68], [0.38, 0.68]].map(([lx, lz], li) => (
            <mesh key={`ct-leg-${li}`} position={[lx, 0.15, lz]}>
              <cylinderGeometry args={[0.02, 0.03, 0.30, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
          {/* Succulent Plant on Table */}
          <group position={[0, 0.35, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.09, 0.07, 0.12, 12]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial color="#10b981" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* 2 Round Beanbag Poufs (Sage Green & Terracotta) */}
        <group position={[-7.2, 0, 0.9]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.44, 0.38, 18]} />
            <meshStandardMaterial color="#10b981" roughness={0.85} />
          </mesh>
        </group>
        <group position={[-7.2, 0, -1.9]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.44, 0.38, 18]} />
            <meshStandardMaterial color="#f97316" roughness={0.85} />
          </mesh>
        </group>

        {/* Pantry / Coffee Bar Counter along Back Wall */}
        <group position={[-6.8, 0, -7.4]}>
          <RoundedBox args={[2.8, 0.88, 0.85]} radius={0.03} position={[0, 0.44, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[2.9, 0.06, 0.9]} radius={0.02} position={[0, 0.91, 0]}>
            <meshStandardMaterial color="#78350f" roughness={0.5} />
          </RoundedBox>
          {/* Chrome Espresso Machine */}
          <mesh position={[-0.6, 1.14, 0]} castShadow>
            <boxGeometry args={[0.55, 0.42, 0.48]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Water Dispenser */}
          <group position={[0.8, 0.94, 0]}>
            <mesh position={[0, 0.24, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.42, 16]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} roughness={0.1} />
            </mesh>
          </group>
          {/* 2 Bar Stools */}
          {[-0.6, 0.6].map((bx, bi) => (
            <group key={`bstool-${bi}`} position={[bx, 0, 0.85]}>
              <mesh position={[0, 0.65, 0]} castShadow>
                <cylinderGeometry args={[0.19, 0.19, 0.06, 16]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 0.32, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.64, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>


      {/* ==================================================== */}
      {/* 3. ZONE 2: RUANGAN KERJA (SPACIOUS PODS & DESKS)     */}
      {/* ==================================================== */}
      <group>
        {/* Floating Zone Label */}
        <Html position={[0, 3.6, -3.8]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill work">
            💼 Ruangan Kerja
          </div>
        </Html>

        {/* --- EXECUTIVE SUITE: Arka (Lead Engineer) at [0, 0, -4.8] --- */}
        <group position={[0, 0, -4.8]}>
          <RoundedBox args={[2.6, 0.72, 1.1]} radius={0.04} position={[0, 0.36, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
          </RoundedBox>
          <RoundedBox args={[2.7, 0.06, 1.2]} radius={0.02} position={[0, 0.75, 0]} castShadow>
            <meshStandardMaterial color="#451a03" roughness={0.3} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0.72, 0.6]}>
            <boxGeometry args={[2.5, 0.015, 0.015]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} />
          </mesh>

          {/* Dual 27" Curved Monitors facing South (+Z) towards user */}
          <group position={[0, 1.22, -0.38]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.38, 8]} />
              <meshStandardMaterial color="#020617" metalness={0.9} />
            </mesh>
            <mesh position={[-0.58, 0, 0]} rotation={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[1.0, 0.58, 0.04]} />
              <meshStandardMaterial color="#020617" metalness={0.9} />
            </mesh>
            <mesh position={[-0.58, 0, 0.022]} rotation={[0, 0.15, 0]}>
              <planeGeometry args={[0.96, 0.54]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0.58, 0, 0]} rotation={[0, -0.15, 0]} castShadow>
              <boxGeometry args={[1.0, 0.58, 0.04]} />
              <meshStandardMaterial color="#020617" metalness={0.9} />
            </mesh>
            <mesh position={[0.58, 0, 0.022]} rotation={[0, -0.15, 0]}>
              <planeGeometry args={[0.96, 0.54]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>

          {/* Keyboard & Mouse Pad */}
          <mesh position={[0, 0.785, 0.22]}>
            <boxGeometry args={[0.52, 0.012, 0.18]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Desk Lamp */}
          <group position={[-1.0, 0.78, -0.3]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
              <meshStandardMaterial color="#b45309" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#b45309" metalness={0.8} />
            </mesh>
            <mesh position={[0.08, 0.44, 0]} rotation={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.06, 0.11, 0.14, 12]} />
              <meshStandardMaterial color="#b45309" metalness={0.8} />
            </mesh>
          </group>

          {/* Dedicated Executive Ergonomic Chair */}
            <ErgonomicDeskChair position={[0, 0, SEAT_LOCAL_Z]} rotationY={Math.PI} accentColor="#f59e0b" />
        </group>

        {/* --- 8 INDIVIDUAL DEVELOPER WORKSTATION DESK PODS --- */}
        {[
          // LEFT COLUMN (X = -4.5)
          { id: 'ui-ux-designer',  x: -4.5, z: -2.6, color: '#ec4899', title: 'Figma UI/UX' },
          { id: 'frontend-dev',    x: -4.5, z:  0.4, color: '#10b981', title: 'React FE' },
          { id: 'backend-dev',     x: -4.5, z:  3.4, color: '#8b5cf6', title: 'REST / SQL' },

          // RIGHT COLUMN (X = +1.8)
          { id: 'qa-tester',       x:  1.8, z: -2.6, color: '#f97316', title: 'Test Runner' },
          { id: 'debugger',        x:  1.8, z:  0.4, color: '#ef4444', title: 'Debug Console' },
          { id: 'product-manager', x:  1.8, z:  3.4, color: '#3b82f6', title: 'PRD Backlog' },

          // FAR-RIGHT (X = +4.0)
          { id: 'researcher',      x:  4.0, z: -2.6, color: '#0ea5e9', title: 'Web Research' },
          { id: 'writer-docs',     x:  4.0, z:  0.4, color: '#14b8a6', title: 'Tech Docs' },
        ].map((pod, i) => (
          <group key={`work-pod-${i}`} position={[pod.x, 0, pod.z]}>
            {/* Desk Surface */}
            <RoundedBox args={[1.3, 0.05, 0.8]} radius={0.02} position={[0, 0.74, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.2} />
            </RoundedBox>
            {/* Sturdy Steel Legs */}
            {[-0.56, 0.56].map((lx, li) => (
              <group key={`leg-${li}`} position={[lx, 0.36, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.04, 0.72, 0.72]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} />
                </mesh>
              </group>
            ))}

            {/* Glowing Accent LED strip */}
            <mesh position={[0, 0.72, 0.4]}>
              <boxGeometry args={[1.2, 0.015, 0.015]} />
              <meshStandardMaterial color={pod.color} emissive={pod.color} emissiveIntensity={2.5} />
            </mesh>

            {/* Dual Monitors facing South (+Z) towards user */}
            <group position={[0, 1.20, -0.28]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.36, 8]} />
                <meshStandardMaterial color="#020617" metalness={0.9} />
              </mesh>
              <mesh position={[-0.26, 0, 0]} rotation={[0, 0.08, 0]} castShadow>
                <boxGeometry args={[0.68, 0.46, 0.03]} />
                <meshStandardMaterial color="#020617" metalness={0.9} />
              </mesh>
              <mesh position={[-0.26, 0, 0.018]} rotation={[0, 0.08, 0]}>
                <planeGeometry args={[0.65, 0.43]} />
                <meshBasicMaterial color={pod.color} />
              </mesh>
              <mesh position={[0.38, 0, 0]} rotation={[0, -0.12, 0]} castShadow>
                <boxGeometry args={[0.56, 0.46, 0.03]} />
                <meshStandardMaterial color="#020617" metalness={0.9} />
              </mesh>
              <mesh position={[0.38, 0, 0.018]} rotation={[0, -0.12, 0]}>
                <planeGeometry args={[0.53, 0.43]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>

            {/* Keyboard & Mouse on Desk */}
            <mesh position={[0, 0.775, 0.16]}>
              <boxGeometry args={[0.38, 0.01, 0.14]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.26, 0.772, 0.16]}>
              <boxGeometry args={[0.07, 0.008, 0.10]} />
              <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Dedicated Ergonomic Office Chair positioned right at desk */}
            <ErgonomicDeskChair position={[0, 0, SEAT_LOCAL_Z]} rotationY={Math.PI} accentColor={pod.color} />
          </group>
        ))}
      </group>


      {/* ==================================================== */}
      {/* 4. ZONE 3: RUANGAN MEETING (GLASS BOARDROOM RIGHT)   */}
      {/* ==================================================== */}
      <group>
        {/* Floating Zone Label */}
        <Html position={[8.2, 3.6, -1.0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill meeting">
            📊 Ruangan Meeting
          </div>
        </Html>

        {/* --- CRITTALL BLACK STEEL & GLASS PARTITION WALL --- */}
        {/* Along X = 5.4, from Z = -8.5 to Z = +2.5 */}
        <group position={[5.4, 1.8, -3.0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Glass Panels */}
          {[-4.0, -2.4, 2.4, 4.0].map((gx, gi) => (
            <mesh key={`grid-glass-${gi}`} position={[gx, 0, 0]}>
              <boxGeometry args={[1.5, 3.6, 0.03]} />
              <meshStandardMaterial
                color="#60a5fa"
                transparent
                opacity={0.2}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          ))}
          {/* Black Metal Grid Frame Structure */}
          {[-4.8, -3.2, -1.6, 1.6, 3.2, 4.8].map((fx, fi) => (
            <mesh key={`grid-frame-${fi}`} position={[fx, 0, 0]}>
              <boxGeometry args={[0.06, 3.6, 0.06]} />
              <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
            </mesh>
          ))}
          {/* Top & Bottom Horizontal Beams */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[9.8, 0.07, 0.07]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.8, 0]}>
            <boxGeometry args={[9.8, 0.07, 0.07]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
          {/* Mid-Rail Horizontal Glass Divider */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[9.8, 0.04, 0.06]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
          {/* Doorway Header at Z = 0 (Doorway between -1.6 and +1.6) */}
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[3.2, 0.05, 0.06]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
        </group>

        {/* --- LARGE EXECUTIVE BOARDROOM CONFERENCE TABLE --- */}
        <group position={[8.2, 0, -2.5]}>
          <RoundedBox args={[3.6, 0.07, 1.4]} radius={0.03} position={[0, 0.74, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#451a03" roughness={0.35} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.18]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          {[-1.2, 1.2].map((bx, bi) => (
            <mesh key={`table-base-${bi}`} position={[bx, 0.36, 0]} castShadow>
              <boxGeometry args={[0.32, 0.72, 0.85]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          ))}

          {/* Conference Speakerphone Puck in Center */}
          <group position={[0, 0.80, 0]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.13, 0.035, 18]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.01, 16]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>

          {/* Laptops on Conference Table */}
          <mesh position={[-0.9, 0.785, 0.32]}>
            <boxGeometry args={[0.32, 0.015, 0.24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0.9, 0.785, -0.32]}>
            <boxGeometry args={[0.32, 0.015, 0.24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>

          {/* 8 Modern Conference Chairs around Table */}
          {/* Same SEAT HEIGHT CONTRACT as ErgonomicDeskChair: the seat top is the derived
              CHAIR_CUSHION_TOP (0.203, not the old 0.45 and not 0.32) so the seated
              figure's thigh beds on it and both soles reach the floor. Every part is
              positioned from that one constant, so the eight chairs cannot drift apart.
              The chair backrest stays at local -Z and each row's rotationY turns it
              behind the occupant (see the facing contract on ErgonomicDeskChair). */}
          {/* North Side (facing South into table) */}
          {[-0.9, 0, 0.9].map((cx, ci) => (
            <group key={`conf-chair-n-${ci}`} position={[cx, 0, -1.05]} rotation={[0, 0, 0]}>
              <RoundedBox args={[0.42, 0.06, 0.30]} radius={0.025} position={[0, CHAIR_CUSHION_TOP - 0.03, -0.03]} castShadow>
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </RoundedBox>
              <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, CHAIR_CUSHION_TOP + 0.24, -0.18]} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </RoundedBox>
              <mesh position={[0, (CHAIR_CUSHION_TOP - 0.06) / 2, -0.03]}>
                <cylinderGeometry args={[0.02, 0.02, CHAIR_CUSHION_TOP - 0.06, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.012, -0.03]}>
                <cylinderGeometry args={[0.15, 0.15, 0.024, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {/* South Side (facing North into table) */}
          {[-0.9, 0, 0.9].map((cx, ci) => (
            <group key={`conf-chair-s-${ci}`} position={[cx, 0, 1.05]} rotation={[0, Math.PI, 0]}>
              <RoundedBox args={[0.42, 0.06, 0.30]} radius={0.025} position={[0, CHAIR_CUSHION_TOP - 0.03, -0.03]} castShadow>
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </RoundedBox>
              <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, CHAIR_CUSHION_TOP + 0.24, -0.18]} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </RoundedBox>
              <mesh position={[0, (CHAIR_CUSHION_TOP - 0.06) / 2, -0.03]}>
                <cylinderGeometry args={[0.02, 0.02, CHAIR_CUSHION_TOP - 0.06, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.012, -0.03]}>
                <cylinderGeometry args={[0.15, 0.15, 0.024, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {/* West Head Chair (Tiara's Seat) - +PI/2 so its backrest sits at -X, away from the table */}
          <group position={[-2.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <RoundedBox args={[0.42, 0.06, 0.30]} radius={0.025} position={[0, CHAIR_CUSHION_TOP - 0.03, -0.03]} castShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, CHAIR_CUSHION_TOP + 0.24, -0.18]} castShadow>
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, (CHAIR_CUSHION_TOP - 0.06) / 2, -0.03]}>
              <cylinderGeometry args={[0.02, 0.02, CHAIR_CUSHION_TOP - 0.06, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.012, -0.03]}>
              <cylinderGeometry args={[0.15, 0.15, 0.024, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
          {/* East Head Chair - -PI/2 so its backrest sits at +X, away from the table */}
          <group position={[2.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <RoundedBox args={[0.42, 0.06, 0.30]} radius={0.025} position={[0, CHAIR_CUSHION_TOP - 0.03, -0.03]} castShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, CHAIR_CUSHION_TOP + 0.24, -0.18]} castShadow>
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, (CHAIR_CUSHION_TOP - 0.06) / 2, -0.03]}>
              <cylinderGeometry args={[0.02, 0.02, CHAIR_CUSHION_TOP - 0.06, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.012, -0.03]}>
              <cylinderGeometry args={[0.15, 0.15, 0.024, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Tall Corner Plant in Meeting Room */}
        <group position={[10.2, 0, -6.8]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.18, 0.76, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.54, 14, 14]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        </group>
      </group>


      {/* ==================================================== */}
      {/* 5. ZONE 4: RUANG SANTAI & KOLAM RENANG (EAST WING)   */}
      {/* ==================================================== */}
      {/* Now in its OWN wing (x 11.5 .. 22.5), NOT overlapping the work pods.
          The group is centred at world (17, 0, -4) and every furniture piece and
          spot below is expressed in local coordinates, so
          world = (17 + lx, 0, -4 + lz). LOUNGE_SPOTS in AgentCharacter.tsx owns
          the matching agent positions -- change them together.
          PLAN (local):
            x -5 .. +0.2  : spa deck, RAISED to y = 0.18 (two sun loungers)
            x -1.6 .. +4  : swimming pool basin, water at y = -0.12
            x +0.4        : pool coping + a real ladder down to the water
          The wing is one open floor at three levels -- flat (y 0), the raised spa
          deck (DECK_Y = 0.18) and the pool water (y = -0.12) -- so EVERY seat an
          agent can occupy is real furniture standing on one of those three levels,
and its cushion top is derived from that level rather than guessed:
             SPA_CUSHION_TOP = CHAIR_CUSHION_TOP (0.203), LOUNGER_SEAT_TOP = 0.31
             => seat hip  = floor + CHAIR_HIP_Y          (upright seats, AgentCharacter.tsx)
             => lounger  = deck + LOUNGER_SEAT_TOP + LOUNGE_CONTACT (reclined)
          PLAN (local, group origin = world (17, 0, -4)):
            x -5.2 .. -0.6 : spa deck, RAISED to y = DECK_Y (2 loungers + 3 chairs)
            x -0.5 ..  5.1 : pool coping ring, top y = 0.10, water at y = -0.12
          Nothing overlaps: the deck's east edge (x -0.6) stops 0.1 clear of the
          coping's west edge (x -0.5), and every agent spot is ON a cushion. */}
      <group position={[17, 0, -4]}>
        {/* Floating Zone Label */}
        <Html position={[-2.9, 2.6, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill lounge">
            🏖️ Ruang Santai & Kolam Renang
          </div>
        </Html>

        {/* --- RAISED SPA DECK: one step up at y = DECK_Y --- */}
        <mesh position={[-2.9, DECK_Y / 2, 0]}>
          <boxGeometry args={[4.6, DECK_Y, 6.0]} />
          <meshStandardMaterial color={isDark ? '#1c2436' : '#efe7d8'} roughness={0.55} />
        </mesh>
        {/* Deck step nosing along the pool-facing (east) edge, so the DECK_Y rise reads */}
        <mesh position={[-0.6, DECK_Y - 0.02, 0]}>
          <boxGeometry args={[0.12, 0.06, 6.0]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>

        {/* --- 2 SUN LOUNGERS on the raised deck, long axis along X, head end west.
            Each is rotated PI/2 so its +Z (the foot end an occupant faces) points at
            the pool; LOUNGE_SPOTS puts the agent at the group's origin with the same
            rotY, so its pelvis and both soles land on the flat seat section. --- */}
        {[-2.0, 0.4].map((lz, li) => (
          <group key={`lounger-${li}`} position={[-4.1, DECK_Y, lz]} rotation={[0, Math.PI / 2, 0]}>
            {/* Legs */}
            {[-0.72, 0.72].map((lx2, lzi) => (
              <mesh key={`ll-leg-${lzi}`} position={[lx2, 0.11, 0]}>
                <boxGeometry args={[0.05, 0.22, 0.5]} />
                <meshStandardMaterial color="#78350f" roughness={0.6} />
              </mesh>
            ))}
            {/* Flat seat section — top at LOUNGER_SEAT_TOP above the deck */}
            <RoundedBox args={[0.62, 0.1, 1.1]} radius={0.04} position={[0, LOUNGER_SEAT_TOP - 0.05, 0.32]} castShadow>
              <meshStandardMaterial color="#f8fafc" roughness={0.7} />
            </RoundedBox>
            {/* Raised backrest section, head end toward local -Z (tucked under the parasol) */}
            <RoundedBox args={[0.62, 0.1, 1.0]} radius={0.04} position={[0, 0.46, -0.36]} rotation={[-0.42, 0, 0]} castShadow>
              <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
            </RoundedBox>
            {/* Rolled headrest pillow in a spa tone */}
            <mesh position={[0, 0.58, -0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.5, 14]} />
              <meshStandardMaterial color={li === 1 ? '#14b8a6' : '#38bdf8'} roughness={0.75} />
            </mesh>
          </group>
        ))}

        {/* --- 3 SPA ARMCHAIRS on the raised deck, facing the pool (+X) --- */}
        {[-2.2, 0.0, 2.2].map((az, ai) => (
          <SpaArmchair
            key={`deck-chair-${ai}`}
            position={[-1.8, DECK_Y, az]}
            rotationY={Math.PI / 2}
            cushion={ai === 1 ? '#e0f2fe' : '#f8fafc'}
            bolster={ai === 2 ? '#99f6e4' : '#bae6fd'}
          />
        ))}

        {/* --- SIDE TABLE between loungers (sits on the deck at DECK_Y) --- */}
        <group position={[-4.1, DECK_Y, -0.8]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
          {/* Coconut / drink */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.07, 14, 12]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
          </mesh>
        </group>

        {/* Cantilever parasol at the deck's south end (pole up from the raised deck) */}
        <group position={[-4.1, DECK_Y, 2.0]}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 2.1, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh position={[0.4, 2.12, 0]} rotation={[0, 0, 0.12]} castShadow>
            <coneGeometry args={[1.25, 0.42, 8]} />
            <meshStandardMaterial color={isDark ? '#0e7490' : '#fca5a5'} roughness={0.85} side={2} />
          </mesh>
        </group>

        {/* --- SWIMMING POOL (east half of the wing) --- */}
        {/* Basin is 4.4 x 3.6; water at y = -0.12, basin floor at y = -0.42.
            Coping ring top is y = 0.10 -- a real step DOWN off the flat wing floor,
            which is where the ladder lands. */}
        <group position={[2.3, 0, 0.2]}>
          {/* Stone coping ring around the basin (4 rails) */}
          <mesh position={[0, 0.05, 2.1]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.1, 0.6]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#e2e8f0'} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.05, -2.1]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.1, 0.6]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#e2e8f0'} roughness={0.6} />
          </mesh>
          {[-2.5, 2.5].map((cx, ci) => (
            <mesh key={`coping-x-${ci}`} position={[cx, 0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.1, 3.6]} />
              <meshStandardMaterial color={isDark ? '#334155' : '#e2e8f0'} roughness={0.6} />
            </mesh>
          ))}
          {/* Basin walls (inner faces visible from above) */}
          <mesh position={[0, -0.21, 0]}>
            <boxGeometry args={[4.4, 0.48, 3.6]} />
            <meshStandardMaterial color={isDark ? '#0e7490' : '#bae6fd'} roughness={0.3} side={2} />
          </mesh>
          {/* Basin floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
            <planeGeometry args={[4.4, 3.6]} />
            <meshStandardMaterial color={isDark ? '#155e75' : '#7dd3fc'} roughness={0.2} />
          </mesh>
          {/* Glassy water surface — translucent + slight emissive so it reads as water */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
            <planeGeometry args={[4.38, 3.58]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#0891b2"
              emissiveIntensity={isDark ? 0.5 : 0.25}
              transparent
              opacity={0.72}
              roughness={0.05}
              metalness={0.35}
            />
          </mesh>
          {/* SUBMERGED ENTRY STEPS running down into the water (west end) */}
          {[-1.95, -1.61, -1.27].map((sx, s) => (
            <mesh key={`pool-step-${s}`} position={[sx, -0.08 - s * 0.12, 0]}>
              <boxGeometry args={[0.34, 0.42, 1.6]} />
              <meshStandardMaterial color={isDark ? '#155e75' : '#93c5fd'} roughness={0.4} />
            </mesh>
          ))}
          {/* CHROME POOL LADDER: the route from the wing floor (y 0) DOWN across the
              coping (y 0.10) into the water (y -0.12). It straddles the south coping
              rail, so the level change is a visible, usable step. */}
          <group position={[2.05, 0, 2.1]}>
            {[-0.22, 0.22].map((lx, lxi) => (
              <mesh key={`ladder-rail-${lxi}`} position={[lx, 0.28, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 1.2, 10]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
            ))}
            {/* Curved grip returns over the coping */}
            {[-0.22, 0.22].map((lx, lxi) => (
              <mesh key={`ladder-grip-${lxi}`} position={[lx, 0.86, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.026, 0.026, 0.4, 10]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
            ))}
            {/* 3 rungs descending into the basin */}
            {[0.34, 0.06, -0.22].map((ry, ri) => (
              <mesh key={`ladder-rung-${ri}`} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>

        {/* --- 4 POOLSIDE ARMCHAIRS on the flat wing floor, two north (facing +Z
            toward the water) and two south (facing -Z). They stand at y = 0, so
            their hip is a plain CHAIR_HIP_Y -- genuinely a step below the deck row. --- */}
        <SpaArmchair position={[1.3, 0, -3.5]} rotationY={0} cushion="#f0fdfa" bolster="#5eead4" />
        <SpaArmchair position={[3.5, 0, -3.5]} rotationY={0} cushion="#fef3c7" bolster="#fcd34d" />
        <SpaArmchair position={[1.3, 0, 3.4]} rotationY={Math.PI} cushion="#f0fdfa" bolster="#5eead4" />
        <SpaArmchair position={[3.5, 0, 3.4]} rotationY={Math.PI} cushion="#fef3c7" bolster="#fcd34d" />

        {/* --- POOLSIDE DECOR: planters flanking the south chairs, outboard of both
            so nothing crowds a seat (both sit on the flat wing floor, y 0) --- */}
        {[0.3, 4.5].map((px, pi) => (
          <group key={`planter-${pi}`} position={[px, 0, 3.4]}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.16, 0.32, 14]} />
              <meshStandardMaterial color="#e7e5e4" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.46, 0]} castShadow>
              <sphereGeometry args={[0.28, 12, 12]} />
              <meshStandardMaterial color="#15803d" roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Deck path light dots along the deck's east edge */}
        {[-5.0, -3.6, -2.2, -0.8].map((lx, li) => (
          <mesh key={`deck-light-${li}`} position={[lx, DECK_Y + 0.01, 2.8]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 10]} />
            <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={isDark ? 1.6 : 0.6} />
          </mesh>
        ))}
      </group>


      {/* ==================================================== */}
      {/* 6. ZONE 5: TAMAN / GARDEN (FRONT STRIP)              */}
      {/* ==================================================== */}
      {/* The strip the lounge used to occupy (z 4.8 .. 8.4), now a garden. It
          borders the work zone's OPEN front (no wall), so it fills the foreground
          without colliding with anything: the front pod row is z = 3.4 and its
          chair reaches z ~ 4.6, so planting starts at z = 5.0. No agent spot is
          bound here -- it is scenery, walked past on the way to the east wing. */}
      <group>
        <Html position={[0, 2.0, 6.4]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill garden">
            🌿 Taman Kantor
          </div>
        </Html>

        {/* Soil / lawn bed */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 6.6]} receiveShadow>
          <planeGeometry args={[22, 3.4]} />
          <meshStandardMaterial color={isDark ? '#12251a' : '#bbf7d0'} roughness={0.95} />
        </mesh>
        {/* Gravel border separating the garden from the work floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 4.95]} receiveShadow>
          <planeGeometry args={[22, 0.3]} />
          <meshStandardMaterial color={isDark ? '#334155' : '#e2e8f0'} roughness={0.9} />
        </mesh>

        {/* Central low planter wall with a hedge run */}
        <group position={[0, 0, 7.9]}>
          <RoundedBox args={[20, 0.34, 0.9]} radius={0.06} position={[0, 0.17, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={isDark ? '#1f2b24' : '#cbd5e1'} roughness={0.8} />
          </RoundedBox>
          {Array.from({ length: 20 }, (_, i) => -9.4 + i * 0.99).map((hx, hi) => (
            <mesh key={`hedge-${hi}`} position={[hx, 0.52, 0]} castShadow>
              <sphereGeometry args={[0.42, 12, 10]} />
              <meshStandardMaterial color={hi % 2 === 0 ? '#15803d' : '#166534'} roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Two flowering trees flanking the garden */}
        {[-8.6, 8.6].map((tx, ti) => (
          <group key={`garden-tree-${ti}`} position={[tx, 0, 6.2]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.16, 1.0, 10]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.35, 0]} castShadow>
              <sphereGeometry args={[0.72, 14, 14]} />
              <meshStandardMaterial color={ti === 0 ? '#16a34a' : '#22c55e'} roughness={0.85} />
            </mesh>
            <mesh position={[0.3, 1.6, 0.15]} castShadow>
              <sphereGeometry args={[0.34, 12, 12]} />
              <meshStandardMaterial color="#f9a8d4" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Shrub clusters + a birdbath across the bed */}
        {[-5.6, -2.4, 1.2, 4.6].map((sx, si) => (
          <group key={`shrub-${si}`} position={[sx, 0, 6.5]}>
            <mesh position={[0, 0.26, 0]} castShadow>
              <sphereGeometry args={[0.36, 12, 10]} />
              <meshStandardMaterial color={si % 2 === 0 ? '#15803d' : '#65a30d'} roughness={0.9} />
            </mesh>
            <mesh position={[0.34, 0.2, 0.2]} castShadow>
              <sphereGeometry args={[0.24, 10, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.9} />
            </mesh>
          </group>
        ))}
        <group position={[3.0, 0, 5.9]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.2, 16]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#e2e8f0'} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.5, 10]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#cbd5e1'} roughness={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.52, 0]}>
            <circleGeometry args={[0.3, 20]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} roughness={0.1} metalness={0.3} />
          </mesh>
        </group>

        {/* Stepping stones leading from the work floor toward the wing doorway */}
        {[[-3.0, 5.4], [-1.4, 5.1], [0.4, 5.4], [1.8, 5.1]].map(([px, pz], pi) => (
          <mesh key={`stone-${pi}`} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0.02, pz]} receiveShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.04, 14]} />
            <meshStandardMaterial color={isDark ? '#475569' : '#d6d3d1'} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
