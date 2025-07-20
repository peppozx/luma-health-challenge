import express from 'express';

import { setupMiddlewares } from './infrastructure/api/setupMiddlewares';
import { setupDocumentation } from './infrastructure/api/setupDocumentation';
import { setupRoutes } from './infrastructure/api/setupRoutes';
import { errorHandler } from './infrastructure/api/middlewares/ErrorHandler';

export function createApp(): express.Application {
  const app = express();
  
  // Setup phases - order matters!
  setupMiddlewares(app);
  setupDocumentation(app);
  setupRoutes(app);
  
  // Error handling should be last
  app.use(errorHandler);
  
  return app;
}