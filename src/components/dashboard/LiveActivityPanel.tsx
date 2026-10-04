// ============================================
// AgentOffice - Live Activity Feed ("Aktivitas langsung")
// Filter pills by agent + Real-time event log
// ============================================
import { useAppStore } from '../../store/useAppStore';
import './LiveActivityPanel.css';

interface LiveActivityPanelProps {
  onSelectAgent: (agentId: string) => void;
}

export function LiveActivityPanel({ onSelectAgent }: LiveActivityPanelProps) {
  const agents = useAppStore((s) => s.agents);
  const liveActivities = useAppStore((s) => s.liveActivities);
  const selectedFilter = useAppStore((s) => s.selectedActivityFilter);
  const setSelectedFilter = useAppStore((s) => s.setSelectedActivityFilter);

  const filteredActivities = selectedFilter === 'all'
    ? liveActivities
    : liveActivities.filter((act) => act.agentId === selectedFilter);

  return (
    <aside className="activity-panel-hq">
      <div className="activity-panel-header">
        <h2 className="activity-panel-title">Aktivitas langsung</h2>
      </div>

      {/* Filter Tabs Row */}
      <div className="activity-filter-scroll">
        <button
          className={`activity-filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          Semua
        </button>
        {agents.map((agent) => (
          <button
            key={`filter-${agent.id}`}
            className={`activity-filter-pill ${selectedFilter === agent.id ? 'active' : ''}`}
            onClick={() => setSelectedFilter(agent.id)}
            style={{
              borderColor: selectedFilter === agent.id ? agent.color : undefined,
              color: selectedFilter === agent.id ? agent.color : undefined,
            }}
          >
            {agent.name}
          </button>
        ))}
      </div>

      {/* Activities Feed List */}
      <div className="activity-list-container">
        {filteredActivities.map((act) => {
          const agent = agents.find((a) => a.id === act.agentId);
          return (
            <div
              key={act.id}
              className="activity-item"
              onClick={() => onSelectAgent(act.agentId)}
              title={`Klik untuk fokus ${act.agentName}`}
            >
              <div
                className="activity-avatar"
                style={{
                  backgroundColor: act.color,
                }}
              >
                {act.shortTag || act.agentName.charAt(0)}
              </div>
              <div className="activity-body">
                <div className="activity-text">
                  <span className="activity-agent-name" style={{ color: act.color }}>
                    {agent?.shortTag ? `[${agent.shortTag}] ` : ''}
                  </span>
                  {act.text}
                </div>
              </div>
              <div className="activity-time">{act.timeAgo}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
