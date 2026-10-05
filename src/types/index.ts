// ============================================
// AgentOffice - Core Type Definitions
// ============================================

// --- Agent Types ---
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'discussing' | 'done' | 'error';

export type RoomZone = 'work' | 'break' | 'meeting' | 'lounge';

export interface Agent {
  id: string;
  name: string;
  shortTag: string; // e.g. 'AO', 'PM', 'FE', 'DE', 'SM', 'CW'
  role: string;
  description: string;
  avatar: AgentAvatar;
  systemPrompt: string;
  modelConfig: ModelConfig;
  skills: string[];
  tools: string[];
  status: AgentStatus;
  currentTaskId?: string;
  currentTaskSummary: string;
  sessionStats: string;
  roomZone?: RoomZone;
  color: string;
}

export interface AgentAvatar {
  bodyColor: string;
  headColor: string;
  accentColor: string;
  icon: string;
}

export type SkillCategory = 'architecture' | 'design' | 'development' | 'testing' | 'devops' | 'research';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  instructions: string;
  tools: string[];
  icon: string;
  isCustom?: boolean;
}

// --- Backlog & Activity Types for HQ Dashboard ---
export interface BacklogItem {
  id: string;
  category: 'deadline' | 'waiting_owner' | 'ideas';
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface LiveActivity {
  id: string;
  agentId: string;
  agentName: string;
  shortTag: string;
  color: string;
  text: string;
  timeAgo: string;
  category?: string;
}

// --- LLM Provider Types ---
export type LLMProvider = 'anthropic' | 'google' | 'openai' | 'custom-openai';

export interface ModelConfig {
  provider: LLMProvider;
  baseUrl?: string;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  extraHeaders?: Record<string, string>;
  fallbackModel?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  baseUrl: string;
  apiKey: string;
  models: string[];
  isCustom: boolean;
  extraHeaders?: Record<string, string>;
}

// --- Task Types ---
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgentId?: string;
  parentTaskId?: string;
  subtaskIds: string[];
  artifacts: Artifact[];
  createdAt: number;
  updatedAt: number;
}

// --- Message Types ---
export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  targetAgentId?: string;
  channel?: 'direct' | 'team';
  content: string;
  taskId?: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface CollaborationState {
  isActive: boolean;
  topic: string;
  currentStep: number;
  totalSteps: number;
  activeSpeakerId: string | null;
  targetSpeakerId: string | null;
}

// --- Artifact Types ---
export type ArtifactType = 'code' | 'markdown' | 'diagram' | 'file' | 'image';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
  version: number;
  createdAt: number;
}

// --- Usage Types ---
export interface UsageLog {
  id: string;
  agentId: string;
  model: string;
  provider: LLMProvider;
  tokensIn: number;
  tokensOut: number;
  estimatedCost: number;
  taskId?: string;
  timestamp: number;
}

// --- UI Types ---
export type PanelView = 'chat' | 'tasks' | 'settings' | 'artifacts' | 'usage';
export type CameraMode = 'orbit' | 'focused' | 'overview';

export interface AppSettings {
  performanceMode: boolean;
  theme: 'dark' | 'light';
  language: 'id' | 'en';
  cameraMode: CameraMode;
  showStatusBubbles: boolean;
  autoFocusActiveAgent: boolean;
}
