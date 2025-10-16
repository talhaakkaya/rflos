import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MarkerLabelProps {
  lat: number;
  lon: number;
  name: string;
  color: 'red' | 'blue';
  onClick: () => void;
}

export default function MarkerLabel({ lat, lon, name, color, onClick }: MarkerLabelProps) {
  const map = useMap();

  useEffect(() => {
    if (!name) return;

    const nameMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'marker-name-label',
        html: `<div class="marker-name marker-name-${color}" style="cursor: pointer;">${name}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 70]
      })
    });

    // Add click handler
    nameMarker.on('click', () => {
      onClick();
    });

    nameMarker.addTo(map);

    return () => {
      map.removeLayer(nameMarker);
    };
  }, [map, lat, lon, name, color, onClick]);

  return null;
}
