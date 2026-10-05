// ============================================
// AgentOffice - Live Activity Feed ("Aktivitas langsung")
// Compact agent filter + Real-time event log
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

        {/* Was a scrollable row of ten pills (Semua + all 9 agents) that wrapped
            to several lines and pushed the feed down. A select keeps the same
            filter with a fixed, predictable height. */}
        <select
          className="activity-filter-select"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          title="Filter aktivitas berdasarkan agen"
        >
          <option value="all">Semua agen</option>
          {agents.map((agent) => (
            <option key={`filter-${agent.id}`} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Activities Feed List */}
      <div className="activity-list-container">
        {filteredActivities.length === 0 && (
          <div className="activity-empty">
            Tidak ada aktivitas{selectedFilter !== 'all' ? ' untuk agen ini' : ''}.
          </div>
        )}
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
