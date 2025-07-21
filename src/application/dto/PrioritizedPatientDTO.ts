export interface PrioritizedPatientDTO {
  id: string;
  name: string;
  score: number;
  distance: number;
  demographicScore: number;
  behavioralScore: number;
}

export interface GetPrioritizedPatientsRequestDTO {
  facility: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface GetPrioritizedPatientsResponseDTO {
  patients: PrioritizedPatientDTO[];
}
