import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../../types';

interface MapBoundsAdjusterProps {
  points: Point[];
  resetTrigger?: number; // Increment this to trigger a zoom reset
}

export default function MapBoundsAdjuster({ points, resetTrigger }: MapBoundsAdjusterProps) {
  const map = useMap();
  const hasAdjustedBounds = useRef(false);

  useEffect(() => {
    // Only adjust bounds on the very first mount (page load/refresh)
    if (!hasAdjustedBounds.current && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      hasAdjustedBounds.current = true;
    }
  }, [map, points]);

  // Zoom when reset is triggered
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0 && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, map]);

  return null;
}
