import type { LineOfSightResult } from '../hooks/usePathCalculation';
import type { Obstacle } from '../utils/diffraction';

export interface Point {
  id: string;
  lat: number;
  lon: number;
  name: string;
  height: number;
}

export interface PathResult {
  distance: number;
  elevations: number[];
  distances: number[];
  los: LineOfSightResult;
  height1: number;
  height2: number;
  name1: string;
  name2: string;
  pathPoints: { lat: number; lon: number }[];
  frequency?: number; // MHz
  fresnelZone?: {
    upper: number[]; // Fresnel zone upper boundary elevations
    lower: number[]; // Fresnel zone lower boundary elevations
    radius: number; // Maximum Fresnel zone radius in meters
    clearancePercentages: number[]; // Clearance percentage at each point
    minClearance: number; // Minimum clearance percentage along path
    minClearanceDistance: number; // Distance (km) where minimum clearance occurs
    minClearanceMeters: number; // Minimum clearance in meters (actual vertical space)
  };
  fspl?: number; // Free Space Path Loss in dB
  bearing?: number; // Forward bearing/azimuth in degrees (0-360)
  reverseBearing?: number; // Reverse bearing in degrees (0-360)
  elevationAngle?: number; // Elevation angle from point1 to point2 (degrees, + is up, - is down)
  reverseElevationAngle?: number; // Elevation angle from point2 to point1 (degrees)
  diffraction?: {
    obstacles: Obstacle[]; // Detected obstacles along the path
    totalLoss: number; // Total diffraction loss in dB
    mainObstacle: Obstacle | null; // Most significant obstacle
  };
  kFactor?: number; // K-factor used for earth curvature and atmospheric refraction
}

export interface SegmentDistance {
  fromId: string;
  toId: string;
  distance: number;
}
