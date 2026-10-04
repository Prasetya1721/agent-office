// ============================================
// AgentOffice - Sidebar Navigation
// ============================================
import { useAppStore } from '../../store/useAppStore';
import type { PanelView } from '../../types';
import './Sidebar.css';

const NAV_ITEMS: { key: PanelView; icon: string; label: string }[] = [
  { key: 'chat', icon: '💬', label: 'Chat' },
  { key: 'tasks', icon: '📋', label: 'Tasks' },
  { key: 'artifacts', icon: '📦', label: 'Artifacts' },
  { key: 'usage', icon: '📊', label: 'Usage' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export function Sidebar() {
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const isPanelOpen = useAppStore((s) => s.isPanelOpen);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const agents = useAppStore((s) => s.agents);

  const workingAgents = agents.filter((a) => a.status === 'working' || a.status === 'thinking');

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#logo-grad)" />
            <path d="M10 22V14L16 10L22 14V22L16 18L10 22Z" fill="white" fillOpacity="0.9" />
            <path d="M16 10V18" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
            <defs>
              <linearGradient id="logo-grad" x1="2" y1="2" x2="30" y2="30">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${activePanel === item.key && isPanelOpen ? 'active' : ''}`}
            onClick={() => {
              if (activePanel === item.key && isPanelOpen) {
                setPanelOpen(false);
              } else {
                setActivePanel(item.key);
                setPanelOpen(true);
              }
            }}
            title={item.label}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="sidebar-footer">
        {workingAgents.length > 0 && (
          <div className="sidebar-activity">
            <div className="sidebar-activity-dot" />
            <span>{workingAgents.length} working</span>
          </div>
        )}
      </div>
    </div>
  );
}
