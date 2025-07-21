import { z } from 'zod';

import { registry } from '../OpenAPIConfig';
import {
  GetPrioritizedPatientsRequestSchema,
  GetPrioritizedPatientsResponseSchema,
  PatientResponseSchema,
} from '../../validations/patientValidations';

// Register Location schema
registry.register(
  'Location',
  z
    .object({
      latitude: z
        .number()
        .min(-90)
        .max(90)
        .openapi({ example: 40.7128, description: 'Latitude coordinate' }),
      longitude: z
        .number()
        .min(-180)
        .max(180)
        .openapi({ example: -74.006, description: 'Longitude coordinate' }),
    })
    .openapi({
      description: 'Geographic location coordinates',
      example: { latitude: 40.7128, longitude: -74.006 },
    }),
);

// Register Facility schema with inline location
registry.register(
  'Facility',
  z
    .object({
      location: z
        .object({
          latitude: z
            .number()
            .min(-90)
            .max(90)
            .openapi({ example: 40.7128, description: 'Latitude coordinate' }),
          longitude: z
            .number()
            .min(-180)
            .max(180)
            .openapi({ example: -74.006, description: 'Longitude coordinate' }),
        })
        .openapi({
          description: 'Geographic location coordinates',
        }),
    })
    .openapi({ description: 'Healthcare facility information' }),
);

// Register request/response schemas
registry.register('GetPrioritizedPatientsRequest', GetPrioritizedPatientsRequestSchema);
registry.register('PatientResponse', PatientResponseSchema);
registry.register('GetPrioritizedPatientsResponse', GetPrioritizedPatientsResponseSchema);

// Register error response schema
registry.register(
  'ErrorResponse',
  z
    .object({
      error: z.object({
        message: z.string().openapi({ example: 'Validation failed' }),
        statusCode: z.number().openapi({ example: 400 }),
      }),
    })
    .openapi({
      description: 'Error response',
      example: {
        error: {
          message: 'Validation failed: facility.location.latitude: Invalid input',
          statusCode: 400,
        },
      },
    }),
);

// Register health check response
registry.register(
  'HealthCheckResponse',
  z
    .object({
      status: z.string().openapi({ example: 'ok' }),
      timestamp: z.string().openapi({ example: '2024-01-20T10:30:00.000Z' }),
      version: z.string().optional().openapi({ example: '1.0.0' }),
    })
    .openapi({
      description: 'Health check response',
    }),
);
