import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

const LocationSchema = z
  .object({
    latitude: z
      .number()
      .min(-90, { message: 'Latitude must be between -90 and 90' })
      .max(90, { message: 'Latitude must be between -90 and 90' })
      .openapi({ example: 40.7128, description: 'Latitude coordinate' }),
    longitude: z
      .number()
      .min(-180, { message: 'Longitude must be between -180 and 180' })
      .max(180, { message: 'Longitude must be between -180 and 180' })
      .openapi({ example: -74.006, description: 'Longitude coordinate' }),
  })
  .openapi({
    description: 'Geographic location coordinates',
    example: { latitude: 40.7128, longitude: -74.006 },
  });

const FacilitySchema = z
  .object({
    location: LocationSchema,
  })
  .openapi({ description: 'Healthcare facility information' });

export const GetPrioritizedPatientsRequestSchema = z
  .object({
    facility: FacilitySchema,
  })
  .openapi({
    description: 'Request body for getting prioritized patients',
    example: {
      facility: {
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    },
  });

export const PatientResponseSchema = z.object({
  id: z.string().openapi({ example: '541d25c9-9500-4265-8967-240f44ecf723' }),
  name: z.string().openapi({ example: 'John Doe' }),
  score: z.number().min(1).max(10).openapi({ example: 8.5 }),
  distance: z.number().openapi({ example: 12.3, description: 'Distance in kilometers' }),
  demographicScore: z.number().openapi({ example: 9.0 }),
  behavioralScore: z.number().openapi({ example: 8.3 }),
});

export const GetPrioritizedPatientsResponseSchema = z
  .object({
    patients: z.array(PatientResponseSchema),
  })
  .openapi({
    description: 'List of prioritized patients',
    example: {
      patients: [
        {
          id: '541d25c9-9500-4265-8967-240f44ecf723',
          name: 'John Doe',
          score: 8.5,
          distance: 12.3,
          demographicScore: 9.0,
          behavioralScore: 8.3,
        },
      ],
    },
  });

export const getPrioritizedPatientsSchema = {
  body: GetPrioritizedPatientsRequestSchema,
};
