import { Service } from 'typedi';

import { Patient, ScoredPatient, Location } from '../entities/Patient';
import { DistanceCalculator } from './DistanceCalculator';

/**
 * Configuration interface for the patient scoring algorithm.
 *
 * @remarks
 * This configuration allows fine-tuning of the scoring algorithm by adjusting
 * the weights of different factors and controlling the randomness behavior.
 */
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

/**
 * Service responsible for calculating patient prioritization scores.
 *
 * @remarks
 * This service implements a weighted scoring algorithm that considers both
 * demographic and behavioral factors to predict the likelihood of a patient
 * accepting an appointment offer.
 *
 * The algorithm balances multiple factors:
 * - **Demographic (20%)**: Age and distance from facility
 * - **Behavioral (80%)**: Past acceptance rate, cancellation rate, and response time
 *
 * To ensure fairness, patients with limited interaction history receive a
 * controlled random boost, preventing them from being perpetually deprioritized.
 *
 * @example
 * ```typescript
 * const scoringService = new ScoringService({
 *   randomnessConfig: {
 *     enabled: true,
 *     maxBoost: 0.15,
 *     lowDataThreshold: 10
 *   }
 * });
 *
 * const facility = { location: { latitude: 40.7128, longitude: -74.0060 } };
 * const scoredPatient = scoringService.calculateScore(patient, facility.location);
 * console.log(`Patient score: ${scoredPatient.score}/10`);
 * ```
 */
@Service()
export class ScoringService {
  private readonly config: ScoringConfig;

  constructor(config?: Partial<ScoringConfig>) {
    const defaultConfig: ScoringConfig = {
      weights: {
        demographic: {
          age: 0.1,
          distance: 0.1,
        },
        behavioral: {
          acceptedOffers: 0.3,
          canceledOffers: 0.3,
          averageReplyTime: 0.2,
        },
      },
      randomnessConfig: {
        enabled: true,
        maxBoost: 0.2,
        lowDataThreshold: 20,
      },
    };

    this.config = {
      weights: {
        demographic: {
          ...defaultConfig.weights.demographic,
          ...(config?.weights?.demographic || {}),
        },
        behavioral: {
          ...defaultConfig.weights.behavioral,
          ...(config?.weights?.behavioral || {}),
        },
      },
      randomnessConfig: {
        ...defaultConfig.randomnessConfig,
        ...(config?.randomnessConfig || {}),
      },
    };
  }

  /**
   * Calculates a comprehensive prioritization score for a patient.
   *
   * @param patient - The patient to score
   * @param facilityLocation - The location of the healthcare facility
   * @returns A scored patient object with detailed scoring breakdown
   *
   * @remarks
   * The scoring algorithm follows a multi-step process:
   * 1. Calculate distance between patient and facility
   * 2. Generate individual scores (0-10) for each factor:
   *    - Age: Optimized for 30-65 years (higher reliability)
   *    - Distance: Closer patients score higher
   *    - Acceptance rate: Based on historical accepted/canceled ratio
   *    - Response time: Faster responders score higher
   * 3. Apply configured weights to compute demographic and behavioral scores
   * 4. Combine scores: final = (demographic × 0.2) + (behavioral × 0.8)
   * 5. Apply randomness boost for patients with limited data
   * 6. Ensure final score is within 1-10 range
   *
   * @example
   * ```typescript
   * const patient: Patient = {
   *   id: '123',
   *   name: 'John Doe',
   *   age: 45,
   *   location: { latitude: 40.7580, longitude: -73.9855 },
   *   acceptedOffers: 8,
   *   canceledOffers: 2,
   *   averageReplyTime: 600 // 10 minutes
   * };
   *
   * const facility = { latitude: 40.7128, longitude: -74.0060 };
   * const scored = scoringService.calculateScore(patient, facility);
   *
   * console.log(`Score: ${scored.score}`);
   * console.log(`Distance: ${scored.distance} km`);
   * console.log(`Demographic: ${scored.demographicScore}`);
   * console.log(`Behavioral: ${scored.behavioralScore}`);
   * ```
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
      (acceptanceRateScore *
        (this.config.weights.behavioral.acceptedOffers +
          this.config.weights.behavioral.canceledOffers) +
        responseTimeScore * this.config.weights.behavioral.averageReplyTime) /
      totalBehavioralWeight;

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

  /**
   * Calculates an age-based score with preference for middle-aged patients.
   *
   * @param age - Patient's age in years
   * @returns Score between 6-10
   *
   * @remarks
   * Age scoring rationale:
   * - **< 30 years**: 6-8 (younger patients may be less reliable)
   * - **30-65 years**: 10 (peak reliability age range)
   * - **> 65 years**: 7-10 (gradual decrease for mobility concerns)
   *
   * The scoring uses linear interpolation for smooth transitions.
   *
   * @internal
   */
  private calculateAgeScore(age: number): number {
    if (age < 30) {
      return 6 + (age / 30) * 2;
    } else if (age <= 65) {
      return 10;
    } else {
      return 10 - ((age - 65) / 35) * 3;
    }
  }

  /**
   * Calculates a distance-based score with preference for nearby patients.
   *
   * @param distanceKm - Distance in kilometers from facility
   * @returns Score between 3-10
   *
   * @remarks
   * Distance scoring tiers:
   * - **0-10 km**: 10 (excellent - very likely to attend)
   * - **10-25 km**: 9 (very good - minimal travel burden)
   * - **25-50 km**: 7 (good - moderate travel time)
   * - **50-100 km**: 5 (fair - significant travel required)
   * - **> 100 km**: 3 (poor - unlikely due to distance)
   *
   * @internal
   */
  private calculateDistanceScore(distanceKm: number): number {
    if (distanceKm <= 10) return 10;
    if (distanceKm <= 25) return 9;
    if (distanceKm <= 50) return 7;
    if (distanceKm <= 100) return 5;
    return 3;
  }

  /**
   * Calculates a score based on the patient's historical acceptance rate.
   *
   * @param patient - Patient with offer history
   * @returns Score between 0-10 (or 5 for insufficient data)
   *
   * @remarks
   * - Returns neutral score (5) for patients with < 5 total offers
   * - Otherwise, score = (accepted / total) × 10
   * - This directly reflects the probability of acceptance
   *
   * @example
   * - 8 accepted, 2 canceled = 80% rate = score of 8
   * - 3 accepted, 7 canceled = 30% rate = score of 3
   *
   * @internal
   */
  private calculateAcceptanceRateScore(patient: Patient): number {
    const totalOffers = patient.acceptedOffers + patient.canceledOffers;

    if (totalOffers < 5) return 5;

    const acceptanceRate = patient.acceptedOffers / totalOffers;
    return acceptanceRate * 10;
  }

  /**
   * Calculates a score based on average response time to appointment offers.
   *
   * @param avgReplyTimeSeconds - Average response time in seconds
   * @returns Score between 2-10
   *
   * @remarks
   * Response time scoring tiers:
   * - **≤ 5 min (300s)**: 10 (excellent - very engaged)
   * - **≤ 15 min (900s)**: 8 (very good - promptly responsive)
   * - **≤ 30 min (1800s)**: 6 (good - reasonably responsive)
   * - **≤ 1 hour (3600s)**: 4 (fair - delayed response)
   * - **> 1 hour**: 2 (poor - significantly delayed)
   *
   * Faster response times indicate higher engagement and availability.
   *
   * @internal
   */
  private calculateResponseTimeScore(avgReplyTimeSeconds: number): number {
    if (avgReplyTimeSeconds <= 300) return 10;
    if (avgReplyTimeSeconds <= 900) return 8;
    if (avgReplyTimeSeconds <= 1800) return 6;
    if (avgReplyTimeSeconds <= 3600) return 4;
    return 2;
  }

  /**
   * Applies a controlled random boost to patients with limited interaction history.
   *
   * @param patient - The patient being scored
   * @param currentScore - The calculated score before randomness
   * @returns The score with potential random boost applied
   *
   * @remarks
   * This method ensures fairness by preventing new patients from being
   * perpetually ranked low due to lack of historical data.
   *
   * - Only applies to patients with total interactions < lowDataThreshold
   * - Adds random boost between 0 and (maxBoost × 10) points
   * - Default: up to 2 points (20% of scale) for patients with < 20 interactions
   *
   * This gives new patients a chance to be contacted and build history.
   *
   * @example
   * ```typescript
   * // Patient with 3 total interactions (< 20 threshold)
   * // Current score: 5.5
   * // Possible boost: 0 to 2 points
   * // Final score: 5.5 to 7.5 (randomly determined)
   * ```
   *
   * @internal
   */
  private applyRandomnessBoost(patient: Patient, currentScore: number): number {
    const totalInteractions = patient.acceptedOffers + patient.canceledOffers;

    if (totalInteractions < this.config.randomnessConfig.lowDataThreshold) {
      const randomBoost = Math.random() * this.config.randomnessConfig.maxBoost * 10;
      return currentScore + randomBoost;
    }

    return currentScore;
  }
}
