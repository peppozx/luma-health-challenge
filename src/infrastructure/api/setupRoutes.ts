import { Application } from 'express';

import { AppConfig } from '../config/AppConfig';
import { createPatientRoutes } from './routes/patientRoutes';

export function setupRoutes(app: Application): void {
  // Health check route
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API routes
  app.use(`${AppConfig.apiPrefix}/patients`, createPatientRoutes());

  // Add more route groups here as needed:
  // app.use(`${AppConfig.apiPrefix}/facilities`, createFacilityRoutes());
  // app.use(`${AppConfig.apiPrefix}/appointments`, createAppointmentRoutes());
}
