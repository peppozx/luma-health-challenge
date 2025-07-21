import type { Request, Response, NextFunction } from 'express';

import type { GetPrioritizedPatients } from '../../../application/use-cases/GetPrioritizedPatients';
import type { Facility } from '../../../domain/entities/Facility';
import { logger } from '../../../shared/utils/Logger';

export class PatientController {
  constructor(private readonly getPrioritizedPatients: GetPrioritizedPatients) {}

  async getPrioritized(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facility } = req.body as { facility: Facility };

      logger.info('Getting prioritized patients', { facility });

      const result = await this.getPrioritizedPatients.execute({ facility });

      logger.info(`Returning ${result.patients.length} prioritized patients`);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
