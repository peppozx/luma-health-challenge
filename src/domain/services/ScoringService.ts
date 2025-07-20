import { Patient, ScoredPatient, Location } from '../entities/Patient';
import { DistanceCalculator } from './DistanceCalculator';

export interface ScoringConfig {
  weights: {
    demographic: {
      age: number;
      distance: number;
    };
    behavioral: {
      acceptedOffers: number;
      canceledOffers: number;
      averageReplyTime: number;
    };
  };
  randomnessConfig: {
    enabled: boolean;
    maxBoost: number;
    lowDataThreshold: number;
  };
}

export class ScoringService {
  private readonly config: ScoringConfig;

  constructor(config?: Partial<ScoringConfig>) {
    this.config = {
      weights: {
        demographic: {
          age: 0.10,
          distance: 0.10,
        },
        behavioral: {
          acceptedOffers: 0.30,
          canceledOffers: 0.30,
          averageReplyTime: 0.20,
        },
      },
      randomnessConfig: {
        enabled: true,
        maxBoost: 0.2,
        lowDataThreshold: 20,
      },
      ...config,
    };
  }

  /**
   * Calculates the score of a patient based on demographic and behavioral data
   */
  calculateScore(patient: Patient, facilityLocation: Location): ScoredPatient {
    const distance = DistanceCalculator.calculate(patient.location, facilityLocation);
    
    const ageScore = this.calculateAgeScore(patient.age);
    const distanceScore = this.calculateDistanceScore(distance);
    const acceptanceRateScore = this.calculateAcceptanceRateScore(patient);
    const responseTimeScore = this.calculateResponseTimeScore(patient.averageReplyTime);

    // Calculate weighted demographic score (normalized to 0-10)
    const demographicScore = 
      (ageScore * this.config.weights.demographic.age +
      distanceScore * this.config.weights.demographic.distance) / 
      (this.config.weights.demographic.age + this.config.weights.demographic.distance);

    // Calculate weighted behavioral score (normalized to 0-10)
    const totalBehavioralWeight = 
      this.config.weights.behavioral.acceptedOffers + 
      this.config.weights.behavioral.canceledOffers + 
      this.config.weights.behavioral.averageReplyTime;
    
    const behavioralScore = 
      (acceptanceRateScore * (this.config.weights.behavioral.acceptedOffers + this.config.weights.behavioral.canceledOffers) +
      responseTimeScore * this.config.weights.behavioral.averageReplyTime) / totalBehavioralWeight;

    // Calculate final score: 20% demographic + 80% behavioral
    let finalScore = demographicScore * 0.2 + behavioralScore * 0.8;

    if (this.config.randomnessConfig.enabled) {
      finalScore = this.applyRandomnessBoost(patient, finalScore);
    }

    finalScore = Math.max(1, Math.min(10, finalScore));

    return {
      ...patient,
      score: Number(finalScore.toFixed(2)),
      distance: Number(distance.toFixed(2)),
      demographicScore: Number(demographicScore.toFixed(2)),
      behavioralScore: Number(behavioralScore.toFixed(2)),
    };
  }

  private calculateAgeScore(age: number): number {
    if (age < 30) {
      return 6 + (age / 30) * 2;
    } else if (age <= 65) {
      return 10;
    } else {
      return 10 - ((age - 65) / 35) * 3;
    }
  }

  private calculateDistanceScore(distanceKm: number): number {
    if (distanceKm <= 10) return 10;
    if (distanceKm <= 25) return 9;
    if (distanceKm <= 50) return 7;
    if (distanceKm <= 100) return 5;
    return 3;
  }

  private calculateAcceptanceRateScore(patient: Patient): number {
    const totalOffers = patient.acceptedOffers + patient.canceledOffers;
    
    if (totalOffers < 5) return 5;
    
    const acceptanceRate = patient.acceptedOffers / totalOffers;
    return acceptanceRate * 10;
  }

  private calculateResponseTimeScore(avgReplyTimeSeconds: number): number {
    if (avgReplyTimeSeconds <= 300) return 10;
    if (avgReplyTimeSeconds <= 900) return 8;
    if (avgReplyTimeSeconds <= 1800) return 6;
    if (avgReplyTimeSeconds <= 3600) return 4;
    return 2;
  }

  private applyRandomnessBoost(patient: Patient, currentScore: number): number {
    const totalInteractions = patient.acceptedOffers + patient.canceledOffers;
    
    if (totalInteractions < this.config.randomnessConfig.lowDataThreshold) {
      const randomBoost = Math.random() * this.config.randomnessConfig.maxBoost * 10;
      return currentScore + randomBoost;
    }
    
    return currentScore;
  }
}