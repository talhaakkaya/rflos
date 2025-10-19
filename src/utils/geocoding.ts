/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free service for location search - no API key required
 * Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type: string;
  importance: number;
}

// Track last request time for rate limiting (1 request/second required by Nominatim)
let lastRequestTime = 0;

/**
 * Search for locations using Nominatim geocoding API
 * @param query Search query (e.g., "Istanbul, Turkey" or "Eiffel Tower")
 * @param limit Maximum number of results (default: 5)
 * @returns Promise with array of geocoding results
 */
export async function searchLocation(query: string, limit: number = 5): Promise<GeocodeResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Rate limiting: Ensure at least 1 second between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    const waitTime = 1000 - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();

  try {
    // Nominatim API endpoint
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: limit.toString(),
      addressdetails: '1' // Include detailed address components
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        // User-Agent is required by Nominatim usage policy
        'User-Agent': 'LOS-Calculator-App/1.0 (RF path analysis tool)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Nominatim returns an array of results
    return data as GeocodeResult[];

  } catch (error) {
    console.error('Geocoding search failed:', error);
    throw error;
  }
}

/**
 * Format a geocoding result for display
 * Truncates long names and provides a user-friendly string
 * @param result Geocode result from Nominatim
 * @param maxLength Maximum length for display (default: 50)
 * @returns Formatted display string
 */
export function formatResultDisplay(result: GeocodeResult, maxLength: number = 50): string {
  const name = result.display_name;
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + '...';
}
