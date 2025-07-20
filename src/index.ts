import { createApp } from './app';
import { startServer } from './server';

const app = createApp();

// Only start the server if this file is run directly
if (require.main === module) {
  startServer(app);
}

export default app;
