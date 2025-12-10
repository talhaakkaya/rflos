import { useMemo } from 'react';
import { calculateDistance, generatePathPoints, calculateLineOfSight, calculateBearing, calculateRadioHorizon } from './usePathCalculation';
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

  const {
    data: elevations,
    isLoading,
    error
  } = useElevationQuery(pathPoints, enabled && !!fromPoint && !!toPoint);

  const result = useMemo((): PathResult | null => {
    if (!fromPoint || !toPoint || !elevations) return null;

    try {
      const distance = calculateDistance(
        fromPoint.lat,
        fromPoint.lon,
        toPoint.lat,
        toPoint.lon
      );

      const distances = pathPoints.map((p) =>
        calculateDistance(fromPoint.lat, fromPoint.lon, p.lat, p.lon)
      );

      const los = calculateLineOfSight(
        distances,
        elevations,
        fromPoint.height,
        toPoint.height,
        kFactor
      );

      let fspl: number | undefined;
      let fresnelZone: PathResult['fresnelZone'] | undefined;
      let diffraction: PathResult['diffraction'] | undefined;

      if (frequency) {
        fspl = calculateFSPL(distance, frequency);

        fresnelZone = calculateFresnelZone(
          distances,
          elevations,
          los.losLine,
          distance,
          frequency
        );

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

      const elevation1WithHeight = elevations[0] + fromPoint.height;
      const elevation2WithHeight = elevations[elevations.length - 1] + toPoint.height;
      const distanceInMeters = distance * 1000;

      // Calculate elevation angles accounting for Earth's curvature
      // curvatureDrop = d² / (2 × K × R)
      const effectiveRadius = kFactor * 6371000; // meters
      const curvatureDrop = (distanceInMeters * distanceInMeters) / (2 * effectiveRadius);

      // Effective height of target from observer's perspective
      const target2EffectiveHeight = elevation2WithHeight - curvatureDrop;
      const target1EffectiveHeight = elevation1WithHeight - curvatureDrop;

      // Positive angle = point up, negative = point down
      const elevationAngle = Math.atan2(target2EffectiveHeight - elevation1WithHeight, distanceInMeters) * 180 / Math.PI;
      const reverseElevationAngle = Math.atan2(target1EffectiveHeight - elevation2WithHeight, distanceInMeters) * 180 / Math.PI;

      // Calculate radio horizon using total height above sea level (ground + antenna)
      const radioHorizon = calculateRadioHorizon(
        elevation1WithHeight,  // ground elevation + antenna height
        elevation2WithHeight,  // ground elevation + antenna height
        distance,
        kFactor
      );

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
        kFactor,
        radioHorizon
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
