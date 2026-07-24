import { getClient } from '../db';
import { generateEmbedding } from './embedder';

export interface SearchResult {
  text: string;
  filename: string;
  documentId: string;
  chunkIndex: number;
  score: number;
}

export async function searchRelevantChunks(question: string, limit: number = 5): Promise<SearchResult[]> {
  const questionEmbedding = await generateEmbedding(question);

  const db = getClient().db('docmind');
  const collection = db.collection('documents');

  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: limit,
        },
      },
      {
        $project: {
          text: 1,
          filename: 1,
          documentId: 1,
          chunkIndex: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();

  return results as unknown as SearchResult[];
}