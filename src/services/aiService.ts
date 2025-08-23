import { v4 as uuidv4 } from 'uuid';

export type AIModel = 'google-gemini' | 'deepseek-v3' | 'mistral-small-24b' | 'cura-ai';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
  sources?: string[];
}

export interface ScannedProduct {
  status: string;
  source: string;
  confidence: number;
  explanation: string;
  data: {
    product: {
      nie?: string | null;
      name?: string | null;
      manufacturer?: string | null;
      dosage_form?: string | null;
      strength?: string | null;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const API_KEY = process.env.NEXT_PUBLIC_YOLO_KEY as string;
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

const modelMapping: Partial<Record<AIModel, string>> = {
  'google-gemini': 'google/gemma-3-27b-it:free',
  'deepseek-v3': 'deepseek/deepseek-chat-v3-0324:free',
  'mistral-small-24b': 'mistralai/mistral-small-3.2-24b-instruct:free',
};

const isVertexAIModel = (model: AIModel): boolean => {
  return model.startsWith('vertex-');
};

interface SessionState {
  id: string;
  messages: Message[];
  verificationResult?: any;
}

const SessionStateService = {
  async getSessionState(sessionId: string): Promise<SessionState> {
    try {
      const session = localStorage.getItem(`session:${sessionId}`);
      if (!session) {
        return { id: sessionId, messages: [], verificationResult: null };
      }
      return JSON.parse(session);
    } catch (error) {
      console.error('Error getting session state:', error);
      return { id: sessionId, messages: [], verificationResult: null };
    }
  },

  async saveSessionState(session: SessionState): Promise<void> {
    try {
      localStorage.setItem(`session:${session.id}`, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  },

  async addMessageToSession(sessionId: string, message: Message): Promise<void> {
    try {
      const session = await this.getSessionState(sessionId);
      session.messages.push(message);
      await this.saveSessionState(session);
    } catch (error) {
      console.error('Error adding message to session:', error);
    }
  },
};

export const aiService = {
  async generateCompletion(model: AIModel, messages: Message[]): Promise<AIResponse> {
    try {
      if (!API_BASE_URL || !API_KEY) {
        throw new Error('Missing API_BASE_URL or API_KEY in environment variables');
      }

      if (isVertexAIModel(model)) {
        return await generateVertexAICompletion(model, messages);
      }

      if (model === 'cura-ai') {
        return await generateCuraAICompletion(messages);
      }

      const openRouterModel = modelMapping[model] || modelMapping['google-gemini'];
      if (!openRouterModel) {
        throw new Error(`No model mapping found for ${model}`);
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cura AI',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        text,
        model: data.model || openRouterModel,
      };
    } catch (error: any) {
      console.error('AI API error:', error);
      throw new Error(error.message || 'Failed to generate AI response');
    }
  },

  async streamCompletion(model: AIModel, messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      if (!API_BASE_URL || !API_KEY) {
        throw new Error('Missing API_BASE_URL or API_KEY in environment variables');
      }

      if (isVertexAIModel(model)) {
        return await streamVertexAICompletion(model, messages, onChunk);
      }

      if (model === 'cura-ai') {
        const response = await generateCuraAICompletion(messages);
        onChunk(response.text);
        return;
      }

      const openRouterModel = modelMapping[model] || modelMapping['google-gemini'];
      if (!openRouterModel) {
        throw new Error(`No model mapping found for ${model}`);
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cura AI',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API streaming request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body cannot be read');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) onChunk(content);
            } catch (e) {
              console.warn('Error parsing SSE chunk:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('AI streaming error:', error);
      throw new Error(error.message || 'Failed to stream AI response');
    }
  },
};

async function generateCuraAICompletion(messages: Message[]): Promise<AIResponse> {
  try {
    if (!API_BASE_URL || !API_KEY) {
      throw new Error('Missing API_BASE_URL or API_KEY in environment variables');
    }

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      throw new Error('No sessionId found in localStorage, run /verify first');
    }
    // console.log('Session ID from /agent:', sessionId);

    const session = await SessionStateService.getSessionState(sessionId);
    // console.log('Session from /agent SessionStateService:', session);

    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      throw new Error('Latest message must be from user');
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const rawById = id ? localStorage.getItem(`scannedProduct:${id}`) : null;
    const scannedProductRaw = rawById;
    let scannedProduct: ScannedProduct | null = null;
    if (scannedProductRaw) {
      try {
        scannedProduct = JSON.parse(scannedProductRaw);
      } catch (e) {
        console.error('Failed to parse scannedProduct:', e);
      }
    }

    // console.log('Selected scannedProduct source:', {
    //   rawById: !!rawById,
    //   scannedProduct,
    // });

    // Gabungkan scannedProduct ke dalam text
    let combinedText = latestMessage.content;
    if (scannedProduct) {
      const scannedProductStr = JSON.stringify(scannedProduct); // Konversi ke string JSON
      combinedText = `${latestMessage.content}\n[SCANNED_PRODUCT]\n${scannedProductStr}\n[/SCANNED_PRODUCT]`;
      // console.log('Combined text with scannedProduct:', combinedText);
    }

    const body = {
      session_id: sessionId,
      text: combinedText,
    };

    // console.log('Request body sent to server:', body);

    const response = await fetch(`${API_BASE_URL}/v1/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'ngrok-skip-browser-warning': 'true',
        'X-Session-Id': sessionId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Cura AI request failed with status ${response.status}`);
    }

    const data = await response.json();

    const text =
      (typeof data?.answer === 'string' && data.answer) ||
      (typeof data?.text === 'string' && data.text) ||
      '';

    if (!text) {
      console.error('Cura AI raw response:', data);
      throw new Error('Invalid response format from Cura AI: missing or invalid text/answer');
    }

    const sources: any[] = Array.isArray(data.sources) ? data.sources : [];

    await SessionStateService.addMessageToSession(sessionId, latestMessage);
    await SessionStateService.addMessageToSession(sessionId, {
      role: 'assistant',
      content: text,
    });

    return {
      text,
      model: 'cura-ai',
      sources: sources.map(item => String(item)),
    };
  } catch (error: any) {
    console.error('Cura AI API error:', error);
    throw new Error(error.message || 'Failed to generate Cura AI response');
  }
}

async function generateVertexAICompletion(model: AIModel, messages: Message[]): Promise<AIResponse> {
  const vertexModel = process.env.VERTEX_AI_MODEL_ID || modelMapping[model];
  if (!vertexModel) {
    throw new Error(`No model mapping found for ${model}`);
  }

  const apiKey = process.env.NEXT_PUBLIC_VERTEX_AI_API_KEY;
  const projectId = process.env.VERTEX_AI_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!apiKey || !projectId) {
    throw new Error('Vertex AI configuration is missing');
  }

  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${vertexModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Vertex AI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    text,
    model: vertexModel,
  };
}

async function streamVertexAICompletion(model: AIModel, messages: Message[], onChunk: (chunk: string) => void) {
  const vertexModel = modelMapping[model];
  if (!vertexModel) {
    throw new Error(`No model mapping found for ${model}`);
  }

  const apiKey = process.env.NEXT_PUBLIC_VERTEX_AI_API_KEY;
  const projectId = process.env.VERTEX_AI_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!apiKey || !projectId) {
    throw new Error('Vertex AI configuration is missing');
  }

  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${vertexModel}:streamGenerateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Vertex AI streaming request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body cannot be read');
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.trim() && line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (content) onChunk(content);
        } catch (e) {
          console.warn('Error parsing SSE chunk:', e);
        }
      }
    }
  }
}