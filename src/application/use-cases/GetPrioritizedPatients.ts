import type { PatientRepository } from '../../domain/repositories/PatientRepository';
import type { ScoringService } from '../../domain/services/ScoringService';
import type { Location, ScoredPatient } from '../../domain/entities/Patient';
import type {
  GetPrioritizedPatientsRequestDTO,
  GetPrioritizedPatientsResponseDTO,
  PrioritizedPatientDTO,
} from '../dto/PrioritizedPatientDTO';

export class GetPrioritizedPatients {
  constructor(
    private readonly patientRepository: PatientRepository,
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
