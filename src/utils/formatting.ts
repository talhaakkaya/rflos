/**
 * Formatting utilities for RF and LOS calculations
 */

export interface ClearanceStatus {
  text: string;
  color: string;
  emoji: string;
}

/**
 * Get clearance status and color based on Fresnel zone clearance percentage
 * @param clearancePercent - Clearance percentage (0-100+)
 * @returns Status object with text, color, and emoji
 */
export function getClearanceStatus(clearancePercent: number): ClearanceStatus {
  if (clearancePercent >= 100) {
    return { text: 'Excellent', color: '#00aa00', emoji: '✅' };
  } else if (clearancePercent >= 60) {
    return { text: 'Good', color: '#28a745', emoji: '✓' };
  } else if (clearancePercent >= 20) {
    return { text: 'Marginal', color: '#ff8c00', emoji: '⚠️' };
  } else if (clearancePercent >= 0) {
    return { text: 'Poor', color: '#dc3545', emoji: '⚠️' };
  } else {
    return { text: 'Obstructed', color: '#aa0000', emoji: '❌' };
  }
}

/**
 * Convert bearing (0-360°) to compass direction
 * @param bearing - Bearing in degrees (0-360)
 * @returns Compass direction (N, NNE, NE, etc.)
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}
