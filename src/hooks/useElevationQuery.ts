import { useQuery } from '@tanstack/react-query';
import { fetchElevationData, type PathPoint } from './usePathCalculation';

function getElevationCacheKey(points: PathPoint[]): string {
  // Round to 6 decimal places for cache key stability
  return points
    .map(p => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`)
    .join('|');
}

export function useElevationQuery(pathPoints: PathPoint[], enabled: boolean = true) {
  const cacheKey = getElevationCacheKey(pathPoints);

  return useQuery({
    queryKey: ['elevation', cacheKey],
    queryFn: () => fetchElevationData(pathPoints),
    enabled: enabled && pathPoints.length > 0,
    staleTime: Infinity, // Elevation data never changes
    gcTime: 1000 * 60 * 30,
  });
}
