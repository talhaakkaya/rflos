/**
 * Knife-Edge Diffraction Calculations
 * Based on ITU-R P.526 recommendations
 */

/**
 * Obstacle information for diffraction calculations
 */
export interface Obstacle {
  index: number;           // Index in the path points array
  distance: number;        // Distance from start point (km)
  height: number;          // Obstacle height above LOS line (m)
  terrainHeight: number;   // Actual terrain elevation (m)
  losHeight: number;       // LOS line height at this point (m)
  diffractionLoss: number; // Diffraction loss in dB
  fresnelParameter: number; // Fresnel-Kirchhoff diffraction parameter (v)
}

/**
 * Calculate the Fresnel-Kirchhoff diffraction parameter (v)
 * @param h - Obstacle height above LOS line (m)
 * @param d1 - Distance from transmitter to obstacle (km)
 * @param d2 - Distance from obstacle to receiver (km)
 * @param wavelengthM - Wavelength in meters
 * @returns Fresnel-Kirchhoff parameter (dimensionless)
 */
export function calculateFresnelParameter(
  h: number,
  d1: number,
  d2: number,
  wavelengthM: number
): number {
  // Convert distances to meters
  const d1m = d1 * 1000;
  const d2m = d2 * 1000;

  // v = h * sqrt(2 * (d1 + d2) / (λ * d1 * d2))
  const v = h * Math.sqrt((2 * (d1m + d2m)) / (wavelengthM * d1m * d2m));

  return v;
}

/**
 * Calculate knife-edge diffraction loss using ITU-R P.526 approximation
 * @param v - Fresnel-Kirchhoff diffraction parameter
 * @returns Diffraction loss in dB (always >= 0)
 */
export function calculateDiffractionLoss(v: number): number {
  // ITU-R P.526 knife-edge diffraction loss formula
  let loss: number;

  if (v <= -0.78) {
    // No significant diffraction loss (obstacle well below LOS)
    loss = 0;
  } else {
    // Approximation valid for v > -0.78
    // L(v) = 6.9 + 20*log10(sqrt((v - 0.1)^2 + 1) + v - 0.1)
    const term = Math.sqrt(Math.pow(v - 0.1, 2) + 1) + v - 0.1;
    loss = 6.9 + 20 * Math.log10(term);
  }

  return Math.max(0, loss); // Loss cannot be negative
}

/**
 * Detect obstacles along the path (terrain points above LOS line)
 * @param distances - Array of distances from start point (km)
 * @param elevations - Array of terrain elevations (m)
 * @param losLine - Array of LOS line heights (m)
 * @param frequencyMHz - Frequency in MHz
 * @returns Array of obstacles with diffraction parameters
 */
export function detectObstacles(
  distances: number[],
  elevations: number[],
  losLine: number[],
  frequencyMHz: number
): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const totalDistance = distances[distances.length - 1];

  // Calculate wavelength
  const speedOfLight = 299.792458; // m/MHz (speed of light)
  const wavelengthM = speedOfLight / frequencyMHz;

  // Check each intermediate point (skip start and end)
  for (let i = 1; i < elevations.length - 1; i++) {
    const heightAboveLOS = elevations[i] - losLine[i];

    // Only consider points where terrain is above or very close to LOS line
    // Include points within small negative margin for near-grazing cases
    if (heightAboveLOS > -5) { // Within 5m below LOS line
      const d1 = distances[i];
      const d2 = totalDistance - d1;

      // Calculate Fresnel parameter
      const v = calculateFresnelParameter(heightAboveLOS, d1, d2, wavelengthM);

      // Calculate diffraction loss
      const diffractionLoss = calculateDiffractionLoss(v);

      // Only add as obstacle if there's actual obstruction (positive v)
      if (v > -0.78) {
        obstacles.push({
          index: i,
          distance: distances[i],
          height: heightAboveLOS,
          terrainHeight: elevations[i],
          losHeight: losLine[i],
          diffractionLoss,
          fresnelParameter: v
        });
      }
    }
  }

  return obstacles;
}

/**
 * Calculate total diffraction loss for multiple obstacles
 * Uses the Bullington method for multiple knife-edges
 * @param obstacles - Array of detected obstacles
 * @returns Total diffraction loss in dB
 */
export function calculateMultipleObstacleLoss(obstacles: Obstacle[]): number {
  if (obstacles.length === 0) {
    return 0;
  }

  if (obstacles.length === 1) {
    return obstacles[0].diffractionLoss;
  }

  // For multiple obstacles, use simplified approach:
  // Find the obstacle with maximum Fresnel parameter (most significant)
  // and add a fraction of the other obstacles' losses

  // Sort by Fresnel parameter (descending)
  const sortedObstacles = [...obstacles].sort((a, b) => b.fresnelParameter - a.fresnelParameter);

  // Primary obstacle (largest v)
  const primaryLoss = sortedObstacles[0].diffractionLoss;

  // Add secondary obstacles with reduced weighting
  let secondaryLoss = 0;
  for (let i = 1; i < sortedObstacles.length; i++) {
    // Each additional obstacle contributes less (geometric decay)
    const weight = Math.pow(0.5, i);
    secondaryLoss += sortedObstacles[i].diffractionLoss * weight;
  }

  return primaryLoss + secondaryLoss;
}

/**
 * Find the main (most significant) obstacle
 * @param obstacles - Array of obstacles
 * @returns The obstacle with the highest Fresnel parameter, or null if no obstacles
 */
export function findMainObstacle(obstacles: Obstacle[]): Obstacle | null {
  if (obstacles.length === 0) {
    return null;
  }

  return obstacles.reduce((max, current) =>
    current.fresnelParameter > max.fresnelParameter ? current : max
  );
}

/**
 * Calculate clearance angle over an obstacle
 * @param h - Obstacle height above LOS (m)
 * @param d - Distance to obstacle (km)
 * @returns Clearance angle in degrees (negative means obstacle blocks LOS)
 */
export function calculateClearanceAngle(h: number, d: number): number {
  const dMeters = d * 1000;
  // tan(angle) = h / d
  const angleRad = Math.atan(h / dMeters);
  return angleRad * 180 / Math.PI;
}
