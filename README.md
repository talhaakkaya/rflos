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
- **Knife-Edge Diffraction Analysis** (ITU-R P.526):
  - Detects terrain obstacles above the line of sight
  - Calculates Fresnel-Kirchhoff diffraction parameters
  - Multi-obstacle diffraction loss calculations
  - Shows main obstacle location and height above LOS
  - Total diffraction loss in dB added to path loss
  - Supports multiple knife-edge obstacles along the path
- **K-Factor / Atmospheric Refraction**:
  - Adjustable K-factor from 1.0 to 5.0 (default: 4/3 standard atmosphere)
  - Presets for different conditions: No refraction, Standard, Inversion
  - Affects radio horizon distance and LOS calculations
  - Shows refraction category (Subrefractive/Standard/Superrefractive/Ducting)
  - Temperature inversion and ducting condition modeling
- **ERP Calculator & Link Budget Tool**:
  - Calculate Effective Radiated Power (ERP) for both stations
  - Bidirectional link budget analysis
  - Multiple modulation types: FM 25kHz, FM 12.5kHz, NFM, P25 Digital, DMR, D-Star, SSB, CW
  - Transmitter power, antenna gain, and cable loss inputs
  - Received power and link margin calculations
  - Fade margin with quality assessment (Excellent/Good/Marginal/Poor/Failed)
  - Power unit conversions: watts ↔ dBm, dBi ↔ dBd
  - Real-time link budget updates with path changes
- **Real-time RF Updates**: All RF metrics recalculate when changing frequency or moving markers

### Advanced Configuration
- **Antenna Heights**: Set custom antenna/tower heights for each point independently (in meters)
- **Precision Coordinates**: Enter exact latitude/longitude coordinates (6 decimal places)
- **JSON Import**: Import multiple points from JSON format (supports callsign, latitude, longitude fields)
- **Real Elevation Data**: Uses Open-Elevation API with 50 sample points along the path
- **Draggable Panels**:
  - Station Setup panel (control panel) - draggable
  - RF Analysis panel - draggable with independent positioning
  - Path Analysis panel (Line of Sight) - separate results display
- **Point Management**: Add or remove points dynamically (minimum 2 required)
- **Advanced LOS Settings**: Configure K-factor for atmospheric refraction modeling
- **Auto-Calculation**: Path analysis updates automatically when moving markers or changing settings (no manual calculate button needed)

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Styling**: Modern interface with intuitive controls
- **Live Distance Display**: Distance labels shown on all lines between points
- **Visual Selection Feedback**: Selected lines, markers, and labels highlight in red
- **Color-Coded Results**:
  - Green "CLEAR" status for unobstructed paths
  - Red "BLOCKED" status when terrain obstructs the path
  - Orange "BEYOND HORIZON" status when path exceeds radio horizon (Earth's curvature limit)
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
git clone https://github.com/talhaakkaya/rflos
cd rflos

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
   - **Path Analysis Panel** (Line of Sight):
     - Check the status (CLEAR or BLOCKED)
     - View the elevation profile chart with Earth's curvature and Fresnel zone
     - **Antenna Aiming** section shows:
       - Azimuth (compass bearing) for both directions with cardinal directions
       - Elevation angle (vertical pointing angle) for both directions
       - Interactive compass visualization when chart is expanded
     - Hover over the chart to see precise locations on the map
     - Click ⬆ to expand the chart for detailed analysis
     - Click ⇅ to reverse calculation direction and see opposite perspective
   - **RF Analysis Panel** (draggable):
     - Free Space Path Loss (FSPL) in dB
     - Knife-Edge Diffraction analysis (if obstacles detected)
       - Main obstacle location and height
       - Diffraction loss in dB
       - Total path loss (FSPL + diffraction)
     - K-Factor (atmospheric refraction) with category
     - Fresnel zone radius and clearance percentage

6. **ERP Calculator & Link Budget**:
   - Click "🔌 ERP Calculator" button in RF Analysis panel
   - Configure transmitter power, antenna gain, and cable loss for both stations
   - Select modulation type (FM, NFM, Digital, SSB, CW) or use custom settings
   - View bidirectional link budget with:
     - Effective Radiated Power (ERP) for both directions
     - Received power levels
     - Link margin and fade margin
     - Link quality assessment (Excellent/Good/Marginal/Poor/Failed)
   - Switch between watts/dBm and dBi/dBd units

7. **Advanced LOS Settings** (K-Factor):
   - Click "⚙️ Settings" button in RF Analysis panel
   - Adjust K-factor slider (1.0 to 5.0)
   - Quick presets:
     - No Refraction (1.0) - geometric LOS only
     - Standard (1.333) - normal atmospheric conditions
     - Inversion (1.5) - enhanced propagation
   - K-factor affects LOS horizon distance and path clearance

8. **Interactive Chart Analysis**:
   - Hover over elevation points to see exact locations marked on the map
   - Observe Fresnel zone (blue shaded area) clearance
   - Move mouse outside chart area to hide the location marker

9. **Analyze Multiple Paths**:
   - Click different lines to analyze various combinations
   - Distance labels show for all point pairs
   - Each analysis updates the chart and RF metrics
   - Compare 2m vs 70cm by toggling frequency

10. **Manage Points and Panels**:
   - Remove points using the × button (minimum 2 required)
   - Drag markers to adjust positions (calculations auto-update)
   - Drag RF Analysis panel anywhere on screen for better visibility
   - Add/remove points as needed for your network planning
   - Use 🎯 button to reset map zoom to fit all points

## API Usage

This application uses the free [Open-Elevation API](https://open-elevation.com/) for terrain elevation data. No API key required.

## Project Structure

```
src/
├── components/
│   ├── ControlPanel.tsx           # Station Setup panel (input controls and point management)
│   ├── LOSPanel.tsx               # Line of Sight results display and elevation chart
│   ├── RFAnalysisPanel.tsx        # RF Analysis panel (draggable) - frequency, FSPL, diffraction, K-factor
│   ├── ERPCalculator.tsx          # ERP/Link Budget calculator modal
│   ├── AdvancedSettingsModal.tsx  # K-factor and LOS settings modal
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
│   ├── usePathCalculation.ts      # Distance, bearing, and path generation
│   ├── useLOSCalculation.ts       # LOS calculation with earth curvature and K-factor
│   ├── useURLState.ts             # URL state encoding/decoding
│   ├── useDraggable.ts            # Drag-and-drop behavior hook
│   └── useLocalStorage.ts         # Local storage persistence hook
├── utils/
│   ├── rfCalculations.ts          # RF formulas (FSPL, Fresnel, clearance)
│   ├── diffraction.ts             # Knife-edge diffraction (ITU-R P.526)
│   ├── linkBudget.ts              # ERP and link budget calculations
│   ├── atmospheric.ts             # K-factor and atmospheric refraction
│   ├── formatting.ts              # Display formatting utilities
│   └── pointComparison.ts         # Point comparison utilities
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

6. **Cumulative Angle Visibility**: More accurate than simple LOS line intersection
   - Calculates curvature drop: `h = d² / (2 × K × R)`
   - Effective terrain height: `effectiveHeight = terrain - curvatureDrop`
   - Angle from observer: `angle = atan2(effectiveHeight - observerHeight, distance)`
   - Tracks cumulative max angle (horizon) - if target angle < horizon angle, blocked
   - 0.005° tolerance for elevation data precision
   - Distinguishes between terrain blockage vs Earth's curvature (radio horizon)

7. **Radio Horizon**: Maximum theoretical LOS distance based on height above sea level
   - Formula: `d = 4.12 × √(K × h)` where h is total height (ground + antenna) in meters
   - Combined range: `d_total = d_A + d_B`
   - Uses effective Earth radius with K-factor for atmospheric refraction

8. **Antenna Bearing (Azimuth)**:
   - Formula: `θ = atan2(sin(Δλ)×cos(φ2), cos(φ1)×sin(φ2) - sin(φ1)×cos(φ2)×cos(Δλ))`
   - Converts to 0-360° range and cardinal directions (N, NE, E, etc.)
   - Calculated bidirectionally for both endpoints

9. **Elevation Angle (Vertical)**:
   - Accounts for Earth's curvature: `effectiveHeight = targetHeight - curvatureDrop`
   - Formula: `angle = atan2(effectiveHeight - observerHeight, distance)`
   - curvatureDrop = d² / (2 × K × R)
   - Positive angle = point antenna up, negative = point down

10. **Free Space Path Loss (FSPL)**:
    - Formula: `FSPL(dB) = 20×log₁₀(d_km) + 20×log₁₀(f_MHz) + 32.45`
    - Calculates signal attenuation in free space
    - Used for link budget planning

11. **First Fresnel Zone**:
    - Formula: `radius = √((λ × d1 × d2) / (d1 + d2))`
    - Where λ = wavelength, d1 = distance to point, d2 = distance from point
    - Calculates clearance zone needed for optimal RF propagation
    - Clearance percentage = (actual clearance / radius) × 100%
    - Status thresholds: ≥100% Excellent, ≥60% Good, ≥20% Marginal, ≥0% Poor, <0% Obstructed
    - 60% clearance (0.6 × radius) recommended for reliable communications

12. **Knife-Edge Diffraction** (ITU-R P.526):
    - **Fresnel-Kirchhoff parameter**: `v = h × √(2(d1 + d2) / (λ × d1 × d2))`
      - h = obstacle height above LOS line (m)
      - d1, d2 = distances from transmitter/receiver to obstacle (m)
      - λ = wavelength (m)
    - **Diffraction Loss**: `L(v) = 6.9 + 20×log₁₀(√((v - 0.1)² + 1) + v - 0.1)` dB
    - **Multi-obstacle**: Uses primary obstacle loss + weighted secondary obstacles
    - Detects obstacles within 5m below LOS line for near-grazing cases

13. **K-Factor (Atmospheric Refraction)**:
    - Effective Earth radius: `R_eff = k × R_earth`
    - Standard atmosphere: k = 4/3 (1.333)
    - Subrefractive: k < 1.2 (signal bends away from Earth)
    - Superrefractive: k > 1.35 (enhanced propagation)
    - Ducting: k > 1.6 (extreme range extension)
    - Affects LOS horizon and path clearance calculations

14. **Link Budget (ERP Calculator)**:
    - **ERP (Effective Radiated Power)**: `ERP = P_tx + G_ant - L_cable` (dBm)
    - **Received Power**: `P_rx = ERP - FSPL + G_rx - L_cable_rx` (dBm)
    - **Link Margin**: `Margin = P_rx - Sensitivity` (dB)
    - **Fade Margin**: `Fade = Margin - SNR_required` (dB)
    - **Power Conversions**:
      - dBm to Watts: `P(W) = 10^(P(dBm)/10) / 1000`
      - dBd to dBi: `G(dBi) = G(dBd) + 2.15`
    - Quality thresholds: Excellent ≥20dB, Good ≥10dB, Marginal ≥0dB, Poor ≥-6dB

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

- Elevation data accuracy depends on Open-Elevation API resolution (~30m in most areas)
- Path assumes great circle route (not actual terrain-following RF propagation)
- Frequency range limited to 30-3000 MHz (VHF/UHF bands)
- Clutter losses (buildings, vegetation) not included in calculations
- Diffraction calculations use ITU-R P.526 knife-edge approximation (actual terrain may differ)
- K-factor modeling is simplified (real atmospheric conditions vary continuously)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the GNU License.

## Acknowledgments

- [Open-Elevation](https://open-elevation.com/) for free elevation data
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- Developed by [TA1VAL](https://www.qrz.com/db/TA1VAL)
