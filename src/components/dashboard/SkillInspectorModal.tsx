// ============================================
// AgentOffice - Skill Inspector & Management Modal
// View equipped skills, browse 24-skill registry,
// equip/unequip skills for any agent, preview markdown instructions
// ============================================
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SKILLS_REGISTRY, SKILL_CATEGORIES } from '../../config/skills';
import type { Skill, SkillCategory } from '../../types';
import './SkillInspectorModal.css';

interface SkillInspectorModalProps {
  agentId: string | null;
  onClose: () => void;
}

export function SkillInspectorModal({ agentId, onClose }: SkillInspectorModalProps) {
  const agents = useAppStore((s) => s.agents);
  const assignSkill = useAppStore((s) => s.assignSkill);
  const removeSkill = useAppStore((s) => s.removeSkill);

  const [activeAgentId, setActiveAgentId] = useState<string>(agentId || agents[0]?.id || 'arka-ao');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);

  const currentAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  if (!currentAgent) return null;

  const equippedSkills = currentAgent.skills
    .map((skId: string) => SKILLS_REGISTRY.find((sk: Skill) => sk.id === skId))
    .filter((sk): sk is Skill => Boolean(sk));

  const availableSkills = SKILLS_REGISTRY.filter((sk: Skill) => {
    const matchesCat = selectedCategory === 'all' || sk.category === selectedCategory;
    return matchesCat;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="skill-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="skill-modal-header">
          <div className="modal-header-left">
            <span className="modal-badge-icon">⚡</span>
            <div>
              <h2 className="modal-title">Skill Management & AI Registry</h2>
              <p className="modal-subtitle">
                Atur kapabilitas spesialis, prompt instruksi, dan tools untuk masing-masing agent
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Tutup modal">
            ✕
          </button>
        </div>

        {/* Agent Switcher Tabs */}
        <div className="agent-switcher-tabs">
          {agents.map((agent) => (
            <button
              key={`switcher-${agent.id}`}
              className={`agent-tab-btn ${activeAgentId === agent.id ? 'active' : ''}`}
              onClick={() => setActiveAgentId(agent.id)}
              style={{
                borderColor: activeAgentId === agent.id ? agent.color : undefined,
              }}
            >
              <span
                className="agent-tab-dot"
                style={{ backgroundColor: agent.color }}
              />
              <span>{agent.name}</span>
              <span className="agent-tab-count">
                {agent.skills.length}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Content Split */}
        <div className="skill-modal-body">
          {/* Left: Current Agent's Equipped Skills */}
          <div className="skill-column equipped-column">
            <div className="column-header">
              <h3>
                Skill Aktif {currentAgent.name} ({equippedSkills.length})
              </h3>
            </div>
            <div className="skill-cards-list">
              {equippedSkills.map((sk) => (
                <div
                  key={`eq-${sk.id}`}
                  className={`skill-item-card ${previewSkill?.id === sk.id ? 'previewing' : ''}`}
                  onClick={() => setPreviewSkill(sk)}
                >
                  <div className="skill-item-top">
                    <span className="skill-item-icon">{sk.icon}</span>
                    <span className="skill-item-name">{sk.name}</span>
                    <button
                      className="skill-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(currentAgent.id, sk.id);
                      }}
                      title="Lepas skill ini dari agen"
                    >
                      Lepas
                    </button>
                  </div>
                  <p className="skill-item-desc">{sk.description}</p>
                  <div className="skill-tools-tags">
                    {sk.tools.map((t) => (
                      <span key={t} className="tool-tag">🔧 {t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Full 24-Skill Registry */}
          <div className="skill-column registry-column">
            <div className="column-header">
              <h3>Katalog Skill Tersedia (24)</h3>
              {/* Category Filter Pills */}
              <div className="category-filter-pills">
                <button
                  className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua
                </button>
                {SKILL_CATEGORIES.map((cat: { id: SkillCategory; name: string; icon: string }) => (
                  <button
                    key={cat.id}
                    className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="skill-cards-list">
              {availableSkills.map((sk: Skill) => {
                const isEquipped = currentAgent.skills.includes(sk.id);
                return (
                  <div
                    key={`reg-${sk.id}`}
                    className={`skill-item-card registry ${previewSkill?.id === sk.id ? 'previewing' : ''}`}
                    onClick={() => setPreviewSkill(sk)}
                  >
                    <div className="skill-item-top">
                      <span className="skill-item-icon">{sk.icon}</span>
                      <span className="skill-item-name">{sk.name}</span>
                      {isEquipped ? (
                        <span className="equipped-badge">✓ Terpasang</span>
                      ) : (
                        <button
                          className="skill-equip-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            assignSkill(currentAgent.id, sk.id);
                          }}
                        >
                          + Pasang
                        </button>
                      )}
                    </div>
                    <p className="skill-item-desc">{sk.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Skill Documentation & Prompt Preview */}
          <div className="skill-column preview-column">
            <div className="column-header">
              <h3>Detail & Markdown Panduan</h3>
            </div>
            {previewSkill ? (
              <div className="skill-detail-view">
                <div className="detail-hero">
                  <span className="detail-icon">{previewSkill.icon}</span>
                  <div>
                    <h4 className="detail-title">{previewSkill.name}</h4>
                    <span className="detail-cat-badge">{previewSkill.category}</span>
                  </div>
                </div>
                <div className="detail-section">
                  <h5>Deskripsi Kapabilitas:</h5>
                  <p>{previewSkill.description}</p>
                </div>
                <div className="detail-section">
                  <h5>Tools Yang Dibutuhkan:</h5>
                  <div className="detail-tools-list">
                    {previewSkill.tools.map((t) => (
                      <span key={t} className="detail-tool-chip">⚡ {t}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-section">
                  <h5>System Instructions:</h5>
                  <pre className="detail-instructions-code">
                    {previewSkill.instructions}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="detail-placeholder">
                <span>👈</span>
                <p>Pilih skill di sebelah kiri untuk melihat deskripsi dan instruksi lengkap.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
