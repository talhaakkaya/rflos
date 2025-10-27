/**
 * Formatting utilities for RF and LOS calculations
 */

import { CheckCircle2, Check, AlertTriangle, XCircle } from 'lucide-react';

export interface ClearanceStatus {
  text: string;
  color: string;
  icon: React.ReactNode;
}

/**
 * Get clearance status and color based on Fresnel zone clearance percentage
 * @param clearancePercent - Clearance percentage (0-100+)
 * @returns Status object with text, color, and icon component
 */
export function getClearanceStatus(clearancePercent: number): ClearanceStatus {
  if (clearancePercent >= 100) {
    return { text: 'Excellent', color: '#00aa00', icon: <CheckCircle2 size={16} /> };
  } else if (clearancePercent >= 60) {
    return { text: 'Good', color: '#28a745', icon: <Check size={16} /> };
  } else if (clearancePercent >= 20) {
    return { text: 'Marginal', color: '#ff8c00', icon: <AlertTriangle size={16} /> };
  } else if (clearancePercent >= 0) {
    return { text: 'Poor', color: '#dc3545', icon: <AlertTriangle size={16} /> };
  } else {
    return { text: 'Obstructed', color: '#aa0000', icon: <XCircle size={16} /> };
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
