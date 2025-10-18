/**
 * Atmospheric refraction (K-Factor) utilities for Line of Sight calculations
 */

/**
 * Get recommended k-factor based on climate and conditions
 * @param climate - Climate type
 * @param condition - Weather condition
 * @returns Recommended k-factor value
 */
export function getRecommendedKFactor(
  climate: 'temperate' | 'tropical' | 'desert' | 'arctic',
  condition: 'clear' | 'normal' | 'inversion' | 'ducting'
): number {
  // Standard atmospheric refraction
  if (condition === 'clear' || condition === 'normal') {
    return 4/3; // 1.333... standard atmosphere
  }

  // Temperature inversion (enhanced refraction)
  if (condition === 'inversion') {
    if (climate === 'tropical' || climate === 'desert') {
      return 1.5; // Strong inversion common in hot climates
    }
    return 1.4; // Moderate inversion
  }

  // Ducting conditions (very strong refraction)
  if (condition === 'ducting') {
    return 5.0; // Can be even higher, but 5 is practical limit for calculations
  }

  return 4/3; // Default
}

/**
 * Get description of k-factor effect on LOS
 * @param kFactor - K-factor value
 * @returns Description of refraction effect
 */
export function getKFactorDescription(kFactor: number): string {
  if (kFactor < 1.2) {
    return 'Subrefractive - Signal bends away from Earth (shorter range)';
  } else if (kFactor < 1.35) {
    return 'Standard atmosphere - Normal refraction conditions';
  } else if (kFactor < 1.6) {
    return 'Superrefractive - Enhanced propagation (longer range)';
  } else {
    return 'Ducting - Extreme range extension possible';
  }
}
