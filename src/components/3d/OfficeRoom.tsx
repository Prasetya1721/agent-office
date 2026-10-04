// ============================================
// AgentOffice - Realistic 3D Virtual Office HQ
// Ruangan Kerja + Ruangan Istirahat (Pojok Kopi) + Ruangan Meeting
// High-end Scandinavian tech office matching reference design 1:1
// ============================================
import { RoundedBox, Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

// Realistic Ergonomic Office Mesh Chair
function ErgonomicDeskChair({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 5-Wheel Star Base */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.05, 12]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = (i * Math.PI * 2) / 5;
        return (
          <group key={`spoke-${i}`}>
            <mesh position={[Math.cos(ang) * 0.16, 0.035, Math.sin(ang) * 0.16]} rotation={[0, -ang, 0]}>
              <boxGeometry args={[0.26, 0.024, 0.03]} />
              <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[Math.cos(ang) * 0.28, 0.024, Math.sin(ang) * 0.28]} rotation={[Math.PI / 2, 0, ang]}>
              <cylinderGeometry args={[0.024, 0.024, 0.032, 10]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
      {/* Hydraulic Gas Lift Cylinder */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.022, 0.026, 0.35, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Contoured Seat Cushion */}
      <RoundedBox args={[0.50, 0.08, 0.48]} radius={0.035} position={[0, 0.44, 0]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </RoundedBox>
      {/* Ergonomic Mesh Backrest */}
      <RoundedBox args={[0.44, 0.52, 0.06]} radius={0.03} position={[0, 0.74, 0.22]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.85} />
      </RoundedBox>
      {/* Lumbar & Headrest */}
      <RoundedBox args={[0.26, 0.13, 0.05]} radius={0.02} position={[0, 1.08, 0.25]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </RoundedBox>
      {/* T-Armrests */}
      {[-0.27, 0.27].map((ax, i) => (
        <group key={`chair-arm-${i}`} position={[ax, 0.52, 0.02]}>
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[0.028, 0.14, 0.036]} />
            <meshStandardMaterial color="#374151" metalness={0.6} />
          </mesh>
          <RoundedBox args={[0.065, 0.026, 0.24]} radius={0.012} position={[0, 0.035, 0]}>
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}
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

      {/* Main Floor: Scandinavian Honey Oak Parquet Planks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -1.0]} receiveShadow>
        <planeGeometry args={[23, 16]} />
        <meshStandardMaterial
          color={floorWood}
          roughness={0.25}
          metalness={0.12}
        />
      </mesh>

      {/* Floor Wood Plank Seams */}
      {[-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10].map((x) => (
        <mesh key={`seam-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, -1.0]}>
          <planeGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.5} />
        </mesh>
      ))}
      {[-8, -6, -4, -2, 0, 2, 4, 6].map((z) => (
        <mesh key={`seam-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, z]}>
          <planeGeometry args={[23, 0.018]} />
          <meshBasicMaterial color={floorWoodAlt} transparent opacity={0.5} />
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
      {/* 2. ZONE 1: RUANGAN ISTIRAHAT & POJOK KOPI (LEFT)     */}
      {/* ==================================================== */}
      <group>
        {/* Floating Zone Label */}
        <Html position={[-7.8, 3.4, -0.5]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="room-zone-pill break">
            ☕ Pojok Kopi & Istirahat
          </div>
        </Html>

        {/* Designer Scandinavian 2-Seater Sofa (facing East towards center) */}
        <group position={[-8.8, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox args={[2.2, 0.36, 0.85]} radius={0.06} position={[0, 0.24, 0]} castShadow>
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[2.2, 0.52, 0.24]} radius={0.06} position={[0, 0.56, -0.32]} castShadow>
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </RoundedBox>
          {[-1.12, 1.12].map((ax, i) => (
            <RoundedBox key={`sofa-arm-${i}`} args={[0.20, 0.44, 0.9]} radius={0.05} position={[ax, 0.38, 0]} castShadow>
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </RoundedBox>
          ))}
          {/* Throw Pillows (Mustard & Terracotta) */}
          <mesh position={[-0.7, 0.46, -0.16]} rotation={[0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.36, 0.36, 0.12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.7} />
          </mesh>
          <mesh position={[0.7, 0.46, -0.16]} rotation={[0.2, -0.3, 0]} castShadow>
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
          <ErgonomicDeskChair position={[0, 0, 0.8]} rotationY={0} />
        </group>

        {/* --- 8 INDIVIDUAL DEVELOPER WORKSTATION DESK PODS --- */}
        {[
          // LEFT COLUMN (X = -4.5)
          { id: 'ui-ux-designer',  x: -4.5, z: -2.8, color: '#ec4899', title: 'Figma UI/UX' },
          { id: 'frontend-dev',    x: -4.5, z: -0.2, color: '#10b981', title: 'React FE' },
          { id: 'backend-dev',     x: -4.5, z:  2.4, color: '#8b5cf6', title: 'REST / SQL' },

          // RIGHT COLUMN (X = +1.8)
          { id: 'qa-tester',       x:  1.8, z: -2.8, color: '#f97316', title: 'Test Runner' },
          { id: 'debugger',        x:  1.8, z: -0.2, color: '#ef4444', title: 'Debug Console' },
          { id: 'product-manager', x:  1.8, z:  2.4, color: '#3b82f6', title: 'PRD Backlog' },

          // FAR-RIGHT (X = +4.0)
          { id: 'researcher',      x:  4.0, z: -2.8, color: '#0ea5e9', title: 'Web Research' },
          { id: 'writer-docs',     x:  4.0, z: -0.2, color: '#14b8a6', title: 'Tech Docs' },
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
            <ErgonomicDeskChair position={[0, 0, 0.8]} rotationY={0} />
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
          {/* North Side (facing South into table) */}
          {[-0.9, 0, 0.9].map((cx, ci) => (
            <group key={`conf-chair-n-${ci}`} position={[cx, 0, -1.05]} rotation={[0, 0, 0]}>
              <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.025} position={[0, 0.45, 0]} castShadow>
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </RoundedBox>
              <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </RoundedBox>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {/* South Side (facing North into table) */}
          {[-0.9, 0, 0.9].map((cx, ci) => (
            <group key={`conf-chair-s-${ci}`} position={[cx, 0, 1.05]} rotation={[0, Math.PI, 0]}>
              <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.025} position={[0, 0.45, 0]} castShadow>
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </RoundedBox>
              <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]} castShadow>
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </RoundedBox>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {/* West Head Chair (Tiara's Seat) */}
          <group position={[-2.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.025} position={[0, 0.45, 0]} castShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]} castShadow>
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
          {/* East Head Chair */}
          <group position={[2.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <RoundedBox args={[0.42, 0.06, 0.42]} radius={0.025} position={[0, 0.45, 0]} castShadow>
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.40, 0.48, 0.05]} radius={0.02} position={[0, 0.72, -0.18]} castShadow>
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
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
    </group>
  );
}
