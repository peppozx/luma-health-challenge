import { registry } from '../OpenAPIConfig';

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health check',
  description: 'Check if the API is running',
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/HealthCheckResponse',
          },
        },
      },
    },
  },
});
