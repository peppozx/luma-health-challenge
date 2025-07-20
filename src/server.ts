import { Application } from 'express';
import { createServer, Server } from 'http';

import { AppConfig } from './infrastructure/config/AppConfig';
import { logger } from './shared/utils/Logger';
import { setupGracefulShutdown } from './infrastructure/server/gracefulShutdown';

export function startServer(app: Application): Server {
  const server = createServer(app);

  server.listen(AppConfig.port, () => {
    logger.info(`Server running on port ${AppConfig.port}`);
    logger.info(`Environment: ${AppConfig.nodeEnv}`);
    logger.info(`API available at http://localhost:${AppConfig.port}${AppConfig.apiPrefix}`);
    logger.info(`API Documentation available at http://localhost:${AppConfig.port}/api-docs`);
  });

  setupGracefulShutdown(server);

  return server;
}
