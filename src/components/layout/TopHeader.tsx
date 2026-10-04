// ============================================
// AgentOffice - Top Header Bar
// Matching Reference Screenshot:
// Title + Live Pill, View Toggles (Otomatis, Terang, Gelap, Sudut awal, Layar penuh),
// and Right KPI Stat Cards (JAM, TOKEN KELUAR, BIAYA, AKURASI, AKTIF, TIM AKTIF, RAM AI)
// ============================================
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import './TopHeader.css';

interface TopHeaderProps {
  onResetCamera: () => void;
}

export function TopHeader({ onResetCamera }: TopHeaderProps) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const agents = useAppStore((s) => s.agents);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);

  // Live real-time clock matching "15.03.52" in screenshot
  const [timeStr, setTimeStr] = useState('15.03.52');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hh}.${mm}.${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeAgentsCount = agents.filter(
    (a) => a.status === 'working' || a.status === 'thinking' || a.status === 'discussing'
  ).length;

  return (
    <header className="top-header-hq">
      {/* 1. LEFT TITLE & LIVE STATUS */}
      <div className="hq-brand-section">
        <div className="hq-title-row">
          <h1 className="hq-title">Kantor Virtual HQ</h1>
          <span className="hq-live-badge">
            <span className="live-dot" />
            Live
          </span>
        </div>
        <div className="hq-subtitle">3D Multi-Agent Office • Active Sprint #03</div>
      </div>

      {/* 2. CENTER CONTROLS: THEME & CAMERA */}
      <div className="hq-view-controls">
        <button
          className="hq-control-btn"
          onClick={() => {
            setActivePanel('settings');
            setPanelOpen(true);
          }}
          title="Pengaturan Aplikasi"
        >
          ⚙️ Pengaturan
        </button>
        <button
          className={`hq-control-btn ${settings.theme === 'light' ? 'active' : ''}`}
          onClick={() => updateSettings({ theme: 'light' })}
          title="Mode Terang (Daylight Office)"
        >
          ☀️ Terang
        </button>
        <button
          className={`hq-control-btn ${settings.theme === 'dark' ? 'active' : ''}`}
          onClick={() => updateSettings({ theme: 'dark' })}
          title="Mode Gelap (Cyberpunk Night)"
        >
          🌙 Gelap
        </button>
        <button
          className="hq-control-btn"
          onClick={onResetCamera}
          title="Reset ke sudut isometric awal"
        >
          📐 Sudut awal
        </button>
        <button
          className="hq-control-btn"
          onClick={handleFullscreen}
          title="Layar penuh (Fullscreen)"
        >
          ⛶ Layar penuh
        </button>
      </div>

      {/* 3. RIGHT KPI METRICS CARDS */}
      <div className="hq-metrics-deck">
        <div className="hq-kpi-card highlight">
          <span className="kpi-label">JAM</span>
          <span className="kpi-val clock">{timeStr}</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">TOKEN KELUAR</span>
          <span className="kpi-val">778rb</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">BIAYA KELUAR</span>
          <span className="kpi-val">378rb</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">AKURASI INTERAKSI</span>
          <span className="kpi-val">21.00</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">AKTIF</span>
          <span className="kpi-val">602</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">TIM AKTIF</span>
          <span className="kpi-val text-green">{activeAgentsCount || 6}/6</span>
        </div>
        <div className="hq-kpi-card">
          <span className="kpi-label">RAM AI</span>
          <span className="kpi-val">1.2G free</span>
        </div>
      </div>
    </header>
  );
}
