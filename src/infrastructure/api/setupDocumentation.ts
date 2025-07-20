import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

import { generateOpenAPIDocument } from './documentation/OpenAPIConfig';
import './documentation/routes';

export function setupDocumentation(app: Application): void {
  const openAPIDocument = generateOpenAPIDocument();

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPIDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Patient Waitlist API Documentation',
  }));

  // Serve OpenAPI JSON spec
  app.get('/api-docs.json', (_req, res) => {
    res.json(openAPIDocument);
  });
}
