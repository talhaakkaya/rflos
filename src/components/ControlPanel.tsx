import './ControlPanel.css';
import type { Point } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { useState, useEffect, useRef } from 'react';
import { latLonToGridLocator, gridLocatorToLatLon, validateGridLocator, formatGridLocator } from '../utils/gridLocator';
import { searchLocation, formatResultDisplay, type GeocodeResult } from '../utils/geocoding';
import { Eye, Tag, Ruler, Home, X, Download, Search, Globe, MapPin, MapPinned, Target } from 'lucide-react';

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

  // Track when we're updating coordinates from grid input to prevent circular updates
  const isUpdatingFromGridRef = useRef(false);

  // Track search mode for each point
  const [searchMode, setSearchMode] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, GeocodeResult[]>>({});
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});
  const [searchError, setSearchError] = useState<Record<string, string | null>>({});

  // Track geolocation for each point
  const [geoLocationLoading, setGeoLocationLoading] = useState<Record<string, boolean>>({});
  const [geoLocationError, setGeoLocationError] = useState<Record<string, string | null>>({});

  // Sync grid locators when points change (from drag or other updates)
  useEffect(() => {
    // Skip update if we're currently updating from grid input to prevent circular updates
    if (isUpdatingFromGridRef.current) {
      isUpdatingFromGridRef.current = false;
      return;
    }

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
        // Set flag to prevent circular update in useEffect
        isUpdatingFromGridRef.current = true;
        onPointUpdate(pointId, { lat: coords.lat, lon: coords.lon });
      }
    }
  };

  // Get current input mode for a point (default to lat/lon)
  const getInputMode = (pointId: string): 'latlon' | 'grid' => {
    return inputMode[pointId] || 'latlon';
  };

  // Toggle search mode for a point
  const toggleSearchMode = (pointId: string) => {
    const isCurrentlyOpen = searchMode[pointId];
    setSearchMode(prev => ({
      ...prev,
      [pointId]: !isCurrentlyOpen
    }));

    // Reset search state when closing
    if (isCurrentlyOpen) {
      setSearchQuery(prev => ({ ...prev, [pointId]: '' }));
      setSearchResults(prev => ({ ...prev, [pointId]: [] }));
      setSearchError(prev => ({ ...prev, [pointId]: null }));
    }
  };

  // Handle search execution
  const handleSearch = async (pointId: string) => {
    const query = searchQuery[pointId];
    if (!query || query.trim().length === 0) {
      return;
    }

    setIsSearching(prev => ({ ...prev, [pointId]: true }));
    setSearchError(prev => ({ ...prev, [pointId]: null }));

    try {
      const results = await searchLocation(query, 5);
      setSearchResults(prev => ({ ...prev, [pointId]: results }));

      if (results.length === 0) {
        setSearchError(prev => ({ ...prev, [pointId]: 'No locations found' }));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(prev => ({ ...prev, [pointId]: 'Search failed. Please try again.' }));
      setSearchResults(prev => ({ ...prev, [pointId]: [] }));
    } finally {
      setIsSearching(prev => ({ ...prev, [pointId]: false }));
    }
  };

  // Handle search result selection
  const handleSelectResult = (pointId: string, result: GeocodeResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Update point coordinates
    onPointUpdate(pointId, { lat, lon });

    // Close search
    setSearchMode(prev => ({ ...prev, [pointId]: false }));
    setSearchQuery(prev => ({ ...prev, [pointId]: '' }));
    setSearchResults(prev => ({ ...prev, [pointId]: [] }));
    setSearchError(prev => ({ ...prev, [pointId]: null }));
  };

  // Handle get my location
  const handleGetMyLocation = (pointId: string) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setGeoLocationError(prev => ({ ...prev, [pointId]: 'Geolocation is not supported by your browser' }));
      return;
    }

    // Clear previous error
    setGeoLocationError(prev => ({ ...prev, [pointId]: null }));
    setGeoLocationLoading(prev => ({ ...prev, [pointId]: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Update point coordinates
        onPointUpdate(pointId, { lat, lon });

        // Clear loading state
        setGeoLocationLoading(prev => ({ ...prev, [pointId]: false }));
      },
      (error) => {
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setGeoLocationError(prev => ({ ...prev, [pointId]: errorMessage }));
        setGeoLocationLoading(prev => ({ ...prev, [pointId]: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
            {hideLabels ? <Eye size={18} /> : <Tag size={18} />}
          </button>
          <button
            className="btn-icon btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLines();
            }}
            title={hideLines ? "Show all lines" : "Hide lines (keep Point A only)"}
          >
            {hideLines ? <Target size={18} /> : <Ruler size={18} />}
          </button>
          <button
            className="btn-icon btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Reset to home"
          >
            <Home size={18} />
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title="Hide panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Points List */}
      <div className="points-section">
        <div className="section-header">
          <h3>Points</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="btn-small btn-primary" onClick={() => setShowImportDialog(true)} disabled={isAddingPoint}>
              <Download size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Import JSON
            </button>
            {isAddingPoint ? (
              <button className="btn-small btn-danger" onClick={onCancelAddPoint}>
                <X size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Cancel
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
                  <X size={16} />
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
                onClick={() => handleGetMyLocation(point.id)}
                title="Get my current location"
                disabled={geoLocationLoading[point.id]}
                style={{
                  fontSize: '14px',
                  padding: '2px 6px',
                  background: geoLocationLoading[point.id] ? '#e3f2fd' : undefined,
                  border: geoLocationLoading[point.id] ? '2px solid #2196F3' : undefined,
                  opacity: geoLocationLoading[point.id] ? 0.7 : 1
                }}
              >
                {geoLocationLoading[point.id] ? '...' : <MapPinned size={16} />}
              </button>
              <button
                className="btn-icon btn-primary"
                onClick={() => toggleSearchMode(point.id)}
                title={searchMode[point.id] ? "Close search" : "Search location"}
                style={{
                  fontSize: '14px',
                  padding: '2px 6px',
                  background: searchMode[point.id] ? '#e3f2fd' : undefined,
                  border: searchMode[point.id] ? '2px solid #2196F3' : undefined
                }}
              >
                <Search size={16} />
              </button>
              <button
                className="btn-icon btn-primary"
                onClick={() => toggleInputMode(point.id)}
                title={getInputMode(point.id) === 'latlon' ? "Switch to grid locator" : "Switch to lat/lon"}
                style={{ fontSize: '14px', padding: '2px 6px' }}
              >
                {getInputMode(point.id) === 'latlon' ? <Globe size={16} /> : <MapPin size={16} />}
              </button>
            </div>

            {/* Search Interface (shown when search mode is active) */}
            {searchMode[point.id] && (
              <div style={{ marginBottom: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery[point.id] || ''}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, [point.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(point.id);
                      }
                    }}
                    className="input-data"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-small btn-primary"
                    onClick={() => handleSearch(point.id)}
                    disabled={isSearching[point.id] || !searchQuery[point.id]?.trim()}
                  >
                    {isSearching[point.id] ? '...' : 'Search'}
                  </button>
                </div>

                {/* Search Results */}
                {searchResults[point.id] && searchResults[point.id].length > 0 && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>
                    {searchResults[point.id].map((result) => (
                      <div
                        key={result.place_id}
                        onClick={() => handleSelectResult(point.id, result)}
                        style={{
                          padding: '8px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          fontSize: '12px',
                          transition: 'background-color 0.2s',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        title={result.display_name}
                      >
                        {formatResultDisplay(result, 60)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {searchError[point.id] && (
                  <div style={{ color: '#dc3545', fontSize: '11px', marginTop: '5px' }}>
                    {searchError[point.id]}
                  </div>
                )}

                {/* Help Text */}
                {!searchResults[point.id]?.length && !searchError[point.id] && !isSearching[point.id] && (
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                    Enter a city, address, or landmark
                  </div>
                )}
              </div>
            )}

            {/* Geolocation Error Message */}
            {geoLocationError[point.id] && (
              <div style={{ color: '#dc3545', fontSize: '11px', marginBottom: '5px', padding: '5px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                {geoLocationError[point.id]}
              </div>
            )}

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
