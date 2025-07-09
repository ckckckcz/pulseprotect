import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Configure API keys - in production, these should be environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const META_API_KEY = process.env.META_API_KEY || '';

// Initialize Google AI
const googleAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, messages } = req.body;

    if (!model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    let response;

    switch (model) {
      case 'google-gemini':
        response = await handleGoogleGemini(messages);
        break;
      case 'deepseek-v3':
        response = await handleDeepSeek(messages);
        break;
      case 'meta-llama4':
        response = await handleMetaLlama(messages);
        break;
      case 'gpt-4o':
      case 'gpt-4o-mini':
      case 'gpt-3.5-turbo':
        response = await simulateResponse(model, messages);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported model' });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate AI response' 
    });
  }
}

async function handleGoogleGemini(messages: any[]) {
  try {
    const geminiModel = googleAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Format messages for Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    const result = await geminiModel.generateContent({
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });
    
    const response = result.response;
    const text = response.text();
    
    return {
      text,
      model: 'Google Gemini Pro'
    };
  } catch (error) {
    console.error('Google Gemini API error:', error);
    throw new Error('Failed to generate response from Google Gemini');
  }
}

async function handleDeepSeek(messages: any[]) {
  try {
    // Call DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-v3-0324',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    return {
      text: response.data.choices[0].message.content,
      model: 'DeepSeek V3 0324'
    };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error('Failed to generate response from DeepSeek');
  }
}

async function handleMetaLlama(messages: any[]) {
  try {
    // Call Meta API
    const response = await axios.post(
      'https://api.meta.ai/v1/chat/completions',
      {
        model: 'llama-4-maverick',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${META_API_KEY}`
        }
      }
    );
    
    return {
      text: response.data.choices[0].message.content,
      model: 'Llama 4 Maverick'
    };
  } catch (error) {
    console.error('Meta API error:', error);
    throw new Error('Failed to generate response from Meta Llama');
  }
}

// Simulate response for testing or when API keys aren't available
async function simulateResponse(model: string, messages: any[]) {
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage ? lastUserMessage.content : '';
  
  // Wait to simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text: `This is a simulated response from ${model} to: "${userContent}"`,
    model: model
  };
}
