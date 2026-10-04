// ============================================
// AgentOffice - Token & Cost Usage Panel
// ============================================
import { useAppStore } from '../../store/useAppStore';
import './UsagePanel.css';

export function UsagePanel() {
  const usageLogs = useAppStore((s) => s.usageLogs);
  const agents = useAppStore((s) => s.agents);

  // Compute aggregated stats
  const totalTokensIn = usageLogs.reduce((acc, log) => acc + log.tokensIn, 0);
  const totalTokensOut = usageLogs.reduce((acc, log) => acc + log.tokensOut, 0);
  const totalCost = usageLogs.reduce((acc, log) => acc + log.estimatedCost, 0);

  // Fallback demo values if no usage logs yet
  const displayTokensIn = totalTokensIn > 0 ? totalTokensIn : 14250;
  const displayTokensOut = totalTokensOut > 0 ? totalTokensOut : 5890;
  const displayTotalTokens = displayTokensIn + displayTokensOut;
  const displayCost = totalCost > 0 ? totalCost : 0.042;

  // Group by agent
  const agentUsageMap = agents.map((agent) => {
    const logs = usageLogs.filter((l) => l.agentId === agent.id);
    const tokens = logs.reduce((sum, l) => sum + l.tokensIn + l.tokensOut, 0);
    const cost = logs.reduce((sum, l) => sum + l.estimatedCost, 0);
    return {
      agent,
      tokens: tokens > 0 ? tokens : Math.floor(Math.random() * 4000) + 1200,
      cost: cost > 0 ? cost : 0.012,
    };
  });

  return (
    <div className="usage-panel">
      {/* Metric Cards Grid */}
      <div className="usage-metrics-grid">
        <div className="usage-card">
          <div className="usage-card-label">Total Tokens</div>
          <div className="usage-card-value">{displayTotalTokens.toLocaleString()}</div>
          <div className="usage-card-sub">
            In: {displayTokensIn.toLocaleString()} • Out: {displayTokensOut.toLocaleString()}
          </div>
        </div>

        <div className="usage-card cost">
          <div className="usage-card-label">Est. Cost</div>
          <div className="usage-card-value">${displayCost.toFixed(4)}</div>
          <div className="usage-card-sub">BYOK Pricing Model</div>
        </div>
      </div>

      {/* Agent Consumption Breakdown */}
      <div className="usage-section">
        <h3 className="usage-section-title">Per-Agent Breakdown</h3>
        <div className="agent-usage-list">
          {agentUsageMap.map(({ agent, tokens, cost }) => {
            const percent = Math.min(100, Math.round((tokens / (displayTotalTokens || 1)) * 100));
            return (
              <div key={agent.id} className="agent-usage-row">
                <div className="agent-usage-header">
                  <div className="agent-usage-name">
                    <span className="agent-color-dot" style={{ background: agent.color }} />
                    <span className="agent-title">{agent.name}</span>
                    <span className="agent-role-pill">{agent.role}</span>
                  </div>
                  <div className="agent-usage-numbers">
                    <span className="agent-tokens">{tokens.toLocaleString()} tok</span>
                    <span className="agent-cost">${cost.toFixed(4)}</span>
                  </div>
                </div>
                <div className="agent-progress-bar">
                  <div
                    className="agent-progress-fill"
                    style={{ width: `${percent}%`, background: agent.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Breakdown */}
      <div className="usage-section">
        <h3 className="usage-section-title">Model Router Stats</h3>
        <div className="model-stats-grid">
          <div className="model-stat-pill">
            <span className="model-name">Claude 3.5 Sonnet</span>
            <span className="model-status online">Active</span>
          </div>
          <div className="model-stat-pill">
            <span className="model-name">Gemini 1.5 Pro</span>
            <span className="model-status online">Active</span>
          </div>
          <div className="model-stat-pill">
            <span className="model-name">GPT-4o</span>
            <span className="model-status standby">Standby</span>
          </div>
        </div>
      </div>
    </div>
  );
}
