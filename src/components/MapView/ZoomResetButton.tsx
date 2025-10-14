import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../../types';

interface ZoomResetButtonProps {
  points: Point[];
}

export default function ZoomResetButton({ points }: ZoomResetButtonProps) {
  const map = useMap();

  const handleZoomReset = () => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  return (
    <button
      onClick={handleZoomReset}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: '4px',
        width: '34px',
        height: '34px',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f4'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      title="Fit all points in view"
    >
      🎯
    </button>
  );
}
