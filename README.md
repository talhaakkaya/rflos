# Line of Sight (LOS) Calculator

A web-based RF (Radio Frequency) path analysis tool that calculates line of sight between two geographic points using real terrain elevation data. Perfect for planning wireless communication links, radio towers, and RF installations.

![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)

## Features

### Interactive Map
- **Draggable Markers**: Click and drag red (Point A) and blue (Point B) markers to set your locations
- **Custom Marker Names**: Name your points (e.g., "Base Station", "Remote Site") with labels displayed above each marker
- **Real-time Updates**: Coordinate fields update automatically when markers are moved
- **OpenStreetMap Integration**: High-quality map tiles with worldwide coverage
- **Auto-zoom**: Map automatically adjusts to show both points

### Line of Sight Analysis
- **Terrain Profile**: Visual elevation chart showing the path between two points
- **Obstruction Detection**: Automatically identifies if terrain blocks the RF path
- **Detailed Metrics**:
  - Total path distance in kilometers
  - Elevation at each point
  - Antenna heights (configurable)
  - Location of first obstruction (if blocked)
  - Maximum obstacle height above line of sight

### Advanced Configuration
- **Antenna Heights**: Set custom antenna/tower heights for both points (in meters)
- **Precision Coordinates**: Enter exact latitude/longitude coordinates (6 decimal places)
- **Real Elevation Data**: Uses Open-Elevation API with 50 sample points along the path
- **Draggable Panels**: Move control and results panels anywhere on screen

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Styling**: Modern interface with intuitive controls
- **Live Distance Display**: Shows path distance on the map after calculation
- **Color-Coded Results**:
  - Green "CLEAR" status for unobstructed paths
  - Red "BLOCKED" status with obstruction details

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

1. **Set Your Points**:
   - Drag the red (Point A) and blue (Point B) markers on the map, OR
   - Enter exact coordinates in the control panel
   - Optionally name your points for easy identification

2. **Configure Antenna Heights**:
   - Enter antenna/tower heights in meters for each point
   - Heights are added to the terrain elevation

3. **Calculate**:
   - Click "Calculate Path" button
   - Wait for elevation data to load (~1-2 seconds)

4. **Review Results**:
   - Check the status (CLEAR or BLOCKED)
   - View the elevation profile chart
   - See detailed path metrics
   - Distance label appears on the map

5. **Adjust and Recalculate**:
   - Drag markers to new positions
   - Previous results clear automatically
   - Click "Calculate Path" again

## API Usage

This application uses the free [Open-Elevation API](https://open-elevation.com/) for terrain elevation data. No API key required.

## Project Structure

```
src/
├── components/
│   ├── ControlPanel.tsx    # Input controls and settings
│   ├── MapView.tsx          # Interactive Leaflet map
│   └── LOSPanel.tsx         # Results display and chart
├── hooks/
│   └── usePathCalculation.ts # LOS calculation logic
├── App.tsx                   # Main application component
└── main.tsx                  # Entry point
```

## Calculations

The application performs the following calculations:

1. **Distance**: Haversine formula for great circle distance
2. **Path Sampling**: 50 interpolated points along the straight line
3. **Elevation Lookup**: Batch query to Open-Elevation API
4. **Line of Sight**: Linear interpolation from start to end point (including antenna heights)
5. **Obstruction Check**: Compares terrain elevation vs. LOS line at each sample point

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

- Assumes straight-line RF path (no atmospheric refraction correction)
- Elevation data accuracy depends on Open-Elevation API resolution
- Does not account for Earth's curvature (suitable for paths < 50km)
- No Fresnel zone analysis

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Open-Elevation](https://open-elevation.com/) for free elevation data
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
