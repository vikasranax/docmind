import { getClient } from '../db';

export interface DocumentChunk {
  documentId: string;
  filename: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  createdAt: Date;
}

export async function saveChunks(chunks: DocumentChunk[]): Promise<void> {
  const db = getClient().db('docmind');
  const collection = db.collection<DocumentChunk>('documents');
  await collection.insertMany(chunks);
}

export async function getDocumentList(): Promise<{ documentId: string; filename: string; chunkCount: number }[]> {
  const db = getClient().db('docmind');
  const collection = db.collection<DocumentChunk>('documents');

  const results = await collection
    .aggregate([
      {
        $group: {
          _id: '$documentId',
          filename: { $first: '$filename' },
          chunkCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return results.map((r) => ({
    documentId: r._id,
    filename: r.filename,
    chunkCount: r.chunkCount,
  }));
}