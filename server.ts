import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/apiRouter';
import { checkMySQLHealth } from './src/server/mysql';
import { initMySQLSync } from './src/server/mysqlSync';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize and synchronize with remote MySQL database
  await initMySQLSync();

  // Mount API REST routes
  app.use('/api', apiRouter);

  // Health check endpoint with live MySQL status
  app.get('/health', async (_req, res) => {
    const dbHealth = await checkMySQLHealth();
    res.json({
      status: 'ok',
      service: 'ChurchFlow SaaS API',
      database: {
        engine: 'MySQL 8.0 (Hostinger Cloud)',
        host: dbHealth.host,
        name: dbHealth.database,
        connected: dbHealth.connected,
        tablesCount: dbHealth.tablesCount,
        latencyMs: dbHealth.latencyMs
      }
    });
  });

  // Environment check: production vs development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    // Mount Vite middlewares for HMR and instant TypeScript module serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChurchFlow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start ChurchFlow server:', err);
  process.exit(1);
});
