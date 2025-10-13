import { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import MapView from './components/MapView';
import LOSPanel from './components/LOSPanel';
import {
  calculateDistance,
  generatePathPoints,
  fetchElevationData,
  calculateLineOfSight,
} from './hooks/usePathCalculation';
import type { LineOfSightResult } from './hooks/usePathCalculation';
import './App.css';

interface PathResult {
  distance: number;
  elevations: number[];
  distances: number[];
  los: LineOfSightResult;
  height1: number;
  height2: number;
}

function App() {
  const [lat1, setLat1] = useState<string>('41.038702');
  const [lon1, setLon1] = useState<string>('28.881802');
  const [lat2, setLat2] = useState<string>('41.115365');
  const [lon2, setLon2] = useState<string>('29.053646');
  const [height1, setHeight1] = useState<string>('10');
  const [height2, setHeight2] = useState<string>('10');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PathResult | null>(null);

  const handleCalculate = async () => {
    const lat1Val = parseFloat(lat1);
    const lon1Val = parseFloat(lon1);
    const lat2Val = parseFloat(lat2);
    const lon2Val = parseFloat(lon2);
    const height1Val = parseFloat(height1) || 0;
    const height2Val = parseFloat(height2) || 0;

    if (isNaN(lat1Val) || isNaN(lon1Val) || isNaN(lat2Val) || isNaN(lon2Val)) {
      alert('Please enter valid coordinates');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate distance
      const distance = calculateDistance(lat1Val, lon1Val, lat2Val, lon2Val);

      // Generate path points
      const pathPoints = generatePathPoints(lat1Val, lon1Val, lat2Val, lon2Val, 50);

      // Fetch elevation data
      const elevations = await fetchElevationData(pathPoints);

      // Calculate distances for each point
      const distances = pathPoints.map((p) =>
        calculateDistance(lat1Val, lon1Val, p.lat, p.lon)
      );

      // Calculate line of sight
      const los = calculateLineOfSight(distances, elevations, height1Val, height2Val);

      setResult({
        distance,
        elevations,
        distances,
        los,
        height1: height1Val,
        height2: height2Val
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error calculating path: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoint1Drag = (lat: number, lng: number) => {
    setLat1(lat.toFixed(6));
    setLon1(lng.toFixed(6));
  };

  const handlePoint2Drag = (lat: number, lng: number) => {
    setLat2(lat.toFixed(6));
    setLon2(lng.toFixed(6));
  };

  return (
    <div className="app">
      <MapView
        lat1={parseFloat(lat1)}
        lon1={parseFloat(lon1)}
        lat2={parseFloat(lat2)}
        lon2={parseFloat(lon2)}
        onPoint1Drag={handlePoint1Drag}
        onPoint2Drag={handlePoint2Drag}
        distance={result?.distance}
      />

      <ControlPanel
        lat1={lat1}
        lon1={lon1}
        lat2={lat2}
        lon2={lon2}
        height1={height1}
        height2={height2}
        onLat1Change={setLat1}
        onLon1Change={setLon1}
        onLat2Change={setLat2}
        onLon2Change={setLon2}
        onHeight1Change={setHeight1}
        onHeight2Change={setHeight2}
        onCalculate={handleCalculate}
        isLoading={isLoading}
      />

      <LOSPanel result={result} />
    </div>
  );
}

export default App;
