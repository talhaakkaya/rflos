import './ControlPanel.css';
import type { Point } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { useState } from 'react';

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
  frequency: number;
  onFrequencyChange: (freq: number) => void;
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
  onCancelAddPoint,
  frequency,
  onFrequencyChange
}: ControlPanelProps) {
  const { position, isDragging, handleMouseDown } = useDraggable({ x: 50, y: 20 });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.panel-header')) {
      handleMouseDown(e);
    }
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
        <h2>RF Path Analysis</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn-toggle-labels"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLabels();
            }}
            title={hideLabels ? "Show distance labels" : "Hide distance labels"}
          >
            {hideLabels ? '👁️' : '🏷️'}
          </button>
          <button
            className="btn-toggle-lines"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLines();
            }}
            title={hideLines ? "Show all lines" : "Hide lines (keep Point A only)"}
          >
            {hideLines ? '📍' : '📐'}
          </button>
          <button
            className="btn-reset"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Reset to home"
          >
            🏠
          </button>
          <button
            className="btn-hide"
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

      {/* RF Frequency Selection */}
      <div className="rf-section">
        <h3>RF Analysis</h3>
        <div className="frequency-selector">
          <label>Frequency Band:</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            <button
              className={`btn-freq ${frequency === 144 ? 'active' : ''}`}
              onClick={() => onFrequencyChange(144)}
            >
              2m (144 MHz)
            </button>
            <button
              className={`btn-freq ${frequency === 432 ? 'active' : ''}`}
              onClick={() => onFrequencyChange(432)}
            >
              70cm (432 MHz)
            </button>
          </div>
        </div>
      </div>

      {/* Points List */}
      <div className="points-section">
        <div className="section-header">
          <h3>Points</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="btn-small btn-import" onClick={() => setShowImportDialog(true)} disabled={isAddingPoint}>
              📥 Import JSON
            </button>
            {isAddingPoint ? (
              <button className="btn-small btn-cancel" onClick={onCancelAddPoint}>
                ✕ Cancel
              </button>
            ) : (
              <button className="btn-small btn-add" onClick={onAddPoint}>
                + Add Point
              </button>
            )}
          </div>
        </div>

        {/* Import JSON Dialog */}
        {showImportDialog && (
          <div className="import-dialog">
            <textarea
              placeholder='Paste JSON here, e.g.:&#10;{"callsign": "ta1val", "latitude": 40.90, "longitude": 29.123}&#10;or an array of objects'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
            />
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button
                className="btn-small btn-import"
                onClick={() => {
                  onImportJSON(importText);
                  setImportText('');
                  setShowImportDialog(false);
                }}
              >
                Import
              </button>
              <button
                className="btn-small"
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
              <span className={`point-badge ${index === 0 ? 'badge-red' : 'badge-blue'}`}>
                {point.name}
              </span>
              {points.length > 2 && (
                <button
                  className="btn-remove"
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

            <input
              type="text"
              placeholder="Name"
              value={point.name}
              onChange={(e) => onPointUpdate(point.id, { name: e.target.value })}
              className="name-input"
              maxLength={30}
            />

            <div className="input-row">
              <input
                type="number"
                placeholder="Latitude"
                step="any"
                value={point.lat}
                onChange={(e) => onPointUpdate(point.id, { lat: parseFloat(e.target.value) || 0 })}
              />
              <input
                type="number"
                placeholder="Longitude"
                step="any"
                value={point.lon}
                onChange={(e) => onPointUpdate(point.id, { lon: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="height-input-row">
              <label>Height (m):</label>
              <input
                type="number"
                placeholder="Height"
                value={point.height}
                onChange={(e) => onPointUpdate(point.id, { height: parseFloat(e.target.value) || 0 })}
                min="0"
                className="small-input"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
