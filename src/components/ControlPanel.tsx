import { useRef, useState, useEffect } from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  lat1: string;
  lon1: string;
  lat2: string;
  lon2: string;
  height1: string;
  height2: string;
  onLat1Change: (value: string) => void;
  onLon1Change: (value: string) => void;
  onLat2Change: (value: string) => void;
  onLon2Change: (value: string) => void;
  onHeight1Change: (value: string) => void;
  onHeight2Change: (value: string) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export default function ControlPanel({
  lat1, lon1, lat2, lon2, height1, height2,
  onLat1Change, onLon1Change, onLat2Change, onLon2Change,
  onHeight1Change, onHeight2Change,
  onCalculate, isLoading
}: ControlPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-header')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  return (
    <div
      ref={panelRef}
      className="control-panel"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="panel-header" style={{ cursor: 'grab' }}>
        <h2>RF Path Analysis</h2>
        <span className="drag-hint">⋮⋮</span>
      </div>

      <div className="input-group">
        <label>Point A (Start)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="Latitude"
            step="any"
            value={lat1}
            onChange={(e) => onLat1Change(e.target.value)}
          />
          <input
            type="number"
            placeholder="Longitude"
            step="any"
            value={lon1}
            onChange={(e) => onLon1Change(e.target.value)}
          />
        </div>
      </div>

      <div className="input-group">
        <label>Point B (End)</label>
        <div className="input-row">
          <input
            type="number"
            placeholder="Latitude"
            step="any"
            value={lat2}
            onChange={(e) => onLat2Change(e.target.value)}
          />
          <input
            type="number"
            placeholder="Longitude"
            step="any"
            value={lon2}
            onChange={(e) => onLon2Change(e.target.value)}
          />
        </div>
      </div>

      <div className="input-group">
        <label>Antenna Heights (meters)</label>
        <div className="input-row">
          <input
            type="number"
            className="small-input"
            placeholder="Point A"
            value={height1}
            onChange={(e) => onHeight1Change(e.target.value)}
            min="0"
          />
          <input
            type="number"
            className="small-input"
            placeholder="Point B"
            value={height2}
            onChange={(e) => onHeight2Change(e.target.value)}
            min="0"
          />
        </div>
      </div>

      <button
        className="btn"
        onClick={onCalculate}
        disabled={isLoading}
      >
        {isLoading ? 'Calculating...' : 'Calculate Path'}
      </button>

      {isLoading && (
        <div className="loading">Fetching elevation data...</div>
      )}
    </div>
  );
}
