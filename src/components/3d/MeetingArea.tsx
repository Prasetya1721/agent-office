// ============================================
// AgentOffice - 3D Meeting Area & Hologram Sync
// ============================================
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import { Group } from 'three';
import { useAppStore } from '../../store/useAppStore';

interface MeetingAreaProps {
  position: [number, number, number];
}

export function MeetingArea({ position }: MeetingAreaProps) {
  const collaboration = useAppStore((s) => s.collaboration);
  const agents = useAppStore((s) => s.agents);
  const holoRingRef = useRef<Group>(null);
  const orbRef = useRef<Group>(null);

  const activeSpeaker = agents.find((a) => a.id === collaboration.activeSpeakerId);
  const targetSpeaker = agents.find((a) => a.id === collaboration.targetSpeakerId);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (holoRingRef.current) {
      holoRingRef.current.rotation.y = t * 0.8;
    }
    if (orbRef.current) {
      orbRef.current.position.y = 1.3 + Math.sin(t * 2) * 0.08;
      orbRef.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Central round table */}
      <group position={[0, 0, 0]}>
        {/* Table top */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.06, 24]} />
          <meshStandardMaterial
            color="#1a1a3a"
            metalness={0.6}
            roughness={0.3}
            emissive={collaboration.isActive ? '#6366f1' : '#1a1a3a'}
            emissiveIntensity={collaboration.isActive ? 0.3 : 0.02}
          />
        </mesh>
        {/* Table holographic ring */}
        <mesh position={[0, 0.54, 0]}>
          <torusGeometry args={[0.75, 0.01, 8, 32]} />
          <meshBasicMaterial
            color={collaboration.isActive ? '#22c55e' : '#6366f1'}
            transparent
            opacity={collaboration.isActive ? 0.9 : 0.4}
          />
        </mesh>
        {/* Table base */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.5, 12]} />
          <meshStandardMaterial color="#2a2a55" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Table foot */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
          <meshStandardMaterial color="#2a2a55" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Holographic projector effect */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.5, 1.4, 16, 1, true]} />
        <meshBasicMaterial
          color={collaboration.isActive ? '#38bdf8' : '#6366f1'}
          transparent
          opacity={collaboration.isActive ? 0.15 : 0.04}
          depthWrite={false}
        />
      </mesh>

      {/* Floating Holographic Sphere during active collaboration */}
      {collaboration.isActive && (
        <group ref={orbRef} position={[0, 1.3, 0]}>
          {/* Central orb */}
          <mesh>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Orbiting rings */}
          <group ref={holoRingRef}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.26, 0.008, 8, 32]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.34, 0.008, 8, 32]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
            </mesh>
          </group>

          {/* Floating UI Badge above table */}
          <Html position={[0, 0.45, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <div
              style={{
                background: 'rgba(15, 17, 35, 0.92)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '12px',
                padding: '8px 14px',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.3)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#38bdf8',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                ⚡ Multi-Agent Sync • Step {collaboration.currentStep}/{collaboration.totalSteps}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                {activeSpeaker?.name || 'Lead'} → {targetSpeaker?.name || 'Tim'}
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* Floor accent rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.3, 1.35, 32]} />
        <meshBasicMaterial
          color={collaboration.isActive ? '#38bdf8' : '#6366f1'}
          transparent
          opacity={collaboration.isActive ? 0.35 : 0.15}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.52, 32]} />
        <meshBasicMaterial
          color={collaboration.isActive ? '#a855f7' : '#818cf8'}
          transparent
          opacity={collaboration.isActive ? 0.2 : 0.08}
        />
      </mesh>

      {/* Decorative corner pillars */}
      {[
        [-7, 0, -4.5],
        [7, 0, -4.5],
        [-7, 0, 6],
        [7, 0, 6],
      ].map(([x, _, z], i) => (
        <group key={`pillar-${i}`} position={[x, 0, z]}>
          <RoundedBox args={[0.2, 6, 0.2]} radius={0.05} position={[0, 3, 0]}>
            <meshStandardMaterial
              color="#12122a"
              metalness={0.4}
              roughness={0.6}
            />
          </RoundedBox>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[0.22, 0.04, 0.22]} />
            <meshStandardMaterial
              color={collaboration.isActive ? '#38bdf8' : '#6366f1'}
              emissive={collaboration.isActive ? '#38bdf8' : '#6366f1'}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
