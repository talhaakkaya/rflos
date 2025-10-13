import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MarkerLabelProps {
  lat: number;
  lon: number;
  name: string;
  color: 'red' | 'blue';
}

export default function MarkerLabel({ lat, lon, name, color }: MarkerLabelProps) {
  const map = useMap();

  useEffect(() => {
    if (!name) return;

    const nameMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'marker-name-label',
        html: `<div class="marker-name marker-name-${color}">${name}</div>`,
        iconSize: [120, 20],
        iconAnchor: [60, 70]
      })
    });

    nameMarker.addTo(map);

    return () => {
      map.removeLayer(nameMarker);
    };
  }, [map, lat, lon, name, color]);

  return null;
}
