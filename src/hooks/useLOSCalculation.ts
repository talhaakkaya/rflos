import { useState } from 'react';
import { calculateDistance, generatePathPoints, fetchElevationData, calculateLineOfSight } from './usePathCalculation';
import { calculateFSPL, calculateFresnelZone } from '../utils/rfCalculations';
import type { Point, PathResult } from '../types';

export function useLOSCalculation(points: Point[]) {
  const [isLoading, setIsLoading] = useState(false);

  const calculateLOS = async (
    fromId: string,
    toId: string,
    onSuccess: (result: PathResult) => void,
    onError?: (error: string) => void,
    frequency?: number
  ) => {
    const fromPoint = points.find(p => p.id === fromId);
    const toPoint = points.find(p => p.id === toId);

    if (!fromPoint || !toPoint) {
      onError?.('Invalid points selected');
      return null;
    }

    setIsLoading(true);

    try {
      // Calculate distance
      const distance = calculateDistance(
        fromPoint.lat,
        fromPoint.lon,
        toPoint.lat,
        toPoint.lon
      );

      // Generate path points
      const pathPoints = generatePathPoints(
        fromPoint.lat,
        fromPoint.lon,
        toPoint.lat,
        toPoint.lon,
        50
      );

      // Fetch elevation data
      const elevations = await fetchElevationData(pathPoints);

      // Calculate distances for each point
      const distances = pathPoints.map((p) =>
        calculateDistance(fromPoint.lat, fromPoint.lon, p.lat, p.lon)
      );

      // Calculate line of sight
      const los = calculateLineOfSight(
        distances,
        elevations,
        fromPoint.height,
        toPoint.height
      );

      // Calculate RF metrics if frequency is provided
      let fspl: number | undefined;
      let fresnelZone: PathResult['fresnelZone'] | undefined;

      if (frequency) {
        // Calculate Free Space Path Loss
        fspl = calculateFSPL(distance, frequency);

        // Calculate Fresnel Zone
        fresnelZone = calculateFresnelZone(
          distances,
          elevations,
          los.losLine,
          distance,
          frequency
        );
      }

      const result: PathResult = {
        distance,
        elevations,
        distances,
        los,
        height1: fromPoint.height,
        height2: toPoint.height,
        name1: fromPoint.name,
        name2: toPoint.name,
        pathPoints,
        frequency,
        fspl,
        fresnelZone
      };

      onSuccess(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { calculateLOS, isLoading };
}
