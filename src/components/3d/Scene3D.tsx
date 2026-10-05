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

// 9 Agent Workstation Positions - Aligned with individual spacious desk pods
// Each pod sits at (pod.x, 0, pod.z) and the agent's seat is SW + DESK/SEAT
// contract in OfficeRoom.tsx: seat world pos = (pod.x, 0, pod.z + SEAT_LOCAL_Z).
// rotY is interpreted as: 0 => model front faces +Z, PI => -Z, PI/2 => +X, -PI/2 => -X.
// IMPORTANT: inside a pod the desk sits at local z = 0 while the chair (and the
// seated agent) sits at local z = SEAT_LOCAL_Z = +0.95, so the monitors -- which
// face +Z "towards the user" -- are actually BEHIND the seat at -Z. To look AT
// the workstation the model must therefore face -Z, i.e. rotY = PI. (rotY = 0
// would put the agent's back to the desk, which reads as a backwards figure.)
export const AGENT_CONFIGS: Record<string, { position: [number, number, number]; rotationY: number }> = {
  // Arka (Lead) - Executive Suite desk at [0, 0, -4.8], chair at z -3.85
  'lead-engineer':   { position: [ 0.0, 0, -3.85], rotationY: Math.PI },

  // Left Column (X = -4.5) - pods at z -2.6 / 0.4 / 3.4
  'ui-ux-designer':  { position: [-4.5, 0, -1.65], rotationY: Math.PI },
  'frontend-dev':    { position: [-4.5, 0,  1.35], rotationY: Math.PI },
  'backend-dev':     { position: [-4.5, 0,  4.35], rotationY: Math.PI },

  // Right Column (X = +1.8)
  'qa-tester':       { position: [ 1.8, 0, -1.65], rotationY: Math.PI },
  'debugger':        { position: [ 1.8, 0,  1.35], rotationY: Math.PI },
  'product-manager': { position: [ 1.8, 0,  4.35], rotationY: Math.PI },

  // Far Right Workstations (X = +4.0)
  'researcher':      { position: [ 4.0, 0, -1.65], rotationY: Math.PI },
  'writer-docs':     { position: [ 4.0, 0,  1.35], rotationY: Math.PI },
};

export const AGENT_POSITIONS: Record<string, [number, number, number]> = {
  'lead-engineer':   [ 0.0, 0, -4.0],
  'ui-ux-designer':  [-4.5, 0, -2.0],
  'frontend-dev':    [-4.5, 0,  0.6],
  'backend-dev':     [-4.5, 0,  3.2],
  'qa-tester':       [ 1.8, 0, -2.0],
  'debugger':        [ 1.8, 0,  0.6],
  'product-manager': [ 1.8, 0,  3.2],
  'researcher':      [ 4.0, 0, -2.0],
  'writer-docs':     [ 4.0, 0,  0.6],
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
        {/* True Isometric camera matching the reference screenshot. Pulled back
            and shifted east so the whole footprint fits: the office now spans
            x -11.5 .. 22.5 (the Ruang Santai wing is east of the work room). */}
        <PerspectiveCamera makeDefault position={[22.0, 20.0, 20.0]} fov={38} />
        
        <color attach="background" args={[bgColor]} />
        
        {/* Warm office ambient illumination */}
        <ambientLight intensity={isDark ? 0.6 : 0.82} color={isDark ? '#c7d2fe' : '#ffffff'} />
        
        {/* Main Sun stream from upper-left windows (warm daylight) */}
        <directionalLight
          position={[-12, 22, -6]}
          intensity={isDark ? 0.9 : 1.6}
          color={isDark ? '#93c5fd' : '#fffbeb'}
          castShadow={!settings.performanceMode}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />
        {/* Fill from the right — soft cool sky bounce */}
        <directionalLight position={[14, 10, 8]} intensity={isDark ? 0.35 : 0.45} color="#e0f2fe" />

        {/* Soft atmospheric accent lights */}
        <pointLight position={[-8.5, 3.2, 1.5]} intensity={0.5} color="#fde68a" distance={10} decay={2} />
        <pointLight position={[8.2, 3.6, 3.5]} intensity={0.5} color="#38bdf8" distance={12} decay={2} />
        <pointLight position={[0, 2.0, -4.5]} intensity={isDark ? 0.6 : 0.25} color="#f59e0b" distance={6} decay={2} />

        <Suspense fallback={null}>
          {/* Office Room Architecture (Ruangan Kerja, Istirahat / Pojok Kopi, Meeting) */}
          <OfficeRoom />

          {/* 9 Specialist Agents seated at their workstations / zones */}
          {agents.map((agent, index) => {
            const config = AGENT_CONFIGS[agent.id] || {
              position: [-4 + (index % 4) * 2.2, 0, -2 + Math.floor(index / 4) * 2.5] as [number, number, number],
              rotationY: 0,
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
              opacity={0.4}
              scale={32}
              blur={2.0}
              far={8}
            />
          )}
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={8}
          maxDistance={48}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={0.2}
          target={[4, 1.0, -2]}
        />
      </Canvas>
    </div>
  );
}
