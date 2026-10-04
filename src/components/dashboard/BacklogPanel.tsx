// ============================================
// AgentOffice - Right Panel: Backlog & Chat
// Matching Reference Screenshot:
// Tab switch (Backlog | Chat)
// Backlog view: Deadline dekat, Menunggu owner, Ide / nanti
// Chat view: Multi-Agent collaborative messaging
// ============================================
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { runCollaborativeSprint } from '../../services/agentOrchestrator';
import type { Message } from '../../types';
import './BacklogPanel.css';

export function BacklogPanel() {
  const rightPanelTab = useAppStore((s) => s.rightPanelTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const backlogItems = useAppStore((s) => s.backlogItems);
  const toggleBacklogItem = useAppStore((s) => s.toggleBacklogItem);
  const agents = useAppStore((s) => s.agents);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const activeChatTab = useAppStore((s) => s.activeChatTab);
  const setActiveChatTab = useAppStore((s) => s.setActiveChatTab);
  const collaboration = useAppStore((s) => s.collaboration);

  const [chatInput, setChatInput] = useState('');

  const deadlineItems = backlogItems.filter((b) => b.category === 'deadline');
  const waitingOwnerItems = backlogItems.filter((b) => b.category === 'waiting_owner');
  const ideasItems = backlogItems.filter((b) => b.category === 'ideas');

  const filteredMessages = messages.filter((m) => {
    if (activeChatTab === 'team') return m.channel === 'team';
    return (m.agentId === activeChatTab || m.targetAgentId === activeChatTab) && m.channel !== 'team';
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');

    if (activeChatTab === 'team') {
      runCollaborativeSprint(text);
    } else {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        agentId: activeChatTab,
        channel: 'direct',
        content: text,
        timestamp: Date.now(),
      };
      addMessage(userMsg);
    }
  };

  return (
    <aside className="backlog-panel-hq">
      {/* Top Tab Switcher */}
      <div className="backlog-tabs-header">
        <button
          className={`backlog-tab-btn ${rightPanelTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('backlog')}
        >
          📋 Backlog
        </button>
        <button
          className={`backlog-tab-btn ${rightPanelTab === 'chat' ? 'active' : ''}`}
          onClick={() => setRightPanelTab('chat')}
        >
          💬 Chat
        </button>
      </div>

      {/* TAB 1: BACKLOG VIEW */}
      {rightPanelTab === 'backlog' && (
        <div className="backlog-content-scroll">
          {/* Section 1: Deadline Dekat */}
          <div className="backlog-section">
            <div className="backlog-section-header">
              <span className="section-title">Deadline dekat</span>
              <span className="section-count">{deadlineItems.length}</span>
            </div>
            <div className="backlog-item-list">
              {deadlineItems.map((item) => (
                <label key={item.id} className="backlog-checkbox-row">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleBacklogItem(item.id)}
                    className="backlog-checkbox"
                  />
                  <span className={`item-title ${item.completed ? 'completed' : ''}`}>
                    {item.title}
                  </span>
                  {item.dueDate && (
                    <span className="due-date-pill">{item.dueDate}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Menunggu Owner */}
          <div className="backlog-section">
            <div className="backlog-section-header">
              <span className="section-title">Menunggu owner</span>
              <span className="section-count">{waitingOwnerItems.length}</span>
            </div>
            <div className="backlog-item-list">
              {waitingOwnerItems.map((item) => (
                <label key={item.id} className="backlog-checkbox-row">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleBacklogItem(item.id)}
                    className="backlog-checkbox"
                  />
                  <span className={`item-title ${item.completed ? 'completed' : ''}`}>
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Ide / Nanti */}
          <div className="backlog-section">
            <div className="backlog-section-header">
              <span className="section-title">Ide / nanti</span>
              <span className="section-count">{ideasItems.length}</span>
            </div>
            <div className="backlog-item-list">
              {ideasItems.map((item) => (
                <label key={item.id} className="backlog-checkbox-row">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleBacklogItem(item.id)}
                    className="backlog-checkbox"
                  />
                  <span className={`item-title ${item.completed ? 'completed' : ''}`}>
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHAT VIEW */}
      {rightPanelTab === 'chat' && (
        <div className="chat-tab-content">
          {/* Channel Selector */}
          <div className="chat-channel-pills">
            <button
              className={`chat-pill ${activeChatTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveChatTab('team')}
            >
              👥 Tim Sprint
            </button>
            {agents.map((a) => (
              <button
                key={`chat-pill-${a.id}`}
                className={`chat-pill ${activeChatTab === a.id ? 'active' : ''}`}
                onClick={() => setActiveChatTab(a.id)}
                style={{
                  borderColor: activeChatTab === a.id ? a.color : undefined,
                  color: activeChatTab === a.id ? a.color : undefined,
                }}
              >
                {a.shortTag}
              </button>
            ))}
          </div>

          {/* Collaboration active indicator */}
          {collaboration.isActive && (
            <div className="sprint-status-banner">
              <div className="sprint-status-dot" />
              <div className="sprint-status-text">
                <strong>Sprint Step {collaboration.currentStep}/4:</strong> {collaboration.topic}
              </div>
            </div>
          )}

          {/* Message Stream */}
          <div className="chat-stream-list">
            {filteredMessages.map((msg) => {
              const sender = agents.find((a) => a.id === msg.agentId);
              return (
                <div
                  key={msg.id}
                  className={`chat-message-row ${msg.role === 'user' ? 'user' : 'agent'}`}
                >
                  <div className="message-header">
                    <span
                      className="message-sender"
                      style={{ color: sender?.color || '#3b82f6' }}
                    >
                      {msg.role === 'user' ? '👤 Anda' : sender?.name || 'Agent'}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-body">{msg.content}</div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={
                activeChatTab === 'team'
                  ? 'Mulai sprint koordinasi tim...'
                  : `Kirim pesan ke ${agents.find((a) => a.id === activeChatTab)?.name}...`
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chat-input-field"
            />
            <button type="submit" className="chat-send-btn">
              Kirim
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
