import { useState, useEffect, useRef, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView/MapView';
import LOSPanel from './components/LOSPanel';
import RFAnalysisPanel from './components/RFAnalysisPanel';
import HelpModal from './components/HelpModal';
import ERPCalculator from './components/ERPCalculator';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import { calculateDistance } from './hooks/usePathCalculation';
import { useLOSCalculation } from './hooks/useLOSCalculation';
import { decodeStateFromURL, updateURL } from './hooks/useURLState';
import { gridLocatorToLatLon } from './utils/gridLocator';
import type { Point, SegmentDistance } from './types';
import { Menu } from 'lucide-react';
import './App.css';

function App() {
  const defaultPoints: Point[] = [
    { id: '1', lat: 41.038702, lon: 28.881802, name: 'Point A', height: 10 },
    { id: '2', lat: 41.0600, lon: 28.9850, name: 'Point B', height: 10 },
  ];

  const initialState = () => {
    const urlState = decodeStateFromURL();
    console.log('Initializing state from URL:', urlState);

    if (!urlState) {
      return {
        points: defaultPoints,
        losFromId: '1',
        losToId: '2',
        selectedLine: { fromId: '1', toId: '2' },
        hideLines: false,
        isPanelVisible: true,
        isLOSPanelOpen: true,
        frequency: 145.500
      };
    }

    return {
      points: urlState.points || defaultPoints,
      losFromId: urlState.losFromId || '1',
      losToId: urlState.losToId || '2',
      selectedLine: urlState.selectedLine ?? null,
      hideLines: urlState.hideLines || false,
      isPanelVisible: urlState.isPanelVisible ?? true,
      isLOSPanelOpen: urlState.isLOSPanelOpen ?? true,
      frequency: urlState.frequency || 145.500
    };
  };

  const initial = useMemo(() => initialState(), []);

  const [points, setPoints] = useState<Point[]>(initial.points);
  const [losFromId, setLosFromId] = useState<string>(initial.losFromId);
  const [losToId, setLosToId] = useState<string>(initial.losToId);
  const [selectedLine, setSelectedLine] = useState<{ fromId: string; toId: string } | null>(initial.selectedLine);
  const [hideLines, setHideLines] = useState<boolean>(initial.hideLines);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(initial.isPanelVisible);
  const [isLOSPanelOpen, setIsLOSPanelOpen] = useState<boolean>(initial.isLOSPanelOpen);

  const [segmentDistances, setSegmentDistances] = useState<SegmentDistance[]>([]);
  const [hideLabels, setHideLabels] = useState<boolean>(false);
  const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);
  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<number>(initial.frequency);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isERPCalculatorOpen, setIsERPCalculatorOpen] = useState<boolean>(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState<boolean>(false);
  const [resetZoomTrigger, setResetZoomTrigger] = useState<number>(0);
  const [showRFAnalysis, setShowRFAnalysis] = useState<boolean>(false);
  const [kFactor, setKFactor] = useState<number>(4/3);

  const pointsGeometry = useMemo(() =>
    points.map(p => ({ id: p.id, lat: p.lat, lon: p.lon, height: p.height })),
    [points]
  );

  const { result, isLoading, error } = useLOSCalculation({
    fromId: losFromId,
    toId: losToId,
    points,
    frequency,
    kFactor,
    enabled: isLOSPanelOpen && !!losFromId && !!losToId
  });

  useEffect(() => {
    if (error) {
      console.error('Calculation failed:', error);
    }
  }, [error]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      updateURL({ points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen, frequency });
      return;
    }
    console.log('App state changed - updating URL:', { points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen, frequency });
    updateURL({ points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen, frequency });
  }, [points, losFromId, losToId, selectedLine, hideLines, isPanelVisible, isLOSPanelOpen, frequency]);

  useEffect(() => {
    calculateSegmentDistances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsGeometry]);

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
  };

  const handleMarkerClick = (id: string) => {
    if (points[0].id === id) {
      return;
    }

    const clickedPoint = points.find(p => p.id === id);
    if (!clickedPoint) {
      return;
    }

    const reorderedPoints = [
      clickedPoint,
      ...points.filter(p => p.id !== id)
    ];

    setPoints(reorderedPoints);
    setLosFromId(clickedPoint.id);
    setLosToId(reorderedPoints[1].id);

    if (isLOSPanelOpen && (result || selectedLine)) {
      setSelectedLine({ fromId: clickedPoint.id, toId: reorderedPoints[1].id });
    }
  };

  const handleLineClick = (fromId: string, toId: string) => {
    const isAlreadySelected = selectedLine &&
      ((selectedLine.fromId === fromId && selectedLine.toId === toId) ||
       (selectedLine.fromId === toId && selectedLine.toId === fromId));

    if (isAlreadySelected) {
      setSelectedLine(null);
      setIsLOSPanelOpen(false);
      return;
    }

    setSelectedLine({ fromId, toId });
    setLosFromId(fromId);
    setLosToId(toId);
    setIsLOSPanelOpen(true);
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

    if (losFromId === id || losToId === id) {
      setLosFromId(remainingPoints[0].id);
      setLosToId(remainingPoints[1].id);
    }

    if (selectedLine && (selectedLine.fromId === id || selectedLine.toId === id)) {
      setSelectedLine(null);
    }
  };

  const handleReverseCalculation = () => {
    const fromId = selectedLine?.fromId || losFromId;
    const toId = selectedLine?.toId || losToId;

    if (!fromId || !toId) {
      return;
    }

    setLosFromId(toId);
    setLosToId(fromId);
    if (selectedLine) {
      setSelectedLine({ fromId: toId, toId: fromId });
    }
  };

  const handleReset = () => {
    setPoints(defaultPoints);
    setLosFromId('1');
    setLosToId('2');
    setSelectedLine({ fromId: '1', toId: '2' });
    setIsLOSPanelOpen(true);
    setFrequency(145.500);
    setResetZoomTrigger(prev => prev + 1);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleImportJSON = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      const importedPoints: Point[] = [];

      const items = Array.isArray(data) ? data : [data];

      const isDuplicate = (lat: number, lon: number, name: string): boolean => {
        return points.some(p =>
          p.lat === lat && p.lon === lon && p.name === name
        );
      };

      items.forEach((item, index) => {
        let lat: number | null = null;
        let lon: number | null = null;

        if (item.latitude && item.longitude) {
          lat = parseFloat(item.latitude);
          lon = parseFloat(item.longitude);
        }
        else {
          const gridField = item.grid_square || item.gridsquare || item.grid || item.locator;

          if (gridField) {
            const coords = gridLocatorToLatLon(gridField);
            if (coords) {
              lat = coords.lat;
              lon = coords.lon;
            }
          }
        }

        if (lat !== null && lon !== null) {
          const name = item.callsign || item.name || `Point ${String.fromCharCode(65 + points.length + index)}`;

          if (isDuplicate(lat, lon, name)) {
            return;
          }

          const newId = (Math.max(...points.map(p => parseInt(p.id)), 0) + index + 1).toString();
          importedPoints.push({
            id: newId,
            lat,
            lon,
            name,
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

  const handleApplyAdvancedSettings = (settings: {
    kFactor: number;
  }) => {
    setKFactor(settings.kFactor);
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
          <Menu size={20} />
        </button>
      )}

      {isLOSPanelOpen && (
        <LOSPanel
          result={result}
          onClose={() => {
            setSelectedLine(null);
            setIsLOSPanelOpen(false);
          }}
          onHoverPoint={(index) => setHoveredPathIndex(index)}
          onReverseCalculation={handleReverseCalculation}
          onRFAnalysisToggle={() => setShowRFAnalysis(!showRFAnalysis)}
          showRFAnalysis={showRFAnalysis}
          currentName1={points.find(p => p.id === (selectedLine?.fromId || losFromId))?.name}
          currentName2={points.find(p => p.id === (selectedLine?.toId || losToId))?.name}
          isLoading={isLoading}
        />
      )}

      {showRFAnalysis && (
        <RFAnalysisPanel
          result={result}
          frequency={frequency}
          onFrequencyChange={setFrequency}
          onOpenERPCalculator={() => setIsERPCalculatorOpen(true)}
          onOpenAdvancedSettings={() => setIsAdvancedSettingsOpen(true)}
          onClose={() => setShowRFAnalysis(false)}
          currentName1={points.find(p => p.id === (selectedLine?.fromId || losFromId))?.name}
          isLoading={isLoading}
        />
      )}

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ERPCalculator
        isOpen={isERPCalculatorOpen}
        onClose={() => setIsERPCalculatorOpen(false)}
        fspl={result?.fspl}
        distance={result?.distance}
        frequency={result?.frequency}
        pointAName={points.find(p => p.id === (selectedLine?.fromId || losFromId))?.name}
        pointBName={points.find(p => p.id === (selectedLine?.toId || losToId))?.name}
      />

      <AdvancedSettingsModal
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        kFactor={kFactor}
        onApply={handleApplyAdvancedSettings}
      />

      <LoadingSpinner isLoading={isLoading} />

      <Footer />
    </div>
  );
}

export default App;
