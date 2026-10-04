// ============================================
// AgentOffice - Right Panel (dynamic content)
// ============================================
import { useAppStore } from '../../store/useAppStore';
import { ChatPanel } from '../ui/ChatPanel';
import { TaskBoardPanel } from '../ui/TaskBoardPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { ArtifactsPanel } from '../ui/ArtifactsPanel';
import { UsagePanel } from '../ui/UsagePanel';
import './RightPanel.css';

export function RightPanel() {
  const activePanel = useAppStore((s) => s.activePanel);
  const isPanelOpen = useAppStore((s) => s.isPanelOpen);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);

  if (!isPanelOpen) return null;

  const panelTitles: Record<string, string> = {
    chat: '💬 Chat',
    tasks: '📋 Task Board',
    settings: '⚙️ Settings',
    artifacts: '📦 Artifacts',
    usage: '📊 Usage',
  };

  return (
    <div className={`right-panel ${isPanelOpen ? 'open' : ''}`}>
      <div className="right-panel-header">
        <h2>{panelTitles[activePanel]}</h2>
        <button className="right-panel-close" onClick={() => setPanelOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <div className="right-panel-content">
        {activePanel === 'chat' && <ChatPanel />}
        {activePanel === 'tasks' && <TaskBoardPanel />}
        {activePanel === 'settings' && <SettingsPanel />}
        {activePanel === 'artifacts' && <ArtifactsPanel />}
        {activePanel === 'usage' && <UsagePanel />}
      </div>
    </div>
  );
}
