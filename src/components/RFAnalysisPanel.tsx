import type { PathResult } from '../types';
import './LOSPanel.css';
import { useDraggable } from '../hooks/useDraggable';

interface RFAnalysisPanelProps {
  result: PathResult | null;
  frequency: number;
  onFrequencyChange: (freq: number) => void;
  onOpenERPCalculator?: () => void;
  onOpenAdvancedSettings?: () => void;
  onClose?: () => void;
  currentName1?: string;
  isLoading?: boolean;
}

export default function RFAnalysisPanel({
  result,
  frequency,
  onFrequencyChange,
  onOpenERPCalculator,
  onOpenAdvancedSettings,
  onClose,
  currentName1,
  isLoading = false
}: RFAnalysisPanelProps) {
  const { position, isDragging, handleMouseDown } = useDraggable({
    x: 50,
    y: 20
  });

  if (!result) return null;

  const { fspl, diffraction, kFactor, name1 } = result;

  // Use current names if provided, otherwise fall back to result names
  const displayName1 = currentName1 || name1;

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.los-header')) {
      handleMouseDown(e);
    }
  };

  return (
    <div
      className="los-panel"
      style={{
        position: 'absolute',
        inset: `${position.y}px auto auto ${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
        zIndex: 1100
      }}
      onMouseDown={handlePanelMouseDown}
    >
      <div className="los-header" style={{ cursor: 'grab' }}>
        <h3>RF Analysis</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onClose && (
            <button
              className="btn-icon btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Close RF analysis"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="los-info" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        {/* Frequency Selection */}
        <div>
          <div className="los-detail" style={{ marginBottom: '6px' }}>
            <strong>Frequency:</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className={`btn-freq btn-freq-default ${frequency >= 144 && frequency <= 148 ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onFrequencyChange(145.5);
              }}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              2m
            </button>
            <button
              className={`btn-freq btn-freq-default ${frequency >= 420 && frequency <= 450 ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onFrequencyChange(433.5);
              }}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              70cm
            </button>
            <input
              type="number"
              value={frequency}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  onFrequencyChange(val);
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                // Validate on blur and reset to default if invalid
                if (isNaN(val) || val < 30 || val > 3000) {
                  onFrequencyChange(145.5);
                }
              }}
              step="0.0125"
              min="30"
              max="3000"
              className="freq-input"
              style={{
                width: '100px',
                padding: '4px 8px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#333',
                fontFamily: "'Courier New', monospace"
              }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>MHz</span>
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            VHF: 30-300 MHz | UHF: 300-3000 MHz
          </div>
        </div>

        {/* RF Analysis Section */}
        {result.frequency && fspl && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
            <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="los-detail" style={{ color: '#2277ee', fontWeight: 'bold', margin: 0 }}>
                RF Metrics ({result.frequency} MHz)
              </div>
              {onOpenERPCalculator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenERPCalculator();
                  }}
                  className="btn-small btn-primary"
                  title="Open ERP/Link Budget Calculator"
                >
                  🔌 ERP Calculator
                </button>
              )}
            </div>
            <div className="los-detail">
              <strong>Free Space Path Loss:</strong> {fspl.toFixed(2)} dB
            </div>
            <div className="los-detail" style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
              {result.frequency >= 30 && result.frequency < 300 ? 'VHF' : result.frequency >= 300 && result.frequency <= 3000 ? 'UHF' : 'RF'}
            </div>
          </div>
        )}

        {/* Knife-Edge Diffraction Section */}
        {diffraction && diffraction.obstacles.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
            <div className="los-detail" style={{ color: '#ff6b00', fontWeight: 'bold', marginBottom: '6px' }}>
              ⛰️ Knife-Edge Diffraction Analysis
            </div>
            <div className="los-detail">
              <strong>Obstacles Detected:</strong> {diffraction.obstacles.length}
            </div>
            {diffraction.mainObstacle && (
              <>
                <div className="los-detail">
                  <strong>Main Obstacle:</strong> {diffraction.mainObstacle.distance.toFixed(2)} km from {displayName1}
                </div>
                <div className="los-detail">
                  <strong>Height Above LOS:</strong> {diffraction.mainObstacle.height > 0 ? '+' : ''}{diffraction.mainObstacle.height.toFixed(1)} m
                </div>
                <div className="los-detail">
                  <strong>Diffraction Loss:</strong>{' '}
                  <span style={{ color: diffraction.totalLoss > 6 ? '#dc3545' : diffraction.totalLoss > 3 ? '#ff8c00' : '#28a745' }}>
                    {diffraction.totalLoss.toFixed(2)} dB
                  </span>
                </div>
                <div className="los-detail" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  Fresnel parameter v = {diffraction.mainObstacle.fresnelParameter.toFixed(2)}
                </div>
              </>
            )}
            {diffraction.obstacles.length > 1 && (
              <div className="los-detail" style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                ℹ️ Multiple obstacles detected. Loss includes {diffraction.obstacles.length} knife-edge diffractions.
              </div>
            )}
            <div className="los-detail" style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
              Total path loss: {fspl && (fspl + diffraction.totalLoss).toFixed(2)} dB (FSPL + diffraction)
            </div>
          </div>
        )}
        {diffraction && diffraction.obstacles.length === 0 && !result.los.isBlocked && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
            <div className="los-detail" style={{ color: '#28a745', fontSize: '12px' }}>
              ✓ No significant diffraction - Clear line of sight
            </div>
          </div>
        )}

        {/* K-Factor Section */}
        {kFactor && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
            <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="los-detail" style={{ color: '#6a5acd', fontWeight: 'bold', margin: 0 }}>
                🌐 Atmospheric Refraction
              </div>
              {onOpenAdvancedSettings && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAdvancedSettings();
                  }}
                  className="btn-small btn-primary"
                  title="Open Line of Sight Settings"
                >
                  ⚙️ Settings
                </button>
              )}
            </div>
            <div className="los-detail">
              <strong>K-Factor:</strong> {kFactor.toFixed(3)}
              <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                ({kFactor < 1.2 ? 'Subrefractive' : kFactor < 1.35 ? 'Standard' : kFactor < 1.6 ? 'Superrefractive' : 'Ducting'})
              </span>
            </div>
            <div className="los-detail" style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '4px' }}>
              {kFactor < 1.2
                ? 'Signal bends away from Earth - shorter range'
                : kFactor < 1.35
                ? 'Normal atmospheric conditions'
                : kFactor < 1.6
                ? 'Enhanced propagation - longer range'
                : 'Extreme range extension possible'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
