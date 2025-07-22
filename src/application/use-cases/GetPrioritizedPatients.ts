import { Service } from 'typedi';

import { ScoringService } from '../../domain/services/ScoringService';
import { InMemoryPatientRepository } from '../../infrastructure/repositories/InMemoryPatientRepository';
import { Location, ScoredPatient } from '../../domain/entities/Patient';
import {
  GetPrioritizedPatientsRequestDTO,
  GetPrioritizedPatientsResponseDTO,
  PrioritizedPatientDTO,
} from '../dto/PrioritizedPatientDTO';

@Service()
export class GetPrioritizedPatients {
  constructor(
    // The idea was to use PatientRepository interface here, but since typeDI
    // injects dependencies based on class names, we need to use the concrete implementation
    private readonly patientRepository: InMemoryPatientRepository,
    private readonly scoringService: ScoringService,
  ) {}

  async execute(
    request: GetPrioritizedPatientsRequestDTO,
  ): Promise<GetPrioritizedPatientsResponseDTO> {
    const facilityLocation: Location = {
      latitude: request.facility.location.latitude,
      longitude: request.facility.location.longitude,
    };

    const patients = await this.patientRepository.findAll();

    const scoredPatients: ScoredPatient[] = patients.map((patient) =>
      this.scoringService.calculateScore(patient, facilityLocation),
    );

    scoredPatients.sort((a, b) => b.score - a.score);

    const topPatients = scoredPatients.slice(0, 10);

    const prioritizedPatients: PrioritizedPatientDTO[] = topPatients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      score: patient.score,
      distance: patient.distance || 0,
      demographicScore: patient.demographicScore,
      behavioralScore: patient.behavioralScore,
    }));

    return {
      patients: prioritizedPatients,
    };
  }
}
