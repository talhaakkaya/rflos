import { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView/MapView';
import LOSPanel from './components/LOSPanel';
import HelpModal from './components/HelpModal';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
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

    // If no URL state at all, use full defaults
    if (!urlState) {
      return {
        points: defaultPoints,
        losFromId: '1',
        losToId: '2',
        selectedLine: { fromId: '1', toId: '2' },
        hideLines: false,
        isPanelVisible: true,
        isLOSPanelOpen: true
      };
    }

    // URL state exists, use it (respecting null values)
    return {
      points: urlState.points || defaultPoints,
      losFromId: urlState.losFromId || '1',
      losToId: urlState.losToId || '2',
      selectedLine: urlState.selectedLine ?? null,
      hideLines: urlState.hideLines || false,
      isPanelVisible: urlState.isPanelVisible ?? true,
      isLOSPanelOpen: urlState.isLOSPanelOpen ?? true
    };
  };

  const initial = initialState();

  // State (all stored in URL params)
  const [points, setPoints] = useState<Point[]>(initial.points);
  const [losFromId, setLosFromId] = useState<string>(initial.losFromId);
  const [losToId, setLosToId] = useState<string>(initial.losToId);
  const [selectedLine, setSelectedLine] = useState<{ fromId: string; toId: string } | null>(initial.selectedLine);
  const [hideLines, setHideLines] = useState<boolean>(initial.hideLines);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(initial.isPanelVisible);
  const [isLOSPanelOpen, setIsLOSPanelOpen] = useState<boolean>(initial.isLOSPanelOpen);

  // Temporary state (not saved)
  const [result, setResult] = useState<PathResult | null>(null);
  const [segmentDistances, setSegmentDistances] = useState<SegmentDistance[]>([]);
  const [hideLabels, setHideLabels] = useState<boolean>(false);
  const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);
  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<number>(145.5); // MHz - default to 2m band
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [resetZoomTrigger, setResetZoomTrigger] = useState<number>(0);

  // Create a stable reference that only changes when geometry actually changes
  const pointsGeometryRef = useRef<Array<{ id: string; lat: number; lon: number; height: number }>>([]);
  const [pointsGeometry, setPointsGeometry] = useState<Array<{ id: string; lat: number; lon: number; height: number }>>([]);

  // Update pointsGeometry only when actual geometry changes
  useEffect(() => {
    const newGeometry = points.map(p => ({ id: p.id, lat: p.lat, lon: p.lon, height: p.height }));

    // Deep compare to see if geometry actually changed
    const geometryChanged = newGeometry.length !== pointsGeometryRef.current.length ||
      newGeometry.some((p, i) => {
        const prev = pointsGeometryRef.current[i];
        return !prev || p.id !== prev.id || p.lat !== prev.lat || p.lon !== prev.lon || p.height !== prev.height;
      });

    if (geometryChanged) {
      pointsGeometryRef.current = newGeometry;
      setPointsGeometry(newGeometry);
    }
  }, [points]);

  const { calculateLOS, isLoading } = useLOSCalculation(points);
  const hasCalculatedOnMount = useRef(false);
  const isFirstRender = useRef(true);
  const recalculateTimeoutRef = useRef<number | null>(null);

  // Update URL when state changes (skip first render since we just loaded from URL)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Set URL to initial state on first render
      updateURL({ points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen });
      return;
    }
    console.log('App state changed - updating URL:', { points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen });
    updateURL({ points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen });
  }, [points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen]);

  // Auto-calculate LOS on mount with saved losFromId and losToId (only if panel should be open)
  useEffect(() => {
    if (!hasCalculatedOnMount.current && isLOSPanelOpen && losFromId && losToId) {
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
        },
        frequency
      );
    }
  }, [losFromId, losToId, calculateLOS, isLOSPanelOpen]);

  // Auto-calculate segment distances when points coordinates change
  useEffect(() => {
    calculateSegmentDistances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsGeometry]);

  // Auto-recalculate when points coordinates/heights change (debounced)
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
        },
        frequency
      );
    }, 300);

    return () => {
      if (recalculateTimeoutRef.current) {
        clearTimeout(recalculateTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsGeometry, frequency]);

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

  const handleMarkerClick = (id: string) => {
    // If clicking the first point, do nothing (it's already the "from" point)
    if (points[0].id === id) {
      return;
    }

    // Find the clicked point
    const clickedPoint = points.find(p => p.id === id);
    if (!clickedPoint) {
      return;
    }

    // Reorder: move clicked point to the front
    const reorderedPoints = [
      clickedPoint,
      ...points.filter(p => p.id !== id)
    ];

    setPoints(reorderedPoints);

    // Update LOS IDs to use the new first point
    setLosFromId(clickedPoint.id);
    setLosToId(reorderedPoints[1].id);

    // Only recalculate if LOS panel is already open
    if (isLOSPanelOpen && (result || selectedLine)) {
      setSelectedLine({ fromId: clickedPoint.id, toId: reorderedPoints[1].id });

      // Trigger new calculation
      calculateLOS(
        clickedPoint.id,
        reorderedPoints[1].id,
        (result) => {
          setResult(result);
        },
        (error) => {
          console.error('Marker click calculation failed:', error);
        },
        frequency
      );
    }
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
      setIsLOSPanelOpen(false);
      return;
    }

    // Clear old result first to ensure clean state
    setResult(null);

    // Select new line
    setSelectedLine({ fromId, toId });
    setLosFromId(fromId);
    setLosToId(toId);
    setIsLOSPanelOpen(true);

    // Automatically calculate LOS for the clicked line
    await calculateLOS(
      fromId,
      toId,
      (result) => {
        setResult(result);
      },
      (error) => {
        alert('Error calculating path: ' + error);
      },
      frequency
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

  const handleReverseCalculation = async () => {
    // Find the two points being analyzed
    const fromId = selectedLine?.fromId || losFromId;
    const toId = selectedLine?.toId || losToId;

    if (!fromId || !toId) {
      return;
    }

    // Swap the calculation direction
    setLosFromId(toId);
    setLosToId(fromId);
    if (selectedLine) {
      setSelectedLine({ fromId: toId, toId: fromId });
    }

    // Recalculate with reversed direction
    await calculateLOS(
      toId,
      fromId,
      (result) => {
        setResult(result);
      },
      (error) => {
        console.error('Reverse calculation failed:', error);
      },
      frequency
    );
  };

  const handleReset = async () => {
    // Reset to defaults
    setPoints(defaultPoints);
    setLosFromId('1');
    setLosToId('2');
    setSelectedLine({ fromId: '1', toId: '2' });
    setIsLOSPanelOpen(true);
    setResult(null);

    // Reset zoom trigger
    setResetZoomTrigger(prev => prev + 1);

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);

    // Trigger calculation for default line (like on page load)
    await calculateLOS(
      '1',
      '2',
      (result) => {
        setResult(result);
      },
      (error) => {
        console.error('Reset calculation failed:', error);
      },
      frequency
    );
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
        onMarkerClick={handleMarkerClick}
        onLineClick={handleLineClick}
        onMapClick={handleMapClick}
        selectedLine={selectedLine}
        segmentDistances={segmentDistances}
        hideLabels={hideLabels}
        hideLines={hideLines}
        isAddingPoint={isAddingPoint}
        hoveredPathPoint={result && hoveredPathIndex !== null ? result.pathPoints[hoveredPathIndex] : null}
        onHelpClick={() => setIsHelpOpen(true)}
        resetZoomTrigger={resetZoomTrigger}
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
          setIsLOSPanelOpen(false);
        }}
        onHoverPoint={(index) => setHoveredPathIndex(index)}
        onReverseCalculation={handleReverseCalculation}
        currentName1={points.find(p => p.id === (selectedLine?.fromId || losFromId))?.name}
        currentName2={points.find(p => p.id === (selectedLine?.toId || losToId))?.name}
        frequency={frequency}
        onFrequencyChange={setFrequency}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <LoadingSpinner isLoading={isLoading} />

      <Footer />
    </div>
  );
}

export default App;
