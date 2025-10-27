import './HelpModal.css';
import { X, Map, Radio, BarChart3, Ruler, Plug, Globe, Settings, Lightbulb } from 'lucide-react';

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
          <button className="btn-icon-lg btn-danger-solid" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Map size={20} /> Getting Started</h3>
            <ul>
              <li><strong>Add Points:</strong> Click "+ Add Point" then click anywhere on the map to place markers</li>
              <li><strong>Move Points:</strong> Drag any marker to reposition it</li>
              <li><strong>Import Points:</strong> Use "Import JSON" to load multiple points at once</li>
              <li><strong>Remove Points:</strong> Click × on any point card (minimum 2 required)</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Radio size={20} /> Analyze a Path</h3>
            <ul>
              <li><strong>Select Line:</strong> Click any blue line or distance label on the map</li>
              <li><strong>Auto-Calculate:</strong> Analysis starts automatically when you select a line</li>
              <li><strong>View Results:</strong> Check the Path Analysis and RF Analysis panels for detailed info</li>
              <li><strong>Change Frequency:</strong> Toggle between 2m (145 MHz) and 70cm (433 MHz), or enter custom frequency</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={20} /> Understanding the Chart</h3>
            <ul>
              <li><strong>Brown Area:</strong> Terrain elevation along the path</li>
              <li><strong>Green/Red Line:</strong> Line of sight (green = clear, red = blocked)</li>
              <li><strong>Blue Zone:</strong> First Fresnel zone - RF signal clearance area</li>
              <li><strong>Hover Chart:</strong> Move mouse over chart to see exact location on map</li>
              <li><strong>Expand Chart:</strong> Click ⬆ button to enlarge the chart</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Ruler size={20} /> RF Analysis Metrics</h3>
            <ul>
              <li><strong>CLEAR/BLOCKED:</strong> Whether terrain obstructs the path (in Path Analysis panel)</li>
              <li><strong>Free Space Path Loss (FSPL):</strong> Signal loss in dB (lower is better)</li>
              <li><strong>Knife-Edge Diffraction:</strong> Additional loss from obstacles (if detected)</li>
              <li><strong>K-Factor:</strong> Atmospheric refraction effect on radio horizon</li>
              <li><strong>Fresnel Zone:</strong> Clearance percentage and status indicator</li>
              <li><strong>Distance:</strong> Total path length in kilometers</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plug size={20} /> ERP Calculator & Link Budget</h3>
            <ul>
              <li><strong>Access:</strong> Click "ERP Calculator" in RF Analysis panel</li>
              <li><strong>Configure:</strong> Set TX power, antenna gain, and cable loss for both stations</li>
              <li><strong>Modulation:</strong> Choose FM, NFM, Digital (P25/DMR/D-Star), SSB, or CW</li>
              <li><strong>Results:</strong> View ERP, received power, link margin, and fade margin</li>
              <li><strong>Quality:</strong> Link assessment (Excellent/Good/Marginal/Poor/Failed)</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={20} /> K-Factor (Atmospheric Refraction)</h3>
            <ul>
              <li><strong>Access:</strong> Click "Settings" in RF Analysis panel</li>
              <li><strong>Standard:</strong> 4/3 (1.333) for normal atmospheric conditions</li>
              <li><strong>Inversion:</strong> 1.5 for enhanced propagation (longer range)</li>
              <li><strong>Effect:</strong> Higher K-factor extends radio horizon and improves clearance</li>
              <li><strong>Use:</strong> Adjust based on local weather and propagation conditions</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} /> Configuration</h3>
            <ul>
              <li><strong>Antenna Heights:</strong> Set tower/antenna height for each point in Station Setup panel</li>
              <li><strong>Point Names:</strong> Label your points (e.g., "Base Station")</li>
              <li><strong>Draggable Panels:</strong> Drag Station Setup and RF Analysis panels anywhere on screen</li>
              <li><strong>Hide Labels:</strong> Label button to toggle distance labels</li>
              <li><strong>Hide Lines:</strong> Lines button to show only Point A connections</li>
              <li><strong>Reset View:</strong> Target button to zoom to fit all points</li>
            </ul>
          </section>

          <section className="help-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={20} /> Pro Tips</h3>
            <ul>
              <li>Terrain obstructions can often be cleared by increasing antenna heights</li>
              <li>2m band has better propagation than 70cm for same conditions</li>
              <li>Fresnel zone should have 60% clearance for reliable communications</li>
              <li>Knife-edge diffraction adds loss even when LOS shows "CLEAR"</li>
              <li>Higher K-factor (inversion conditions) can make blocked paths viable</li>
              <li>Use ERP Calculator to verify link budget before installation</li>
              <li>Fade margin of 20+ dB provides excellent reliability</li>
              <li>FSPL under 110 dB typically indicates good signal strength</li>
              <li>Drag panels to optimize your workspace for multi-monitor setups</li>
              <li>Use URL sharing to save and share your point configurations</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
