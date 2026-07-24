import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import uploadRoutes from './routes/upload';
import askRoutes from './routes/ask';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', uploadRoutes);
app.use('/api', askRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DocMind server is running' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();