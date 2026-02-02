import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

import authRoutes from './routes/auth.js';
import classroomRoutes from './routes/classrooms.js';
import studentRoutes from './routes/students.js';
import heatRoutes from './routes/heats.js';
import analyticsRoutes from './routes/analytics.js';
import subscriptionRoutes from './routes/subscriptions.js';
import challengeRoutes from './routes/challenges.js';
import merchandiseRoutes from './routes/merchandise.js';
import resourceRoutes from './routes/resources.js';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import tournamentRoutes from './routes/tournaments.js';
=======
import skillRoutes from './routes/skills.js';
import skillSessionRoutes from './routes/skill-sessions.js';
>>>>>>> Stashed changes
=======
import skillRoutes from './routes/skills.js';
import skillSessionRoutes from './routes/skill-sessions.js';
>>>>>>> Stashed changes

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = join(__dirname, '../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database
import './db/index.js';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : /^http:\/\/localhost:\d+$/,  // Allow any localhost port in dev
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/heats', heatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/resources', resourceRoutes);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
app.use('/api/tournaments', tournamentRoutes);
=======
app.use('/api/skills', skillRoutes);
app.use('/api/skill-sessions', skillSessionRoutes);
>>>>>>> Stashed changes
=======
app.use('/api/skills', skillRoutes);
app.use('/api/skill-sessions', skillSessionRoutes);
>>>>>>> Stashed changes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`ðŸƒ Mathathlon server running on http://localhost:${PORT}`);
});


