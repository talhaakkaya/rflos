import './ControlPanel.css';
import type { Point } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { useState, useEffect } from 'react';
import { latLonToGridLocator, gridLocatorToLatLon, validateGridLocator, formatGridLocator } from '../utils/gridLocator';

interface ControlPanelProps {
  points: Point[];
  onPointUpdate: (id: string, updates: Partial<Point>) => void;
  onAddPoint: () => void;
  onRemovePoint: (id: string) => void;
  onReset: () => void;
  onImportJSON: (jsonText: string) => void;
  onToggleVisibility: () => void;
  hideLabels: boolean;
  onToggleLabels: () => void;
  hideLines: boolean;
  onToggleLines: () => void;
  isAddingPoint: boolean;
  onCancelAddPoint: () => void;
}

export default function ControlPanel({
  points,
  onPointUpdate,
  onAddPoint,
  onRemovePoint,
  onReset,
  onImportJSON,
  onToggleVisibility,
  hideLabels,
  onToggleLabels,
  hideLines,
  onToggleLines,
  isAddingPoint,
  onCancelAddPoint
}: ControlPanelProps) {
  const { position, isDragging, handleMouseDown } = useDraggable({ x: 50, y: 20 });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');

  // Track input mode for each point (lat/lon vs grid locator)
  const [inputMode, setInputMode] = useState<Record<string, 'latlon' | 'grid'>>({});

  // Track grid locator input values (user may be typing)
  const [gridInputs, setGridInputs] = useState<Record<string, string>>({});

  // Track previous coordinates to detect marker drags vs typing
  const [prevCoords, setPrevCoords] = useState<Record<string, { lat: number; lon: number }>>({});

  // Sync grid locators when points change (from drag or other updates)
  useEffect(() => {
    const newGridInputs: Record<string, string> = {};
    const newPrevCoords: Record<string, { lat: number; lon: number }> = {};

    points.forEach(point => {
      newPrevCoords[point.id] = { lat: point.lat, lon: point.lon };

      // Check if coordinates changed (marker was dragged)
      const coordsChanged = !prevCoords[point.id] ||
                           prevCoords[point.id].lat !== point.lat ||
                           prevCoords[point.id].lon !== point.lon;

      // Always update grid if coordinates changed (marker drag) or if in lat/lon mode
      if (coordsChanged || inputMode[point.id] !== 'grid') {
        newGridInputs[point.id] = latLonToGridLocator(point.lat, point.lon, 8);
      } else {
        // Keep existing value only if coords haven't changed (user is typing)
        newGridInputs[point.id] = gridInputs[point.id] || latLonToGridLocator(point.lat, point.lon, 8);
      }
    });

    setGridInputs(newGridInputs);
    setPrevCoords(newPrevCoords);
  }, [points, inputMode]);

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-header')) {
      handleMouseDown(e);
    }
  };

  // Toggle between lat/lon and grid locator input mode
  const toggleInputMode = (pointId: string) => {
    setInputMode(prev => ({
      ...prev,
      [pointId]: prev[pointId] === 'grid' ? 'latlon' : 'grid'
    }));
  };

  // Handle grid locator input change
  const handleGridInputChange = (pointId: string, value: string) => {
    setGridInputs(prev => ({
      ...prev,
      [pointId]: value
    }));

    // Try to convert to lat/lon if valid
    const formatted = formatGridLocator(value);
    if (formatted) {
      const coords = gridLocatorToLatLon(formatted);
      if (coords) {
        onPointUpdate(pointId, { lat: coords.lat, lon: coords.lon });
      }
    }
  };

  // Get current input mode for a point (default to lat/lon)
  const getInputMode = (pointId: string): 'latlon' | 'grid' => {
    return inputMode[pointId] || 'latlon';
  };

  return (
    <div
      className="control-panel"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handlePanelMouseDown}
    >
      <div className="panel-header" style={{ cursor: 'grab' }}>
        <h2>Station Setup</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn-icon btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLabels();
            }}
            title={hideLabels ? "Show distance labels" : "Hide distance labels"}
          >
            {hideLabels ? '👁️' : '🏷️'}
          </button>
          <button
            className="btn-icon btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLines();
            }}
            title={hideLines ? "Show all lines" : "Hide lines (keep Point A only)"}
          >
            {hideLines ? '📍' : '📐'}
          </button>
          <button
            className="btn-icon btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Reset to home"
          >
            🏠
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title="Hide panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Points List */}
      <div className="points-section">
        <div className="section-header">
          <h3>Points</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="btn-small btn-primary" onClick={() => setShowImportDialog(true)} disabled={isAddingPoint}>
              📥 Import JSON
            </button>
            {isAddingPoint ? (
              <button className="btn-small btn-danger" onClick={onCancelAddPoint}>
                ✕ Cancel
              </button>
            ) : (
              <button className="btn-small btn-primary" onClick={onAddPoint}>
                + Add Point
              </button>
            )}
          </div>
        </div>

        {/* Import JSON Dialog */}
        {showImportDialog && (
          <div className="import-dialog">
            <textarea
              className="textarea-base"
              placeholder='Paste JSON here, e.g.:&#10;{"callsign": "ta1val", "latitude": 40.90, "longitude": 29.123}&#10;or {"callsign": "ta1val", "grid_square": "KN40av"}&#10;or an array of objects'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
            />
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button
                className="btn-small btn-import-solid"
                onClick={() => {
                  onImportJSON(importText);
                  setImportText('');
                  setShowImportDialog(false);
                }}
              >
                Import
              </button>
              <button
                className="btn-small btn-cancel-solid"
                onClick={() => {
                  setImportText('');
                  setShowImportDialog(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {points.map((point, index) => (
          <div key={point.id} className="point-item">
            <div className="point-header">
              <input
                type="text"
                placeholder="Name"
                value={point.name}
                onChange={(e) => onPointUpdate(point.id, { name: e.target.value })}
                className={`input-compact point-name-input ${index === 0 ? 'name-red' : 'name-blue'}`}
                maxLength={30}
              />
              {points.length > 2 && (
                <button
                  className="btn-icon btn-neutral btn-circular"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePoint(point.id);
                  }}
                  title="Remove point"
                >
                  ×
                </button>
              )}
            </div>

            {/* Coordinate Input Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <span style={{ fontSize: '11px', color: '#666', flex: 1 }}>
                {getInputMode(point.id) === 'latlon' ? 'Lat/Lon' : 'Grid Locator'}
              </span>
              <button
                className="btn-icon btn-primary"
                onClick={() => toggleInputMode(point.id)}
                title={getInputMode(point.id) === 'latlon' ? "Switch to grid locator" : "Switch to lat/lon"}
                style={{ fontSize: '14px', padding: '2px 6px' }}
              >
                {getInputMode(point.id) === 'latlon' ? '🌐' : '📍'}
              </button>
            </div>

            {/* Conditional Input: Lat/Lon OR Grid Locator */}
            {getInputMode(point.id) === 'latlon' ? (
              <div className="input-row">
                <input
                  type="number"
                  placeholder="Latitude"
                  step="any"
                  value={point.lat}
                  onChange={(e) => onPointUpdate(point.id, { lat: parseFloat(e.target.value) || 0 })}
                  className="input-data"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  step="any"
                  value={point.lon}
                  onChange={(e) => onPointUpdate(point.id, { lon: parseFloat(e.target.value) || 0 })}
                  className="input-data"
                />
              </div>
            ) : (
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Grid (e.g., KN41bo34)"
                  value={gridInputs[point.id] || ''}
                  onChange={(e) => handleGridInputChange(point.id, e.target.value.toUpperCase())}
                  className="input-data"
                  maxLength={8}
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    backgroundColor: validateGridLocator(gridInputs[point.id] || '') ? 'white' : '#fff3cd',
                    borderColor: validateGridLocator(gridInputs[point.id] || '') ? '#ccc' : '#ffc107'
                  }}
                />
              </div>
            )}

            <div className="height-input-row">
              <label>Height (m):</label>
              <input
                type="number"
                placeholder="Height"
                value={point.height}
                onChange={(e) => onPointUpdate(point.id, { height: parseFloat(e.target.value) || 0 })}
                min="0"
                className="input-data small-input"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
