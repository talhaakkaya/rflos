import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SegmentLabelProps {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  distance: number;
  fromId: string;
  toId: string;
  isSelected: boolean;
  onLineClick: (fromId: string, toId: string) => void;
}

export default function SegmentLabel({
  lat1,
  lon1,
  lat2,
  lon2,
  distance,
  fromId,
  toId,
  isSelected,
  onLineClick
}: SegmentLabelProps) {
  const map = useMap();

  useEffect(() => {
    if (!distance || distance === 0) return;

    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;

    const className = isSelected
      ? 'distance-label distance-label-clickable distance-label-selected'
      : 'distance-label distance-label-clickable';

    const distanceMarker = L.marker([midLat, midLon], {
      icon: L.divIcon({
        className,
        html: `${distance.toFixed(2)} km`,
        iconSize: [80, 20]
      })
    });

    distanceMarker.on('click', () => {
      onLineClick(fromId, toId);
    });

    distanceMarker.addTo(map);

    return () => {
      map.removeLayer(distanceMarker);
    };
  }, [map, lat1, lon1, lat2, lon2, distance, fromId, toId, isSelected, onLineClick]);

  return null;
}
