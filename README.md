# Line of Sight (LOS) Calculator

A web-based RF (Radio Frequency) path analysis tool that calculates line of sight between multiple geographic points using real terrain elevation data. Perfect for planning wireless communication links, radio towers, and RF installations.

![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)

## Features

### Interactive Map
- **Multiple Points**: Add unlimited points to your map (minimum 2 required)
- **Click-to-Place Points**: Click "+ Add Point" then click anywhere on the map to place new markers
- **Draggable Markers**: Click and drag markers to set your locations (first point is red, others are blue)
- **Custom Marker Names**: Name your points (e.g., "Base Station", "Remote Site") with labels displayed above each marker
- **All-Pairs Connections**: Lines automatically connect every pair of points with distance labels
- **Clickable Line Selection**: Click any line or distance label to select it for LOS analysis
  - Selected lines turn red along with their markers and labels
  - Automatic calculation triggers on line selection
- **Real-time Updates**: Coordinate fields and calculations update automatically when markers are moved
- **OpenStreetMap Integration**: High-quality map tiles with worldwide coverage
- **Smart Zoom Controls**:
  - Auto-zoom on initial page load to fit all points
  - Manual zoom reset button (🎯) to reframe all points
  - Zoom stays put when adding/removing points or dragging markers
- **View Toggles**: Hide/show distance labels and connection lines for cleaner views
- **URL State Management**: Share links with all points and configurations preserved

### Line of Sight Analysis
- **Terrain Profile**: Visual elevation chart showing the path between selected points
- **Interactive Chart Hover**: Hover over the elevation chart to see exact location markers on the map
- **Expandable Chart**: Click ⬆/⬇ to expand/collapse chart for detailed analysis
- **Earth's Curvature Compensation**: Uses 4/3 Earth radius rule for atmospheric refraction (critical for long paths)
- **Obstruction Detection**: Automatically identifies if terrain blocks the RF path
- **Detailed Metrics**:
  - Total path distance in kilometers (dynamically displayed on chart)
  - Elevation at each point
  - Antenna heights (configurable per point)
  - Location of first obstruction (if blocked)
  - Maximum obstacle height above line of sight
  - Point names displayed in analysis results

### RF Propagation Analysis
- **Frequency Band Selection**: Choose between 2m (144 MHz) and 70cm (432 MHz) amateur radio bands
- **First Fresnel Zone Visualization**:
  - Shaded blue zone displayed on elevation chart
  - Shows critical RF clearance area around line of sight
  - Maximum radius calculated and displayed
  - Different zone sizes for different frequencies
- **Free Space Path Loss (FSPL)**:
  - Automatic calculation in decibels
  - Helps estimate link budget requirements
  - Accounts for frequency-dependent losses
- **Real-time RF Updates**: All RF metrics recalculate when changing frequency or moving markers

### Advanced Configuration
- **Antenna Heights**: Set custom antenna/tower heights for each point independently (in meters)
- **Precision Coordinates**: Enter exact latitude/longitude coordinates (6 decimal places)
- **JSON Import**: Import multiple points from JSON format (supports callsign, latitude, longitude fields)
- **Real Elevation Data**: Uses Open-Elevation API with 50 sample points along the path
- **Draggable Panels**: Move control and results panels anywhere on screen
- **Point Management**: Add or remove points dynamically (minimum 2 required)
- **Auto-Calculation**: Path analysis updates automatically when moving markers or changing settings (no manual calculate button needed)

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
   - Click "+ Add Point" then click anywhere on the map to place new markers
   - Alternative: Drag existing markers on the map to reposition them
   - Enter exact coordinates in each point's card
   - Import multiple points from JSON format
   - Name your points for easy identification (e.g., "Tower 1", "Building A")

2. **Configure Each Point**:
   - Enter antenna/tower heights in meters for each point independently
   - Heights are added to the terrain elevation
   - Adjust coordinates precisely using the input fields

3. **Select Frequency Band**:
   - Choose between 2m (144 MHz) or 70cm (432 MHz) in the RF Analysis section
   - Frequency affects Fresnel zone size and path loss calculations

4. **Select a Path**:
   - Click any blue line on the map, OR
   - Click any distance label (e.g., "5.23 km")
   - The selected line, markers, and labels turn red
   - LOS and RF analysis starts automatically

5. **Review Results**:
   - Check the status (CLEAR or BLOCKED)
   - View the elevation profile chart with Earth's curvature and Fresnel zone
   - See Free Space Path Loss and Fresnel zone radius
   - Hover over the chart to see precise locations on the map
   - Click ⬆ to expand the chart for detailed analysis
   - Distance displays dynamically on the chart x-axis

6. **Interactive Chart Analysis**:
   - Hover over elevation points to see exact locations marked on the map
   - Observe Fresnel zone (blue shaded area) clearance
   - Move mouse outside chart area to hide the location marker

7. **Analyze Multiple Paths**:
   - Click different lines to analyze various combinations
   - Distance labels show for all point pairs
   - Each analysis updates the chart and RF metrics
   - Compare 2m vs 70cm by toggling frequency

8. **Manage Points**:
   - Remove points using the × button (minimum 2 required)
   - Drag markers to adjust positions (calculations auto-update)
   - Add/remove points as needed for your network planning
   - Use 🎯 button to reset map zoom to fit all points

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
│   ├── useURLState.ts             # URL state management
│   └── useDraggable.ts            # Drag-and-drop behavior hook
├── utils/
│   └── rfCalculations.ts          # RF propagation formulas (FSPL, Fresnel)
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
7. **Free Space Path Loss (FSPL)**:
   - Formula: `FSPL(dB) = 20×log₁₀(d_km) + 20×log₁₀(f_MHz) + 32.45`
   - Calculates signal attenuation in free space
   - Used for link budget planning
8. **First Fresnel Zone**:
   - Formula: `radius = √((λ × d1 × d2) / (d1 + d2))`
   - Where λ = wavelength, d1 = distance to point, d2 = distance from point
   - Calculates clearance zone needed for optimal RF propagation
   - 60% clearance recommended for reliable communications

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

- Elevation data accuracy depends on Open-Elevation API resolution (~30m in most areas)
- Weather conditions (temperature inversions, ducting) not modeled
- Path assumes great circle route (not actual terrain-following RF propagation)
- Knife-edge diffraction not calculated (shows only direct obstruction)
- Limited to VHF/UHF amateur bands (2m and 70cm currently supported)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the GNU License.

## Acknowledgments

- [Open-Elevation](https://open-elevation.com/) for free elevation data
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
