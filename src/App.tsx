import { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView/MapView';
import LOSPanel from './components/LOSPanel';
import { calculateDistance } from './hooks/usePathCalculation';
import { useLOSCalculation } from './hooks/useLOSCalculation';
import type { Point, PathResult, SegmentDistance } from './types';
import './App.css';

function App() {
  const [points, setPoints] = useState<Point[]>([
    { id: '1', lat: 41.038702, lon: 28.881802, name: 'Point A', height: 10 },
    { id: '2', lat: 41.0600, lon: 28.9850, name: 'Point B', height: 10 },
  ]);

  const [losFromId, setLosFromId] = useState<string>('1');
  const [losToId, setLosToId] = useState<string>('2');
  const [selectedLine, setSelectedLine] = useState<{ fromId: string; toId: string } | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);
  const [segmentDistances, setSegmentDistances] = useState<SegmentDistance[]>([]);

  const { calculateLOS, isLoading } = useLOSCalculation(points);

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
    setResult(null);
    setSegmentDistances([]);
    setSelectedLine(null);
  };

  const handleLineClick = async (fromId: string, toId: string) => {
    setSelectedLine({ fromId, toId });
    setLosFromId(fromId);
    setLosToId(toId);

    // Automatically calculate LOS for the clicked line
    await calculateLOS(
      fromId,
      toId,
      (result) => {
        setResult(result);
        calculateSegmentDistances();
      },
      (error) => {
        alert('Error calculating path: ' + error);
      }
    );
  };

  const handleCalculate = async () => {
    // Use the selected line if available, otherwise use the current losFromId/losToId
    const fromId = selectedLine?.fromId || losFromId;
    const toId = selectedLine?.toId || losToId;

    await calculateLOS(
      fromId,
      toId,
      (result) => {
        setResult(result);
        calculateSegmentDistances();
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
    const lastPoint = points[points.length - 1];
    const newId = (Math.max(...points.map(p => parseInt(p.id))) + 1).toString();
    const newPoint: Point = {
      id: newId,
      lat: lastPoint.lat + 0.01,
      lon: lastPoint.lon + 0.01,
      name: `Point ${String.fromCharCode(65 + points.length)}`,
      height: 10
    };
    setPoints([...points, newPoint]);
    setResult(null);
    setSegmentDistances([]);
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

    setResult(null);
    setSegmentDistances([]);
    setSelectedLine(null);
  };

  return (
    <div className="app">
      <MapView
        points={points}
        onPointDrag={handlePointDrag}
        onLineClick={handleLineClick}
        selectedLine={selectedLine}
        segmentDistances={segmentDistances}
        losFromId={result ? losFromId : undefined}
        losToId={result ? losToId : undefined}
      />

      <ControlPanel
        points={points}
        onPointUpdate={handlePointUpdate}
        onAddPoint={handleAddPoint}
        onRemovePoint={handleRemovePoint}
        onCalculate={handleCalculate}
        isLoading={isLoading}
      />

      <LOSPanel result={result} />
    </div>
  );
}

export default App;
