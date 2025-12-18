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
  // Cumulative angle visibility (more accurate)
  visibility: {
    isVisible: boolean;           // True if endpoint is visible from start
    blockedAtDistance: number | null;  // Distance where first blockage occurs
    blockedByIndex: number | null;     // Index of the blocking terrain point
    horizonAngle: number;         // Final horizon angle from observer (degrees)
    targetAngle: number;          // Angle to target point (degrees)
    blockedByTerrain: boolean;    // True if blocked by terrain, false if only by Earth's curvature
  };
}

interface ElevationAPIResult {
  elevation: number;
  latitude: number;
  longitude: number;
}

interface ElevationAPIResponse {
  results: ElevationAPIResult[];
}

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

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);

  // Convert to degrees and normalize to 0-360
  const bearing = (θ * 180 / Math.PI + 360) % 360;

  return bearing;
}

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

export async function fetchElevationData(points: PathPoint[]): Promise<number[]> {
  const locations = points.map(p => ({latitude: p.lat, longitude: p.lon}));

  try {
    const response = await fetch('https://elevation.qso.app/api/v1/lookup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({locations})
    });

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Invalid coordinates provided');
        case 429:
          throw new Error('Rate limit exceeded. Please wait a moment and try again');
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error('Elevation service is temporarily unavailable');
        default:
          throw new Error(`Elevation API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: ElevationAPIResponse = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Elevation API returned invalid data structure');
    }

    return data.results.map(r => r.elevation);
  } catch (error) {
    console.error('Error fetching elevation:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach elevation API');
    }
    throw error;
  }
}

export interface RadioHorizonResult {
  horizon1: number;        // Radio horizon distance from point A (km)
  horizon2: number;        // Radio horizon distance from point B (km)
  combined: number;        // Total theoretical LOS range (km)
  exceedsHorizon: boolean; // True if path distance > combined horizon
  excess: number;          // How much path exceeds horizon (km), 0 if within range
}

export function calculateRadioHorizon(
  height1: number,  // Total height above sea level at point A (ground + antenna) in meters
  height2: number,  // Total height above sea level at point B (ground + antenna) in meters
  distance: number, // Path distance (km)
  kFactor: number = 4/3
): RadioHorizonResult {
  // Radio horizon formula: d = √(2 × K × R × h)
  // Derived from Earth geometry with atmospheric refraction
  const earthRadius = 6371; // km
  const horizon1 = Math.sqrt(2 * kFactor * earthRadius * (height1 / 1000)); // h converted to km
  const horizon2 = Math.sqrt(2 * kFactor * earthRadius * (height2 / 1000)); // h converted to km
  const combined = horizon1 + horizon2;
  const exceedsHorizon = distance > combined;
  const excess = exceedsHorizon ? distance - combined : 0;

  return {
    horizon1,
    horizon2,
    combined,
    exceedsHorizon,
    excess
  };
}

/**
 * Cumulative angle visibility calculation (accurate method)
 *
 * Algorithm:
 * 1. curvatureDrop = d² / (2 × K × R)
 * 2. effectiveHeight = terrainElevation - curvatureDrop
 * 3. angle = atan2(effectiveHeight - observerHeight, distance)
 * 4. Track cumulativeMaxAngle as we scan from observer outward
 * 5. Target is visible if targetAngle >= cumulativeMaxAngle
 */
export function calculateCumulativeAngleVisibility(
  distances: number[],
  elevations: number[],
  height1: number,
  height2: number,
  kFactor: number = 4/3
): {
  isVisible: boolean;
  blockedAtDistance: number | null;
  blockedByIndex: number | null;
  horizonAngle: number;
  targetAngle: number;
  blockedByTerrain: boolean;
} {
  const earthRadius = 6371000;
  const effectiveRadius = kFactor * earthRadius;
  const observerHeight = elevations[0] + height1;

  // Calculate target angle (including antenna height at target)
  const targetDistanceM = distances[distances.length - 1] * 1000;
  const targetCurvatureDrop = (targetDistanceM * targetDistanceM) / (2 * effectiveRadius);
  const targetTotalHeight = elevations[elevations.length - 1] + height2;
  const targetEffectiveHeight = targetTotalHeight - targetCurvatureDrop;
  const targetAngle = Math.atan2(targetEffectiveHeight - observerHeight, targetDistanceM) * (180 / Math.PI);

  // Scan path and track cumulative max angle (horizon)
  let cumulativeMaxAngle = -90;
  let horizonIndex = -1;

  for (let i = 1; i < distances.length - 1; i++) {
    const distanceM = distances[i] * 1000;
    const curvatureDrop = (distanceM * distanceM) / (2 * effectiveRadius);
    const effectiveHeight = elevations[i] - curvatureDrop;
    const angle = Math.atan2(effectiveHeight - observerHeight, distanceM) * (180 / Math.PI);

    if (angle > cumulativeMaxAngle) {
      cumulativeMaxAngle = angle;
      horizonIndex = i;
    }
  }

  // Target is visible if its angle is >= the cumulative horizon angle
  // 0.005° tolerance for elevation data precision
  const isVisible = targetAngle >= cumulativeMaxAngle - 0.005;

  let blockedAtDistance: number | null = null;
  let blockedByIndex: number | null = null;
  let blockedByTerrain = false;

  if (!isVisible) {
    blockedAtDistance = horizonIndex > 0 ? distances[horizonIndex] : null;
    blockedByIndex = horizonIndex > 0 ? horizonIndex : null;

    // Determine if blocked by terrain or just Earth's curvature
    // Compare actual horizon angle vs what it would be over flat terrain
    if (horizonIndex > 0) {
      const baselineElev = Math.min(elevations[0], elevations[elevations.length - 1]);
      const horizonDistanceM = distances[horizonIndex] * 1000;
      const horizonCurvatureDrop = (horizonDistanceM * horizonDistanceM) / (2 * effectiveRadius);

      // What would the angle be if terrain was flat at baseline?
      const flatEffectiveHeight = baselineElev - horizonCurvatureDrop;
      const flatAngle = Math.atan2(flatEffectiveHeight - observerHeight, horizonDistanceM) * (180 / Math.PI);

      // If actual horizon angle is higher than flat angle, terrain is causing the blockage
      blockedByTerrain = cumulativeMaxAngle > flatAngle + 0.01;
    }
  }

  return {
    isVisible,
    blockedAtDistance,
    blockedByIndex,
    horizonAngle: cumulativeMaxAngle,
    targetAngle,
    blockedByTerrain
  };
}

export function calculateLineOfSight(
  distances: number[],
  elevations: number[],
  height1: number,
  height2: number,
  kFactor: number = 4/3
): LineOfSightResult {
  const n = distances.length;
  const losLine: number[] = [];
  const startElev = elevations[0] + height1;
  const endElev = elevations[n-1] + height2;
  const totalDistance = distances[n-1];

  // Earth's effective radius for RF propagation (k-factor for atmospheric refraction)
  // k = 4/3 is standard, but can range from 1.0 (no refraction) to 5+ (ducting)
  const earthRadius = 6371 * kFactor; // km

  for (let i = 0; i < n; i++) {
    const fraction = i / (n - 1);
    const straightLineElev = startElev + (endElev - startElev) * fraction;

    // Earth's curvature offset: h = d1 * d2 / (2 * R)
    // where d1 is distance from start, d2 is distance from end
    const d1 = distances[i];
    const d2 = totalDistance - d1;
    const curvatureOffset = (d1 * d2) / (2 * earthRadius);

    // Subtract curvature (line curves down from Earth's surface)
    losLine.push(straightLineElev - curvatureOffset);
  }

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

  // Calculate visibility using cumulative angle method
  const visibility = calculateCumulativeAngleVisibility(
    distances,
    elevations,
    height1,
    height2,
    kFactor
  );

  return {
    losLine,
    isBlocked,
    blockDistance,
    maxObstacle,
    startElev,
    endElev,
    visibility
  };
}
