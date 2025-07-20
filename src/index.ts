import express from 'express';

import { AppConfig } from './infrastructure/config/AppConfig';
import { createPatientRoutes } from './infrastructure/api/routes/patientRoutes';
import { errorHandler } from './infrastructure/api/middlewares/ErrorHandler';
import { logger } from './shared/utils/Logger';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(`${AppConfig.apiPrefix}/patients`, createPatientRoutes());

app.use(errorHandler);

const server = app.listen(AppConfig.port, () => {
  logger.info(`Server running on port ${AppConfig.port}`);
  logger.info(`Environment: ${AppConfig.nodeEnv}`);
  logger.info(`API available at http://localhost:${AppConfig.port}${AppConfig.apiPrefix}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
