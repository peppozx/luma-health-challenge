import { Application } from 'express';
import express from 'express';

export function setupMiddlewares(app: Application): void {
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add more middlewares here as needed:
  // - CORS
  // - Helmet for security
  // ...
}
