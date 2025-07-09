import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    // Stream responses based on selected model
    switch (model) {
      case 'google-gemini':
        await streamGoogleGemini(res, messages);
        break;
      case 'deepseek-v3':
        await streamDeepSeek(res, messages);
        break;
      case 'meta-llama4':
        await streamMetaLlama(res, messages);
        break;
      default:
        await streamSimulatedResponse(res, model, messages);
        break;
    }

    res.end();
  } catch (error) {
    console.error('AI streaming API error:', error);
    
    // If headers haven't been sent yet, send an error response
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to stream AI response' 
      });
    }
    
    // Otherwise, end the stream
    res.end();
  }
}

async function streamGoogleGemini(res: NextApiResponse, messages: any[]) {
  try {
    const geminiModel = googleAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Format messages for Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    const result = await geminiModel.generateContentStream({
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }
  } catch (error) {
    console.error('Google Gemini streaming error:', error);
    throw new Error('Failed to stream response from Google Gemini');
  }
}

async function streamDeepSeek(res: NextApiResponse, messages: any[]) {
  // Simulate streaming for DeepSeek - in production, use actual streaming API if available
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage ? lastUserMessage.content : '';
  
  const response = `This is a simulated streaming response from DeepSeek to: "${userContent}"`;
  
  for (let i = 0; i < response.length; i++) {
    res.write(response[i]);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

async function streamMetaLlama(res: NextApiResponse, messages: any[]) {
  // Simulate streaming for Meta Llama - in production, use actual streaming API if available
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage ? lastUserMessage.content : '';
  
  const response = `This is a simulated streaming response from Meta Llama to: "${userContent}"`;
  
  for (let i = 0; i < response.length; i++) {
    res.write(response[i]);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

async function streamSimulatedResponse(res: NextApiResponse, model: string, messages: any[]) {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage ? lastUserMessage.content : '';
  
  const response = `This is a simulated streaming response from ${model} to: "${userContent}"`;
  
  for (let i = 0; i < response.length; i++) {
    res.write(response[i]);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
