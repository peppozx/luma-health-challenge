import { z } from 'zod';

import { registry } from '../OpenAPIConfig';
import {
  GetPrioritizedPatientsRequestSchema,
  GetPrioritizedPatientsResponseSchema
} from '../../validations/patientValidations';

// Register the prioritized patients endpoint
registry.registerPath({
  method: 'post',
  path: '/api/patients/prioritized',
  tags: ['Patients'],
  summary: 'Get prioritized patient list',
  description: 'Returns a list of up to 10 patients prioritized by their likelihood to accept appointments',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetPrioritizedPatientsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response with prioritized patients',
      content: {
        'application/json': {
          schema: GetPrioritizedPatientsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - Invalid input',
      content: {
        'application/json': {
          schema: z.object({
            error: z.object({
              message: z.string(),
              statusCode: z.number(),
            }),
          }),
          example: {
            error: {
              message: 'Validation failed: facility.location.latitude: Invalid input',
              statusCode: 400,
            },
          },
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({
            error: z.object({
              message: z.string(),
              statusCode: z.number(),
            }),
          }),
          example: {
            error: {
              message: 'Internal server error',
              statusCode: 500,
            },
          },
        },
      },
    },
  },
});