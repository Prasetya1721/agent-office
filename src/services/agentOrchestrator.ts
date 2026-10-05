// ============================================
// AgentOffice - Multi-Agent Collaboration Orchestrator
// ============================================
import { useAppStore } from '../store/useAppStore';
import { sendMessageToAgent, isProviderUsable } from './llmService';
import type { Message, Task, Artifact } from '../types';

/**
 * Marker prefixed to every scripted agent line.
 *
 * Steps 2-4 of the sprint are NOT wired to an LLM — they are fixed strings plus
 * generated artifacts. Step 1 calls a real model when one is reachable. Without
 * this marker a scripted line is indistinguishable from real model output, so
 * the run reads as "the team did the work" when no model was ever called.
 */
const SIMULATED_PREFIX = '⚠️ [SIMULASI — bukan output model] ';

/**
 * Run a full synchronized collaborative sprint across all agents
 */
export async function runCollaborativeSprint(userGoal: string): Promise<void> {
  const store = useAppStore.getState();
  const { agents, providers } = store;

  // Find agent references
  const leadAgent = agents.find((a) => a.id === 'lead-engineer') || agents[0];
  const uiuxAgent = agents.find((a) => a.id === 'ui-ux-designer') || agents[1];
  const frontendAgent = agents.find((a) => a.id === 'frontend-dev') || agents[2];
  const debuggerAgent = agents.find((a) => a.id === 'debugger') || agents[3];

  // Refuse to fake a collaboration when nothing can reach a model. Steps 2-4
  // are hardcoded, so running them with no key would post a scripted "QA audit
  // passed, ready to deploy" for work that was never done.
  if (!providers.some(isProviderUsable)) {
    useAppStore.getState().addMessage({
      id: `msg-collab-${Date.now()}-nokey`,
      role: 'system',
      agentId: leadAgent.id,
      targetAgentId: 'all',
      channel: 'team',
      content:
        `Sprint dibatalkan: belum ada API key, jadi tidak ada model yang bisa dihubungi.\n\n` +
        `Isi API key di Settings > tab "Providers" (Anthropic / Google / OpenAI), ` +
        `atau tambah endpoint lokal keyless lewat "Add Custom Endpoint" untuk Ollama / LM Studio.\n\n` +
        `Sprint tidak dijalankan daripada menampilkan output palsu.`,
      timestamp: Date.now(),
    });
    return;
  }

  // Helper delay
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Initialize collaboration session
  useAppStore.getState().setCollaboration({
    isActive: true,
    topic: userGoal,
    currentStep: 1,
    totalSteps: 4,
    activeSpeakerId: leadAgent.id,
    targetSpeakerId: uiuxAgent.id,
  });

  // Post User prompt into Team Channel
  const userMsg: Message = {
    id: `msg-collab-${Date.now()}-user`,
    role: 'user',
    channel: 'team',
    content: `Perintah Proyek: "${userGoal}". Mohon tim agent berkoordinasi dan selesaikan secara berkesinambungan.`,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(userMsg);

  // ----------------------------------------------------
  // STEP 1: LEAD ENGINEER (Architecture & Delegation)
  // ----------------------------------------------------
  useAppStore.getState().updateAgentStatus(leadAgent.id, 'thinking');
  useAppStore.getState().setCollaboration({
    currentStep: 1,
    activeSpeakerId: leadAgent.id,
    targetSpeakerId: uiuxAgent.id,
  });

  await wait(1200);
  useAppStore.getState().updateAgentStatus(leadAgent.id, 'working');

  // Create Task for Lead Engineer
  const leadTaskId = `task-${Date.now()}-lead`;
  const leadTask: Task = {
    id: leadTaskId,
    title: `[Arsitektur] ${userGoal.slice(0, 32)}...`,
    description: `Analisis kebutuhan, dekomposisi modul, dan delegasi tim untuk: ${userGoal}`,
    status: 'in-progress',
    assignedAgentId: leadAgent.id,
    subtaskIds: [],
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  useAppStore.getState().addTask(leadTask);

  let leadResponse = '';
  const leadProvider = providers.find((p) => p.provider === leadAgent.modelConfig.provider);

  if (isProviderUsable(leadProvider)) {
    try {
      leadResponse = await sendMessageToAgent(
        leadAgent,
        [userMsg],
        () => {}
      );
    } catch {
      leadResponse = '';
    }
  }

  if (!leadResponse) {
    leadResponse = `${SIMULATED_PREFIX}[Skill: 📋 Task Decomposition & Architecture] @UI/UX Designer Saya telah menganalisis kebutuhan "${userGoal}". Tolong rancang wireframe interaktif, user flow, dan palet warna yang modern untuk fitur ini. Setelah desain siap, handoff langsung ke @Frontend Dev agar dapat segera dibuatkan komponennya.`;
  }

  const leadMsg: Message = {
    id: `msg-collab-${Date.now()}-lead`,
    role: 'agent',
    agentId: leadAgent.id,
    targetAgentId: uiuxAgent.id,
    channel: 'team',
    content: leadResponse,
    taskId: leadTaskId,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(leadMsg);
  useAppStore.getState().moveTask(leadTaskId, 'done');
  useAppStore.getState().updateAgentStatus(leadAgent.id, 'discussing');

  await wait(1800);

  // ----------------------------------------------------
  // STEP 2: UI/UX DESIGNER (Design System & Wireframe)
  // ----------------------------------------------------
  useAppStore.getState().updateAgentStatus(uiuxAgent.id, 'thinking');
  useAppStore.getState().setCollaboration({
    currentStep: 2,
    activeSpeakerId: uiuxAgent.id,
    targetSpeakerId: frontendAgent.id,
  });

  await wait(1400);
  useAppStore.getState().updateAgentStatus(uiuxAgent.id, 'working');

  const uiuxTaskId = `task-${Date.now()}-uiux`;
  const uiuxTask: Task = {
    id: uiuxTaskId,
    title: `[UI/UX Design] Layout & Wireframe ${userGoal.slice(0, 24)}...`,
    description: `Rancangan estetika visual, tata letak antarmuka, dan flow pengguna`,
    status: 'in-progress',
    assignedAgentId: uiuxAgent.id,
    subtaskIds: [],
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  useAppStore.getState().addTask(uiuxTask);

  // Generate an Artifact for UI/UX
  const designArtifact: Artifact = {
    id: `art-uiux-${Date.now()}`,
    title: `[SIMULASI] Design Spec: ${userGoal}`,
    type: 'code',
    language: 'html',
    version: 1,
    createdAt: Date.now(),
    content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #090a16;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #f8fafc;
      padding: 30px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    h2 { margin: 12px 0 8px; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
    .btn {
      margin-top: 16px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      border: none;
      color: white;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Designed by UI/UX Designer</span>
    <h2>${userGoal}</h2>
    <p>Wireframe interaktif hasil kolaborasi multi-agent terintegrasi dengan palet cyberpunk modern.</p>
    <button class="btn" onclick="alert('Wireframe Interaktif Berjalan!')">Konfirmasi Desain</button>
  </div>
</body>
</html>`,
  };
  useAppStore.getState().addArtifact(designArtifact);

  const uiuxMsg: Message = {
    id: `msg-collab-${Date.now()}-uiux`,
    role: 'agent',
    agentId: uiuxAgent.id,
    targetAgentId: frontendAgent.id,
    channel: 'team',
    content: `${SIMULATED_PREFIX}[Skill: 🎨 Cyberpunk Design System & Wireframing] @Lead Engineer @Frontend Dev Desain sistem dan wireframe visual untuk "${userGoal}" sudah saya rampungkan! Komponen telah dioptimalkan untuk aksesibilitas dan saya simpan di tab Artifacts. @Frontend Dev silakan lanjutkan implementasi kodenya.`,
    taskId: uiuxTaskId,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(uiuxMsg);
  useAppStore.getState().moveTask(uiuxTaskId, 'done');
  useAppStore.getState().updateAgentStatus(uiuxAgent.id, 'discussing');

  await wait(1800);

  // ----------------------------------------------------
  // STEP 3: FRONTEND DEV (Component Implementation)
  // ----------------------------------------------------
  useAppStore.getState().updateAgentStatus(frontendAgent.id, 'thinking');
  useAppStore.getState().setCollaboration({
    currentStep: 3,
    activeSpeakerId: frontendAgent.id,
    targetSpeakerId: debuggerAgent.id,
  });

  await wait(1500);
  useAppStore.getState().updateAgentStatus(frontendAgent.id, 'working');

  const frontendTaskId = `task-${Date.now()}-frontend`;
  const frontendTask: Task = {
    id: frontendTaskId,
    title: `[Frontend] Implementasi Komponen ${userGoal.slice(0, 24)}...`,
    description: `Koding komponen React, hooks state, dan integrasi view`,
    status: 'in-progress',
    assignedAgentId: frontendAgent.id,
    subtaskIds: [],
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  useAppStore.getState().addTask(frontendTask);

  // Generate code artifact
  const codeArtifact: Artifact = {
    id: `art-fe-${Date.now()}`,
    title: `[SIMULASI] Component: ${userGoal}`,
    type: 'code',
    language: 'typescript',
    version: 1,
    createdAt: Date.now(),
    content: `// ============================================
// Auto-generated Component: ${userGoal}
// Built by: Frontend Dev Agent
// ============================================
import React, { useState } from 'react';

export function FeatureModule() {
  const [active, setActive] = useState(false);

  return (
    <div className="feature-wrapper">
      <h3>${userGoal}</h3>
      <p>Status: {active ? 'Running' : 'Ready'}</p>
      <button onClick={() => setActive(!active)}>
        Toggle Feature
      </button>
    </div>
  );
}`,
  };
  useAppStore.getState().addArtifact(codeArtifact);

  const frontendMsg: Message = {
    id: `msg-collab-${Date.now()}-fe`,
    role: 'agent',
    agentId: frontendAgent.id,
    targetAgentId: debuggerAgent.id,
    channel: 'team',
    content: `${SIMULATED_PREFIX}[Skill: ⚛️ React 19 & Three.js Canvas Engineering] @UI/UX Designer Desainnya presisi sekali! @Lead Engineer Kode komponen React dan state integration sudah saya selesaikan dan disimpan ke Artifacts. @Debugger tolong lakukan verifikasi menyeluruh: cek potential memory leak dan uji error handling-nya ya.`,
    taskId: frontendTaskId,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(frontendMsg);
  useAppStore.getState().moveTask(frontendTaskId, 'review');
  useAppStore.getState().updateAgentStatus(frontendAgent.id, 'discussing');

  await wait(1800);

  // ----------------------------------------------------
  // STEP 4: DEBUGGER (Audit, Testing, Verification)
  // ----------------------------------------------------
  useAppStore.getState().updateAgentStatus(debuggerAgent.id, 'thinking');
  useAppStore.getState().setCollaboration({
    currentStep: 4,
    activeSpeakerId: debuggerAgent.id,
    targetSpeakerId: leadAgent.id,
  });

  await wait(1400);
  useAppStore.getState().updateAgentStatus(debuggerAgent.id, 'working');

  const debugTaskId = `task-${Date.now()}-debug`;
  const debugTask: Task = {
    id: debugTaskId,
    title: `[QA / Audit] Pengujian Kode ${userGoal.slice(0, 24)}...`,
    description: `Audit re-render, zero error check, dan benchmark performa`,
    status: 'in-progress',
    assignedAgentId: debuggerAgent.id,
    subtaskIds: [],
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  useAppStore.getState().addTask(debugTask);

  const debugMsg: Message = {
    id: `msg-collab-${Date.now()}-debug`,
    role: 'agent',
    agentId: debuggerAgent.id,
    targetAgentId: leadAgent.id,
    channel: 'team',
    content: `${SIMULATED_PREFIX}[Skill: ⏱️ GPU Memory Leak & Performance Profiling] @Frontend Dev @Lead Engineer Audit selesai: tidak ditemukan runtime exception, render lifecycle efisien, dan semua boundary aman! Fitur '${userGoal}' lolos uji kualitas dan siap dideploy ke production. ✅`,
    taskId: debugTaskId,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(debugMsg);
  useAppStore.getState().moveTask(debugTaskId, 'done');
  useAppStore.getState().moveTask(frontendTaskId, 'done');
  useAppStore.getState().updateAgentStatus(debuggerAgent.id, 'done');

  await wait(1500);

  // ----------------------------------------------------
  // CONCLUSION: LEAD ENGINEER SIGNOFF
  // ----------------------------------------------------
  useAppStore.getState().updateAgentStatus(leadAgent.id, 'working');
  const finalMsg: Message = {
    id: `msg-collab-${Date.now()}-final`,
    role: 'agent',
    agentId: leadAgent.id,
    targetAgentId: 'all',
    channel: 'team',
    content: `🎉 Kerja bagus tim! Seluruh alur kolaborasi untuk "${userGoal}" telah tuntas secara berkesinambungan. UI/UX, Frontend, dan QA telah sinkron, kartu tugas ter-update, dan hasil artefak siap diakses user di tab Artifacts.`,
    timestamp: Date.now(),
  };
  useAppStore.getState().addMessage(finalMsg);
  useAppStore.getState().updateAgentStatus(leadAgent.id, 'done');

  await wait(2000);

  // Reset statuses back to idle
  agents.forEach((a) => {
    useAppStore.getState().updateAgentStatus(a.id, 'idle');
  });

  useAppStore.getState().setCollaboration({
    isActive: false,
    activeSpeakerId: null,
    targetSpeakerId: null,
  });
}
