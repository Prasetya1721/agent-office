// ============================================
// AgentOffice - Artifacts Panel
// ============================================
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Artifact } from '../../types';
import './ArtifactsPanel.css';

const DEFAULT_ARTIFACTS: Artifact[] = [
  {
    id: 'art-1',
    title: 'App Architecture & Flow',
    type: 'markdown',
    language: 'markdown',
    version: 1,
    createdAt: Date.now() - 1000 * 60 * 45,
    content: `# 🏗️ AgentOffice System Architecture

## Component Overview
- **3D Interactive Canvas**: Powered by Three.js & React Three Fiber
- **Agent Mesh & State Loop**: Reactive state synchronization with idle/typing/thinking loops
- **LLM Brain Router**: Multi-provider failover routing (Anthropic Claude, Google Gemini, OpenAI GPT, Local LLM)
- **Task Orchestrator**: Automated planning, delegation, and dependency chaining

### Communication Sequence
1. User provides prompt to **Lead Engineer**
2. Lead decomposes task into modular subtasks
3. Subtasks dispatched to **UI/UX Designer** and **Frontend Dev**
4. Code passes to **Debugger / QA** for automated verification
5. Delivered to user as reviewed artifact!`,
  },
  {
    id: 'art-2',
    title: 'Landing Page Hero Component',
    type: 'code',
    language: 'html',
    version: 2,
    createdAt: Date.now() - 1000 * 60 * 20,
    content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #0d0e1b;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    .card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 36px 48px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 24px;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: white;
      padding: 10px 24px;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 3D Autonomous AI Office</h1>
    <p>Your team of specialist agents collaborating in real-time.</p>
    <button onclick="alert('Hello from AgentOffice Sandbox!')">Launch Mission</button>
  </div>
</body>
</html>`,
  },
  {
    id: 'art-3',
    title: 'API Integration Client',
    type: 'code',
    language: 'typescript',
    version: 1,
    createdAt: Date.now() - 1000 * 60 * 10,
    content: `export interface StreamOptions {
  model: string;
  temperature?: number;
  onChunk: (chunk: string) => void;
}

export async function streamCompletion(prompt: string, opts: StreamOptions) {
  const response = await fetch('/api/llm/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...opts }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    opts.onChunk(decoder.decode(value, { stream: true }));
  }
}`,
  },
];

export function ArtifactsPanel() {
  const tasks = useAppStore((s) => s.tasks);
  const storeArtifacts = useAppStore((s) => s.artifacts);
  
  // Aggregate artifacts from store + tasks + default artifacts
  const taskArtifacts = tasks.flatMap((t) => t.artifacts || []);
  const allArtifacts = [...storeArtifacts, ...taskArtifacts, ...DEFAULT_ARTIFACTS];

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(allArtifacts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const selectedArtifact = allArtifacts.find((a) => a.id === selectedArtifactId) || allArtifacts[0];

  const filteredArtifacts = filterType === 'all' 
    ? allArtifacts 
    : allArtifacts.filter((a) => a.type === filterType);

  const handleCopy = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(selectedArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedArtifact) return;
    const blob = new Blob([selectedArtifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = selectedArtifact.language === 'html' ? 'html' : selectedArtifact.type === 'markdown' ? 'md' : 'ts';
    a.download = `${selectedArtifact.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="artifacts-panel">
      {/* Category filter tabs */}
      <div className="artifacts-filter-bar">
        {['all', 'code', 'markdown'].map((type) => (
          <button
            key={type}
            className={`artifacts-filter-chip ${filterType === type ? 'active' : ''}`}
            onClick={() => setFilterType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Artifact List */}
      <div className="artifacts-list">
        {filteredArtifacts.map((art) => (
          <div
            key={art.id}
            className={`artifact-item ${art.id === selectedArtifact?.id ? 'active' : ''}`}
            onClick={() => setSelectedArtifactId(art.id)}
          >
            <div className="artifact-item-icon">
              {art.type === 'code' ? '💻' : art.type === 'markdown' ? '📝' : '📦'}
            </div>
            <div className="artifact-item-info">
              <div className="artifact-item-title">{art.title}</div>
              <div className="artifact-item-meta">
                v{art.version} • {art.language || art.type} • {new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Artifact Viewer */}
      {selectedArtifact && (
        <div className="artifact-viewer">
          <div className="artifact-viewer-toolbar">
            <div className="artifact-viewer-actions">
              {selectedArtifact.language === 'html' && (
                <div className="artifact-tabs">
                  <button
                    className={`artifact-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Live Preview
                  </button>
                  <button
                    className={`artifact-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                    onClick={() => setActiveTab('code')}
                  >
                    Source Code
                  </button>
                </div>
              )}
            </div>
            <div className="artifact-tools">
              <button className="tool-btn" onClick={handleCopy} title="Copy Content">
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className="tool-btn" onClick={handleDownload} title="Download File">
                📥 Export
              </button>
            </div>
          </div>

          <div className="artifact-viewer-body">
            {selectedArtifact.language === 'html' && activeTab === 'preview' ? (
              <iframe
                title="Artifact Sandbox"
                srcDoc={selectedArtifact.content}
                className="artifact-sandbox-frame"
                sandbox="allow-scripts"
              />
            ) : (
              <pre className="artifact-code-block">
                <code>{selectedArtifact.content}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
