// ============================================
// AgentOffice - Realistic 3D Virtual Office HQ
// Ruangan Kerja + Ruangan Istirahat (Pojok Kopi) + Ruangan Meeting
// ============================================
import { RoundedBox, Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

export function OfficeRoom() {
  const theme = useAppStore((s) => s.settings.theme);
  const collaboration = useAppStore((s) => s.collaboration);

  const isDark = theme === 'dark';
  const wallColor = isDark ? '#1a1d2e' : '#f1f3f7';
  const floorColor = isDark ? '#232738' : '#e8dfd3';
  const trimColor = isDark ? '#2d3248' : '#d8d0c2';
  const glassBorderColor = isDark ? '#3b4261' : '#1e293b';

  return (
    <group>
      {/* ==================================================== */}
      {/* 1. ROOM SHELL: FLOOR & PERIMETER WALLS               */}
      {/* ==================================================== */}
      {/* Hardwood Parquet Oak Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* Floor Wood Plank Grid Overlay */}
      {[-12, -9, -6, -3, 0, 3, 6, 9, 12].map((x) => (
        <mesh key={`floor-seam-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.02, 18]} />
          <meshBasicMaterial color={trimColor} transparent opacity={0.4} />
        </mesh>
      ))}
      {[-8, -5, -2, 1, 4, 7].map((z) => (
        <mesh key={`floor-seam-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]}>
          <planeGeometry args={[26, 0.02]} />
          <meshBasicMaterial color={trimColor} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Back Wall with Large Panoramic Windows */}
      <group position={[0, 4, -8.5]}>
        {/* Solid Wall Section */}
        <mesh receiveShadow>
          <boxGeometry args={[26, 8, 0.3]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>

        {/* Windows to Daylight Sky */}
        {[-8, -3, 3, 8].map((wx) => (
          <group key={`back-win-${wx}`} position={[wx, 0.5, 0.16]}>
            {/* Window Glass Frame */}
            <mesh>
              <boxGeometry args={[3.4, 3.8, 0.06]} />
              <meshStandardMaterial
                color="#60a5fa"
                emissive="#38bdf8"
                emissiveIntensity={isDark ? 0.1 : 0.6}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            {/* Window Frame Panes */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[3.5, 0.08, 0.08]} />
              <meshStandardMaterial color={trimColor} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.08, 3.9, 0.08]} />
              <meshStandardMaterial color={trimColor} />
            </mesh>
          </group>
        ))}

        {/* Wall Clock */}
        <group position={[0, 2.5, 0.18]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.04, 24]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>

      {/* Left Wall with Windows */}
      <group position={[-13, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[18, 8, 0.3]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
        {[-4, 2].map((wx) => (
          <group key={`left-win-${wx}`} position={[wx, 0.5, 0.16]}>
            <mesh>
              <boxGeometry args={[3.8, 3.8, 0.06]} />
              <meshStandardMaterial
                color="#60a5fa"
                emissive="#38bdf8"
                emissiveIntensity={isDark ? 0.1 : 0.6}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================================================== */}
      {/* 2. ZONE 1: RUANGAN ISTIRAHAT & POJOK KOPI (LEFT)     */}
      {/* ==================================================== */}
      <group position={[-8.5, 0, 1]}>
        {/* Floating Zone Label */}
        <Html position={[0, 3.2, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill break">
            ☕ Pojok Kopi & Istirahat
          </div>
        </Html>

        {/* Soft Cozy Area Rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.5]} receiveShadow>
          <planeGeometry args={[4.8, 4.2]} />
          <meshStandardMaterial color={isDark ? '#2e344e' : '#e0dbd1'} roughness={0.9} />
        </mesh>

        {/* L-Shaped Modern Fabric Sofa */}
        <group position={[-0.8, 0, 0]}>
          {/* Main Sofa Base */}
          <RoundedBox args={[2.4, 0.38, 0.9]} radius={0.05} position={[0, 0.22, 0]} castShadow>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </RoundedBox>
          {/* Sofa Backrest */}
          <RoundedBox args={[2.4, 0.55, 0.28]} radius={0.06} position={[0, 0.55, -0.32]} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </RoundedBox>
          {/* Return Chaise Section (L-Extension) */}
          <RoundedBox args={[0.9, 0.38, 1.4]} radius={0.05} position={[-0.75, 0.22, 0.95]} castShadow>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </RoundedBox>
          {/* Chaise Backrest */}
          <RoundedBox args={[0.26, 0.55, 1.4]} radius={0.06} position={[-1.08, 0.55, 0.95]} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </RoundedBox>

          {/* Decorative Throw Pillows */}
          <RoundedBox args={[0.34, 0.34, 0.12]} radius={0.04} position={[-0.4, 0.48, -0.15]} rotation={[0.1, 0.2, 0]}>
            <meshStandardMaterial color="#f59e0b" />
          </RoundedBox>
          <RoundedBox args={[0.34, 0.34, 0.12]} radius={0.04} position={[0.5, 0.48, -0.15]} rotation={[0.1, -0.1, 0]}>
            <meshStandardMaterial color="#06b6d4" />
          </RoundedBox>
        </group>

        {/* Low Wooden Coffee Table */}
        <group position={[0.3, 0, 0.6]}>
          <RoundedBox args={[1.2, 0.08, 0.7]} radius={0.02} position={[0, 0.32, 0]} castShadow>
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </RoundedBox>
          {/* Table Legs */}
          {[[-0.5, -0.28], [0.5, -0.28], [-0.5, 0.28], [0.5, 0.28]].map(([lx, lz], i) => (
            <mesh key={`ct-leg-${i}`} position={[lx, 0.15, lz]}>
              <cylinderGeometry args={[0.025, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))}
          {/* Coffee Mug & Open Laptop on Table */}
          <mesh position={[-0.2, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.2, 0.38, 0]} castShadow>
            <boxGeometry args={[0.28, 0.02, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* Colorful Round Bean Bags */}
        {[
          { pos: [1.4, 0.24, -0.2], color: '#f97316' }, // Orange
          { pos: [1.6, 0.24, 0.8], color: '#84cc16' },  // Sage Green
          { pos: [1.3, 0.24, 1.8], color: '#ec4899' },  // Pink
        ].map((bb, i) => (
          <mesh key={`beanbag-${i}`} position={bb.pos as [number, number, number]} castShadow>
            <sphereGeometry args={[0.36, 16, 14]} />
            <meshStandardMaterial color={bb.color} roughness={0.9} />
          </mesh>
        ))}

        {/* Tall Bookshelf / Display Cabinet */}
        <group position={[-3.6, 0, -4.5]}>
          <RoundedBox args={[0.7, 4.2, 2.4]} radius={0.03} position={[0, 2.1, 0]} castShadow>
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </RoundedBox>
          {/* Book rows on shelves */}
          {[0.8, 1.6, 2.4, 3.2].map((sy, i) => (
            <mesh key={`shelf-book-${i}`} position={[0.05, sy, 0]}>
              <boxGeometry args={[0.5, 0.45, 2.1]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#38bdf8' : '#f59e0b'} />
            </mesh>
          ))}
        </group>

        {/* Water Dispenser Cooler */}
        <group position={[-2.8, 0, 4.5]}>
          <RoundedBox args={[0.42, 1.1, 0.42]} radius={0.03} position={[0, 0.55, 0]} castShadow>
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </RoundedBox>
          {/* Blue Water Gallon */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.45, 16]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Coffee Bar Counter ("Pojok Kopi") */}
        <group position={[1.8, 0, -5.5]}>
          {/* Countertop */}
          <RoundedBox args={[1.1, 1.1, 2.8]} radius={0.04} position={[0, 0.55, 0]} castShadow>
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </RoundedBox>
          {/* Wood Counter Top Bar */}
          <RoundedBox args={[1.2, 0.08, 2.9]} radius={0.02} position={[0, 1.12, 0]}>
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </RoundedBox>
          {/* Espresso Machine */}
          <mesh position={[0, 1.32, -0.6]} castShadow>
            <boxGeometry args={[0.45, 0.38, 0.55]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Coffee Cups */}
          <mesh position={[0.2, 1.2, 0.2]}>
            <cylinderGeometry args={[0.04, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>

          {/* 3 Modern Bar Stools */}
          {[-0.8, 0, 0.8].map((bz, bi) => (
            <group key={`stool-${bi}`} position={[0.85, 0, bz]}>
              <mesh position={[0, 0.72, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[0, 0.36, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.72, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ==================================================== */}
      {/* 3. ZONE 2: RUANGAN KERJA (MAIN WORKSPACE CENTER)     */}
      {/* ==================================================== */}
      <group position={[0, 0, -2]}>
        {/* Floating Zone Label */}
        <Html position={[0, 3.8, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill work">
            💼 Ruangan Kerja
          </div>
        </Html>

        {/* --- MANAGER EXECUTIVE DESK (Arka - AO) --- */}
        <group position={[0.5, 0, -1.8]}>
          {/* Executive Desk Base */}
          <RoundedBox args={[2.8, 0.76, 1.2]} radius={0.04} position={[0, 0.38, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#2d1d14" roughness={0.5} />
          </RoundedBox>
          {/* Executive Desktop Top */}
          <RoundedBox args={[2.9, 0.06, 1.26]} radius={0.02} position={[0, 0.78, 0]} castShadow>
            <meshStandardMaterial color="#451a03" roughness={0.4} />
          </RoundedBox>

          {/* Dual Curved Ultrawide Monitors */}
          <group position={[0, 1.15, -0.2]}>
            {/* Monitor Stand */}
            <mesh position={[0, -0.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* Left Screen */}
            <mesh position={[-0.6, 0, 0.05]} rotation={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[1.1, 0.58, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Left Screen Display */}
            <mesh position={[-0.6, 0, 0.075]} rotation={[0, 0.15, 0]}>
              <planeGeometry args={[1.05, 0.53]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Right Screen */}
            <mesh position={[0.6, 0, 0.05]} rotation={[0, -0.15, 0]} castShadow>
              <boxGeometry args={[1.1, 0.58, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Right Screen Display */}
            <mesh position={[0.6, 0, 0.075]} rotation={[0, -0.15, 0]}>
              <planeGeometry args={[1.05, 0.53]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>

          {/* Keyboard & Mousepad */}
          <mesh position={[0, 0.815, 0.25]}>
            <boxGeometry args={[0.55, 0.015, 0.18]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.42, 0.815, 0.25]}>
            <boxGeometry args={[0.18, 0.01, 0.22]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* --- TEAM WORKSTATION PODS (4 Desks with dual screens) --- */}
        {[
          { pos: [-3.2, 0, -2.5], rot: 0, screenColor: '#3b82f6', label: 'Tiara (PM)' },
          { pos: [-3.2, 0, 0.6], rot: 0, screenColor: '#10b981', label: 'Fajar (FE)' },
          { pos: [4.2, 0, -1.5], rot: Math.PI, screenColor: '#8b5cf6', label: 'Dimas (DE)' },
          { pos: [1.2, 0, 2.2], rot: -Math.PI / 2, screenColor: '#ec4899', label: 'Reza (SM)' },
          { pos: [-2.5, 0, 3.2], rot: Math.PI / 2, screenColor: '#06b6d4', label: 'Gilang (CW)' },
        ].map((desk, idx) => (
          <group key={`team-desk-${idx}`} position={desk.pos as [number, number, number]} rotation={[0, desk.rot, 0]}>
            {/* Desk Surface */}
            <RoundedBox args={[1.8, 0.06, 0.9]} radius={0.02} position={[0, 0.74, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#d4c5b3" roughness={0.6} />
            </RoundedBox>
            {/* White Metal Desk Frame & Legs */}
            {[[-0.82, -0.38], [0.82, -0.38], [-0.82, 0.38], [0.82, 0.38]].map(([lx, lz], li) => (
              <mesh key={`dl-${li}`} position={[lx, 0.37, lz]}>
                <boxGeometry args={[0.05, 0.74, 0.05]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.7} />
              </mesh>
            ))}

            {/* Desktop Monitors */}
            <group position={[0, 1.05, -0.22]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Screen Frame */}
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.95, 0.54, 0.03]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Screen Glow Content */}
              <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[0.9, 0.5]} />
                <meshBasicMaterial color={desk.screenColor} />
              </mesh>
            </group>

            {/* Keyboard & Mousepad */}
            <mesh position={[0, 0.775, 0.18]}>
              <boxGeometry args={[0.45, 0.012, 0.15]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.35, 0.775, 0.18]}>
              <boxGeometry args={[0.15, 0.008, 0.18]} />
              <meshStandardMaterial color="#334155" />
            </mesh>

            {/* PC Desktop Tower under desk */}
            <mesh position={[0.65, 0.25, 0]} castShadow>
              <boxGeometry args={[0.22, 0.45, 0.45]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Tall Office Plants & Planters */}
        {[[-6.2, 0, -4.5], [6.8, 0, -4.5]].map(([px, py, pz], pi) => (
          <group key={`plant-${pi}`} position={[px, py, pz]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.22, 0.9, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 1.25, 0]} castShadow>
              <sphereGeometry args={[0.55, 12, 12]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================================================== */}
      {/* 4. ZONE 3: RUANGAN MEETING (GLASS BOARDROOM RIGHT)   */}
      {/* ==================================================== */}
      <group position={[7.5, 0, 3.5]}>
        {/* Floating Zone Label */}
        <Html position={[0, 3.4, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill meeting">
            📊 Ruangan Meeting
          </div>
        </Html>

        {/* --- BLACK-FRAMED GLASS PARTITION WALLS --- */}
        {/* Front Glass Wall with Door Gap */}
        <group position={[-3.8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Glass Panels */}
          {[-2.2, 0.8, 2.2].map((gx, gi) => (
            <mesh key={`glass-panel-${gi}`} position={[gx, 0, 0]}>
              <boxGeometry args={[1.5, 3.6, 0.04]} />
              <meshStandardMaterial
                color="#60a5fa"
                transparent
                opacity={0.25}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          ))}
          {/* Black Metal Frame Structure */}
          {[-3, -1.5, 0, 1.5, 3].map((fx, fi) => (
            <mesh key={`glass-frame-${fi}`} position={[fx, 0, 0]}>
              <boxGeometry args={[0.08, 3.6, 0.08]} />
              <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[6.2, 0.08, 0.08]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.8, 0]}>
            <boxGeometry args={[6.2, 0.08, 0.08]} />
            <meshStandardMaterial color={glassBorderColor} metalness={0.8} />
          </mesh>
        </group>

        {/* --- CONFERENCE BOARDROOM TABLE --- */}
        <group position={[0, 0, 0]}>
          {/* Long Executive Table Top */}
          <RoundedBox args={[3.8, 0.08, 1.5]} radius={0.03} position={[0, 0.74, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.2} />
          </RoundedBox>
          {/* Center Aluminum Cable Trough */}
          <mesh position={[0, 0.785, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          {/* Dual Sturdy Table Pedestal Bases */}
          {[-1.2, 1.2].map((bx, bi) => (
            <mesh key={`conf-base-${bi}`} position={[bx, 0.36, 0]} castShadow>
              <boxGeometry args={[0.35, 0.72, 0.9]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
          ))}

          {/* Conference Speakerphone Puck & Laptops */}
          <mesh position={[0, 0.81, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.8, 0.79, 0.3]}>
            <boxGeometry args={[0.3, 0.015, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[0.8, 0.79, -0.3]}>
            <boxGeometry args={[0.3, 0.015, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>

          {/* 8 Conference Executive Chairs around Table */}
          {[-1.3, -0.45, 0.45, 1.3].map((cx, ci) => (
            <group key={`conf-chairs-${ci}`}>
              {/* North side chairs */}
              <group position={[cx, 0, -1.05]} rotation={[0, 0, 0]}>
                <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.02} position={[0, 0.45, 0]}>
                  <meshStandardMaterial color="#1e293b" roughness={0.6} />
                </RoundedBox>
                <RoundedBox args={[0.4, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]}>
                  <meshStandardMaterial color="#0f172a" roughness={0.6} />
                </RoundedBox>
                <mesh position={[0, 0.22, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
              </group>
              {/* South side chairs */}
              <group position={[cx, 0, 1.05]} rotation={[0, Math.PI, 0]}>
                <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.02} position={[0, 0.45, 0]}>
                  <meshStandardMaterial color="#1e293b" roughness={0.6} />
                </RoundedBox>
                <RoundedBox args={[0.4, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]}>
                  <meshStandardMaterial color="#0f172a" roughness={0.6} />
                </RoundedBox>
                <mesh position={[0, 0.22, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
              </group>
            </group>
          ))}
        </group>

        {/* --- LARGE DIGITAL PRESENTATION TV SCREEN ON WALL --- */}
        {/* --- LARGE DIGITAL PRESENTATION TV SCREEN ON RIGHT WALL --- */}
        <group position={[4.2, 2.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {/* TV Outer Bezel */}
          <mesh castShadow>
            <boxGeometry args={[3.6, 2.1, 0.08]} />
            <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* TV Display Surface */}
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[3.45, 1.95]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive="#1e293b"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* 3D UI on TV Display Screen (Matching "15:03" in reference) */}
          <Html position={[0, 0, 0.06]} transform center distanceFactor={6}>
            <div className="meeting-tv-display">
              <div className="tv-header">
                <span className="tv-live-tag">● LIVE SPRINT</span>
                <span className="tv-clock">15:03:52</span>
              </div>
              <div className="tv-body">
                <div className="tv-metric-item">
                  <span className="tv-m-val">6 / 6</span>
                  <span className="tv-m-lbl">Agent Online</span>
                </div>
                <div className="tv-metric-item">
                  <span className="tv-m-val">99.4%</span>
                  <span className="tv-m-lbl">SLA Delivery</span>
                </div>
                <div className="tv-metric-item">
                  <span className="tv-m-val">
                    {collaboration.isActive ? `Step ${collaboration.currentStep}/4` : 'Ready'}
                  </span>
                  <span className="tv-m-lbl">Sprint Status</span>
                </div>
              </div>
              <div className="tv-footer">
                Agenda: {collaboration.topic}
              </div>
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}
