// ============================================
// AgentOffice - Zustand Store
// ============================================
import { create } from 'zustand';
import type {
  Agent,
  Task,
  Message,
  PanelView,
  AppSettings,
  AgentStatus,
  TaskStatus,
  RoomZone,
  ProviderConfig,
  UsageLog,
  CollaborationState,
  Artifact,
  BacklogItem,
  LiveActivity,
} from '../types';
import { DEFAULT_AGENTS, PROVIDER_DEFAULTS } from '../config/agents';

/**
 * Where an agent belongs given its status. This is what makes the Ruang Santai
 * (Zone 4, lounge + pool) an actual destination rather than decoration: an idle
 * agent drifts there, and any agent that starts working walks back to its desk.
 *
 * A deliberate 'break' or 'meeting' assignment is a standing choice (seeded, or
 * set by the user), so those zones are left alone for every status except an
 * explicit return to work -- only a working agent is pulled back to 'work'.
 */
function zoneForStatus(status: AgentStatus, current?: RoomZone): RoomZone {
  if (status === 'working' || status === 'thinking') return 'work';
  if (status === 'idle') return current === 'meeting' || current === 'break' ? current : 'lounge';
  return current ?? 'work';
}

interface AppState {
  // Agents
  agents: Agent[];
  selectedAgentId: string | null;
  setSelectedAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  toggleAgentWork: (id: string) => void;
  assignSkill: (agentId: string, skillId: string) => void;
  removeSkill: (agentId: string, skillId: string) => void;

  // Backlog
  backlogItems: BacklogItem[];
  toggleBacklogItem: (id: string) => void;
  addBacklogItem: (item: BacklogItem) => void;

  // Live Activities Feed
  liveActivities: LiveActivity[];
  selectedActivityFilter: string; // 'all' or agentId
  setSelectedActivityFilter: (filter: string) => void;
  addActivity: (activity: LiveActivity) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;

  // Artifacts
  artifacts: Artifact[];
  addArtifact: (art: Artifact) => void;

  // Messages
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;

  // Collaboration State
  collaboration: CollaborationState;
  setCollaboration: (collab: Partial<CollaborationState>) => void;

  // Panel
  activePanel: PanelView;
  setActivePanel: (panel: PanelView) => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;

  // Right Panel Tab: 'backlog' | 'chat'
  rightPanelTab: 'backlog' | 'chat';
  setRightPanelTab: (tab: 'backlog' | 'chat') => void;

  // Active Chat Selection ('team' or agentId)
  activeChatTab: string;
  setActiveChatTab: (tab: string) => void;

  // Provider Config
  providers: ProviderConfig[];
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (id: string, updates: Partial<ProviderConfig>) => void;
  removeProvider: (id: string) => void;

  // Usage
  usageLogs: UsageLog[];
  addUsageLog: (log: UsageLog) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Chat state
  chatAgentId: string | null;
  setChatAgent: (id: string | null) => void;

  // 3D camera
  focusPosition: [number, number, number] | null;
  setFocusPosition: (pos: [number, number, number] | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Agents
  agents: DEFAULT_AGENTS,
  selectedAgentId: null,
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, status, roomZone: zoneForStatus(status, a.roomZone) }
          : a
      ),
    })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),
  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    })),
  toggleAgentWork: (id) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== id) return a;
        const newStatus: AgentStatus = a.status === 'working' ? 'idle' : 'working';
        return { ...a, status: newStatus, roomZone: zoneForStatus(newStatus, a.roomZone) };
      }),
    })),
  assignSkill: (agentId, skillId) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId || a.skills.includes(skillId)) return a;
        return { ...a, skills: [...a.skills, skillId] };
      }),
    })),
  removeSkill: (agentId, skillId) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId) return a;
        return { ...a, skills: a.skills.filter((s) => s !== skillId) };
      }),
    })),

  // Backlog matching reference screenshot
  backlogItems: [
    // Deadline dekat (4)
    {
      id: 'bl-1',
      category: 'deadline',
      title: 'Klien 3 — landing page promo sector studio',
      dueDate: '2026-10-07',
      completed: false,
    },
    {
      id: 'bl-2',
      category: 'deadline',
      title: 'Klien 1 — Fix export laporan jadi excel',
      dueDate: '2026-10-09',
      completed: false,
    },
    {
      id: 'bl-3',
      category: 'deadline',
      title: 'Klien 4 — Gambar ilustrasi klien korporat',
      dueDate: '2026-10-12',
      completed: false,
    },
    {
      id: 'bl-4',
      category: 'deadline',
      title: 'Klien 2 — 4 artikel SEO minggu ini',
      dueDate: '2026-10-15',
      completed: false,
    },
    // Menunggu owner (3)
    {
      id: 'bl-5',
      category: 'waiting_owner',
      title: 'Review budget iklan bulan depan',
      completed: false,
    },
    {
      id: 'bl-6',
      category: 'waiting_owner',
      title: 'Pilih desain banner promo (5/8)',
      completed: false,
    },
    {
      id: 'bl-7',
      category: 'waiting_owner',
      title: 'Konfirmasi jadwal rilis fitur baru',
      completed: false,
    },
    // Ide / nanti (3)
    {
      id: 'bl-8',
      category: 'ideas',
      title: 'Template laporan otomatis per klien',
      completed: false,
    },
    {
      id: 'bl-9',
      category: 'ideas',
      title: 'Replikasi CTA mendaftar sukses',
      completed: false,
    },
  ],
  toggleBacklogItem: (id) =>
    set((state) => ({
      backlogItems: state.backlogItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    })),
  addBacklogItem: (item) =>
    set((state) => ({ backlogItems: [item, ...state.backlogItems] })),

  // Live Activities matching reference screenshot
  liveActivities: [
    {
      id: 'act-1',
      agentId: 'tiara-pm',
      agentName: 'Tiara (PM)',
      shortTag: 'PM',
      color: '#3b82f6',
      text: 'DEK - Tambah filter tanggal di dashboard',
      timeAgo: '1m',
    },
    {
      id: 'act-2',
      agentId: 'reza-sm',
      agentName: 'Reza (SM)',
      shortTag: 'SM',
      color: '#ec4899',
      text: 'meta-ads - Tarik performa iklan minggu ini',
      timeAgo: '2m',
    },
    {
      id: 'act-3',
      agentId: 'arka-ao',
      agentName: 'Arka (AO)',
      shortTag: 'AO',
      color: '#f59e0b',
      text: 'Laporan harian semua tim sudah masuk, lagi aku rangkum buat dikirim ke WA owner.',
      timeAgo: '3m',
    },
    {
      id: 'act-4',
      agentId: 'dimas-de',
      agentName: 'Dimas (DE)',
      shortTag: 'DE',
      color: '#8b5cf6',
      text: 'WebScrap - Cek halaman katalog produk',
      timeAgo: '4m',
    },
    {
      id: 'act-5',
      agentId: 'fajar-fe',
      agentName: 'Fajar (FE)',
      shortTag: 'FE',
      color: '#10b981',
      text: 'FE-02 - Cek komponen form landing page',
      timeAgo: '5m',
    },
    {
      id: 'act-6',
      agentId: 'gilang-cw',
      agentName: 'Gilang (CW)',
      shortTag: 'CW',
      color: '#06b6d4',
      text: 'Docs - Tulis draf artikel SEO',
      timeAgo: '7m',
    },
    {
      id: 'act-7',
      agentId: 'fajar-fe',
      agentName: 'Fajar (FE)',
      shortTag: 'FE',
      color: '#10b981',
      text: 'Draft report: Laporan sudah siap di staging, tinggal review owner.',
      timeAgo: '8m',
    },
    {
      id: 'act-8',
      agentId: 'arka-ao',
      agentName: 'Arka (AO)',
      shortTag: 'AO',
      color: '#f59e0b',
      text: 'Cc: Reza. Tolong cek 3 baris laporan kemarin ya',
      timeAgo: '10m',
    },
    {
      id: 'act-9',
      agentId: 'reza-sm',
      agentName: 'Reza (SM)',
      shortTag: 'SM',
      color: '#ec4899',
      text: 'Iklan 4 paling murah per lead, sisa budget klien C dipindah ke sana',
      timeAgo: '11m',
    },
    {
      id: 'act-10',
      agentId: 'fajar-fe',
      agentName: 'Fajar (FE)',
      shortTag: 'FE',
      color: '#10b981',
      text: 'Landing page promo sudah live, tracking form sudah aku uji dan masuk',
      timeAgo: '13m',
    },
    {
      id: 'act-11',
      agentId: 'tiara-pm',
      agentName: 'Tiara (PM)',
      shortTag: 'PM',
      color: '#3b82f6',
      text: 'Hasil: Baca daftar tugas minggu ini',
      timeAgo: '15m',
    },
    {
      id: 'act-12',
      agentId: 'dimas-de',
      agentName: 'Dimas (DE)',
      shortTag: 'DE',
      color: '#8b5cf6',
      text: 'Katalog produk klien sudah tampil, gambar sudah dikompres',
      timeAgo: '18m',
    },
    {
      id: 'act-13',
      agentId: 'gilang-cw',
      agentName: 'Gilang (CW)',
      shortTag: 'CW',
      color: '#06b6d4',
      text: '2 artikel sudah terbit, 1 artikel lagi proses review',
      timeAgo: '20m',
    },
  ],
  selectedActivityFilter: 'all',
  setSelectedActivityFilter: (filter) => set({ selectedActivityFilter: filter }),
  addActivity: (activity) =>
    set((state) => ({ liveActivities: [activity, ...state.liveActivities] })),

  // Tasks
  tasks: [
    {
      id: 'task-1',
      title: 'Decompose System Requirements',
      description: 'Analyze PRD requirements and draft autonomous multi-agent hierarchy.',
      status: 'done',
      assignedAgentId: 'arka-ao',
      subtaskIds: [],
      artifacts: [],
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'task-2',
      title: 'Modern 3D Virtual Workspace Design',
      description: 'Create cohesive glassmorphism palette, 3D spatial layout, and responsive panels.',
      status: 'review',
      assignedAgentId: 'reza-sm',
      subtaskIds: [],
      artifacts: [],
      createdAt: Date.now() - 3600000 * 1.5,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'task-3',
      title: 'Build 3D Interactive Room Zones',
      description: 'Render Three.js room geometry, Ruangan Kerja, Ruangan Istirahat, and Ruangan Meeting.',
      status: 'in-progress',
      assignedAgentId: 'fajar-fe',
      subtaskIds: [],
      artifacts: [],
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 600000,
    },
    {
      id: 'task-4',
      title: 'REST API & SQLite Synchronization',
      description: 'Optimize queries and provide high-concurrency event bus between agents.',
      status: 'todo',
      assignedAgentId: 'dimas-de',
      subtaskIds: [],
      artifacts: [],
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 900000,
    },
  ],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      ),
    })),
  moveTask: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: Date.now() } : t
      ),
    })),

  // Artifacts
  artifacts: [],
  addArtifact: (art) => set((state) => ({ artifacts: [art, ...state.artifacts] })),

  // Collaboration State
  collaboration: {
    isActive: false,
    topic: 'Idle - Ready for Mission',
    currentStep: 0,
    totalSteps: 4,
    activeSpeakerId: null,
    targetSpeakerId: null,
  },
  setCollaboration: (collab) =>
    set((state) => ({ collaboration: { ...state.collaboration, ...collab } })),

  // Right Panel Tab
  rightPanelTab: 'backlog',
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

  // Active Chat Selection ('team' or agent id)
  activeChatTab: 'team',
  setActiveChatTab: (tab) => set({ activeChatTab: tab }),

  // Messages (Synchronized inter-agent dialogue)
  messages: [
    {
      id: 'msg-team-1',
      role: 'agent',
      agentId: 'arka-ao',
      targetAgentId: 'all',
      channel: 'team',
      content: 'Halo tim! Saya baru saja menganalisis arsitektur sistem untuk sprint baru. Mari kita sinkronkan alur kerja antar agent agar terintegrasi penuh.',
      timestamp: Date.now() - 300000,
    },
    {
      id: 'msg-team-2',
      role: 'agent',
      agentId: 'arka-ao',
      targetAgentId: 'tiara-pm',
      channel: 'team',
      content: '@Tiara (PM) tolong prioritaskan backlog sprint dan jadwalkan milestone klien.',
      timestamp: Date.now() - 240000,
    },
    {
      id: 'msg-team-3',
      role: 'agent',
      agentId: 'tiara-pm',
      targetAgentId: 'fajar-fe',
      channel: 'team',
      content: '@Arka @Fajar (FE) Backlog sudah siap! Form landing page promo klien 3 dan filter dashboard siap dikerjakan.',
      timestamp: Date.now() - 180000,
    },
    {
      id: 'msg-team-4',
      role: 'agent',
      agentId: 'fajar-fe',
      targetAgentId: 'dimas-de',
      channel: 'team',
      content: '@Tiara diterima! Frontend React dan visualisasi 3D room sudah sinkron. @Dimas tolong pastikan endpoint catalog produk siap.',
      timestamp: Date.now() - 120000,
    },
    {
      id: 'msg-team-5',
      role: 'agent',
      agentId: 'dimas-de',
      targetAgentId: 'arka-ao',
      channel: 'team',
      content: '@Fajar @Arka Endpoint catalog produk sudah live, query dioptimasi tanpa bottleneck. Tim siap deliver! 🚀',
      timestamp: Date.now() - 60000,
    },
  ],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  // Panel
  activePanel: 'chat',
  setActivePanel: (panel) => set({ activePanel: panel }),
  isPanelOpen: false,
  setPanelOpen: (open) => set({ isPanelOpen: open }),

  // Provider Config
  providers: [
    {
      id: 'anthropic-default',
      name: PROVIDER_DEFAULTS.anthropic.name,
      provider: 'anthropic',
      baseUrl: PROVIDER_DEFAULTS.anthropic.baseUrl,
      apiKey: '',
      models: PROVIDER_DEFAULTS.anthropic.models,
      isCustom: false,
    },
    {
      id: 'google-default',
      name: PROVIDER_DEFAULTS.google.name,
      provider: 'google',
      baseUrl: PROVIDER_DEFAULTS.google.baseUrl,
      apiKey: '',
      models: PROVIDER_DEFAULTS.google.models,
      isCustom: false,
    },
    {
      id: 'openai-default',
      name: PROVIDER_DEFAULTS.openai.name,
      provider: 'openai',
      baseUrl: PROVIDER_DEFAULTS.openai.baseUrl,
      apiKey: '',
      models: PROVIDER_DEFAULTS.openai.models,
      isCustom: false,
    },
  ],
  addProvider: (provider) =>
    set((state) => ({ providers: [...state.providers, provider] })),
  updateProvider: (id, updates) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removeProvider: (id) =>
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
    })),

  // Usage
  usageLogs: [],
  addUsageLog: (log) =>
    set((state) => ({ usageLogs: [...state.usageLogs, log] })),

  // Settings
  settings: {
    performanceMode: false,
    theme: 'light', // Light clean aesthetic matching reference screenshot!
    language: 'id',
    cameraMode: 'orbit',
    showStatusBubbles: true,
    autoFocusActiveAgent: true,
  },
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  // Chat
  chatAgentId: 'arka-ao',
  setChatAgent: (id) => set({ chatAgentId: id }),

  // 3D Camera
  focusPosition: null,
  setFocusPosition: (pos) => set({ focusPosition: pos }),
}));

// ============================================
// Persistence — credentials + user preferences ONLY
// ============================================

/**
 * `providers` holds the BYOK API key. Without persistence it lives in memory
 * only, so every Vite hot-reload or page refresh silently resets it to '' and
 * the app reports "API key belum diisi" again — which is exactly the bug this
 * replaces.
 *
 * Deliberately NOT persisted: agents, messages, tasks, artifacts, activities,
 * backlog, collaboration. Those are seeded demo content — they must reset to a
 * reproducible state on reload so the app never boots into stale conversation
 * history or stale KPI totals.
 *
 * Storage note: this app calls LLM APIs directly from the browser, so the key is
 * only ever as protected as the origin it runs on. A VITE_* env var would be
 * inlined into the shipped bundle by Vite and end up equally readable, so
 * localStorage is not the weaker option here.
 */
const STORAGE_KEY = 'agent-office-prefs';

type PersistedPrefs = Pick<AppState, 'providers' | 'settings'>;

function loadPrefs(): Partial<PersistedPrefs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedPrefs>) : {};
  } catch {
    // Corrupt or unreadable storage must not stop the app from booting.
    return {};
  }
}

// Hydrate before first render so no component ever sees an empty apiKey.
const initialPrefs = loadPrefs();
if (initialPrefs.providers) {
  useAppStore.setState({ providers: initialPrefs.providers });
}
if (initialPrefs.settings) {
  useAppStore.setState({ settings: initialPrefs.settings });
}

useAppStore.subscribe((state) => {
  try {
    const prefs: PersistedPrefs = {
      providers: state.providers,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Quota exceeded or private-mode storage disabled — non-fatal, the session
    // keeps working, the key just will not survive a reload.
  }
});
