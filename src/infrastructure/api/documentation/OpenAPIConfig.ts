import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();
const version = require('../../../../package.json').version;

export const generateOpenAPIDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version,
      title: 'Patient Waitlist API',
      description: 'API for optimizing patient waitlist based on acceptance likelihood',
      contact: {
        name: 'Igor Oliveira',
        email: 'igor@oliveira.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Patients',
        description: 'Patient waitlist operations',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  });
};
