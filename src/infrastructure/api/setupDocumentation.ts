import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

import { generateOpenAPIDocument } from './documentation/OpenAPIConfig';
import './documentation/schemas'; // Register schemas first
import './documentation/routes'; // Then register routes

export function setupDocumentation(app: Application): void {
  const openAPIDocument = generateOpenAPIDocument();

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPIDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Patient Waitlist API Documentation',
  }));

  app.get('/api-docs.json', (_req, res) => {
    res.json(openAPIDocument);
  });
}
