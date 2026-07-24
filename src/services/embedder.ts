import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const ai = new GoogleGenAI({ apiKey });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  if (!response.embeddings || !response.embeddings[0].values) {
    throw new Error('No embedding returned from Gemini API');
  }

  return response.embeddings[0].values;
}