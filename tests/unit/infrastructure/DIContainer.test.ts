import 'reflect-metadata';
import { Container } from 'typedi';

import { GetPrioritizedPatients } from '../../../src/application/use-cases/GetPrioritizedPatients';
import { ScoringService } from '../../../src/domain/services/ScoringService';
import { PatientController } from '../../../src/infrastructure/api/controllers/PatientController';
import { getService, setupContainer } from '../../../src/infrastructure/config/DIContainer';
import { InMemoryPatientRepository } from '../../../src/infrastructure/repositories/InMemoryPatientRepository';

describe('UNIT: DIContainer', () => {
  beforeAll(() => {
    setupContainer();
  });

  afterEach(() => {
    Container.reset();
    setupContainer();
  });

  describe('Service Resolution', () => {
    it('should resolve ScoringService', () => {
      const scoringService = getService(ScoringService);

      expect(scoringService).toBeDefined();
      expect(scoringService).toBeInstanceOf(ScoringService);
    });

    it('should resolve InMemoryPatientRepository', () => {
      const repository = getService(InMemoryPatientRepository);

      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(InMemoryPatientRepository);
    });

    it('should resolve GetPrioritizedPatients with its dependencies', () => {
      const useCase = getService(GetPrioritizedPatients);

      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(GetPrioritizedPatients);

      // Verify it has the required dependencies injected
      expect(useCase['patientRepository']).toBeDefined();
      expect(useCase['patientRepository']).toBeInstanceOf(InMemoryPatientRepository);
      expect(useCase['scoringService']).toBeDefined();
      expect(useCase['scoringService']).toBeInstanceOf(ScoringService);
    });

    it('should resolve PatientController with its dependencies', () => {
      const controller = getService(PatientController);

      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(PatientController);

      // Verify it has the required dependency injected
      expect(controller['getPrioritizedPatients']).toBeDefined();
      expect(controller['getPrioritizedPatients']).toBeInstanceOf(GetPrioritizedPatients);
    });
  });

  describe('Singleton Behavior', () => {
    it('should return the same instance for services', () => {
      const scoringService1 = getService(ScoringService);
      const scoringService2 = getService(ScoringService);

      expect(scoringService1).toBe(scoringService2);
    });

    it('should return the same repository instance', () => {
      const repository1 = getService(InMemoryPatientRepository);
      const repository2 = getService(InMemoryPatientRepository);

      expect(repository1).toBe(repository2);
    });

    it('should use the same dependencies across services', () => {
      const useCase = getService(GetPrioritizedPatients);
      const controller = getService(PatientController);

      // The controller's use case should be the same instance
      expect(controller['getPrioritizedPatients']).toBe(useCase);

      // The repository should be the same instance across services
      const repository = getService(InMemoryPatientRepository);
      expect(useCase['patientRepository']).toBe(repository);
    });
  });

  describe('Container.get direct usage', () => {
    it('should work with Container.get directly', () => {
      const scoringService = Container.get(ScoringService);

      expect(scoringService).toBeDefined();
      expect(scoringService).toBeInstanceOf(ScoringService);
    });
  });
});
