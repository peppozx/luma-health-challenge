import { z } from 'zod';

// Custom Zod refinements for common validations
const zodRefinements = {
  latitude: z.number()
    .refine(val => val >= -90 && val <= 90, {
      message: 'Latitude must be between -90 and 90',
    }),

  longitude: z.number()
    .refine(val => val >= -180 && val <= 180, {
      message: 'Longitude must be between -180 and 180',
    }),
};

export const getPrioritizedPatientsSchema = {
  body: z.object({
    facility: z.object({
      location: z.object({
        latitude: zodRefinements.latitude,
        longitude: zodRefinements.longitude,
      }).describe('Facility location with latitude and longitude'),
    }).describe('Facility information'),
  }).describe('Request to get prioritized patients for a facility'),
};
