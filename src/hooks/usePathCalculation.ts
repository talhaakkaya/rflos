// Types
export interface PathPoint {
  lat: number;
  lon: number;
}

export interface LineOfSightResult {
  losLine: number[];
  isBlocked: boolean;
  blockDistance: number | null;
  maxObstacle: number;
  startElev: number;
  endElev: number;
}

interface ElevationAPIResult {
  elevation: number;
  latitude: number;
  longitude: number;
}

interface ElevationAPIResponse {
  results: ElevationAPIResult[];
}

// Calculate distance using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generate points along the path
export function generatePathPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints: number = 50
): PathPoint[] {
  const points: PathPoint[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = lat1 + (lat2 - lat1) * fraction;
    const lon = lon1 + (lon2 - lon1) * fraction;
    points.push({lat, lon});
  }
  return points;
}

// Fetch elevation data from Open-Elevation API
export async function fetchElevationData(points: PathPoint[]): Promise<number[]> {
  const locations = points.map(p => ({latitude: p.lat, longitude: p.lon}));

  try {
    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({locations})
    });

    const data: ElevationAPIResponse = await response.json();
    return data.results.map(r => r.elevation);
  } catch (error) {
    console.error('Error fetching elevation:', error);
    throw error;
  }
}

// Calculate line of sight with Earth's curvature
export function calculateLineOfSight(
  distances: number[],
  elevations: number[],
  height1: number,
  height2: number
): LineOfSightResult {
  const n = distances.length;
  const losLine: number[] = [];
  const startElev = elevations[0] + height1;
  const endElev = elevations[n-1] + height2;
  const totalDistance = distances[n-1];

  // Earth's effective radius for RF propagation (4/3 rule for atmospheric refraction)
  const earthRadius = 6371 * 4 / 3; // km

  // Calculate LOS line with Earth's curvature
  for (let i = 0; i < n; i++) {
    const fraction = i / (n - 1);

    // Straight-line elevation at this point
    const straightLineElev = startElev + (endElev - startElev) * fraction;

    // Earth's curvature offset: h = d1 * d2 / (2 * R)
    // where d1 is distance from start, d2 is distance from end
    const d1 = distances[i];
    const d2 = totalDistance - d1;
    const curvatureOffset = (d1 * d2) / (2 * earthRadius);

    // Subtract curvature (line curves down from Earth's surface)
    losLine.push(straightLineElev - curvatureOffset);
  }

  // Check for obstructions
  let isBlocked = false;
  let blockDistance: number | null = null;
  let maxObstacle = 0;

  for (let i = 1; i < n - 1; i++) {
    const clearance = losLine[i] - elevations[i];
    if (clearance < 0) {
      isBlocked = true;
      if (blockDistance === null) {
        blockDistance = distances[i];
      }
      maxObstacle = Math.max(maxObstacle, Math.abs(clearance));
    }
  }

  return {
    losLine,
    isBlocked,
    blockDistance,
    maxObstacle,
    startElev,
    endElev
  };
}
