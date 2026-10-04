// ============================================
// AgentOffice - 3D Agent Character (v3 - Improved)
// Better proportioned clay-style humanoid
// ============================================
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

function Arm({ bodyColor, skinColor }: { bodyColor: string; skinColor: string }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.082, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.13, 0]} castShadow>
        <capsuleGeometry args={[0.062, 0.12, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.23, 0]} castShadow>
        <sphereGeometry args={[0.058, 16, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.34, 0]} castShadow>
        <capsuleGeometry args={[0.052, 0.11, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.45, 0]} castShadow>
        <sphereGeometry args={[0.058, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>
    </group>
  );
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
  const [hovered, setHovered] = useState(false);

  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const setChatAgent = useAppStore((s) => s.setChatAgent);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const collaboration = useAppStore((s) => s.collaboration);
  const isSpeaking = collaboration.isActive && collaboration.activeSpeakerId === agent.id;

  const getTargetTransform = (): { pos: [number, number, number]; rotY: number } => {
    if (agent.roomZone === 'break') {
      const breakSpots: Record<string, { pos: [number, number, number]; rotY: number }> = {
        'researcher':  { pos: [-8.8, 0, -1.0], rotY: -Math.PI / 2 }, // on sofa facing coffee table
        'writer-docs': { pos: [-8.8, 0,  0.0], rotY: -Math.PI / 2 }, // on sofa facing coffee table
      };
      return breakSpots[agent.id] || { pos: [-7.2, 0, 0.9], rotY: Math.PI / 2 }; // on beanbag
    }
    if (agent.roomZone === 'meeting') {
      const meetingSpots: Record<string, { pos: [number, number, number]; rotY: number }> = {
        'product-manager': { pos: [ 6.15, 0, -2.5], rotY: -Math.PI / 2 }, // head of table
        'lead-engineer':   { pos: [ 7.3,  0, -3.55], rotY: Math.PI },     // north side facing south
        'ui-ux-designer':  { pos: [ 8.2,  0, -3.55], rotY: Math.PI },
        'frontend-dev':    { pos: [ 9.1,  0, -3.55], rotY: Math.PI },
        'backend-dev':     { pos: [ 7.3,  0, -1.45], rotY: 0 },           // south side facing north
        'debugger':        { pos: [ 8.2,  0, -1.45], rotY: 0 },
        'qa-tester':       { pos: [ 9.1,  0, -1.45], rotY: 0 },
        'researcher':      { pos: [10.25, 0, -2.5], rotY: Math.PI / 2 }, // east head facing west
        'writer-docs':     { pos: [ 8.2,  0, -1.45], rotY: 0 },
      };
      return meetingSpots[agent.id] || { pos: [8.2, 0, -2.5], rotY: -Math.PI / 2 };
    }
    return { pos: basePosition, rotY: baseRotationY };
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime + agent.id.charCodeAt(0) * 0.1;
    const { pos: targetPos, rotY: targetRotY } = getTargetTransform();

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
      // Gentle walk step bounce at floor level
      groupRef.current.position.y = Math.abs(Math.sin(t * 12)) * 0.035;
    } else {
      groupRef.current.position.x = MathUtils.lerp(cx, targetPos[0], 0.18);
      groupRef.current.position.z = MathUtils.lerp(cz, targetPos[2], 0.18);
      let rotDiff = targetRotY - groupRef.current.rotation.y;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      groupRef.current.rotation.y += rotDiff * 0.12;
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
    }

    // Articulated Legs: Thigh & Shin with Knee Joint
    if (leftLegRef.current && rightLegRef.current && leftShinRef.current && rightShinRef.current) {
      if (isMoving) {
        // Natural human walking cycle
        leftLegRef.current.rotation.x = Math.sin(t * 12) * 0.45;
        rightLegRef.current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.45;
        leftShinRef.current.rotation.x = Math.max(0, Math.sin(t * 12)) * 0.55;
        rightShinRef.current.rotation.x = Math.max(0, Math.sin(t * 12 + Math.PI)) * 0.55;
      } else {
        // Seated on chair or sofa: Thigh horizontal (-90°), Shin vertical (+90°), Feet grounded!
        leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, -Math.PI / 2, 0.15);
        rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, -Math.PI / 2, 0.15);
        leftShinRef.current.rotation.x = MathUtils.lerp(leftShinRef.current.rotation.x, Math.PI / 2, 0.15);
        rightShinRef.current.rotation.x = MathUtils.lerp(rightShinRef.current.rotation.x, Math.PI / 2, 0.15);
      }
    }

    if (headRef.current) {
      if (agent.status === 'working') {
        headRef.current.rotation.x = 0.18 + Math.sin(t * 5) * 0.04;
        headRef.current.rotation.y = Math.sin(t * 2.5) * 0.06;
      } else if (agent.status === 'thinking') {
        headRef.current.rotation.x = -0.1 + Math.sin(t * 1.2) * 0.06;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.18;
      } else if (agent.status === 'discussing') {
        headRef.current.rotation.x = Math.sin(t * 5) * 0.08;
        headRef.current.rotation.y = Math.sin(t * 3) * 0.22;
      } else {
        headRef.current.rotation.x = 0.04 + Math.sin(t * 1.2) * 0.02;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
      }
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 1.1) * 0.015;
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isMoving) {
        leftArmRef.current.rotation.x = Math.sin(t * 12 + Math.PI) * 0.45;
        rightArmRef.current.rotation.x = Math.sin(t * 12) * 0.45;
        leftArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.z = 0;
      } else if (agent.status === 'working') {
        // Typing on keyboard
        leftArmRef.current.rotation.x = -0.85 + Math.sin(t * 12) * 0.12;
        rightArmRef.current.rotation.x = -0.85 + Math.cos(t * 12) * 0.12;
        leftArmRef.current.rotation.z = 0.1;
        rightArmRef.current.rotation.z = -0.1;
      } else {
        // Rest hands comfortably forward
        leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, -0.65, 0.08);
        rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, -0.65, 0.08);
        leftArmRef.current.rotation.z = MathUtils.lerp(leftArmRef.current.rotation.z, 0.08, 0.08);
        rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, -0.08, 0.08);
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
  const hairColor = agent.avatar.accentColor;

  return (
    <group
      ref={groupRef}
      position={[basePosition[0], 0, basePosition[2]]}
      rotation={[0, baseRotationY, 0]}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* BODY */}
      <group ref={bodyRef} position={[0, 0.50, 0]}>
        {/* LEFT LEG with Knee Joint */}
        <group ref={leftLegRef} position={[-0.11, 0, 0]}>
          {/* Thigh (Hip to Knee) */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.14, 8, 16]} />
            <meshStandardMaterial color="#1e2a3a" roughness={0.9} />
          </mesh>
          {/* Knee & Shin/Foot */}
          <group ref={leftShinRef} position={[0, -0.22, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.066, 16, 16]} />
              <meshStandardMaterial color="#1e2a3a" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.056, 0.13, 8, 16]} />
              <meshStandardMaterial color="#2d3748" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.22, -0.04]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.105, 0.07, 0.17]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
            </mesh>
          </group>
        </group>

        {/* RIGHT LEG with Knee Joint */}
        <group ref={rightLegRef} position={[0.11, 0, 0]}>
          {/* Thigh (Hip to Knee) */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.14, 8, 16]} />
            <meshStandardMaterial color="#1e2a3a" roughness={0.9} />
          </mesh>
          {/* Knee & Shin/Foot */}
          <group ref={rightShinRef} position={[0, -0.22, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.066, 16, 16]} />
              <meshStandardMaterial color="#1e2a3a" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.056, 0.13, 8, 16]} />
              <meshStandardMaterial color="#2d3748" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.22, -0.04]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.105, 0.07, 0.17]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
            </mesh>
          </group>
        </group>

        {/* HIP */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.06, 8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.8} />
        </mesh>

        {/* TORSO */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.28, 12, 24]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.8}
            emissive={bodyColor}
            emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
          />
        </mesh>

        {/* NECK */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.08, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>

        {/* LEFT ARM */}
        <group ref={leftArmRef} position={[-0.27, 0.38, 0]}>
          <Arm bodyColor={bodyColor} skinColor={skinColor} />
        </group>

        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.27, 0.38, 0]}>
          <Arm bodyColor={bodyColor} skinColor={skinColor} />
        </group>

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.235, 32, 32]} />
            <meshStandardMaterial color={skinColor} roughness={0.55} />
          </mesh>

          {/* Hair */}
          <mesh position={[0, 0.18, -0.01]} castShadow>
            <sphereGeometry args={[0.195, 24, 24]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.175, 0.09, -0.04]} castShadow>
            <sphereGeometry args={[0.155, 20, 20]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.175, 0.09, -0.04]} castShadow>
            <sphereGeometry args={[0.155, 20, 20]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, -0.18]} castShadow>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Eyes */}
          {([-0.09, 0.09] as number[]).map((ex, ei) => (
            <group key={`eye-${ei}`} position={[ex, 0.04, -0.216]}>
              <mesh>
                <sphereGeometry args={[0.034, 16, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, -0.018]}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0.008, 0.01, -0.028]}>
                <sphereGeometry args={[0.007, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}

          {/* Nose */}
          <mesh position={[0, -0.04, -0.228]} castShadow>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>

          {/* Smile */}
          <mesh position={[-0.04, -0.1, -0.218]} rotation={[0, 0, -0.4]}>
            <torusGeometry args={[0.022, 0.007, 8, 16, Math.PI * 0.7]} />
            <meshBasicMaterial color="#7c3f3f" />
          </mesh>
          <mesh position={[0.04, -0.1, -0.218]} rotation={[0, 0, 0.4]}>
            <torusGeometry args={[0.022, 0.007, 8, 16, Math.PI * 0.7]} />
            <meshBasicMaterial color="#7c3f3f" />
          </mesh>

          {/* Cheeks */}
          <mesh position={[-0.155, -0.04, -0.19]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshBasicMaterial color="#f9a8a8" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.155, -0.04, -0.19]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshBasicMaterial color="#f9a8a8" transparent opacity={0.6} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.235, 0, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          <mesh position={[0.235, 0, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* SELECTION RING */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.6, 36]} />
          <meshBasicMaterial color={agent.color} transparent opacity={isSelected ? 0.9 : 0.45} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={agent.color} transparent opacity={isSelected ? 0.12 : hovered ? 0.08 : 0.04} />
      </mesh>

      {/* BADGE */}
      <Html position={[0, 2.1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
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
          <span className="agent-capsule-name">
            {agent.name.split(' ')[0]} <span className="agent-capsule-tag">[{agent.shortTag}]</span>
          </span>
          <span className="agent-capsule-divider">•</span>
          <span className="agent-capsule-status">{statusLabel}</span>
        </div>
      </Html>

      {/* SPEECH BALLOON */}
      {isSpeaking && (
        <Html position={[0, 2.65, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
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

