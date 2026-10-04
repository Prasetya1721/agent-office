// ============================================
// AgentOffice - Virtual HQ Application
// Matching Reference Screenshot Layout:
// TopHeader + Left Activity Panel + Center 3D HQ Scene + Right Backlog/Chat + Bottom Agent Cards Bar
// ============================================
import { useState, useEffect } from 'react';
import { TopHeader } from './components/layout/TopHeader';
import { LiveActivityPanel } from './components/dashboard/LiveActivityPanel';
import { BacklogPanel } from './components/dashboard/BacklogPanel';
import { AgentCardsBar } from './components/dashboard/AgentCardsBar';
import { SkillInspectorModal } from './components/dashboard/SkillInspectorModal';
import { Scene3D, AGENT_POSITIONS } from './components/3d/Scene3D';
import { useAppStore } from './store/useAppStore';
import { RightPanel } from './components/layout/RightPanel';
import './App.css';

export function App() {
  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const setChatAgent = useAppStore((s) => s.setChatAgent);
  const setActiveChatTab = useAppStore((s) => s.setActiveChatTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const setFocusPosition = useAppStore((s) => s.setFocusPosition);
  const settings = useAppStore((s) => s.settings);

  // Skill management modal state
  const [skillModalAgentId, setSkillModalAgentId] = useState<string | null>(null);

  // Sync body theme class with settings
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Agent selection helper
  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setChatAgent(agentId);
    setActiveChatTab(agentId);
    setRightPanelTab('chat');

    const pos = AGENT_POSITIONS[agentId];
    if (pos) {
      setFocusPosition([pos[0], pos[1] + 1.2, pos[2] + 2.5]);
    }
  };

  // Reset camera view
  const handleResetCamera = () => {
    setSelectedAgent(null);
    setFocusPosition(null);
  };

  return (
    <div className={`app-root ${settings.theme} ${skillModalAgentId ? 'modal-active' : ''}`}>
      {/* 1. TOP HEADER (Brand, View Toggles, KPI Cards) */}
      <TopHeader onResetCamera={handleResetCamera} />

      {/* 2. MAIN WORKSPACE GRID: Left Activity + Center 3D + Right Backlog */}
      <div className="main-workspace-grid">
        {/* Left Live Activity Stream */}
        <LiveActivityPanel onSelectAgent={handleSelectAgent} />

        {/* Center 3D Office HQ Viewport */}
        <main className="viewport-3d-wrapper">
          <Scene3D />

          {/* Navigation Hint matching Screenshot */}
          <div className="scene-interaction-hint">
            scroll = zoom &bull; shift + drag = geser &bull; drag/orbit = putar &bull; klik agen = fokus & chat
          </div>
        </main>

        {/* Right Backlog & Chat Panel */}
        <BacklogPanel />
      </div>

      {/* 3. BOTTOM AGENT CARDS BAR (6 Horizontal Cards with Skills) */}
      <AgentCardsBar
        onSelectAgent={handleSelectAgent}
        onOpenSkillModal={(id) => setSkillModalAgentId(id)}
      />

      {/* 4. SKILL INSPECTOR MODAL */}
      {skillModalAgentId && (
        <SkillInspectorModal
          agentId={skillModalAgentId}
          onClose={() => setSkillModalAgentId(null)}
        />
      )}

      {/* Global Sliding Drawer for Settings & Artifacts if opened */}
      <RightPanel />
    </div>
  );
}

export default App;
