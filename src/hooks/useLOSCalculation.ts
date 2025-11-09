import { useMemo } from 'react';
import { calculateDistance, generatePathPoints, calculateLineOfSight, calculateBearing } from './usePathCalculation';
import { calculateFSPL, calculateFresnelZone } from '../utils/rfCalculations';
import { detectObstacles, calculateMultipleObstacleLoss, findMainObstacle } from '../utils/diffraction';
import { useElevationQuery } from './useElevationQuery';
import type { Point, PathResult } from '../types';

interface LOSCalculationParams {
  fromId: string;
  toId: string;
  points: Point[];
  frequency?: number;
  kFactor?: number;
  enabled?: boolean;
}

export function useLOSCalculation({
  fromId,
  toId,
  points,
  frequency,
  kFactor = 4/3,
  enabled = true
}: LOSCalculationParams) {
  const fromPoint = points.find(p => p.id === fromId);
  const toPoint = points.find(p => p.id === toId);

  // Generate path points (pure calculation, no side effects)
  const pathPoints = useMemo(() => {
    if (!fromPoint || !toPoint) return [];

    return generatePathPoints(
      fromPoint.lat,
      fromPoint.lon,
      toPoint.lat,
      toPoint.lon,
      50
    );
  }, [fromPoint?.lat, fromPoint?.lon, toPoint?.lat, toPoint?.lon]);

  // Fetch elevation data with React Query (cached!)
  const {
    data: elevations,
    isLoading,
    error
  } = useElevationQuery(pathPoints, enabled && !!fromPoint && !!toPoint);

  // Calculate result when elevation data is available
  const result = useMemo((): PathResult | null => {
    if (!fromPoint || !toPoint || !elevations) return null;

    try {
      // Calculate distance
      const distance = calculateDistance(
        fromPoint.lat,
        fromPoint.lon,
        toPoint.lat,
        toPoint.lon
      );

      // Calculate distances for each point
      const distances = pathPoints.map((p) =>
        calculateDistance(fromPoint.lat, fromPoint.lon, p.lat, p.lon)
      );

      // Calculate line of sight
      const los = calculateLineOfSight(
        distances,
        elevations,
        fromPoint.height,
        toPoint.height,
        kFactor
      );

      // Calculate RF metrics if frequency is provided
      let fspl: number | undefined;
      let fresnelZone: PathResult['fresnelZone'] | undefined;
      let diffraction: PathResult['diffraction'] | undefined;

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

        // Calculate knife-edge diffraction
        const obstacles = detectObstacles(
          distances,
          elevations,
          los.losLine,
          frequency
        );
        const totalLoss = calculateMultipleObstacleLoss(obstacles);
        const mainObstacle = findMainObstacle(obstacles);

        diffraction = {
          obstacles,
          totalLoss,
          mainObstacle
        };
      }

      // Calculate bearing/azimuth
      const bearing = calculateBearing(
        fromPoint.lat,
        fromPoint.lon,
        toPoint.lat,
        toPoint.lon
      );
      const reverseBearing = calculateBearing(
        toPoint.lat,
        toPoint.lon,
        fromPoint.lat,
        fromPoint.lon
      );

      // Calculate elevation angles (vertical takeoff angle)
      const elevation1WithHeight = elevations[0] + fromPoint.height;
      const elevation2WithHeight = elevations[elevations.length - 1] + toPoint.height;
      const distanceInMeters = distance * 1000;

      // Positive angle = point up, negative = point down
      const elevationAngle = Math.atan2(elevation2WithHeight - elevation1WithHeight, distanceInMeters) * 180 / Math.PI;
      const reverseElevationAngle = Math.atan2(elevation1WithHeight - elevation2WithHeight, distanceInMeters) * 180 / Math.PI;

      return {
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
        fresnelZone,
        bearing,
        reverseBearing,
        elevationAngle,
        reverseElevationAngle,
        diffraction,
        kFactor
      };
    } catch (err) {
      console.error('LOS calculation error:', err);
      return null;
    }
  }, [fromPoint, toPoint, elevations, pathPoints, frequency, kFactor]);

  return {
    result,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error occurred') : null
  };
}
