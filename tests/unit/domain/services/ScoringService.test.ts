import { ScoringService, ScoringConfig } from '../../../../src/domain/services/ScoringService';
import { Patient, Location } from '../../../../src/domain/entities/Patient';

describe('UNIT: ScoringService', () => {
  let scoringService: ScoringService;
  const facilityLocation: Location = { latitude: 40.7128, longitude: -74.0060 };

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  describe('calculateScore', () => {
    it('should calculate score for a patient with perfect behavioral data and close distance', () => {
      const patient: Patient = {
        id: '1',
        name: 'John Doe',
        location: { latitude: 40.7580, longitude: -73.9855 }, // ~5km from facility
        age: 45,
        acceptedOffers: 100,
        canceledOffers: 0,
        averageReplyTime: 120, // 2 minutes
      };

      const scoredPatient = scoringService.calculateScore(patient, facilityLocation);

      expect(scoredPatient.score).toBeGreaterThan(9);
      expect(scoredPatient.score).toBeLessThanOrEqual(10);
      expect(scoredPatient.distance).toBeLessThan(10);
      expect(scoredPatient.demographicScore).toBe(10);
      expect(scoredPatient.behavioralScore).toBe(10);
    });

    it('should calculate score for a patient with poor behavioral data', () => {
      const patient: Patient = {
        id: '2',
        name: 'Jane Smith',
        location: { latitude: 40.7580, longitude: -73.9855 },
        age: 45,
        acceptedOffers: 0,
        canceledOffers: 100,
        averageReplyTime: 7200, // 2 hours
      };

      const scoredPatient = scoringService.calculateScore(patient, facilityLocation);

      expect(scoredPatient.score).toBeLessThan(5);
      expect(scoredPatient.behavioralScore).toBeLessThan(5);
    });

    it('should handle patients with no interaction history', () => {
      const patient: Patient = {
        id: '3',
        name: 'New Patient',
        location: { latitude: 40.7580, longitude: -73.9855 },
        age: 35,
        acceptedOffers: 0,
        canceledOffers: 0,
        averageReplyTime: 0,
      };

      const scoredPatient = scoringService.calculateScore(patient, facilityLocation);

      expect(scoredPatient.score).toBeGreaterThanOrEqual(1);
      expect(scoredPatient.score).toBeLessThanOrEqual(10);
    });

    it('should apply age scoring correctly for different age groups', () => {
      const youngPatient: Patient = {
        id: '4',
        name: 'Young Patient',
        location: facilityLocation,
        age: 20,
        acceptedOffers: 50,
        canceledOffers: 50,
        averageReplyTime: 600,
      };

      const middleAgedPatient: Patient = {
        ...youngPatient,
        id: '5',
        name: 'Middle Aged Patient',
        age: 50,
      };

      const elderlyPatient: Patient = {
        ...youngPatient,
        id: '6',
        name: 'Elderly Patient',
        age: 80,
      };

      const youngScore = scoringService.calculateScore(youngPatient, facilityLocation);
      const middleScore = scoringService.calculateScore(middleAgedPatient, facilityLocation);
      const elderlyScore = scoringService.calculateScore(elderlyPatient, facilityLocation);

      // Middle-aged patients (30-65) should have the highest demographic score
      expect(middleScore.demographicScore).toBeGreaterThan(youngScore.demographicScore);
      expect(middleScore.demographicScore).toBeGreaterThan(elderlyScore.demographicScore);
    });

    it('should apply distance scoring correctly', () => {
      const basePatient: Patient = {
        id: '7',
        name: 'Test Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 50,
        canceledOffers: 50,
        averageReplyTime: 600,
      };

      const nearPatient = { ...basePatient, id: '7a' };
      const mediumPatient = {
        ...basePatient,
        id: '7b',
        location: { latitude: 41.8781, longitude: -87.6298 }, // Chicago, ~1150km
      };
      const farPatient = {
        ...basePatient,
        id: '7c',
        location: { latitude: 34.0522, longitude: -118.2437 }, // LA, ~3935km
      };

      const nearScore = scoringService.calculateScore(nearPatient, facilityLocation);
      const mediumScore = scoringService.calculateScore(mediumPatient, facilityLocation);
      const farScore = scoringService.calculateScore(farPatient, facilityLocation);

      expect(nearScore.distance).toBe(0);
      expect(mediumScore.distance).toBeGreaterThan(1000);
      expect(farScore.distance).toBeGreaterThan(3000);

      // Scores should decrease with distance
      expect(nearScore.demographicScore).toBeGreaterThan(mediumScore.demographicScore);
      // Both medium and far distances get score 3, so demographic scores will be equal
      expect(mediumScore.demographicScore).toBe(farScore.demographicScore);
    });

    it('should apply response time scoring correctly', () => {
      const basePatient: Patient = {
        id: '8',
        name: 'Test Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 50,
        canceledOffers: 50,
        averageReplyTime: 0,
      };

      const fastResponder = { ...basePatient, id: '8a', averageReplyTime: 120 }; // 2 min
      const averageResponder = { ...basePatient, id: '8b', averageReplyTime: 1200 }; // 20 min
      const slowResponder = { ...basePatient, id: '8c', averageReplyTime: 5400 }; // 1.5 hours

      const fastScore = scoringService.calculateScore(fastResponder, facilityLocation);
      const averageScore = scoringService.calculateScore(averageResponder, facilityLocation);
      const slowScore = scoringService.calculateScore(slowResponder, facilityLocation);

      expect(fastScore.behavioralScore).toBeGreaterThan(averageScore.behavioralScore);
      expect(averageScore.behavioralScore).toBeGreaterThan(slowScore.behavioralScore);
    });

    it('should calculate acceptance rate correctly', () => {
      const highAcceptance: Patient = {
        id: '9a',
        name: 'High Acceptance',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 90,
        canceledOffers: 10,
        averageReplyTime: 600,
      };

      const lowAcceptance: Patient = {
        ...highAcceptance,
        id: '9b',
        name: 'Low Acceptance',
        acceptedOffers: 10,
        canceledOffers: 90,
      };

      const highScore = scoringService.calculateScore(highAcceptance, facilityLocation);
      const lowScore = scoringService.calculateScore(lowAcceptance, facilityLocation);

      expect(highScore.behavioralScore).toBeGreaterThan(lowScore.behavioralScore);
      expect(highScore.score).toBeGreaterThan(lowScore.score);
    });

    it('should respect weight configuration', () => {
      const customConfig: Partial<ScoringConfig> = {
        weights: {
          demographic: { age: 0.50, distance: 0.50 },
          behavioral: {
            acceptedOffers: 0.10,
            canceledOffers: 0.10,
            averageReplyTime: 0.80,
          },
        },
      };

      const customService = new ScoringService(customConfig);
      const patient: Patient = {
        id: '10',
        name: 'Test Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 50,
        canceledOffers: 50,
        averageReplyTime: 300, // Fast responder
      };

      const defaultScore = scoringService.calculateScore(patient, facilityLocation);
      const customScore = customService.calculateScore(patient, facilityLocation);

      // With custom weights favoring response time, the score should be different
      expect(customScore.score).not.toBe(defaultScore.score);
    });

    it('should apply randomness boost for patients with low interaction data', () => {
      const lowInteractionPatient: Patient = {
        id: '11',
        name: 'New Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 5,
        canceledOffers: 5, // Total 10 interactions < 20 threshold
        averageReplyTime: 600,
      };

      // Run multiple times to test randomness
      const scores = Array(10).fill(null).map(() =>
        scoringService.calculateScore(lowInteractionPatient, facilityLocation).score
      );

      // Check that not all scores are identical (randomness is applied)
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBeGreaterThan(1);
    });

    it('should not apply randomness boost for patients with sufficient interaction data', () => {
      const highInteractionPatient: Patient = {
        id: '12',
        name: 'Regular Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 50,
        canceledOffers: 50, // Total 100 interactions > 20 threshold
        averageReplyTime: 600,
      };

      // Run multiple times - scores should be consistent
      const scores = Array(10).fill(null).map(() =>
        scoringService.calculateScore(highInteractionPatient, facilityLocation).score
      );

      // All scores should be identical (no randomness)
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBe(1);
    });

    it('should respect randomness configuration when disabled', () => {
      const noRandomnessService = new ScoringService({
        randomnessConfig: { enabled: false, maxBoost: 0, lowDataThreshold: 20 },
      });

      const lowInteractionPatient: Patient = {
        id: '13',
        name: 'New Patient',
        location: facilityLocation,
        age: 40,
        acceptedOffers: 2,
        canceledOffers: 2,
        averageReplyTime: 600,
      };

      const scores = Array(10).fill(null).map(() =>
        noRandomnessService.calculateScore(lowInteractionPatient, facilityLocation).score
      );

      // All scores should be identical when randomness is disabled
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBe(1);
    });

    it('should ensure scores are always between 1 and 10', () => {
      const patients: Patient[] = [
        {
          id: '14a',
          name: 'Worst Case',
          location: { latitude: -33.8688, longitude: 151.2093 }, // Sydney, very far
          age: 90,
          acceptedOffers: 0,
          canceledOffers: 1000,
          averageReplyTime: 86400, // 24 hours
        },
        {
          id: '14b',
          name: 'Best Case',
          location: facilityLocation,
          age: 45,
          acceptedOffers: 1000,
          canceledOffers: 0,
          averageReplyTime: 60, // 1 minute
        },
      ];

      patients.forEach(patient => {
        const scored = scoringService.calculateScore(patient, facilityLocation);
        expect(scored.score).toBeGreaterThanOrEqual(1);
        expect(scored.score).toBeLessThanOrEqual(10);
      });
    });
  });
});
