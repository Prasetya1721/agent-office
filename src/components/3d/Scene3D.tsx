// ============================================
// AgentOffice - 3D Office Scene
// Isometric camera view with 6 specialist workstations,
// Ruangan Istirahat (Pojok Kopi), and Ruangan Meeting
// ============================================
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Suspense } from 'react';
import { OfficeRoom } from './OfficeRoom';
import { AgentCharacter } from './AgentCharacter';
import { useAppStore } from '../../store/useAppStore';
import './Scene3D.css';

// 6 Agent Workstation Positions & Chair Orientations in the Office
export const AGENT_CONFIGS: Record<string, { position: [number, number, number]; rotationY: number }> = {
  'arka-ao': {
    position: [0.5, 0, -3.15],
    rotationY: Math.PI, // Facing north towards desk & dual curved monitors
  },
  'tiara-pm': {
    position: [-3.2, 0, -3.9],
    rotationY: Math.PI,
  },
  'fajar-fe': {
    position: [-3.2, 0, -0.8],
    rotationY: Math.PI,
  },
  'dimas-de': {
    position: [4.2, 0, -4.1],
    rotationY: 0, // Facing south towards desk
  },
  'reza-sm': {
    position: [0.6, 0, 0.2],
    rotationY: Math.PI / 2, // Facing east towards desk
  },
  'gilang-cw': {
    position: [-1.9, 0, 1.2],
    rotationY: -Math.PI / 2, // Facing west towards desk
  },
};

export const AGENT_POSITIONS: Record<string, [number, number, number]> = {
  'arka-ao': [0.5, 0, -3.15],
  'tiara-pm': [-3.2, 0, -3.9],
  'fajar-fe': [-3.2, 0, -0.8],
  'dimas-de': [4.2, 0, -4.1],
  'reza-sm': [0.6, 0, 0.2],
  'gilang-cw': [-1.9, 0, 1.2],
};

export function Scene3D() {
  const agents = useAppStore((s) => s.agents);
  const settings = useAppStore((s) => s.settings);
  const selectedAgentId = useAppStore((s) => s.selectedAgentId);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const isDark = settings.theme === 'dark';
  const bgColor = isDark ? '#0b0f19' : '#f8fafc';

  return (
    <div className="scene3d-container">
      <Canvas shadows={!settings.performanceMode} dpr={settings.performanceMode ? 1 : [1, 2]}>
        {/* Isometric Elevated Camera matching Screenshot */}
        <PerspectiveCamera makeDefault position={[13.5, 15.5, 16.5]} fov={38} />
        
        <color attach="background" args={[bgColor]} />
        
        {/* Daylight and Office Lighting */}
        <ambientLight intensity={isDark ? 0.45 : 0.85} />
        
        {/* Main Sun Angle from Back/Left Windows */}
        <directionalLight
          position={[-12, 18, -10]}
          intensity={isDark ? 0.8 : 1.4}
          castShadow={!settings.performanceMode}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={45}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0001}
        />

        {/* Soft Fill Lights for Ruangan Istirahat & Ruangan Meeting */}
        <pointLight position={[-8, 5, 1]} intensity={0.4} color="#f59e0b" distance={12} />
        <pointLight position={[7.5, 4.5, 3.5]} intensity={0.5} color="#38bdf8" distance={12} />
        <pointLight position={[0.5, 4, -3.5]} intensity={0.3} color="#ffffff" distance={10} />

        <Suspense fallback={null}>
          {/* Office Room Architecture (Ruangan Kerja, Istirahat / Pojok Kopi, Meeting) */}
          <OfficeRoom />

          {/* 6 Specialist Agents seated at their workstations */}
          {agents.map((agent, index) => {
            const config = AGENT_CONFIGS[agent.id] || {
              position: [-4 + (index % 5) * 1.5, 0, -5.5 + Math.floor(index / 5) * 1.5] as [number, number, number],
              rotationY: Math.PI,
            };
            return (
              <AgentCharacter
                key={agent.id}
                agent={agent}
                basePosition={config.position}
                baseRotationY={config.rotationY}
                isSelected={selectedAgentId === agent.id}
              />
            );
          })}

          {/* Contact Shadows under furniture and agents */}
          {!settings.performanceMode && (
            <ContactShadows
              position={[0, 0.005, 0]}
              opacity={0.35}
              scale={28}
              blur={1.8}
              far={6}
            />
          )}
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={32}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={0.2}
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  );
}
