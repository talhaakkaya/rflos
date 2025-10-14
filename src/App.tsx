import { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView/MapView';
import LOSPanel from './components/LOSPanel';
import { calculateDistance } from './hooks/usePathCalculation';
import { useLOSCalculation } from './hooks/useLOSCalculation';
import { decodeStateFromURL, updateURL } from './hooks/useURLState';
import type { Point, PathResult, SegmentDistance } from './types';
import './App.css';

function App() {
  // Default values
  const defaultPoints: Point[] = [
    { id: '1', lat: 41.038702, lon: 28.881802, name: 'Point A', height: 10 },
    { id: '2', lat: 41.0600, lon: 28.9850, name: 'Point B', height: 10 },
  ];

  // Initialize state from URL or defaults
  const initialState = () => {
    const urlState = decodeStateFromURL();
    console.log('Initializing state from URL:', urlState);
    return {
      points: urlState?.points || defaultPoints,
      losFromId: urlState?.losFromId || '1',
      losToId: urlState?.losToId || '2',
      selectedLine: urlState?.selectedLine || null
    };
  };

  const initial = initialState();

  // State (all stored in URL params)
  const [points, setPoints] = useState<Point[]>(initial.points);
  const [losFromId, setLosFromId] = useState<string>(initial.losFromId);
  const [losToId, setLosToId] = useState<string>(initial.losToId);
  const [selectedLine, setSelectedLine] = useState<{ fromId: string; toId: string } | null>(initial.selectedLine);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);

  // Temporary state (not saved)
  const [result, setResult] = useState<PathResult | null>(null);
  const [segmentDistances, setSegmentDistances] = useState<SegmentDistance[]>([]);
  const [hideLabels, setHideLabels] = useState<boolean>(false);
  const [hideLines, setHideLines] = useState<boolean>(false);
  const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);

  const { calculateLOS, isLoading } = useLOSCalculation(points);
  const hasCalculatedOnMount = useRef(false);
  const isFirstRender = useRef(true);
  const recalculateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL when state changes (skip first render since we just loaded from URL)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Set URL to initial state on first render
      updateURL({ points, losFromId, losToId, selectedLine });
      return;
    }
    console.log('App state changed - updating URL:', { points, losFromId, losToId, selectedLine });
    updateURL({ points, losFromId, losToId, selectedLine });
  }, [points, losFromId, losToId, selectedLine]);

  // Auto-calculate LOS on mount with saved losFromId and losToId
  useEffect(() => {
    if (!hasCalculatedOnMount.current && losFromId && losToId) {
      hasCalculatedOnMount.current = true;

      // Trigger calculation for the saved points
      calculateLOS(
        losFromId,
        losToId,
        (result) => {
          setResult(result);
        },
        (error) => {
          console.error('Auto-calculation failed:', error);
        }
      );
    }
  }, [losFromId, losToId, calculateLOS]);

  // Auto-calculate segment distances when points change
  useEffect(() => {
    calculateSegmentDistances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Auto-recalculate when points change (debounced)
  useEffect(() => {
    // Determine which line to calculate
    const fromId = selectedLine?.fromId || losFromId;
    const toId = selectedLine?.toId || losToId;

    // Skip if no line is selected and no previous result
    if (!fromId || !toId || (!selectedLine && !result)) {
      return;
    }

    // Clear any pending timeout
    if (recalculateTimeoutRef.current) {
      clearTimeout(recalculateTimeoutRef.current);
    }

    // Debounce for 300ms to avoid excessive calculations while dragging
    recalculateTimeoutRef.current = setTimeout(() => {
      calculateLOS(
        fromId,
        toId,
        (result) => {
          setResult(result);
        },
        (error) => {
          console.error('Auto-recalculation failed:', error);
        }
      );
    }, 300);

    return () => {
      if (recalculateTimeoutRef.current) {
        clearTimeout(recalculateTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Calculate distances between all pairs of points
  const calculateSegmentDistances = () => {
    const distances: SegmentDistance[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = calculateDistance(
          points[i].lat,
          points[i].lon,
          points[j].lat,
          points[j].lon
        );
        distances.push({
          fromId: points[i].id,
          toId: points[j].id,
          distance
        });
      }
    }
    setSegmentDistances(distances);
  };

  const handlePointDrag = (id: string, lat: number, lng: number) => {
    setPoints(points.map(p =>
      p.id === id ? { ...p, lat, lon: lng } : p
    ));
    // Don't clear result/selectedLine - let auto-recalculate handle it
  };

  const handleLineClick = async (fromId: string, toId: string) => {
    // Check if clicking the already selected line - deselect it
    const isAlreadySelected = selectedLine &&
      ((selectedLine.fromId === fromId && selectedLine.toId === toId) ||
       (selectedLine.fromId === toId && selectedLine.toId === fromId));

    if (isAlreadySelected) {
      // Deselect: clear selection and results
      setSelectedLine(null);
      setResult(null);
      return;
    }

    // Select new line
    setSelectedLine({ fromId, toId });
    setLosFromId(fromId);
    setLosToId(toId);

    // Automatically calculate LOS for the clicked line
    await calculateLOS(
      fromId,
      toId,
      (result) => {
        setResult(result);
      },
      (error) => {
        alert('Error calculating path: ' + error);
      }
    );
  };


  const handlePointUpdate = (id: string, updates: Partial<Point>) => {
    setPoints(points.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleAddPoint = () => {
    setIsAddingPoint(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingPoint) {
      const newId = (Math.max(...points.map(p => parseInt(p.id))) + 1).toString();
      const newPoint: Point = {
        id: newId,
        lat,
        lon: lng,
        name: `Point ${String.fromCharCode(65 + points.length)}`,
        height: 10
      };
      setPoints([...points, newPoint]);
      setIsAddingPoint(false);
    }
  };

  const handleCancelAddPoint = () => {
    setIsAddingPoint(false);
  };

  const handleRemovePoint = (id: string) => {
    if (points.length <= 2) {
      alert('You need at least 2 points');
      return;
    }

    const remainingPoints = points.filter(p => p.id !== id);
    setPoints(remainingPoints);

    // Update LOS selection if removed point was selected
    if (losFromId === id || losToId === id) {
      // Reset both to first two points if removed point was involved
      setLosFromId(remainingPoints[0].id);
      setLosToId(remainingPoints[1].id);
    }

    // Clear result and selection if the removed point was involved
    if (selectedLine && (selectedLine.fromId === id || selectedLine.toId === id)) {
      setResult(null);
      setSelectedLine(null);
    }
  };

  const handleReset = () => {
    // Reset to defaults
    setPoints(defaultPoints);
    setLosFromId('1');
    setLosToId('2');
    setSelectedLine(null);
    setResult(null);
    setSegmentDistances([]);
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleImportJSON = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      const importedPoints: Point[] = [];

      // Handle single object or array
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item, index) => {
        if (item.latitude && item.longitude) {
          const newId = (Math.max(...points.map(p => parseInt(p.id)), 0) + index + 1).toString();
          importedPoints.push({
            id: newId,
            lat: parseFloat(item.latitude),
            lon: parseFloat(item.longitude),
            name: item.callsign || item.name || `Point ${String.fromCharCode(65 + points.length + index)}`,
            height: item.height || 10
          });
        }
      });

      if (importedPoints.length > 0) {
        setPoints([...points, ...importedPoints]);
        alert(`Imported ${importedPoints.length} point(s)`);
      } else {
        alert('No valid points found in JSON');
      }
    } catch (error) {
      alert('Invalid JSON format');
      console.error('Import error:', error);
    }
  };

  return (
    <div className="app">
      <MapView
        points={points}
        onPointDrag={handlePointDrag}
        onLineClick={handleLineClick}
        onMapClick={handleMapClick}
        selectedLine={selectedLine}
        segmentDistances={segmentDistances}
        losFromId={result ? losFromId : undefined}
        losToId={result ? losToId : undefined}
        hideLabels={hideLabels}
        hideLines={hideLines}
        isAddingPoint={isAddingPoint}
      />

      {isPanelVisible ? (
        <ControlPanel
          points={points}
          onPointUpdate={handlePointUpdate}
          onAddPoint={handleAddPoint}
          onRemovePoint={handleRemovePoint}
          onReset={handleReset}
          onImportJSON={handleImportJSON}
          onToggleVisibility={() => setIsPanelVisible(false)}
          hideLabels={hideLabels}
          onToggleLabels={() => setHideLabels(!hideLabels)}
          hideLines={hideLines}
          onToggleLines={() => setHideLines(!hideLines)}
          isLoading={isLoading}
          isAddingPoint={isAddingPoint}
          onCancelAddPoint={handleCancelAddPoint}
        />
      ) : (
        <button
          className="btn-show-panel"
          onClick={() => setIsPanelVisible(true)}
          title="Show control panel"
        >
          ☰
        </button>
      )}

      <LOSPanel
        result={result}
        onClose={() => {
          setSelectedLine(null);
          setResult(null);
        }}
      />
    </div>
  );
}

export default App;
