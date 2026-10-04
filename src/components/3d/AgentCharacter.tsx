// ============================================
// AgentOffice - 3D Agent Character & Ergonomic Workstation
// Model humanoid sitting in office chair with animated typing & overhead badge
// ============================================
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import type { Agent } from '../../types';
import { useAppStore } from '../../store/useAppStore';

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

export function AgentCharacter({
  agent,
  basePosition,
  baseRotationY,
  isSelected,
}: AgentCharacterProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const chairRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const setChatAgent = useAppStore((s) => s.setChatAgent);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const collaboration = useAppStore((s) => s.collaboration);
  const isSpeaking = collaboration.isActive && collaboration.activeSpeakerId === agent.id;

  // Determine target based on roomZone
  const zoneOffsets: Record<string, [number, number, number]> = {
    'arka-ao': [0, 0, 0],
    'tiara-pm': [-1, 0, 1],
    'fajar-fe': [1, 0, -1],
    'dimas-de': [-1, 0, -1],
    'reza-sm': [1, 0, 1],
    'gilang-cw': [0, 0, 1.5],
  };
  
  const getTargetTransform = (): { pos: [number, number, number], rotY: number } => {
    const offset = zoneOffsets[agent.id] || [0, 0, 0];
    if (agent.roomZone === 'break') {
      return { pos: [-8.5 + offset[0], 0, 1 + offset[2]], rotY: Math.PI / 2 };
    }
    if (agent.roomZone === 'meeting') {
      return { pos: [7.5 + offset[0] * 0.8, 0, 3.5 + offset[2] * 0.8], rotY: -Math.PI / 2 };
    }
    // Default to work desk
    return { pos: basePosition, rotY: baseRotationY };
  };

  // Real-time animation loop
  useFrame((state) => {
    const t = state.clock.elapsedTime + agent.id.length;
    const { pos: targetPosArr, rotY: targetRotY } = getTargetTransform();
    
    if (!groupRef.current) return;
    
    // Smooth position & rotation interpolation
    const currentX = groupRef.current.position.x;
    const currentZ = groupRef.current.position.z;
    const dx = targetPosArr[0] - currentX;
    const dz = targetPosArr[2] - currentZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isMoving = dist > 0.1;

    if (isMoving) {
      // Constant speed instead of lerp for walking to avoid "warp" sliding effect
      const moveSpeed = 0.04;
      groupRef.current.position.x += (dx / dist) * moveSpeed;
      groupRef.current.position.z += (dz / dist) * moveSpeed;
      
      // Face movement direction smoothly
      const moveAngle = Math.atan2(dx, dz);
      let diff = moveAngle - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.15;
      
      // Walking bounce
      groupRef.current.position.y = Math.abs(Math.sin(t * 15)) * 0.12;
    } else {
      groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetPosArr[0], 0.2);
      groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, targetPosArr[2], 0.2);
      
      // Face target rotation
      let diff = targetRotY - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      
      // Smoothly return Y to floor level (subtle breathing/chair swivel)
      const targetY = agent.status === 'working' ? Math.sin(t * 8) * 0.005 : Math.sin(t * 1.5) * 0.004;
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, targetY, 0.15);
    }

    // Toggle Chair Visibility
    if (chairRef.current) {
      // Scale down chair completely when not at work desk (to simulate walking away)
      const targetChairScale = agent.roomZone === 'work' && !isMoving ? 1 : 0.001;
      chairRef.current.scale.setScalar(MathUtils.lerp(chairRef.current.scale.x, targetChairScale, 0.2));
    }

    // Leg walking animation
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving || agent.roomZone !== 'work') {
        // Standing / Walking posture
        leftLegRef.current.rotation.x = isMoving ? Math.sin(t * 15) * 0.6 : 0;
        rightLegRef.current.rotation.x = isMoving ? Math.sin(t * 15 + Math.PI) * 0.6 : 0;
        leftLegRef.current.position.set(-0.12, 0.0, 0);
        rightLegRef.current.position.set(0.12, 0.0, 0);
      } else {
        // Seated posture (legs swing forward)
        leftLegRef.current.rotation.x = -Math.PI / 2.2;
        rightLegRef.current.rotation.x = -Math.PI / 2.2;
        leftLegRef.current.position.set(-0.12, 0.0, -0.1);
        rightLegRef.current.position.set(0.12, 0.0, -0.1);
      }
    }

    // Head movements
    if (headRef.current) {
      if (agent.status === 'working') {
        headRef.current.rotation.x = 0.15 + Math.sin(t * 4) * 0.04;
        headRef.current.rotation.y = Math.sin(t * 2) * 0.08;
      } else if (agent.status === 'thinking') {
        headRef.current.rotation.x = -0.1 + Math.sin(t * 1.2) * 0.06;
        headRef.current.rotation.y = Math.sin(t * 0.9) * 0.15;
      } else if (agent.status === 'discussing' || agent.roomZone === 'meeting') {
        headRef.current.rotation.x = Math.sin(t * 5) * 0.08;
        headRef.current.rotation.y = Math.sin(t * 3) * 0.2;
      } else {
        headRef.current.rotation.x = 0.05 + Math.sin(t * 1.2) * 0.02;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
      }
    }

    // Arm typing/walking animations
    if (leftArmRef.current && rightArmRef.current) {
      if (isMoving) {
        // Swing arms opposite to legs
        leftArmRef.current.rotation.x = Math.sin(t * 15 + Math.PI) * 0.4;
        rightArmRef.current.rotation.x = Math.sin(t * 15) * 0.4;
      } else if (agent.status === 'working' && agent.roomZone === 'work') {
        leftArmRef.current.rotation.x = -0.8 + Math.sin(t * 14) * 0.12;
        rightArmRef.current.rotation.x = -0.8 + Math.cos(t * 14) * 0.12;
      } else {
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, -0.6, 0.1);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, -0.6, 0.1);
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

  const statusLabel = agent.status === 'idle'
    ? agent.currentTaskSummary.split('•')[1]?.trim() || STATUS_TAGS[agent.status]
    : STATUS_TAGS[agent.status];

  return (
    <group
      ref={groupRef}
      position={[basePosition[0], 0, basePosition[2]]}
      rotation={[0, baseRotationY, 0]}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* ==================================================== */}
      {/* 1. ERGONOMIC SWIVEL OFFICE CHAIR                     */}
      {/* ==================================================== */}
      <group ref={chairRef} position={[0, 0, 0]}>
        {/* 5-Star Wheel Base */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.3, 0.32, 0.04, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <group key={`wheel-${i}`} position={[Math.cos(angle) * 0.28, 0.03, Math.sin(angle) * 0.28]}>
              <mesh rotation={[Math.PI / 2, 0, angle]}>
                <cylinderGeometry args={[0.03, 0.03, 0.03, 8]} />
                <meshStandardMaterial color="#020617" />
              </mesh>
            </group>
          );
        })}

        {/* Hydraulic Piston Lift Cylinder */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.38, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Chair Seat Cushion */}
        <RoundedBox args={[0.52, 0.08, 0.5]} radius={0.03} position={[0, 0.44, 0]} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </RoundedBox>

        {/* Mesh Backrest */}
        <RoundedBox
          args={[0.48, 0.62, 0.06]}
          radius={0.03}
          position={[0, 0.76, 0.22]}
          rotation={[-0.1, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </RoundedBox>

        {/* Headrest */}
        <RoundedBox
          args={[0.26, 0.14, 0.05]}
          radius={0.02}
          position={[0, 1.12, 0.26]}
          castShadow
        >
          <meshStandardMaterial color="#1e293b" />
        </RoundedBox>

        {/* Armrests */}
        {[-0.27, 0.27].map((ax, ai) => (
          <group key={`armrest-${ai}`} position={[ax, 0.58, 0.02]}>
            {/* Vertical Armrest Post */}
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[0.03, 0.16, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.6} />
            </mesh>
            {/* Padded Top Rest */}
            <RoundedBox args={[0.06, 0.03, 0.28]} radius={0.01} position={[0, 0.03, 0]} castShadow>
              <meshStandardMaterial color="#0f172a" />
            </RoundedBox>
          </group>
        ))}
      </group>

      {/* ==================================================== */}
      {/* 2. CUTE CLAY-STYLE HUMANOID CHARACTER MODEL          */}
      {/* ==================================================== */}
      <group position={[0, 0.46, 0]}>
        
        {/* Legs (Longer Capsules to reach floor) */}
        <group ref={leftLegRef} position={[-0.12, 0.0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.32, 8, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.4, -0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.12, 8, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.12, 0.0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.32, 8, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.4, -0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.12, 8, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        </group>

        {/* Puffy Torso / Sweater */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.25, 12, 24]} />
          <meshStandardMaterial
            color={agent.avatar.bodyColor}
            roughness={0.8}
            emissive={agent.avatar.bodyColor}
            emissiveIntensity={isSelected ? 0.35 : hovered ? 0.2 : 0.0}
          />
        </mesh>

        {/* Big Cute Head & Face */}
        <group ref={headRef} position={[0, 0.78, 0]}>
          {/* Main Head Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color={agent.avatar.headColor} roughness={0.5} />
          </mesh>

          {/* Cloud-like Puffy Hair */}
          <group position={[0, 0.15, 0]}>
            <mesh position={[0, 0.1, -0.02]} castShadow>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color={agent.avatar.accentColor} roughness={0.9} />
            </mesh>
            <mesh position={[-0.18, 0, -0.05]} castShadow>
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshStandardMaterial color={agent.avatar.accentColor} roughness={0.9} />
            </mesh>
            <mesh position={[0.18, 0, -0.05]} castShadow>
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshStandardMaterial color={agent.avatar.accentColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.05, 0.18]} castShadow>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color={agent.avatar.accentColor} roughness={0.9} />
            </mesh>
          </group>

          {/* Simple Dot Eyes */}
          <mesh position={[-0.08, 0.02, -0.22]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.08, 0.02, -0.22]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Rosy Cheeks */}
          <mesh position={[-0.14, -0.04, -0.19]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color="#fca5a5" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.14, -0.04, -0.19]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color="#fca5a5" transparent opacity={0.7} />
          </mesh>
        </group>

        {/* Soft Arms & Hands */}
        <group ref={leftArmRef} position={[-0.26, 0.45, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
            <meshStandardMaterial color={agent.avatar.bodyColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={agent.avatar.headColor} roughness={0.5} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.26, 0.45, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
            <meshStandardMaterial color={agent.avatar.bodyColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={agent.avatar.headColor} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ==================================================== */}
      {/* 3. SELECTION RING ON FLOOR                           */}
      {/* ==================================================== */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.55, 0.62, 32]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={isSelected ? 0.9 : 0.4}
          />
        </mesh>
      )}

      {/* ==================================================== */}
      {/* 4. OVERHEAD PILL BADGE (MATCHING SCREENSHOT!)         */}
      {/* Example: "● Arka [AO] • sprint 3 review"             */}
      {/* ==================================================== */}
      <Html
        position={[0, 1.85, 0]}
        center
        distanceFactor={11}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className={`agent-overhead-capsule ${isSelected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
          style={{
            borderColor: agent.color,
            boxShadow: isSelected
              ? `0 0 16px ${agent.color}88, 0 4px 12px rgba(0,0,0,0.5)`
              : `0 2px 10px rgba(0,0,0,0.35)`,
          }}
        >
          <span
            className="agent-capsule-dot"
            style={{
              backgroundColor: agent.color,
              boxShadow: `0 0 8px ${agent.color}`,
            }}
          />
          <span className="agent-capsule-name">
            {agent.name.split(' ')[0]} <span className="agent-capsule-tag">[{agent.shortTag}]</span>
          </span>
          <span className="agent-capsule-divider">•</span>
          <span className="agent-capsule-status">{statusLabel}</span>
        </div>
      </Html>

      {/* ==================================================== */}
      {/* 5. COLLABORATION SPEECH BALLOON                      */}
      {/* ==================================================== */}
      {isSpeaking && (
        <Html
          position={[0, 2.35, 0]}
          center
          distanceFactor={9}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="agent-speech-balloon"
            style={{
              borderColor: agent.color,
              boxShadow: `0 0 20px ${agent.color}aa`,
            }}
          >
            <span className="speech-icon">💬</span>
            <span style={{ color: agent.color, fontWeight: 700 }}>
              {agent.shortTag}:
            </span>
            <span className="speech-text">Koordinasi sprint aktif...</span>
          </div>
        </Html>
      )}
    </group>
  );
}
