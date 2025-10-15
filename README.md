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
- **View Toggles**:
  - Hide/show distance labels for cleaner views
  - Toggle between all lines or only Point A connections (default)
- **LOS Analysis Indicator**: Low-opacity dashed line shows which path is being analyzed when no line is selected
- **URL State Management**:
  - Share links with all points and configurations preserved
  - UI preferences (panel visibility, line display mode) persisted in URL

### Line of Sight Analysis
- **Terrain Profile**: Visual elevation chart showing the path between selected points
- **Interactive Chart Hover**: Hover over the elevation chart to see exact location markers on the map
- **Expandable Chart**: Click ⬆/⬇ to expand/collapse chart for detailed analysis
- **Earth's Curvature Compensation**: Uses 4/3 Earth radius rule for atmospheric refraction (critical for long paths)
- **Curved Path Visualization**: All lines on the map follow Earth's curvature using 50 interpolated points
- **Obstruction Detection**: Automatically identifies if terrain blocks the RF path
- **Detailed Metrics**:
  - Total path distance in kilometers (dynamically displayed on chart)
  - Elevation at each point
  - Antenna heights (configurable per point)
  - Location of first obstruction (if blocked)
  - Maximum obstacle height above line of sight
  - Point names displayed in analysis results
- **Antenna Aiming Calculations**:
  - **Azimuth (Bearing)**: Compass heading from each point with cardinal directions (N, NE, E, etc.)
  - **Elevation Angle**: Vertical takeoff angle for antenna pointing (positive = point up, negative = point down)
  - **Interactive Compass**: Visual compass rose showing bearing direction (displayed when chart is expanded)
  - **Bidirectional**: Shows both forward and reverse bearings/elevations
- **Reverse Path Analysis**: Swap calculation direction with one click to analyze path from opposite perspective

### RF Propagation Analysis
- **Frequency Selection**:
  - Quick buttons for 2m (145.5 MHz) and 70cm (433.5 MHz) amateur radio bands
  - Custom frequency input supporting 30-3000 MHz (VHF/UHF range)
  - 12.5 kHz step precision for channel spacing
- **First Fresnel Zone Visualization**:
  - Shaded blue zone displayed on elevation chart
  - Shows critical RF clearance area around line of sight
  - Maximum radius calculated and displayed
  - Clearance percentage and status indicator (Excellent/Good/Marginal/Poor/Obstructed)
  - 60% clearance recommendation highlighted
  - Minimum clearance point location shown
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

3. **Select Frequency**:
   - Quick select: Click 2m or 70cm buttons for common amateur radio bands
   - Custom frequency: Enter any value from 30-3000 MHz
   - Frequency affects Fresnel zone size and path loss calculations
   - Updates automatically as you type

4. **Select a Path**:
   - Click any blue line on the map, OR
   - Click any distance label (e.g., "5.23 km")
   - The selected line, markers, and labels turn red
   - LOS and RF analysis starts automatically

5. **Review Results**:
   - Check the status (CLEAR or BLOCKED)
   - View the elevation profile chart with Earth's curvature and Fresnel zone
   - See Free Space Path Loss, Fresnel zone radius, and clearance percentage
   - **Antenna Aiming** section shows:
     - Azimuth (compass bearing) for both directions with cardinal directions
     - Elevation angle (vertical pointing angle) for both directions
     - Interactive compass visualization when chart is expanded
   - Hover over the chart to see precise locations on the map
   - Click ⬆ to expand the chart for detailed analysis
   - Click ⇅ to reverse calculation direction and see opposite perspective
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
│   ├── LOSPanel.tsx               # Results display, chart, and antenna aiming
│   ├── Footer.tsx                 # Author attribution and GitHub link
│   ├── HelpModal.tsx              # Help documentation modal
│   ├── LoadingSpinner.tsx         # Loading indicator
│   └── MapView/                   # Modular map components
│       ├── MapView.tsx            # Main map container with curved lines
│       ├── MarkerLabel.tsx        # Point name labels
│       ├── SegmentLabel.tsx       # Distance labels on lines
│       ├── DraggableMarker.tsx    # Individual draggable markers
│       ├── MapBoundsAdjuster.tsx  # Auto-zoom logic
│       ├── ZoomResetButton.tsx    # Manual zoom reset control
│       └── HelpButton.tsx         # Map help button
├── hooks/
│   ├── usePathCalculation.ts     # Distance, bearing, and path generation
│   ├── useLOSCalculation.ts      # LOS calculation with earth curvature
│   ├── useURLState.ts             # URL state encoding/decoding
│   └── useDraggable.ts            # Drag-and-drop behavior hook
├── utils/
│   └── rfCalculations.ts          # RF formulas (FSPL, Fresnel, clearance)
├── types/
│   └── index.ts                   # Centralized TypeScript interfaces
├── App.tsx                        # Main application component
└── main.tsx                       # Entry point
```

## Calculations

The application performs the following calculations:

1. **Distance**: Haversine formula for great circle distance on Earth's surface
   - Formula: `d = 2R × arcsin(√(sin²(Δφ/2) + cos(φ1)×cos(φ2)×sin²(Δλ/2)))`
   - R = Earth radius (6371 km), φ = latitude, λ = longitude

2. **Path Sampling**: 50 interpolated points along the great circle path
   - Used for both elevation profile and curved line visualization on map

3. **Elevation Lookup**: Batch query to Open-Elevation API for all sample points

4. **Line of Sight**: Linear interpolation from start to end point (including antenna heights)

5. **Earth's Curvature**: Applies 4/3 Earth radius correction (8,494.67 km effective radius)
   - Formula: `curvature_offset = (d1 × d2) / (2 × R)`
   - Accounts for atmospheric refraction in RF propagation
   - Critical for paths over ~5km where curvature becomes significant
   - Visualized on map with curved polylines

6. **Obstruction Check**: Compares terrain elevation vs. curved LOS line at each sample point

7. **Antenna Bearing (Azimuth)**:
   - Formula: `θ = atan2(sin(Δλ)×cos(φ2), cos(φ1)×sin(φ2) - sin(φ1)×cos(φ2)×cos(Δλ))`
   - Converts to 0-360° range and cardinal directions (N, NE, E, etc.)
   - Calculated bidirectionally for both endpoints

8. **Elevation Angle (Vertical)**:
   - Formula: `angle = atan2(Δh, d) × 180/π`
   - Δh = height difference (including antenna heights)
   - d = horizontal distance in meters
   - Positive angle = point antenna up, negative = point down

9. **Free Space Path Loss (FSPL)**:
   - Formula: `FSPL(dB) = 20×log₁₀(d_km) + 20×log₁₀(f_MHz) + 32.45`
   - Calculates signal attenuation in free space
   - Used for link budget planning

10. **First Fresnel Zone**:
    - Formula: `radius = √((λ × d1 × d2) / (d1 + d2))`
    - Where λ = wavelength, d1 = distance to point, d2 = distance from point
    - Calculates clearance zone needed for optimal RF propagation
    - Clearance percentage = (actual clearance / radius) × 100%
    - Status thresholds: ≥100% Excellent, ≥60% Good, ≥20% Marginal, ≥0% Poor, <0% Obstructed
    - 60% clearance (0.6 × radius) recommended for reliable communications

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
- Frequency range limited to 30-3000 MHz (VHF/UHF bands)
- Clutter losses (buildings, vegetation) not included in calculations

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the GNU License.

## Acknowledgments

- [Open-Elevation](https://open-elevation.com/) for free elevation data
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- Developed by [TA1VAL](https://www.qrz.com/db/TA1VAL)
