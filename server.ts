import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import healthHandler from './api/health.ts';
import analyzeMaterialHandler from './api/analyze-material.ts';
import tutorChatHandler from './api/tutor-chat.ts';
import evaluateAssessmentHandler from './api/evaluate-assessment.ts';
import generateRecoveryHandler from './api/generate-recovery.ts';
import evaluateReassessmentHandler from './api/evaluate-reassessment.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limits to allow classroom whiteboard / handwritten photo uploads (up to 15MB)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount the modular serverless API endpoints
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/analyze-material', (req, res) => analyzeMaterialHandler(req, res));
app.all('/api/tutor-chat', (req, res) => tutorChatHandler(req, res));
app.all('/api/evaluate-assessment', (req, res) => evaluateAssessmentHandler(req, res));
app.all('/api/generate-recovery', (req, res) => generateRecoveryHandler(req, res));
app.all('/api/evaluate-reassessment', (req, res) => evaluateReassessmentHandler(req, res));

// Development Vite middleware vs Production static asset serving
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (typeof __filename !== 'undefined' && __filename.endsWith('server.cjs')) ||
    Boolean(process.argv[1] && process.argv[1].includes('server.cjs'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : typeof __dirname !== 'undefined'
      ? __dirname
      : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassMate AI server active on http://0.0.0.0:${PORT}`);
  });
}

// Run the local Express/Vite server outside Vercel. On Vercel, the Express app is
// exported to the catch-all serverless function in api/[...path].ts.
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
