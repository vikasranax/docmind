import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { extractTextFromFile } from '../services/textExtractor';
import { chunkText } from '../services/chunker';
import { generateEmbedding } from '../services/embedder';
import { saveChunks, DocumentChunk } from '../models/chunkModel';

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    const textChunks = chunkText(extractedText);
    const documentId = crypto.randomUUID();

    const chunksWithEmbeddings: DocumentChunk[] = [];

    for (const chunk of textChunks) {
      const embedding = await generateEmbedding(chunk.text);
      chunksWithEmbeddings.push({
        documentId,
        filename: req.file.originalname,
        chunkIndex: chunk.index,
        text: chunk.text,
        embedding,
        createdAt: new Date(),
      });
    }

    await saveChunks(chunksWithEmbeddings);

    res.json({
      message: 'Document processed and stored successfully',
      documentId,
      filename: req.file.originalname,
      chunksStored: chunksWithEmbeddings.length,
    });
  } catch (error) {
    console.error('Document processing failed:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

export default router;