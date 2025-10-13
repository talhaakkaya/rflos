# Line of Sight (LOS) Calculator

A web-based RF (Radio Frequency) path analysis tool that calculates line of sight between multiple geographic points using real terrain elevation data. Perfect for planning wireless communication links, radio towers, and RF installations.

![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)

## Features

### Interactive Map
- **Multiple Points**: Add unlimited points to your map (minimum 2 required)
- **Draggable Markers**: Click and drag markers to set your locations (first point is red, others are blue)
- **Custom Marker Names**: Name your points (e.g., "Base Station", "Remote Site") with labels displayed above each marker
- **All-Pairs Connections**: Lines automatically connect every pair of points with distance labels
- **Clickable Line Selection**: Click any line or distance label to select it for LOS analysis
  - Selected lines turn red along with their markers and labels
  - Automatic calculation triggers on line selection
- **Real-time Updates**: Coordinate fields update automatically when markers are moved
- **OpenStreetMap Integration**: High-quality map tiles with worldwide coverage
- **Auto-zoom**: Map automatically adjusts to show all points

### Line of Sight Analysis
- **Terrain Profile**: Visual elevation chart showing the path between selected points
- **Earth's Curvature Compensation**: Uses 4/3 Earth radius rule for atmospheric refraction (critical for long paths)
- **Obstruction Detection**: Automatically identifies if terrain blocks the RF path
- **Detailed Metrics**:
  - Total path distance in kilometers (dynamically displayed on chart)
  - Elevation at each point
  - Antenna heights (configurable per point)
  - Location of first obstruction (if blocked)
  - Maximum obstacle height above line of sight
  - Point names displayed in analysis results

### Advanced Configuration
- **Antenna Heights**: Set custom antenna/tower heights for each point independently (in meters)
- **Precision Coordinates**: Enter exact latitude/longitude coordinates (6 decimal places)
- **Real Elevation Data**: Uses Open-Elevation API with 50 sample points along the path
- **Draggable Panels**: Move control and results panels anywhere on screen
- **Point Management**: Add or remove points dynamically (minimum 2 required)

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Styling**: Modern interface with intuitive controls
- **Live Distance Display**: Distance labels shown on all lines between points
- **Visual Selection Feedback**: Selected lines, markers, and labels highlight in red
- **Color-Coded Results**:
  - Green "CLEAR" status for unobstructed paths
  - Red "BLOCKED" status with obstruction details
- **Point Cards**: Each point has its own card with name, coordinates, and height configuration

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Leaflet / React-Leaflet** - Interactive mapping
- **Chart.js** - Elevation profile visualization
- **Open-Elevation API** - Real-world terrain data

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd los-calculator

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open your browser to `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Usage

1. **Add Points**:
   - Start with 2 default points (Point A and Point B)
   - Click "+ Add Point" to add more markers
   - Drag markers on the map to position them, OR
   - Enter exact coordinates in each point's card
   - Name your points for easy identification (e.g., "Tower 1", "Building A")

2. **Configure Each Point**:
   - Enter antenna/tower heights in meters for each point independently
   - Heights are added to the terrain elevation
   - Adjust coordinates precisely using the input fields

3. **Select a Path**:
   - Click any blue line on the map, OR
   - Click any distance label (e.g., "5.23 km")
   - The selected line, markers, and labels turn red
   - LOS calculation starts automatically

4. **Review Results**:
   - Check the status (CLEAR or BLOCKED)
   - View the elevation profile chart with Earth's curvature
   - See detailed path metrics with point names
   - Distance displays dynamically on the chart x-axis

5. **Analyze Multiple Paths**:
   - Click different lines to analyze various combinations
   - Distance labels show for all point pairs
   - Each analysis updates the chart and results panel

6. **Manage Points**:
   - Remove points using the × button (minimum 2 required)
   - Drag markers to adjust positions
   - Add/remove points as needed for your network planning

## API Usage

This application uses the free [Open-Elevation API](https://open-elevation.com/) for terrain elevation data. No API key required.

## Project Structure

```
src/
├── components/
│   ├── ControlPanel.tsx           # Input controls and point management
│   ├── LOSPanel.tsx               # Results display and chart
│   └── MapView/                   # Modular map components
│       ├── MapView.tsx            # Main map container
│       ├── MarkerLabel.tsx        # Point name labels
│       ├── SegmentLabel.tsx       # Distance labels on lines
│       ├── DraggableMarker.tsx    # Individual draggable markers
│       └── MapBoundsAdjuster.tsx  # Auto-zoom logic
├── hooks/
│   ├── usePathCalculation.ts     # LOS and curvature calculations
│   ├── useLOSCalculation.ts      # Reusable LOS calculation hook
│   └── useDraggable.ts            # Drag-and-drop behavior hook
├── types/
│   └── index.ts                   # Centralized TypeScript interfaces
├── App.tsx                        # Main application component
└── main.tsx                       # Entry point
```

## Calculations

The application performs the following calculations:

1. **Distance**: Haversine formula for great circle distance on Earth's surface
2. **Path Sampling**: 50 interpolated points along the great circle path
3. **Elevation Lookup**: Batch query to Open-Elevation API for all sample points
4. **Line of Sight**: Linear interpolation from start to end point (including antenna heights)
5. **Earth's Curvature**: Applies 4/3 Earth radius correction (8,494.67 km effective radius)
   - Formula: `curvature_offset = (d1 × d2) / (2 × R)`
   - Accounts for atmospheric refraction in RF propagation
   - Critical for paths over ~5km where curvature becomes significant
6. **Obstruction Check**: Compares terrain elevation vs. curved LOS line at each sample point

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

- Elevation data accuracy depends on Open-Elevation API resolution (~30m in most areas)
- No Fresnel zone analysis (only direct line-of-sight)
- Weather conditions (temperature inversions, ducting) not modeled
- Path assumes great circle route (not actual terrain-following RF propagation)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the GNU License.

## Acknowledgments

- [Open-Elevation](https://open-elevation.com/) for free elevation data
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
