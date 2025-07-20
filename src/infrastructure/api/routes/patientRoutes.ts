import { Router } from 'express';

import { PatientController } from '../controllers/PatientController';
import { GetPrioritizedPatients } from '../../../application/use-cases/GetPrioritizedPatients';
import { InMemoryPatientRepository } from '../../repositories/InMemoryPatientRepository';
import { ScoringService } from '../../../domain/services/ScoringService';

export const createPatientRoutes = (): Router => {
  const router = Router();

  const patientRepository = new InMemoryPatientRepository();
  const scoringService = new ScoringService();
  const getPrioritizedPatients = new GetPrioritizedPatients(patientRepository, scoringService);
  const patientController = new PatientController(getPrioritizedPatients);

  router.post('/prioritized', (req, res, next) =>
    patientController.getPrioritized(req, res, next)
  );

  return router;
};
