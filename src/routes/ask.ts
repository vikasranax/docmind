import express, { Router, Request, Response } from 'express';
import { searchRelevantChunks } from '../services/vectorSearch';
import { generateAnswer } from '../services/answerGenerator';

const router: Router = express.Router();

router.post('/ask', async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'A valid question is required' });
  }

  try {
    const relevantChunks = await searchRelevantChunks(question);
    const result = await generateAnswer(question, relevantChunks);

    res.json({
      question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Failed to generate answer:', error);
    res.status(500).json({ error: 'Failed to generate an answer' });
  }
});

export default router;