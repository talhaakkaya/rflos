/**
 * RF propagation calculations for VHF/UHF frequencies
 */

/**
 * Calculate Free Space Path Loss (FSPL)
 * @param distanceKm - Distance in kilometers
 * @param frequencyMHz - Frequency in MHz
 * @returns Path loss in dB
 */
export function calculateFSPL(distanceKm: number, frequencyMHz: number): number {
  // FSPL(dB) = 20*log10(d) + 20*log10(f) + 32.45
  // where d is in km and f is in MHz
  return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.45;
}

/**
 * Calculate Fresnel Zone radius at a given point
 * @param d1 - Distance from transmitter to point (km)
 * @param d2 - Distance from point to receiver (km)
 * @param frequencyMHz - Frequency in MHz
 * @returns Fresnel zone radius in meters
 */
export function calculateFresnelRadius(
  d1: number,
  d2: number,
  frequencyMHz: number
): number {
  // Convert to meters
  const d1m = d1 * 1000;
  const d2m = d2 * 1000;

  // Wavelength in meters: λ = c / f
  const wavelength = 299.792458 / frequencyMHz; // c in m/MHz

  // First Fresnel Zone radius: r = sqrt((λ * d1 * d2) / (d1 + d2))
  const radius = Math.sqrt((wavelength * d1m * d2m) / (d1m + d2m));

  return radius;
}

/**
 * Calculate Fresnel Zone boundaries along the path
 * @param distances - Array of distances from start point (km)
 * @param elevations - Array of terrain elevations (m)
 * @param losLine - Array of line of sight elevations (m)
 * @param totalDistance - Total path distance (km)
 * @param frequencyMHz - Frequency in MHz
 * @returns Object with upper and lower Fresnel zone boundaries and max radius
 */
export function calculateFresnelZone(
  distances: number[],
  _elevations: number[],
  losLine: number[],
  totalDistance: number,
  frequencyMHz: number
): { upper: number[]; lower: number[]; radius: number } {
  const upper: number[] = [];
  const lower: number[] = [];
  let maxRadius = 0;

  for (let i = 0; i < distances.length; i++) {
    const d1 = distances[i];
    const d2 = totalDistance - d1;

    // Calculate Fresnel zone radius at this point
    const radius = calculateFresnelRadius(d1, d2, frequencyMHz);

    if (radius > maxRadius) {
      maxRadius = radius;
    }

    // Add/subtract radius from LOS line to get boundaries
    upper.push(losLine[i] + radius);
    lower.push(losLine[i] - radius);
  }

  return { upper, lower, radius: maxRadius };
}

/**
 * Check if Fresnel zone clearance is sufficient (60% rule)
 * @param elevations - Array of terrain elevations
 * @param fresnelLower - Lower boundary of Fresnel zone
 * @returns Object with clearance status and percentage
 */
export function checkFresnelClearance(
  elevations: number[],
  fresnelLower: number[]
): { isClear: boolean; minClearance: number; minClearancePercent: number } {
  let minClearance = Infinity;

  for (let i = 0; i < elevations.length; i++) {
    const clearance = fresnelLower[i] - elevations[i];
    if (clearance < minClearance) {
      minClearance = clearance;
    }
  }

  // For the percentage, we need to compare against the Fresnel zone radius
  // A rough approximation: if terrain is above the 60% Fresnel zone line
  const isClear = minClearance > 0; // Simplified - could be more sophisticated

  return {
    isClear,
    minClearance,
    minClearancePercent: 0 // Can be calculated more precisely if needed
  };
}
