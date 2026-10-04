// ============================================
// AgentOffice - Bottom Agent Cards Bar
// Matching Reference Screenshot:
// 6 cards side-by-side with Agent name, tag, status button, role,
// current task line, session stats, and equipped skills
// ============================================
import { useAppStore } from '../../store/useAppStore';
import { SKILLS_REGISTRY } from '../../config/skills';
import type { Skill } from '../../types';
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
        const agentSkills = agent.skills
          .map((skId: string) => SKILLS_REGISTRY.find((sk: Skill) => sk.id === skId))
          .filter((sk): sk is Skill => Boolean(sk));

        return (
          <div
            key={agent.id}
            className={`agent-deck-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectAgent(agent.id)}
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

            {/* Metrics stats line */}
            <div className="card-stats-line">
              {agent.sessionStats}
            </div>

            {/* Equipped Skills Row */}
            <div className="card-skills-row">
              {agentSkills.slice(0, 3).map((sk) => (
                <span
                  key={sk?.id}
                  className="card-skill-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSkillModal(agent.id);
                  }}
                  title={sk?.description}
                >
                  {sk?.icon} {sk?.name}
                </span>
              ))}
              <button
                className="card-add-skill-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSkillModal(agent.id);
                }}
                title="Kelola & Tambah Skill Agen"
              >
                + Skill
              </button>
            </div>
          </div>
        );
      })}
    </footer>
  );
}
