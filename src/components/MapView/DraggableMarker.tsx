import { useRef } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../../types';

// Custom marker icons
const redIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"%3E%3Cpath fill="%23e74c3c" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.104.151 2.174.41 3.196C2.661 25.933 12.5 41 12.5 41s9.839-15.067 12.09-25.304c.259-1.022.41-2.092.41-3.196C25 5.596 19.404 0 12.5 0z"/%3E%3Ccircle fill="%23fff" cx="12.5" cy="12.5" r="7"/%3E%3C/svg%3E',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const blueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"%3E%3Cpath fill="%233388ff" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.104.151 2.174.41 3.196C2.661 25.933 12.5 41 12.5 41s9.839-15.067 12.09-25.304c.259-1.022.41-2.092.41-3.196C25 5.596 19.404 0 12.5 0z"/%3E%3Ccircle fill="%23fff" cx="12.5" cy="12.5" r="7"/%3E%3C/svg%3E',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

interface DraggableMarkerProps {
  point: Point;
  useRedIcon: boolean;
  onDragEnd: (id: string, lat: number, lng: number) => void;
}

export default function DraggableMarker({ point, useRedIcon, onDragEnd }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(point.id, lat, lng);
      }
    },
  };

  return (
    <Marker
      position={[point.lat, point.lon]}
      icon={useRedIcon ? redIcon : blueIcon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
    </Marker>
  );
}
