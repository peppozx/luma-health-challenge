import type { Location } from '../entities/Patient';

/**
 * Utility class for calculating distances between geographic coordinates.
 *
 * @remarks
 * This class implements the Haversine formula to calculate the great-circle distance
 * between two points on Earth's surface given their longitude and latitude coordinates.
 * The Haversine formula accounts for Earth's spherical shape and provides accurate
 * results for most practical applications.
 *
 * @example
 * ```typescript
 * const nyc = { latitude: 40.7128, longitude: -74.0060 };
 * const la = { latitude: 34.0522, longitude: -118.2437 };
 * const distance = DistanceCalculator.calculate(nyc, la);
 * console.log(`Distance: ${distance.toFixed(2)} km`); // Distance: 3935.75 km
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula} for mathematical details
 */
export class DistanceCalculator {
  /**
   * Earth's mean radius in kilometers.
   * This value is based on the WGS84 ellipsoid model.
   *
   * @remarks
   * The actual Earth radius varies between 6356.752 km (polar) and 6378.137 km (equatorial).
   * The mean radius of 6371 km provides a good approximation for most distance calculations.
   */
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculates the great-circle distance between two geographic points using the Haversine formula.
   *
   * @param point1 - The first location with latitude and longitude coordinates
   * @param point2 - The second location with latitude and longitude coordinates
   * @returns The distance between the two points in kilometers
   *
   * @remarks
   * The Haversine formula calculates the shortest distance between two points on a sphere.
   * This method assumes:
   * - Latitude values are between -90 and 90 degrees
   * - Longitude values are between -180 and 180 degrees
   * - The Earth is a perfect sphere (small error for most applications)
   *
   * @example
   * ```typescript
   * const hospital = { latitude: 40.7128, longitude: -74.0060 };
   * const patient = { latitude: 40.7580, longitude: -73.9855 };
   * const distance = DistanceCalculator.calculate(hospital, patient);
   * // Returns approximately 7.5 km
   * ```
   *
   * @throws No explicit errors, but will return NaN if invalid coordinates are provided
   */
  static calculate(point1: Location, point2: Location): number {
    const lat1Rad = this.toRadians(point1.latitude);
    const lat2Rad = this.toRadians(point2.latitude);
    const deltaLat = this.toRadians(point2.latitude - point1.latitude);
    const deltaLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Converts degrees to radians.
   *
   * @param degrees - The angle in degrees to convert
   * @returns The angle in radians
   *
   * @remarks
   * This is a utility method used internally by the Haversine formula.
   * The conversion formula is: radians = degrees × (π / 180)
   *
   * @example
   * ```typescript
   * const radians = DistanceCalculator.toRadians(45); // Returns π/4 ≈ 0.7854
   * ```
   *
   * @internal
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
