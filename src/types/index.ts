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
}

export interface SegmentDistance {
  fromId: string;
  toId: string;
  distance: number;
}
