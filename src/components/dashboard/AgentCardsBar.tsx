// ============================================
// AgentOffice - Bottom Agent Cards Bar
// Compact roster: name, status toggle, role, current task.
// Skill chips + stats were moved out — they are what made each card 5 lines
// tall, and skills already have a dedicated modal (click the card, or the
// "+ Skill" affordance is reachable from the Skill Inspector).
// ============================================
import { useAppStore } from '../../store/useAppStore';
import './AgentCardsBar.css';

interface AgentCardsBarProps {
  onSelectAgent: (agentId: string) => void;
  onOpenSkillModal: (agentId: string) => void;
}

export function AgentCardsBar({ onSelectAgent, onOpenSkillModal }: AgentCardsBarProps) {
  const agents = useAppStore((s) => s.agents);
  const selectedAgentId = useAppStore((s) => s.selectedAgentId);
  const toggleAgentWork = useAppStore((s) => s.toggleAgentWork);

  return (
    <footer className="agent-cards-bar-hq">
      {agents.map((agent) => {
        const isSelected = selectedAgentId === agent.id;
        const isWorking = agent.status === 'working' || agent.status === 'thinking' || agent.status === 'discussing';

        return (
          <div
            key={agent.id}
            className={`agent-deck-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectAgent(agent.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAgent(agent.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            title={`${agent.name} — ${agent.role}`}
            style={{
              borderTopColor: agent.color,
            }}
          >
            {/* Header: Name + Status Action Button */}
            <div className="card-top-row">
              <div className="card-agent-identity">
                <span
                  className="card-agent-dot"
                  style={{
                    backgroundColor: agent.color,
                    boxShadow: `0 0 6px ${agent.color}`,
                  }}
                />
                <span className="card-agent-name">
                  {agent.name}
                </span>
              </div>
              <button
                className={`card-status-toggle-btn ${isWorking ? 'working' : 'standby'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAgentWork(agent.id);
                }}
                title="Klik untuk toggle status KERJA / STANDBY"
              >
                {isWorking ? 'KERJA' : 'STANDBY'}
              </button>
            </div>

            {/* Subtitle / Role */}
            <div className="card-role-line">{agent.role}</div>

            {/* Task summary line */}
            <div className="card-task-line" title={agent.currentTaskSummary}>
              <span className="play-icon">▶</span> {agent.currentTaskSummary}
            </div>

            {/* Skill access — kept as one lightweight affordance so the modal is
                still reachable without the chips that made the card tall. */}
            <button
              className="card-skills-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSkillModal(agent.id);
              }}
              title="Lihat & kelola skill agen"
            >
              🧩 Skill
            </button>
          </div>
        );
      })}
    </footer>
  );
}
