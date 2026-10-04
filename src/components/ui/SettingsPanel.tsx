// ============================================
// AgentOffice - Settings Panel with Skills System
// ============================================
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ProviderConfig, LLMProvider } from '../../types';
import { PROVIDER_DEFAULTS } from '../../config/agents';
import { SKILLS_CATALOG, getSkillById } from '../../config/skills';
import { testConnection } from '../../services/llmService';
import './SettingsPanel.css';

type SettingsTab = 'providers' | 'agents' | 'skills' | 'general';

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const providers = useAppStore((s) => s.providers);
  const agents = useAppStore((s) => s.agents);
  const settings = useAppStore((s) => s.settings);
  const addProvider = useAppStore((s) => s.addProvider);
  const removeProvider = useAppStore((s) => s.removeProvider);
  const updateAgent = useAppStore((s) => s.updateAgent);
  const addAgent = useAppStore((s) => s.addAgent);
  const removeAgent = useAppStore((s) => s.removeAgent);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [testResults, setTestResults] = useState<Record<string, 'loading' | 'success' | 'error'>>({});
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');

  // Skills filter state
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const handleTestConnection = async (provider: ProviderConfig) => {
    setTestResults((prev) => ({ ...prev, [provider.id]: 'loading' }));
    try {
      const success = await testConnection(provider);
      setTestResults((prev) => ({ ...prev, [provider.id]: success ? 'success' : 'error' }));
    } catch {
      setTestResults((prev) => ({ ...prev, [provider.id]: 'error' }));
    }
  };

  const handleAddCustomProvider = () => {
    if (!customName.trim() || !customBaseUrl.trim()) return;
    const newProvider: ProviderConfig = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      provider: 'custom-openai',
      baseUrl: customBaseUrl.trim(),
      apiKey: customApiKey.trim(),
      models: customModel.trim() ? [customModel.trim()] : [],
      isCustom: true,
    };
    addProvider(newProvider);
    setShowAddCustom(false);
    setCustomName('');
    setCustomBaseUrl('');
    setCustomApiKey('');
    setCustomModel('');
  };

  const filteredSkills = skillCategoryFilter === 'all'
    ? SKILLS_CATALOG
    : SKILLS_CATALOG.filter((s) => s.category === skillCategoryFilter);

  return (
    <div className="settings-panel">
      {/* Settings Navigation Tabs */}
      <div className="settings-tabs">
        {[
          { key: 'providers' as SettingsTab, label: '🧠 Providers' },
          { key: 'agents' as SettingsTab, label: '🤖 Agents' },
          { key: 'skills' as SettingsTab, label: '🛠️ Skills' },
          { key: 'general' as SettingsTab, label: '⚙️ General' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* ==================================================== */}
        {/* PROVIDERS TAB                                        */}
        {/* ==================================================== */}
        {activeTab === 'providers' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>API Key Management (BYOK)</h3>
              <p>API key disimpan di browser Anda (Local State). Tidak dikirim ke server luar.</p>
            </div>

            {providers.map((provider) => (
              <div key={provider.id} className="provider-card">
                <div className="provider-card-header">
                  <div className="provider-card-info">
                    <span className="provider-card-name">{provider.name}</span>
                    {provider.isCustom && <span className="provider-badge">Custom</span>}
                  </div>
                  {provider.isCustom && (
                    <button
                      className="provider-remove-btn"
                      onClick={() => removeProvider(provider.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="provider-field">
                  <label>Base URL</label>
                  <input
                    type="text"
                    value={provider.baseUrl}
                    onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="settings-input"
                    disabled={!provider.isCustom}
                  />
                </div>

                <div className="provider-field">
                  <label>API Key</label>
                  <div className="input-with-button">
                    <input
                      type="password"
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                      placeholder={provider.isCustom ? 'Optional' : 'sk-...'}
                      className="settings-input"
                    />
                    <button
                      className={`test-btn ${testResults[provider.id] || ''}`}
                      onClick={() => handleTestConnection(provider)}
                      disabled={testResults[provider.id] === 'loading'}
                    >
                      {testResults[provider.id] === 'loading'
                        ? 'Testing...'
                        : testResults[provider.id] === 'success'
                        ? '✅ Valid'
                        : testResults[provider.id] === 'error'
                        ? '❌ Failed'
                        : 'Test'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!showAddCustom ? (
              <button className="add-custom-btn" onClick={() => setShowAddCustom(true)}>
                + Add Custom OpenAI-Compatible Endpoint
              </button>
            ) : (
              <div className="provider-card custom-add">
                <h4>Add Custom Endpoint (Ollama, LM Studio, vLLM)</h4>
                <div className="provider-field">
                  <label>Provider Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ollama Local, LM Studio, etc."
                    className="settings-input"
                  />
                </div>
                <div className="provider-field">
                  <label>Base URL</label>
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434/v1"
                    className="settings-input"
                  />
                </div>
                <div className="provider-field">
                  <label>Model Name</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="llama3, mistral, deepseek-r1"
                    className="settings-input"
                  />
                </div>
                <div className="provider-actions">
                  <button className="test-btn" onClick={handleAddCustomProvider}>
                    ✅ Save Provider
                  </button>
                  <button className="test-btn cancel" onClick={() => setShowAddCustom(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* AGENTS TAB                                           */}
        {/* ==================================================== */}
        {activeTab === 'agents' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Agent Profiles & Installed Skills</h3>
              <p>Atur model AI, system prompt, dan modul skill per agent.</p>
            </div>

            {agents.map((agent) => (
              <div key={agent.id} className="agent-config-card">
                <div className="agent-config-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '12px', flexGrow: 1, minWidth: '200px' }}>
                    <span className="agent-config-avatar" style={{ background: agent.color }}>
                      {agent.avatar.icon}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      <input 
                        type="text" 
                        value={agent.name} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const newShortTag = val.split(' ')[0].substring(0, 2).toUpperCase();
                          updateAgent(agent.id, { name: val, shortTag: newShortTag });
                        }}
                        className="settings-input" 
                        style={{ fontWeight: 'bold' }}
                        placeholder="Agent Name"
                      />
                      <input 
                        type="text" 
                        value={agent.role} 
                        onChange={(e) => updateAgent(agent.id, { role: e.target.value })}
                        className="settings-input" 
                        style={{ fontSize: '13px' }}
                        placeholder="Role / Title"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeAgent(agent.id)} 
                    className="skill-remove-btn" 
                    style={{ padding: '6px 12px', width: 'auto', background: '#ef4444', color: 'white', borderRadius: '4px' }}
                  >
                    🗑️ Hapus
                  </button>
                </div>

                {/* Avatar Settings */}
                <div className="provider-field">
                  <label>Warna & Avatar (3D Styling)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Emoji</span>
                      <input
                        type="text"
                        className="settings-input"
                        style={{ width: '60px', textAlign: 'center' }}
                        value={agent.avatar.icon}
                        onChange={(e) => updateAgent(agent.id, { avatar: { ...agent.avatar, icon: e.target.value }})}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Theme</span>
                      <input
                        type="color"
                        value={agent.color}
                        title="Theme Color (UI/Cards)"
                        onChange={(e) => updateAgent(agent.id, { color: e.target.value })}
                        style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Baju</span>
                      <input
                        type="color"
                        value={agent.avatar.bodyColor}
                        title="Body / Shirt Color"
                        onChange={(e) => updateAgent(agent.id, { avatar: { ...agent.avatar, bodyColor: e.target.value }})}
                        style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Kulit</span>
                      <input
                        type="color"
                        value={agent.avatar.headColor}
                        title="Skin / Head Color"
                        onChange={(e) => updateAgent(agent.id, { avatar: { ...agent.avatar, headColor: e.target.value }})}
                        style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Rambut</span>
                      <input
                        type="color"
                        value={agent.avatar.accentColor}
                        title="Hair / Accent Color"
                        onChange={(e) => updateAgent(agent.id, { avatar: { ...agent.avatar, accentColor: e.target.value }})}
                        style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="provider-field">
                  <label>LLM Brain (Provider)</label>
                  <select
                    value={agent.modelConfig.provider}
                    onChange={(e) =>
                      updateAgent(agent.id, {
                        modelConfig: {
                          ...agent.modelConfig,
                          provider: e.target.value as LLMProvider,
                          model: PROVIDER_DEFAULTS[e.target.value as LLMProvider]?.models?.[0] || '',
                        },
                      })
                    }
                    className="settings-select"
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                    <option value="openai">OpenAI (GPT)</option>
                    {providers
                      .filter((p) => p.isCustom)
                      .map((p) => (
                        <option key={p.id} value="custom-openai">
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="provider-field">
                  <label>Model</label>
                  <select
                    value={agent.modelConfig.model}
                    onChange={(e) =>
                      updateAgent(agent.id, {
                        modelConfig: { ...agent.modelConfig, model: e.target.value },
                      })
                    }
                    className="settings-select"
                  >
                    {(PROVIDER_DEFAULTS[agent.modelConfig.provider]?.models || []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Installed Skills Section */}
                <div className="provider-field">
                  <div className="agent-skills-header">
                    <label>🛠️ Installed Skills ({agent.skills.length})</label>
                    <span className="skills-subtext">Modul kapabilitas spesialis</span>
                  </div>

                  <div className="agent-skills-chips-list">
                    {agent.skills.map((skillId) => {
                      const skill = getSkillById(skillId);
                      if (!skill) return null;
                      return (
                        <div key={skill.id} className="agent-skill-badge">
                          <span className="skill-icon">{skill.icon}</span>
                          <span className="skill-title">{skill.name}</span>
                          <button
                            className="skill-remove-btn"
                            title="Lepas skill ini dari agent"
                            onClick={() =>
                              updateAgent(agent.id, {
                                skills: agent.skills.filter((s) => s !== skillId),
                              })
                            }
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add skill selector */}
                  <select
                    className="settings-select skill-add-select"
                    onChange={(e) => {
                      if (e.target.value && !agent.skills.includes(e.target.value)) {
                        updateAgent(agent.id, {
                          skills: [...agent.skills, e.target.value],
                        });
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      + Pasang Skill dari Katalog...
                    </option>
                    {SKILLS_CATALOG.filter((s) => !agent.skills.includes(s.id)).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="provider-field">
                  <label>System Prompt</label>
                  <textarea
                    value={agent.systemPrompt}
                    onChange={(e) =>
                      updateAgent(agent.id, { systemPrompt: e.target.value })
                    }
                    className="settings-textarea"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <button 
              className="add-custom-btn" 
              style={{ marginTop: '16px', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }} 
              onClick={() => {
                const newId = `agent-${Date.now()}`;
                addAgent({
                  id: newId,
                  name: 'New Agent',
                  role: 'Specialist',
                  shortTag: 'NA',
                  color: '#6366f1',
                  avatar: {
                    icon: '🤖',
                    bodyColor: '#3b82f6',
                    headColor: '#f8fafc',
                    accentColor: '#8b5cf6',
                  },
                  modelConfig: {
                    provider: 'anthropic',
                    model: 'claude-3-5-sonnet-latest',
                  },
                  systemPrompt: 'You are a helpful AI agent.',
                  skills: [],
                  status: 'idle',
                  currentTaskSummary: 'Menunggu tugas',
                  roomZone: 'work',
                });
              }}
            >
              + Tambah Agent Baru
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* SKILLS CATALOG TAB                                   */}
        {/* ==================================================== */}
        {activeTab === 'skills' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Katalog Skill Spesialis (Skill.md Modules)</h3>
              <p>Skill adalah modul instruksi terstruktur dan tools yang dapat dipasangkan ke agent.</p>
            </div>

            {/* Category Filter Bar */}
            <div className="skills-category-filters">
              {['all', 'architecture', 'design', 'development', 'testing'].map((cat) => (
                <button
                  key={cat}
                  className={`skills-filter-btn ${skillCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setSkillCategoryFilter(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Skills Cards Grid */}
            <div className="skills-catalog-grid">
              {filteredSkills.map((skill) => {
                const assignedAgents = agents.filter((a) => a.skills.includes(skill.id));
                const isExpanded = expandedSkillId === skill.id;

                return (
                  <div key={skill.id} className="skill-catalog-card">
                    <div className="skill-card-top">
                      <div className="skill-card-identity">
                        <span className="skill-big-icon">{skill.icon}</span>
                        <div>
                          <h4 className="skill-card-title">{skill.name}</h4>
                          <span className={`skill-category-pill ${skill.category}`}>
                            {skill.category}
                          </span>
                        </div>
                      </div>
                      <button
                        className="skill-expand-btn"
                        onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                      >
                        {isExpanded ? 'Tutup Instruksi' : 'Lihat skill.md'}
                      </button>
                    </div>

                    <p className="skill-card-desc">{skill.description}</p>

                    {/* Tools required badge list */}
                    <div className="skill-tools-row">
                      <span className="skill-tools-label">Tools:</span>
                      {skill.tools.map((t) => (
                        <span key={t} className="skill-tool-chip">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Assigned Agents */}
                    <div className="skill-assigned-row">
                      <span className="assigned-label">Dipasang pada:</span>
                      <div className="assigned-avatars">
                        {assignedAgents.length > 0 ? (
                          assignedAgents.map((a) => (
                            <span
                              key={a.id}
                              className="assigned-pill"
                              style={{ borderLeftColor: a.color }}
                              title={a.name}
                            >
                              {a.avatar.icon} {a.name}
                            </span>
                          ))
                        ) : (
                          <span className="unassigned-text">Belum dipasang</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Markdown Instructions */}
                    {isExpanded && (
                      <div className="skill-instructions-drawer">
                        <div className="instructions-header">
                          <span>📜 Format Instruksi `skill.md`</span>
                        </div>
                        <pre className="skill-instructions-pre">
                          <code>{skill.instructions}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* GENERAL TAB                                          */}
        {/* ==================================================== */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>General Settings</h3>
            </div>

            <div className="settings-group">
              <div className="settings-toggle-row">
                <div>
                  <label>🚀 Performance Mode</label>
                  <p>Kurangi kualitas grafis untuk performa lebih baik di PC rendah</p>
                </div>
                <button
                  className={`settings-toggle ${settings.performanceMode ? 'active' : ''}`}
                  onClick={() => updateSettings({ performanceMode: !settings.performanceMode })}
                >
                  <span className="settings-toggle-knob" />
                </button>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <label>💬 Status Bubbles</label>
                  <p>Tampilkan bubble status mengambang di atas agent</p>
                </div>
                <button
                  className={`settings-toggle ${settings.showStatusBubbles ? 'active' : ''}`}
                  onClick={() => updateSettings({ showStatusBubbles: !settings.showStatusBubbles })}
                >
                  <span className="settings-toggle-knob" />
                </button>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <label>🎯 Auto-focus Active Agent</label>
                  <p>Arahkan kamera otomatis ke agent yang sedang berbicara</p>
                </div>
                <button
                  className={`settings-toggle ${settings.autoFocusActiveAgent ? 'active' : ''}`}
                  onClick={() => updateSettings({ autoFocusActiveAgent: !settings.autoFocusActiveAgent })}
                >
                  <span className="settings-toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
