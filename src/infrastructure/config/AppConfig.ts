import dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api',
};
