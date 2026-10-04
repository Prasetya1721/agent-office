// ============================================
// AgentOffice - Synchronized Multi-Agent Chat Panel
// ============================================
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { sendMessageToAgent } from '../../services/llmService';
import { runCollaborativeSprint } from '../../services/agentOrchestrator';
import { getSkillById } from '../../config/skills';
import type { Message } from '../../types';
import './ChatPanel.css';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChatTab = useAppStore((s) => s.activeChatTab);
  const setActiveChatTab = useAppStore((s) => s.setActiveChatTab);
  const agents = useAppStore((s) => s.agents);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const updateMessage = useAppStore((s) => s.updateMessage);
  const updateAgentStatus = useAppStore((s) => s.updateAgentStatus);
  const setChatAgent = useAppStore((s) => s.setChatAgent);
  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);
  const collaboration = useAppStore((s) => s.collaboration);

  const isTeamMode = activeChatTab === 'team';
  const activeAgent = !isTeamMode ? agents.find((a) => a.id === activeChatTab) : null;

  // Filter messages based on active tab
  const displayMessages = isTeamMode
    ? messages.filter((m) => m.channel === 'team' || !m.channel)
    : messages.filter(
        (m) =>
          (m.agentId === activeChatTab || (m.role === 'user' && m.agentId === activeChatTab)) &&
          m.channel !== 'team'
      );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, collaboration.currentStep]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');

    if (isTeamMode) {
      setIsLoading(true);
      try {
        await runCollaborativeSprint(text);
      } finally {
        setIsLoading(false);
      }
    } else if (activeAgent) {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        agentId: activeAgent.id,
        channel: 'direct',
        content: text,
        timestamp: Date.now(),
      };
      addMessage(userMsg);
      setIsLoading(true);
      updateAgentStatus(activeAgent.id, 'thinking');

      const botMsgId = `msg-${Date.now()}-bot`;
      const botMsg: Message = {
        id: botMsgId,
        role: 'agent',
        agentId: activeAgent.id,
        channel: 'direct',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };
      addMessage(botMsg);

      try {
        updateAgentStatus(activeAgent.id, 'working');
        const response = await sendMessageToAgent(
          activeAgent,
          [...displayMessages, userMsg],
          (chunk) => {
            updateMessage(botMsgId, { content: chunk });
          }
        );
        updateMessage(botMsgId, {
          content: response,
          isStreaming: false,
        });
        updateAgentStatus(activeAgent.id, 'done');
        setTimeout(() => updateAgentStatus(activeAgent.id, 'idle'), 3000);
      } catch (error) {
        updateAgentStatus(activeAgent.id, 'error');
        updateMessage(botMsgId, {
          content: `❌ Error: ${error instanceof Error ? error.message : 'Gagal menghubungi model.'}`,
          isStreaming: false,
        });
        setTimeout(() => updateAgentStatus(activeAgent.id, 'idle'), 4000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to format text with mentions
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@[A-Za-z0-9/_-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="chat-mention">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="chat-panel">
      {/* Selector Tabs: Team Collab + Individual Agents */}
      <div className="chat-agent-tabs">
        <button
          className={`chat-agent-tab team-tab ${isTeamMode ? 'active' : ''}`}
          onClick={() => {
            setActiveChatTab('team');
            setSelectedAgent(null);
          }}
        >
          <span className="chat-agent-tab-icon">👥</span>
          <span className="chat-agent-tab-name">Diskusi Tim</span>
          {collaboration.isActive && <span className="chat-agent-status-dot working" />}
        </button>

        {agents.map((agent) => (
          <button
            key={agent.id}
            className={`chat-agent-tab ${activeChatTab === agent.id ? 'active' : ''}`}
            onClick={() => {
              setActiveChatTab(agent.id);
              setChatAgent(agent.id);
              setSelectedAgent(agent.id);
            }}
            style={{
              '--agent-color': agent.color,
            } as React.CSSProperties}
          >
            <span className="chat-agent-tab-icon">{agent.avatar.icon}</span>
            <span className="chat-agent-tab-name">{agent.name.split(' ')[0]}</span>
            <span className={`chat-agent-status-dot ${agent.status}`} />
          </button>
        ))}
      </div>

      {/* Header Info */}
      {isTeamMode ? (
        <div className="chat-header team-header">
          <div className="chat-header-avatar team">👥</div>
          <div className="chat-header-info">
            <h3>Saluran Kolaborasi Tim</h3>
            <span className="chat-header-role">
              {collaboration.isActive
                ? `⚡ Sprint Aktif: Langkah ${collaboration.currentStep}/${collaboration.totalSteps}`
                : 'Semua agen saling terhubung & tersinkronisasi'}
            </span>
          </div>
          {collaboration.isActive && (
            <div className="chat-header-status working">Syncing...</div>
          )}
        </div>
      ) : activeAgent ? (
        <div className="chat-agent-header-wrapper">
          <div className="chat-header">
            <div className="chat-header-avatar" style={{ background: activeAgent.color }}>
              {activeAgent.avatar.icon}
            </div>
            <div className="chat-header-info">
              <h3>{activeAgent.name}</h3>
              <span className="chat-header-role">{activeAgent.role}</span>
            </div>
            <div className={`chat-header-status ${activeAgent.status}`}>
              {activeAgent.status}
            </div>
          </div>

          {/* Interactive Agent Skills Bar */}
          <div className="chat-agent-skills-bar">
            <span className="skills-bar-title">Keahlian:</span>
            {activeAgent.skills.map((skillId) => {
              const skill = getSkillById(skillId);
              if (!skill) return null;
              return (
                <button
                  key={skill.id}
                  className="chat-skill-pill"
                  title={`${skill.description} (Klik untuk instruksikan skill ini)`}
                  onClick={() => setInput(`Gunakan skill ${skill.name} untuk `)}
                >
                  <span className="pill-icon">{skill.icon}</span>
                  <span className="pill-name">{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Active Collaboration Banner if in progress */}
      {isTeamMode && collaboration.isActive && (
        <div className="collab-status-banner">
          <div className="collab-banner-pulse" />
          <div className="collab-banner-info">
            <span className="collab-banner-title">
              Topik: {collaboration.topic}
            </span>
            <span className="collab-banner-step">
              Pembicara: {agents.find((a) => a.id === collaboration.activeSpeakerId)?.name || 'Lead'} → {agents.find((a) => a.id === collaboration.targetSpeakerId)?.name || 'Tim'}
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="chat-messages">
        {isTeamMode && displayMessages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤝</div>
            <h3>Mulai Kolaborasi Multi-Agent</h3>
            <p>Berikan tugas di bawah ini. Lead Engineer akan membagi tugas ke UI/UX Designer, Frontend Dev, dan Debugger secara otomatis.</p>
          </div>
        )}

        {/* Quick Sprint Presets for Team Mode */}
        {isTeamMode && (
          <div className="chat-sprint-bar">
            <span className="sprint-bar-label">Pemicu Cepat:</span>
            <button
              className="sprint-chip"
              disabled={isLoading || collaboration.isActive}
              onClick={() => runCollaborativeSprint('Buat Modern Landing Page SaaS dengan Dark Mode')}
            >
              🚀 Landing Page SaaS
            </button>
            <button
              className="sprint-chip"
              disabled={isLoading || collaboration.isActive}
              onClick={() => runCollaborativeSprint('Implementasi Fitur Auth & Database SQLite')}
            >
              🔐 Auth & DB
            </button>
            <button
              className="sprint-chip"
              disabled={isLoading || collaboration.isActive}
              onClick={() => runCollaborativeSprint('Audit Keamanan & Optimasi FPS Ruangan 3D')}
            >
              ⚡ Audit Performa
            </button>
          </div>
        )}

        {displayMessages.map((msg) => {
          const senderAgent = agents.find((a) => a.id === msg.agentId);
          const targetAgent = agents.find((a) => a.id === msg.targetAgentId);

          return (
            <div
              key={msg.id}
              className={`chat-message ${msg.role} ${msg.channel === 'team' ? 'team-message' : ''}`}
            >
              {msg.role === 'agent' && (
                <div
                  className="chat-message-avatar"
                  style={{ background: senderAgent?.color || '#6366f1' }}
                  title={senderAgent?.name}
                >
                  {senderAgent?.avatar.icon || '🤖'}
                </div>
              )}

              <div className="chat-message-content">
                {/* Inter-Agent Metadata Header */}
                {isTeamMode && msg.role === 'agent' && senderAgent && (
                  <div className="chat-agent-meta">
                    <span className="agent-sender-name" style={{ color: senderAgent.color }}>
                      {senderAgent.name}
                    </span>
                    <span className="agent-meta-divider">•</span>
                    {targetAgent ? (
                      <span className="agent-target-badge">
                        → @{targetAgent.name}
                      </span>
                    ) : (
                      <span className="agent-target-badge team">
                        → Seluruh Tim
                      </span>
                    )}
                  </div>
                )}

                <div className="chat-message-bubble">
                  {msg.content ? (
                    renderMessageContent(msg.content)
                  ) : msg.isStreaming ? (
                    <div className="chat-typing">
                      <span /><span /><span />
                    </div>
                  ) : null}
                </div>

                <span className="chat-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder={
            isTeamMode
              ? 'Tugaskan seluruh tim (cth: "Buatkan landing page SaaS...", "Analisis bug...")'
              : `Kirim pesan langsung ke ${activeAgent?.name}...`
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          disabled={isLoading || (isTeamMode && collaboration.isActive)}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || (isTeamMode && collaboration.isActive)}
          title="Kirim Pesan"
        >
          {isLoading ? (
            <div className="chat-send-loading" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
