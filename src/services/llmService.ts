// ============================================
// AgentOffice - LLM Service (Brain Router)
// ============================================
import type { Agent, Message, ProviderConfig } from '../types';
import { useAppStore } from '../store/useAppStore';

/**
 * Whether a provider config has everything it needs to serve a request.
 *
 * Built-in cloud providers (Anthropic / Google / OpenAI) require a key. Custom
 * OpenAI-compatible endpoints are usually LOCAL servers (Ollama, LM Studio,
 * vLLM) that are legitimately keyless — SettingsPanel marks their key
 * "Optional" for that reason — so they must not be blocked by a key check.
 */
export function isProviderUsable(provider: ProviderConfig | undefined): boolean {
  if (!provider) return false;
  if (provider.provider === 'custom-openai') return true;
  return provider.apiKey.trim() !== '';
}

/**
 * Send message to agent's LLM provider with streaming
 */
export async function sendMessageToAgent(
  agent: Agent,
  conversationHistory: Message[],
  onChunk: (fullText: string) => void
): Promise<string> {
  const state = useAppStore.getState();
  const providers = state.providers;

  // Find the provider config for this agent
  const providerConfig = providers.find(
    (p) => p.provider === agent.modelConfig.provider
  );

  if (!providerConfig) {
    throw new Error(`Provider "${agent.modelConfig.provider}" tidak ditemukan. Atur di Settings.`);
  }

  if (!isProviderUsable(providerConfig)) {
    throw new Error(
      `API key untuk "${providerConfig.name}" belum diisi. ` +
        `Buka Settings > tab "Providers" lalu isi API Key, atau tambahkan ` +
        `endpoint lokal (Ollama/LM Studio) lewat "Add Custom Endpoint".`
    );
  }

  // Build messages
  const messages = [
    { role: 'system', content: agent.systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role === 'agent' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  // Route to appropriate provider
  switch (agent.modelConfig.provider) {
    case 'openai':
    case 'custom-openai':
      return sendOpenAICompatible(
        providerConfig.baseUrl || 'https://api.openai.com/v1',
        providerConfig.apiKey,
        agent.modelConfig.model,
        messages,
        agent.modelConfig.temperature,
        agent.modelConfig.maxTokens,
        onChunk,
        providerConfig.extraHeaders
      );

    case 'anthropic':
      return sendAnthropic(
        providerConfig.apiKey,
        agent.modelConfig.model,
        messages,
        agent.modelConfig.temperature,
        agent.modelConfig.maxTokens,
        onChunk
      );

    case 'google':
      return sendGemini(
        providerConfig.apiKey,
        agent.modelConfig.model,
        messages,
        agent.modelConfig.temperature,
        agent.modelConfig.maxTokens,
        onChunk
      );

    default:
      throw new Error(`Provider "${agent.modelConfig.provider}" belum didukung.`);
  }
}

/**
 * OpenAI-compatible API (works with OpenAI, Ollama, LM Studio, vLLM, etc.)
 */
async function sendOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
  onChunk: (fullText: string) => void,
  extraHeaders?: Record<string, string>
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  return streamSSE(response, onChunk, 'openai');
}

/**
 * Anthropic Claude API
 */
async function sendAnthropic(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
  onChunk: (fullText: string) => void
): Promise<string> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      system: systemMessage?.content || '',
      messages: chatMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  return streamSSE(response, onChunk, 'anthropic');
}

/**
 * Google Gemini API
 */
async function sendGemini(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
  onChunk: (fullText: string) => void
): Promise<string> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const geminiMessages = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
        contents: geminiMessages,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  return streamSSE(response, onChunk, 'gemini');
}

/**
 * Stream SSE responses from various providers
 */
async function streamSSE(
  response: Response,
  onChunk: (fullText: string) => void,
  provider: 'openai' | 'anthropic' | 'gemini'
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;

      try {
        const json = JSON.parse(data);
        let text = '';

        if (provider === 'openai') {
          text = json.choices?.[0]?.delta?.content || '';
        } else if (provider === 'anthropic') {
          if (json.type === 'content_block_delta') {
            text = json.delta?.text || '';
          }
        } else if (provider === 'gemini') {
          text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        if (text) {
          fullText += text;
          onChunk(fullText);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return fullText;
}

/**
 * Test connection to a provider
 */
export async function testConnection(provider: ProviderConfig): Promise<boolean> {
  try {
    if (provider.provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: provider.models[0] || 'claude-3-5-haiku-20241022',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      return response.ok;
    }

    if (provider.provider === 'google') {
      const model = provider.models[0] || 'gemini-2.0-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );
      return response.ok;
    }

    // OpenAI / Custom OpenAI-compatible
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        ...(provider.extraHeaders || {}),
      },
      body: JSON.stringify({
        model: provider.models[0] || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
