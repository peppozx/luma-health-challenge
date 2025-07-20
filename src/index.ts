import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { AppConfig } from './infrastructure/config/AppConfig';
import { createPatientRoutes } from './infrastructure/api/routes/patientRoutes';
import { errorHandler } from './infrastructure/api/middlewares/ErrorHandler';
import { logger } from './shared/utils/Logger';
import { generateOpenAPIDocument } from './infrastructure/api/documentation/OpenAPIConfig';
import './infrastructure/api/documentation/routes';

const app = express();

app.use(express.json());

const openAPIDocument = generateOpenAPIDocument();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPIDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Patient Waitlist API Documentation',
}));

app.get('/api-docs.json', (_req, res) => {
  res.json(openAPIDocument);
});

// Health check
app.get(`/health`, (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// END Health check

// API routes
app.use(`${AppConfig.apiPrefix}/patients`, createPatientRoutes());
// END routes

app.use(errorHandler);

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(AppConfig.port, () => {
    logger.info(`Server running on port ${AppConfig.port}`);
    logger.info(`Environment: ${AppConfig.nodeEnv}`);
    logger.info(`API available at http://localhost:${AppConfig.port}${AppConfig.apiPrefix}`);
    logger.info(`API Documentation available at http://localhost:${AppConfig.port}/api-docs`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}

export default app;
