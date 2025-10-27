import { useState, useEffect } from 'react';
import './AdvancedSettingsModal.css';
import { getKFactorDescription } from '../utils/atmospheric';
import { X } from 'lucide-react';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kFactor: number;
  onApply: (settings: {
    kFactor: number;
  }) => void;
}

export default function AdvancedSettingsModal({
  isOpen,
  onClose,
  kFactor: initialKFactor,
  onApply
}: AdvancedSettingsModalProps) {
  const [kFactor, setKFactor] = useState(initialKFactor);

  // Update local state when props change
  useEffect(() => {
    setKFactor(initialKFactor);
  }, [initialKFactor, isOpen]);

  const handleApply = () => {
    onApply({
      kFactor
    });
    onClose();
  };

  const handleReset = () => {
    setKFactor(4/3);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Line of Sight Settings</h2>
          <button className="btn-icon-lg btn-danger-solid" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* K-Factor Section */}
          <div className="settings-section">
            <h3>Atmospheric Refraction (K-Factor)</h3>
            <p className="settings-description" style={{ marginBottom: '12px' }}>
              K-factor affects how radio waves bend over the Earth's surface due to atmospheric refraction.
              Higher values increase apparent horizon distance.
            </p>
            <div className="settings-input-group">
              <div className="settings-value-display">
                <span className="settings-value-label">K-Factor:</span>
                <span className="settings-value-number">
                  {kFactor.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.01"
                value={kFactor}
                onChange={(e) => setKFactor(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="settings-description">
                {getKFactorDescription(kFactor)}
              </div>
            </div>

            {/* K-Factor Presets */}
            <div className="settings-input-group">
              <div className="settings-preset-label">Quick Presets:</div>
              <div className="preset-grid">
                <button
                  className="btn-small btn-neutral"
                  onClick={() => setKFactor(1.0)}
                >
                  No Refraction (1.0)
                </button>
                <button
                  className="btn-small btn-neutral"
                  onClick={() => setKFactor(4/3)}
                >
                  Standard (1.333)
                </button>
                <button
                  className="btn-small btn-neutral"
                  onClick={() => setKFactor(1.5)}
                >
                  Inversion (1.5)
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
            <button className="btn-small btn-neutral" onClick={handleReset}>
              Reset to Defaults
            </button>
            <button className="btn-small btn-cancel-solid" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-small btn-import-solid" onClick={handleApply}>
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
