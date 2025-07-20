import { Request, Response, NextFunction } from 'express';

import { GetPrioritizedPatients } from '../../../application/use-cases/GetPrioritizedPatients';
import { logger } from '../../../shared/utils/Logger';

export class PatientController {
  constructor(
    private readonly getPrioritizedPatients: GetPrioritizedPatients
  ) {}

  async getPrioritized(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { facility } = req.body;

      logger.info('Getting prioritized patients', { facility });

      const result = await this.getPrioritizedPatients.execute({ facility });

      logger.info(`Returning ${result.patients.length} prioritized patients`);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
