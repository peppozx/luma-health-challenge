import { Location } from '../entities/Patient';

export class DistanceCalculator {
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculates the distance between two points using the Haversine formula
   * @param point1 First location
   * @param point2 Second location
   * @returns Distance in kilometers
   */
  static calculate(point1: Location, point2: Location): number {
    const lat1Rad = this.toRadians(point1.latitude);
    const lat2Rad = this.toRadians(point2.latitude);
    const deltaLat = this.toRadians(point2.latitude - point1.latitude);
    const deltaLon = this.toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_KM * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}