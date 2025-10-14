import type { LineOfSightResult } from '../hooks/usePathCalculation';

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
  };
  fspl?: number; // Free Space Path Loss in dB
}

export interface SegmentDistance {
  fromId: string;
  toId: string;
  distance: number;
}
