import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How to Use LOS Calculator</h2>
          <button className="btn-icon-lg btn-danger-solid" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <section className="help-section">
            <h3>🗺️ Getting Started</h3>
            <ul>
              <li><strong>Add Points:</strong> Click "+ Add Point" then click anywhere on the map to place markers</li>
              <li><strong>Move Points:</strong> Drag any marker to reposition it</li>
              <li><strong>Import Points:</strong> Use "Import JSON" to load multiple points at once</li>
              <li><strong>Remove Points:</strong> Click × on any point card (minimum 2 required)</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>📡 Analyze a Path</h3>
            <ul>
              <li><strong>Select Line:</strong> Click any blue line or distance label on the map</li>
              <li><strong>Auto-Calculate:</strong> Analysis starts automatically when you select a line</li>
              <li><strong>View Results:</strong> Check the LOS panel (bottom-right) for path status</li>
              <li><strong>Change Frequency:</strong> Toggle between 2m (145 MHz) and 70cm (433 MHz)</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>📊 Understanding the Chart</h3>
            <ul>
              <li><strong>Brown Area:</strong> Terrain elevation along the path</li>
              <li><strong>Green/Red Line:</strong> Line of sight (green = clear, red = blocked)</li>
              <li><strong>Blue Zone:</strong> First Fresnel zone - RF signal clearance area</li>
              <li><strong>Hover Chart:</strong> Move mouse over chart to see exact location on map</li>
              <li><strong>Expand Chart:</strong> Click ⬆ button to enlarge the chart</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>📐 RF Analysis Metrics</h3>
            <ul>
              <li><strong>CLEAR/BLOCKED:</strong> Whether terrain obstructs the path</li>
              <li><strong>Free Space Path Loss (FSPL):</strong> Signal loss in dB (lower is better)</li>
              <li><strong>Fresnel Zone Radius:</strong> Minimum clearance needed for good signal</li>
              <li><strong>Distance:</strong> Total path length in kilometers</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>⚙️ Configuration</h3>
            <ul>
              <li><strong>Antenna Heights:</strong> Set tower/antenna height for each point</li>
              <li><strong>Point Names:</strong> Label your points (e.g., "Base Station")</li>
              <li><strong>Hide Labels:</strong> 🏷️ button to toggle distance labels</li>
              <li><strong>Hide Lines:</strong> 📐 button to show only Point A connections</li>
              <li><strong>Reset View:</strong> 🎯 button to zoom to fit all points</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>💡 Pro Tips</h3>
            <ul>
              <li>Terrain obstructions can often be cleared by increasing antenna heights</li>
              <li>2m band has better propagation than 70cm for same conditions</li>
              <li>Fresnel zone should have 60% clearance for reliable communications</li>
              <li>FSPL under 110 dB typically indicates good signal strength</li>
              <li>Use URL sharing to save and share your point configurations</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
