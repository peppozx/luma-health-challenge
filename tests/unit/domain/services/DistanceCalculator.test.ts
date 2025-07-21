import { DistanceCalculator } from '../../../../src/domain/services/DistanceCalculator';
import { Location } from '../../../../src/domain/entities/Patient';

describe('UNIT: DistanceCalculator', () => {
  describe('calculate', () => {
    it('should return 0 for identical locations', () => {
      const location: Location = { latitude: 40.7128, longitude: -74.0060 };
      const distance = DistanceCalculator.calculate(location, location);
      expect(distance).toBe(0);
    });

    it('should calculate distance between New York and Los Angeles correctly', () => {
      const newYork: Location = { latitude: 40.7128, longitude: -74.0060 };
      const losAngeles: Location = { latitude: 34.0522, longitude: -118.2437 };

      const distance = DistanceCalculator.calculate(newYork, losAngeles);

      // The shortest distance between NYC and LA is approximately 3935 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(3970);
    });

    it('should calculate distance between London and Paris correctly', () => {
      const london: Location = { latitude: 51.5074, longitude: -0.1278 };
      const paris: Location = { latitude: 48.8566, longitude: 2.3522 };

      const distance = DistanceCalculator.calculate(london, paris);

      // The shortest distance between London and Paris is approximately 344 km
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it('should handle antipodal points correctly', () => {
      const northPole: Location = { latitude: 90, longitude: 0 };
      const southPole: Location = { latitude: -90, longitude: 0 };

      const distance = DistanceCalculator.calculate(northPole, southPole);

      // The distance between poles is half the Earth's circumference (~20,000 km)
      expect(distance).toBeGreaterThan(20000);
      expect(distance).toBeLessThan(20100);
    });

    it('should handle negative coordinates correctly', () => {
      const buenosAires: Location = { latitude: -34.6037, longitude: -58.3816 };
      const sydney: Location = { latitude: -33.8688, longitude: 151.2093 };

      const distance = DistanceCalculator.calculate(buenosAires, sydney);

      // The shortest distance between Buenos Aires and Sydney is approximately 11,800 km
      expect(distance).toBeGreaterThan(11700);
      expect(distance).toBeLessThan(11900);
    });

    it('should be commutative (distance A to B equals B to A)', () => {
      const locationA: Location = { latitude: 52.5200, longitude: 13.4050 };
      const locationB: Location = { latitude: 41.9028, longitude: 12.4964 };

      const distanceAB = DistanceCalculator.calculate(locationA, locationB);
      const distanceBA = DistanceCalculator.calculate(locationB, locationA);

      expect(distanceAB).toBe(distanceBA);
    });

    it('should handle very small distances accurately', () => {
      const location1: Location = { latitude: 40.7128, longitude: -74.0060 };
      const location2: Location = { latitude: 40.7130, longitude: -74.0062 };

      const distance = DistanceCalculator.calculate(location1, location2);

      // Very small distance, should be less than 1 km
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });
  });
});
