import 'reflect-metadata';

import { createApp } from './app';
import { setupContainer } from './infrastructure/config/DIContainer';
import { startServer } from './server';

setupContainer();

const app = createApp();

// Only start the server if this file is run directly
if (require.main === module) {
  startServer(app);
}

export default app;
