import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in .env');
}

const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
  console.log('Connected to MongoDB Atlas');
  return client.db('docmind');
}

export function getClient() {
  return client;
}