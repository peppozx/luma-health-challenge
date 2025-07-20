import { Request, Response, NextFunction } from 'express';

import { GetPrioritizedPatients } from '../../../application/use-cases/GetPrioritizedPatients';
import { ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/Logger';

export class PatientController {
  constructor(
    private readonly getPrioritizedPatients: GetPrioritizedPatients
  ) {}

  async getPrioritized(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new ValidationError('Request body is required. Expected format: { "facility": { "location": { "latitude": number, "longitude": number } } }');
      }

      const { facility } = req.body;

      if (!facility) {
        throw new ValidationError('Facility object is required. Expected format: { "facility": { "location": { "latitude": number, "longitude": number } } }');
      }

      if (!facility.location) {
        throw new ValidationError('Facility location is required. Expected format: { "location": { "latitude": number, "longitude": number } }');
      }

      const { latitude, longitude } = facility.location;

      if (latitude === undefined || latitude === null) {
        throw new ValidationError('Latitude is required in facility location');
      }

      if (longitude === undefined || longitude === null) {
        throw new ValidationError('Longitude is required in facility location');
      }

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new ValidationError('Latitude and longitude must be numbers. Received: latitude=' + typeof latitude + ', longitude=' + typeof longitude);
      }

      if (latitude < -90 || latitude > 90) {
        throw new ValidationError(`Latitude must be between -90 and 90. Received: ${latitude}`);
      }

      if (longitude < -180 || longitude > 180) {
        throw new ValidationError(`Longitude must be between -180 and 180. Received: ${longitude}`);
      }

      logger.info('Getting prioritized patients', { facility });

      const result = await this.getPrioritizedPatients.execute({ facility });

      logger.info(`Returning ${result.patients.length} prioritized patients`);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
