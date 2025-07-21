import { getDistance } from 'geolib';

import type { Location } from '../entities/Patient';

/**
 * Utility class for calculating distances between geographic coordinates.
 *
 * @remarks
 * This class uses the geolib library to calculate the great-circle distance
 * between two points on Earth's surface given their longitude and latitude coordinates.
 * The geolib library provides accurate distance calculations using the Haversine formula
 * and other geodesic algorithms.
 *
 * @example
 * ```typescript
 * const nyc = { latitude: 40.7128, longitude: -74.0060 };
 * const la = { latitude: 34.0522, longitude: -118.2437 };
 * const distance = DistanceCalculator.calculate(nyc, la);
 * console.log(`Distance: ${distance.toFixed(2)} km`); // Distance: 3935.75 km
 * ```
 *
 * @see {@link https://github.com/manuelbieh/geolib} for library documentation
 */
export class DistanceCalculator {
  /**
   * Calculates the great-circle distance between two geographic points.
   *
   * @param point1 - The first location with latitude and longitude coordinates
   * @param point2 - The second location with latitude and longitude coordinates
   * @returns The distance between the two points in kilometers
   *
   * @remarks
   * This method uses the geolib library's getDistance function which implements
   * the Haversine formula for accurate distance calculations. The method:
   * - Accepts latitude values between -90 and 90 degrees
   * - Accepts longitude values between -180 and 180 degrees
   * - Returns the distance in meters, which is then converted to kilometers
   *
   * @example
   * ```typescript
   * const hospital = { latitude: 40.7128, longitude: -74.0060 };
   * const patient = { latitude: 40.7580, longitude: -73.9855 };
   * const distance = DistanceCalculator.calculate(hospital, patient);
   * // Returns approximately 7.5 km
   * ```
   */
  static calculate(point1: Location, point2: Location): number {
    const distanceInMeters = getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude },
    );

    return distanceInMeters / 1000;
  }
}
