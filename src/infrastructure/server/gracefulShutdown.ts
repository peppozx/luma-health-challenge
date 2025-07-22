import { Server } from 'http';

import { logger } from '../../shared/utils/Logger';

export function setupGracefulShutdown(server: Server): void {
  const shutdown = (signal: string) => {
    logger.info(`${signal} signal received: closing HTTP server`);

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason: string) => {
    logger.error(`Unhandled Rejection, reason: ${reason}`);
    shutdown('UNHANDLED_REJECTION');
  });
}
