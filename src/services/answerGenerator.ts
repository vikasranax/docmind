import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { SearchResult } from './vectorSearch';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const ai = new GoogleGenAI({ apiKey });

export interface AnswerResult {
  answer: string;
  sources: { filename: string; chunkIndex: number; text: string }[];
}

export async function generateAnswer(question: string, chunks: SearchResult[]): Promise<AnswerResult> {
  if (chunks.length === 0) {
    return {
      answer: "I don't have any relevant information in the uploaded documents to answer that question.",
      sources: [],
    };
  }

  const context = chunks
    .map((chunk, i) => `[Source ${i + 1}] (from ${chunk.filename}, chunk ${chunk.chunkIndex}):\n${chunk.text}`)
    .join('\n\n');

  const prompt = `You are a helpful assistant answering questions based only on the provided document excerpts below. 
Use only the information in these excerpts to answer. If the excerpts don't contain enough information to answer, say so clearly.
When you use information from a source, mention it like [Source 1], [Source 2], etc.

Document excerpts:
${context}

Question: ${question}

Answer:`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  const answerText = response.text ?? 'No answer generated.';

  const sources = chunks.map((chunk) => ({
    filename: chunk.filename,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text.slice(0, 200),
  }));

  return {
    answer: answerText,
    sources,
  };
}