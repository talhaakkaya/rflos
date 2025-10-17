import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateDistance, generatePathPoints, fetchElevationData, calculateLineOfSight, calculateBearing } from './usePathCalculation';
import { calculateFSPL, calculateFresnelZone } from '../utils/rfCalculations';
import { comparePointGeometry } from '../utils/pointComparison';
import type { Point, PathResult } from '../types';

export function useLOSCalculation(points: Point[]) {
  const [isLoading, setIsLoading] = useState(false);

  // Keep current points in a ref so we can access names without triggering recalculation
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Track geometry with deep comparison
  const pointsGeometryRef = useRef<Array<{ id: string; lat: number; lon: number; height: number }>>([]);
  const [pointsGeometry, setPointsGeometry] = useState<Array<{ id: string; lat: number; lon: number; height: number }>>([]);

  useEffect(() => {
    const newGeometry = points.map(p => ({ id: p.id, lat: p.lat, lon: p.lon, height: p.height }));

    // Deep compare to see if geometry actually changed
    const geometryChanged = comparePointGeometry(newGeometry, pointsGeometryRef.current);

    if (geometryChanged) {
      pointsGeometryRef.current = newGeometry;
      setPointsGeometry(newGeometry);
    }
  }, [points]);

  const calculateLOS = useCallback(async (
    fromId: string,
    toId: string,
    onSuccess: (result: PathResult) => void,
    onError?: (error: string) => void,
    frequency?: number
  ) => {
    const fromPoint = pointsRef.current.find(p => p.id === fromId);
    const toPoint = pointsRef.current.find(p => p.id === toId);

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
        fresnelZone,
        bearing,
        reverseBearing,
        elevationAngle,
        reverseElevationAngle
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
  }, [pointsGeometry]); // Only recreate when geometry changes, not names

  return { calculateLOS, isLoading };
}
