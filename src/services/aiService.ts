// OpenRouter unified AI API service

export type AIModel = 'google-gemini' | 'deepseek-v3' | 'mistral-small-24b';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
}

// Map frontend model IDs to OpenRouter model IDs
const modelMapping: Record<AIModel, string> = {
  'google-gemini': 'google/gemma-3-27b-it:free',
  'deepseek-v3': 'deepseek/deepseek-chat-v3-0324:free',
  'mistral-small-24b': 'mistralai/mistral-small-3.2-24b-instruct:free',
};

export const aiService = {
  async generateCompletion(model: AIModel, messages: Message[]): Promise<AIResponse> {
    try {
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
      console.error('OpenRouter API error:', error);
      throw new Error(error.message || 'Failed to generate AI response');
    }
  },
  
  async streamCompletion(model: AIModel, messages: Message[], onChunk: (chunk: string) => void) {
    try {
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
      console.error('OpenRouter streaming error:', error);
      throw new Error(error.message || 'Failed to stream AI response');
    }
  }
};
