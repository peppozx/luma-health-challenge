import { Router } from 'express';

import { PatientController } from '../controllers/PatientController';
import { getService } from '../../config/DIContainer';
import { validateRequest } from '../middlewares/ValidationMiddleware';
import { getPrioritizedPatientsSchema } from '../validations/patientValidations';

export const createPatientRoutes = (): Router => {
  const router = Router();

  const patientController = getService(PatientController);

  router.post('/prioritized', validateRequest(getPrioritizedPatientsSchema), (req, res, next) =>
    patientController.getPrioritized(req, res, next),
  );

  return router;
};
