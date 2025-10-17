/**
 * Point geometry comparison utilities
 */

export interface PointGeometry {
  id: string;
  lat: number;
  lon: number;
  height: number;
}

/**
 * Compare two arrays of point geometries to detect if any geometry has changed.
 * This is useful for optimizing re-renders and calculations that depend only on
 * point positions/heights, not names or other metadata.
 *
 * @param newGeometry - New array of point geometries
 * @param previousGeometry - Previous array of point geometries
 * @returns true if geometry has changed, false otherwise
 */
export function comparePointGeometry(
  newGeometry: PointGeometry[],
  previousGeometry: PointGeometry[]
): boolean {
  // If lengths differ, geometry has changed
  if (newGeometry.length !== previousGeometry.length) {
    return true;
  }

  // Check each point for changes in id, lat, lon, or height
  return newGeometry.some((p, i) => {
    const prev = previousGeometry[i];
    return !prev ||
           p.id !== prev.id ||
           p.lat !== prev.lat ||
           p.lon !== prev.lon ||
           p.height !== prev.height;
  });
}
