import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Track server state
let serverState = {
  isAlive: true,
  startupTime: new Date().toISOString(),
  errors: [] as string[]
};

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check - always responds
app.get('/api/health', (req, res) => {
  res.json({
    status: 'alive',
    uptime: Math.floor((Date.now() - new Date(serverState.startupTime).getTime()) / 1000),
    errors: serverState.errors
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});