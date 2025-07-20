import { z } from 'zod';

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
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
          example: {
            status: 'ok',
            timestamp: '2024-01-20T10:30:00.000Z',
          },
        },
      },
    },
  },
});
