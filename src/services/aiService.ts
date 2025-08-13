// OpenRouter unified AI API service

export type AIModel = 'google-gemini' | 'deepseek-v3' | 'mistral-small-24b' | 'bakekok';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
}

// Map frontend model IDs to OpenRouter/Vertex model IDs
const modelMapping: Record<AIModel, string> = {
  'google-gemini': 'google/gemma-3-27b-it:free',
  'deepseek-v3': 'deepseek/deepseek-chat-v3-0324:free',
  'mistral-small-24b': 'mistralai/mistral-small-3.2-24b-instruct:free',
  'bakekok': 'mistralai/mistral-small-3.2-24b-instruct:free',
};

// Check if model is from Vertex AI
const isVertexAIModel = (model: AIModel): boolean => {
  return model.startsWith('vertex-');
};

export const aiService = {
  async generateCompletion(model: AIModel, messages: Message[]): Promise<AIResponse> {
    try {
      if (isVertexAIModel(model)) {
        return await generateVertexAICompletion(model, messages);
      }
      
      const openRouterModel = modelMapping[model] || modelMapping['google-gemini'];
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''}`,
          'HTTP-Referer': window.location.origin, // OpenRouter requires this
          'X-Title': 'Silva AI', // Your app name
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate AI response');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      
      return {
        text,
        model: data.model || openRouterModel
      };
    } catch (error: any) {
      console.error('AI API error:', error);
      throw new Error(error.message || 'Failed to generate AI response');
    }
  },
  
  async streamCompletion(model: AIModel, messages: Message[], onChunk: (chunk: string) => void) {
    try {
      if (isVertexAIModel(model)) {
        return await streamVertexAICompletion(model, messages, onChunk);
      }
      
      const openRouterModel = modelMapping[model] || modelMapping['google-gemini'];
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Silva AI',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate AI response');
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
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) onChunk(content);
            } catch (e) {
              // Ignore parsing errors in SSE
            }
          }
        }
      }
    } catch (error: any) {
      console.error('AI streaming error:', error);
      throw new Error(error.message || 'Failed to stream AI response');
    }
  }
};

// Vertex AI completion function
async function generateVertexAICompletion(model: AIModel, messages: Message[]): Promise<AIResponse> {
  const vertexModel = process.env.VERTEX_AI_MODEL_ID || modelMapping[model];
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
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to generate Vertex AI response');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    text,
    model: vertexModel
  };
}

// Vertex AI streaming function
async function streamVertexAICompletion(model: AIModel, messages: Message[], onChunk: (chunk: string) => void) {
  const vertexModel = modelMapping[model];
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
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to stream Vertex AI response');
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
          // Ignore parsing errors
        }
      }
    }
  }
}
