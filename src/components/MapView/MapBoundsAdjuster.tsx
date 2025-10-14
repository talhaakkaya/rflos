import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../../types';

interface MapBoundsAdjusterProps {
  points: Point[];
}

export default function MapBoundsAdjuster({ points }: MapBoundsAdjusterProps) {
  const map = useMap();
  const hasAdjustedBounds = useRef(false);

  useEffect(() => {
    // Only adjust bounds on the very first mount (page load/refresh)
    if (!hasAdjustedBounds.current && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 13 });
      hasAdjustedBounds.current = true;
    }
  }, [map, points]);

  return null;
}
