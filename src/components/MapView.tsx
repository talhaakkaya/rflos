import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix Leaflet default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

// Marker name label component
interface MarkerLabelProps {
  lat: number;
  lon: number;
  name: string;
  color: 'red' | 'blue';
}

function MarkerLabel({ lat, lon, name, color }: MarkerLabelProps) {
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

// Distance label component
interface DistanceLabelProps {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  distance: number;
}

function DistanceLabel({ lat1, lon1, lat2, lon2, distance }: DistanceLabelProps) {
  const map = useMap();

  useEffect(() => {
    if (!distance || distance === 0) return;

    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;

    const distanceMarker = L.marker([midLat, midLon], {
      icon: L.divIcon({
        className: 'distance-label',
        html: `${distance.toFixed(2)} km`,
        iconSize: [80, 20]
      })
    });

    distanceMarker.addTo(map);

    return () => {
      map.removeLayer(distanceMarker);
    };
  }, [map, lat1, lon1, lat2, lon2, distance]);

  return null;
}

// Map bounds adjuster
interface MapBoundsAdjusterProps {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
}

function MapBoundsAdjuster({ lat1, lon1, lat2, lon2 }: MapBoundsAdjusterProps) {
  const map = useMap();

  useEffect(() => {
    if (lat1 && lon1 && lat2 && lon2) {
      const bounds = L.latLngBounds([[lat1, lon1], [lat2, lon2]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, lat1, lon1, lat2, lon2]);

  return null;
}

// Draggable marker component
interface DraggableMarkerProps {
  position: [number, number];
  icon: L.Icon;
  onDragEnd: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, icon, onDragEnd }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  };

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
    </Marker>
  );
}

// Main MapView component
interface MapViewProps {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  name1: string;
  name2: string;
  onPoint1Drag: (lat: number, lng: number) => void;
  onPoint2Drag: (lat: number, lng: number) => void;
  distance?: number;
}

export default function MapView({
  lat1, lon1, lat2, lon2, name1, name2,
  onPoint1Drag, onPoint2Drag,
  distance
}: MapViewProps) {
  const center: [number, number] = [(lat1 + lat2) / 2, (lon1 + lon2) / 2];
  const pathPositions: [number, number][] = [[lat1, lon1], [lat2, lon2]];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={pathPositions}
          pathOptions={{
            color: '#3388ff',
            weight: 3,
            opacity: 0.7
          }}
        />

        <DraggableMarker
          position={[lat1, lon1]}
          icon={redIcon}
          onDragEnd={onPoint1Drag}
        />

        <DraggableMarker
          position={[lat2, lon2]}
          icon={blueIcon}
          onDragEnd={onPoint2Drag}
        />

        <MarkerLabel lat={lat1} lon={lon1} name={name1} color="red" />
        <MarkerLabel lat={lat2} lon={lon2} name={name2} color="blue" />

        {distance && (
          <DistanceLabel
            lat1={lat1}
            lon1={lon1}
            lat2={lat2}
            lon2={lon2}
            distance={distance}
          />
        )}

        <MapBoundsAdjuster lat1={lat1} lon1={lon1} lat2={lat2} lon2={lon2} />
      </MapContainer>
    </div>
  );
}
