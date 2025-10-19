/**
 * Maidenhead Grid Locator System Utilities
 * Used by amateur radio operators to specify geographic locations
 * Format: AA00aa00 (field, square, subsquare, extended)
 */

/**
 * Convert latitude and longitude to Maidenhead grid locator
 * @param lat Latitude (-90 to 90)
 * @param lon Longitude (-180 to 180)
 * @param precision Number of characters (4, 6, or 8)
 * @returns Grid locator string (e.g., "KN41bo34")
 */
export function latLonToGridLocator(lat: number, lon: number, precision: 4 | 6 | 8 = 6): string {
  // Normalize coordinates
  let adjustedLon = lon + 180;
  let adjustedLat = lat + 90;

  // Field (first 2 characters - uppercase letters)
  const fieldLon = Math.floor(adjustedLon / 20);
  const fieldLat = Math.floor(adjustedLat / 10);
  const field = String.fromCharCode(65 + fieldLon) + String.fromCharCode(65 + fieldLat);

  if (precision === 4) {
    // Square (2 digits)
    adjustedLon = adjustedLon % 20;
    adjustedLat = adjustedLat % 10;
    const squareLon = Math.floor(adjustedLon / 2);
    const squareLat = Math.floor(adjustedLat / 1);
    return field + squareLon + squareLat;
  }

  // Square (2 digits)
  adjustedLon = adjustedLon % 20;
  adjustedLat = adjustedLat % 10;
  const squareLon = Math.floor(adjustedLon / 2);
  const squareLat = Math.floor(adjustedLat / 1);
  const square = String(squareLon) + String(squareLat);

  if (precision === 6) {
    // Subsquare (2 lowercase letters)
    adjustedLon = (adjustedLon % 2) * 12;
    adjustedLat = (adjustedLat % 1) * 24;
    const subsquareLon = Math.floor(adjustedLon);
    const subsquareLat = Math.floor(adjustedLat);
    const subsquare = String.fromCharCode(97 + subsquareLon) + String.fromCharCode(97 + subsquareLat);
    return field + square + subsquare;
  }

  // Subsquare (2 lowercase letters)
  adjustedLon = (adjustedLon % 2) * 12;
  adjustedLat = (adjustedLat % 1) * 24;
  const subsquareLon = Math.floor(adjustedLon);
  const subsquareLat = Math.floor(adjustedLat);
  const subsquare = String.fromCharCode(97 + subsquareLon) + String.fromCharCode(97 + subsquareLat);

  // Extended square (2 digits) - precision 8
  adjustedLon = (adjustedLon % 1) * 10;
  adjustedLat = (adjustedLat % 1) * 10;
  const extLon = Math.floor(adjustedLon);
  const extLat = Math.floor(adjustedLat);
  const extended = String(extLon) + String(extLat);

  return field + square + subsquare + extended;
}

/**
 * Convert Maidenhead grid locator to latitude and longitude
 * Returns the center point of the grid square
 * @param grid Grid locator string (4, 6, or 8 characters)
 * @returns Object with lat and lon, or null if invalid
 */
export function gridLocatorToLatLon(grid: string): { lat: number; lon: number } | null {
  // Validate and normalize input
  const normalized = grid.trim().toUpperCase();

  if (!validateGridLocator(normalized)) {
    return null;
  }

  let lon = -180;
  let lat = -90;

  // Field (first 2 characters)
  const fieldLon = normalized.charCodeAt(0) - 65;
  const fieldLat = normalized.charCodeAt(1) - 65;
  lon += fieldLon * 20;
  lat += fieldLat * 10;

  if (normalized.length >= 4) {
    // Square (2 digits)
    const squareLon = parseInt(normalized[2]);
    const squareLat = parseInt(normalized[3]);
    lon += squareLon * 2;
    lat += squareLat * 1;
  }

  if (normalized.length >= 6) {
    // Subsquare (2 letters)
    const subsquareLon = normalized.charCodeAt(4) - 65;
    const subsquareLat = normalized.charCodeAt(5) - 65;
    lon += subsquareLon * (2 / 24);
    lat += subsquareLat * (1 / 24);
  }

  if (normalized.length >= 8) {
    // Extended square (2 digits)
    const extLon = parseInt(normalized[6]);
    const extLat = parseInt(normalized[7]);
    lon += extLon * (2 / 240);
    lat += extLat * (1 / 240);
  }

  // Calculate center of the grid square
  const lonWidth = normalized.length >= 8 ? (2 / 240) :
                   normalized.length >= 6 ? (2 / 24) :
                   normalized.length >= 4 ? 2 : 20;
  const latHeight = normalized.length >= 8 ? (1 / 240) :
                    normalized.length >= 6 ? (1 / 24) :
                    normalized.length >= 4 ? 1 : 10;

  lon += lonWidth / 2;
  lat += latHeight / 2;

  return { lat, lon };
}

/**
 * Validate a Maidenhead grid locator string
 * @param grid Grid locator string
 * @returns true if valid format
 */
export function validateGridLocator(grid: string): boolean {
  const normalized = grid.trim().toUpperCase();

  // Must be 2, 4, 6, or 8 characters
  if (![2, 4, 6, 8].includes(normalized.length)) {
    return false;
  }

  // First 2 characters: uppercase letters A-R
  if (!/^[A-R]{2}/.test(normalized.substring(0, 2))) {
    return false;
  }

  // Characters 3-4 (if present): digits 0-9
  if (normalized.length >= 4) {
    if (!/^[0-9]{2}/.test(normalized.substring(2, 4))) {
      return false;
    }
  }

  // Characters 5-6 (if present): letters A-X
  if (normalized.length >= 6) {
    if (!/^[A-X]{2}/.test(normalized.substring(4, 6))) {
      return false;
    }
  }

  // Characters 7-8 (if present): digits 0-9
  if (normalized.length === 8) {
    if (!/^[0-9]{2}/.test(normalized.substring(6, 8))) {
      return false;
    }
  }

  return true;
}

/**
 * Format a grid locator to standard format (uppercase field/square, lowercase subsquare)
 * @param grid Grid locator string
 * @returns Formatted grid locator or null if invalid
 */
export function formatGridLocator(grid: string): string | null {
  const normalized = grid.trim().toUpperCase();

  if (!validateGridLocator(normalized)) {
    return null;
  }

  let formatted = normalized.substring(0, 4); // Field + Square (uppercase)

  if (normalized.length >= 6) {
    // Subsquare (lowercase)
    formatted += normalized.substring(4, 6).toLowerCase();
  }

  if (normalized.length === 8) {
    // Extended square (digits)
    formatted += normalized.substring(6, 8);
  }

  return formatted;
}
