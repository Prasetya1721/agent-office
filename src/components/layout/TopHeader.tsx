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
  const usageLogs = useAppStore((s) => s.usageLogs);
  const collaboration = useAppStore((s) => s.collaboration);

  // Secondary view controls (theme / camera / fullscreen) are set-once, so they
  // live behind a disclosure instead of occupying the header permanently.
  const [showViewMenu, setShowViewMenu] = useState(false);

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
  // Every KPI below is derived from the store. The previous set was six
  // hardcoded literals ("778rb", "378rb", "21.00", "602", "1.2G free",
  // "Active Sprint #03") that never changed, plus a `{count || 6}/6` that
  // reported a fully staffed office when zero agents were active — `||`
  // treats 0 as falsy, so the idle state read as 6/6.
  const tokensOut = usageLogs.reduce((sum, log) => sum + log.tokensOut, 0);
  const totalCost = usageLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
  const hasUsage = usageLogs.length > 0;

  // The header shows the three values that change while you work. Task totals
  // and artifacts were seven cards competing for the same strip; they now live
  // in the Task Board / Artifacts panels, which own that data already. The
  // active-agent count moves into the Live badge, where "live" actually means it.
  const clockKpi = (
    <div className="hq-kpi-card highlight">
      <span className="kpi-label">JAM</span>
      <span className="kpi-val clock">{timeStr}</span>
    </div>
  );

  const sprintLine = collaboration.isActive
    ? `Sprint ${collaboration.currentStep}/${collaboration.totalSteps} — ${collaboration.topic}`
    : 'Idle — belum ada sprint aktif';

  return (
    <header className="top-header-hq">
      {/* 1. LEFT TITLE & LIVE STATUS */}
      <div className="hq-brand-section">
        <div className="hq-title-row">
          <h1 className="hq-title">Kantor Virtual HQ</h1>
          <span className="hq-live-badge">
            <span className="live-dot" />
            {activeAgentsCount > 0 ? `${activeAgentsCount} aktif` : 'Idle'}
          </span>
        </div>
        <div className="hq-subtitle">3D Multi-Agent Office • {sprintLine}</div>
      </div>

      {/* 2. CENTER CONTROL: a single disclosure instead of five always-on buttons.
          Theme / camera / fullscreen are set-once and live behind it. Settings
          is NOT duplicated here — the nav rail already owns that entry. */}
      <div className="hq-view-controls">
        <div className="hq-menu-anchor">
          <button
            className={`hq-control-btn ${showViewMenu ? 'active' : ''}`}
            onClick={() => setShowViewMenu((v) => !v)}
            aria-expanded={showViewMenu}
            title="Opsi tampilan"
          >
            🎛️ Tampilan ▾
          </button>
          {showViewMenu && (
            <>
              <div className="hq-menu-backdrop" onClick={() => setShowViewMenu(false)} />
              <div className="hq-menu-popover" role="menu">
                <button
                  className={`hq-menu-item ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  ☀️ Mode Terang
                </button>
                <button
                  className={`hq-menu-item ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  🌙 Mode Gelap
                </button>
                <button
                  className="hq-menu-item"
                  onClick={() => {
                    onResetCamera();
                    setShowViewMenu(false);
                  }}
                >
                  📐 Sudut awal
                </button>
                <button
                  className="hq-menu-item"
                  onClick={() => {
                    handleFullscreen();
                    setShowViewMenu(false);
                  }}
                >
                  ⛶ Layar penuh
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. RIGHT KPI METRICS — three values that move while you work.
          JAM + the live-token pair. Everything else was either fake or belongs
          to a panel that already renders it. */}
      <div className="hq-metrics-deck">
        {clockKpi}
        <div
          className="hq-kpi-card"
          title={hasUsage ? `${usageLogs.length} usage log` : 'Belum ada usage log'}
        >
          <span className="kpi-label">TOKEN KELUAR</span>
          <span className="kpi-val">{hasUsage ? tokensOut.toLocaleString('id-ID') : '—'}</span>
        </div>
        <div
          className="hq-kpi-card"
          title={hasUsage ? 'Estimasi biaya BYOK' : 'Belum ada usage log'}
        >
          <span className="kpi-label">BIAYA</span>
          <span className="kpi-val">{hasUsage ? `$${totalCost.toFixed(4)}` : '—'}</span>
        </div>
      </div>
    </header>
  );
}
