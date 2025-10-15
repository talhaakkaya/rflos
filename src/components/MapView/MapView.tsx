import { MapContainer, TileLayer, Polyline, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../MapView.css';
import type { Point } from '../../types';
import MarkerLabel from './MarkerLabel';
import SegmentLabel from './SegmentLabel';
import MapBoundsAdjuster from './MapBoundsAdjuster';
import DraggableMarker from './DraggableMarker';
import ZoomResetButton from './ZoomResetButton';
import HelpButton from './HelpButton';
import { generatePathPoints } from '../../hooks/usePathCalculation';

// Component to handle map click events
function MapClickHandler({ isAddingPoint, onMapClick }: { isAddingPoint: boolean; onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (isAddingPoint) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Fix Leaflet default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  points: Point[];
  onPointDrag: (id: string, lat: number, lng: number) => void;
  onLineClick: (fromId: string, toId: string) => void;
  onMapClick: (lat: number, lng: number) => void;
  selectedLine: { fromId: string; toId: string } | null;
  segmentDistances: { fromId: string; toId: string; distance: number }[];
  losFromId?: string;
  losToId?: string;
  hideLabels: boolean;
  hideLines: boolean;
  isAddingPoint: boolean;
  hoveredPathPoint: { lat: number; lon: number } | null;
  pathPoints: { lat: number; lon: number }[] | null;
  onHelpClick: () => void;
  resetZoomTrigger?: number;
}

export default function MapView({
  points,
  onPointDrag,
  onLineClick,
  onMapClick,
  selectedLine,
  segmentDistances,
  losFromId,
  losToId,
  hideLabels,
  hideLines,
  isAddingPoint,
  hoveredPathPoint,
  pathPoints,
  onHelpClick,
  resetZoomTrigger
}: MapViewProps) {
  // Calculate center from all points
  const center: [number, number] = points.length > 0
    ? [
        points.reduce((sum, p) => sum + p.lat, 0) / points.length,
        points.reduce((sum, p) => sum + p.lon, 0) / points.length
      ]
    : [41.038702, 28.881802];

  return (
    <div className={`map-container ${isAddingPoint ? 'map-container-adding-point' : ''}`} style={{ position: 'relative' }}>
      {isAddingPoint && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          zIndex: 1000,
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          pointerEvents: 'none'
        }}>
          Click on map to place new point
        </div>
      )}
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler isAddingPoint={isAddingPoint} onMapClick={onMapClick} />

        {/* Lines connecting all pairs of points - all curved */}
        {points.map((point1, i) =>
          points.slice(i + 1).map((point2) => {
            // When hideLines is true, only show lines from Point A (index 0) to others
            if (hideLines && i !== 0) {
              return null;
            }

            const isSelected = selectedLine &&
              ((selectedLine.fromId === point1.id && selectedLine.toId === point2.id) ||
               (selectedLine.fromId === point2.id && selectedLine.toId === point1.id));

            // Generate curved path for this segment
            const segmentPath = generatePathPoints(point1.lat, point1.lon, point2.lat, point2.lon, 50);

            return (
              <Polyline
                key={`line-${point1.id}-${point2.id}`}
                positions={segmentPath.map(p => [p.lat, p.lon])}
                pathOptions={{
                  color: isSelected ? '#ff0000' : '#3388ff',
                  weight: isSelected ? 5 : 3,
                  opacity: isSelected ? 1 : 0.7,
                  interactive: true
                }}
                eventHandlers={{
                  click: () => {
                    console.log('Line clicked:', point1.id, point2.id);
                    onLineClick(point1.id, point2.id);
                  }
                }}
              />
            );
          })
        )}

        {/* Low-opacity indicator for LOS analysis when no line is selected */}
        {!selectedLine && losFromId && losToId && pathPoints && pathPoints.length > 0 && (
          <Polyline
            positions={pathPoints.map(p => [p.lat, p.lon])}
            pathOptions={{
              color: '#ff6b6b',
              weight: 3,
              opacity: 0.9,
              dashArray: '10, 10'
            }}
          />
        )}

        {/* Render all markers */}
        {points.map((point, index) => {
          // Check if this marker is part of the selected line
          const isPartOfSelectedLine = selectedLine &&
            (selectedLine.fromId === point.id || selectedLine.toId === point.id);

          // Use red icon if it's the first point OR if it's part of selected line
          const useRedIcon = index === 0 || !!isPartOfSelectedLine;

          return (
            <DraggableMarker
              key={point.id}
              point={point}
              useRedIcon={useRedIcon}
              onDragEnd={onPointDrag}
            />
          );
        })}

        {/* Render marker name labels */}
        {points.map((point, index) => {
          // Check if this marker is part of the selected line
          const isPartOfSelectedLine = selectedLine &&
            (selectedLine.fromId === point.id || selectedLine.toId === point.id);

          // Use red color if it's the first point OR if it's part of selected line
          const useRedColor = index === 0 || !!isPartOfSelectedLine;

          return (
            <MarkerLabel
              key={`label-${point.id}`}
              lat={point.lat}
              lon={point.lon}
              name={point.name}
              color={useRedColor ? 'red' : 'blue'}
            />
          );
        })}

        {/* Render segment distance labels */}
        {!hideLabels && segmentDistances.map(seg => {
          const fromPoint = points.find(p => p.id === seg.fromId);
          const toPoint = points.find(p => p.id === seg.toId);
          if (fromPoint && toPoint) {
            // When hideLines is true, only show labels for segments involving Point A
            if (hideLines && seg.fromId !== points[0]?.id && seg.toId !== points[0]?.id) {
              return null;
            }

            const isSelected = selectedLine &&
              ((selectedLine.fromId === seg.fromId && selectedLine.toId === seg.toId) ||
               (selectedLine.fromId === seg.toId && selectedLine.toId === seg.fromId));

            return (
              <SegmentLabel
                key={`${seg.fromId}-${seg.toId}`}
                lat1={fromPoint.lat}
                lon1={fromPoint.lon}
                lat2={toPoint.lat}
                lon2={toPoint.lon}
                distance={seg.distance}
                fromId={seg.fromId}
                toId={seg.toId}
                isSelected={!!isSelected}
                onLineClick={onLineClick}
              />
            );
          }
          return null;
        })}

        {/* Hovered path point marker */}
        {hoveredPathPoint && (
          <CircleMarker
            center={[hoveredPathPoint.lat, hoveredPathPoint.lon]}
            radius={8}
            pathOptions={{
              color: '#fff',
              fillColor: '#333',
              fillOpacity: 1,
              weight: 3
            }}
          />
        )}

        <MapBoundsAdjuster points={points} resetTrigger={resetZoomTrigger} />
        <HelpButton onClick={onHelpClick} />
        <ZoomResetButton points={points} />
      </MapContainer>
    </div>
  );
}
