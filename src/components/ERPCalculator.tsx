import { useState, useEffect } from 'react';
import './ERPCalculator.css';
import { calculateLinkBudget, wattsTodBm, dBdTodBi } from '../utils/linkBudget';

interface ERPCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  fspl?: number;
  distance?: number;
  frequency?: number;
  pointAName?: string;
  pointBName?: string;
}

export default function ERPCalculator({
  isOpen,
  onClose,
  fspl,
  distance,
  frequency,
  pointAName = 'Point A',
  pointBName = 'Point B',
}: ERPCalculatorProps) {
  // Point A inputs
  const [txPowerA, setTxPowerA] = useState<string>('50');
  const [txPowerUnitA, setTxPowerUnitA] = useState<'watts' | 'dBm'>('watts');
  const [antennaGainA, setAntennaGainA] = useState<string>('10');
  const [antennaUnitA, setAntennaUnitA] = useState<'dBi' | 'dBd'>('dBi');
  const [cableLossA, setCableLossA] = useState<string>('1.5');

  // Point B inputs
  const [txPowerB, setTxPowerB] = useState<string>('50');
  const [txPowerUnitB, setTxPowerUnitB] = useState<'watts' | 'dBm'>('watts');
  const [antennaGainB, setAntennaGainB] = useState<string>('10');
  const [antennaUnitB, setAntennaUnitB] = useState<'dBi' | 'dBd'>('dBi');
  const [cableLossB, setCableLossB] = useState<string>('1.5');

  const [results, setResults] = useState<ReturnType<typeof calculateLinkBudget> | null>(null);

  useEffect(() => {
    if (isOpen && fspl) {
      calculateResults();
    }
  }, [isOpen, txPowerA, txPowerUnitA, antennaGainA, antennaUnitA, cableLossA,
      txPowerB, txPowerUnitB, antennaGainB, antennaUnitB, cableLossB, fspl]);

  const calculateResults = () => {
    if (!fspl) return;

    // Convert Point A values to dBm/dBi
    const txPowerADBm = txPowerUnitA === 'watts'
      ? wattsTodBm(parseFloat(txPowerA) || 0)
      : parseFloat(txPowerA) || 0;

    const antennaGainADBi = antennaUnitA === 'dBd'
      ? dBdTodBi(parseFloat(antennaGainA) || 0)
      : parseFloat(antennaGainA) || 0;

    // Convert Point B values to dBm/dBi
    const txPowerBDBm = txPowerUnitB === 'watts'
      ? wattsTodBm(parseFloat(txPowerB) || 0)
      : parseFloat(txPowerB) || 0;

    const antennaGainBDBi = antennaUnitB === 'dBd'
      ? dBdTodBi(parseFloat(antennaGainB) || 0)
      : parseFloat(antennaGainB) || 0;

    const linkBudget = calculateLinkBudget(
      {
        txPowerDBm: txPowerADBm,
        antennaGainDBi: antennaGainADBi,
        cableLossdB: parseFloat(cableLossA) || 0,
      },
      {
        txPowerDBm: txPowerBDBm,
        antennaGainDBi: antennaGainBDBi,
        cableLossdB: parseFloat(cableLossB) || 0,
      },
      fspl
    );

    setResults(linkBudget);
  };

  if (!isOpen) return null;

  const formatPower = (dBm: number, watts: number) => {
    if (watts >= 1) {
      return `${dBm.toFixed(2)} dBm (${watts.toFixed(2)} W)`;
    } else if (watts >= 0.001) {
      return `${dBm.toFixed(2)} dBm (${(watts * 1000).toFixed(2)} mW)`;
    } else {
      return `${dBm.toFixed(2)} dBm (${(watts * 1000000).toFixed(2)} µW)`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link Budget Calculator</h2>
          <button className="btn-icon-lg btn-danger-solid" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-wide">
          {!fspl ? (
            <div className="erp-warning">
              Please calculate a path first to get the Free Space Path Loss (FSPL).
            </div>
          ) : (
            <>
              <div className="erp-info-section">
                <div className="erp-info-item">
                  <span className="erp-info-label">Path:</span>
                  <span className="erp-info-value">{pointAName} ↔ {pointBName}</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-info-label">Distance:</span>
                  <span className="erp-info-value">{distance?.toFixed(2)} km</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-info-label">Frequency:</span>
                  <span className="erp-info-value">{frequency} MHz</span>
                </div>
                <div className="erp-info-item">
                  <span className="erp-info-label">FSPL:</span>
                  <span className="erp-info-value">{fspl.toFixed(2)} dB</span>
                </div>
              </div>

              <div className="erp-input-grid">
                {/* Point A Inputs */}
                <div className="erp-point-section">
                  <h3>{pointAName} (Transmitter)</h3>

                  <div className="erp-input-group">
                    <label>TX Power</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={txPowerA}
                        onChange={(e) => setTxPowerA(e.target.value)}
                        step="0.1"
                      />
                      <select
                        className="select-unit"
                        value={txPowerUnitA}
                        onChange={(e) => setTxPowerUnitA(e.target.value as 'watts' | 'dBm')}
                      >
                        <option value="watts">W</option>
                        <option value="dBm">dBm</option>
                      </select>
                    </div>
                  </div>

                  <div className="erp-input-group">
                    <label>Antenna Gain</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={antennaGainA}
                        onChange={(e) => setAntennaGainA(e.target.value)}
                        step="0.1"
                      />
                      <select
                        className="select-unit"
                        value={antennaUnitA}
                        onChange={(e) => setAntennaUnitA(e.target.value as 'dBi' | 'dBd')}
                      >
                        <option value="dBi">dBi</option>
                        <option value="dBd">dBd</option>
                      </select>
                    </div>
                  </div>

                  <div className="erp-input-group">
                    <label>Cable Loss</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={cableLossA}
                        onChange={(e) => setCableLossA(e.target.value)}
                        step="0.1"
                      />
                      <span className="unit-label">dB</span>
                    </div>
                  </div>
                </div>

                {/* Point B Inputs */}
                <div className="erp-point-section">
                  <h3>{pointBName} (Receiver)</h3>

                  <div className="erp-input-group">
                    <label>TX Power</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={txPowerB}
                        onChange={(e) => setTxPowerB(e.target.value)}
                        step="0.1"
                      />
                      <select
                        className="select-unit"
                        value={txPowerUnitB}
                        onChange={(e) => setTxPowerUnitB(e.target.value as 'watts' | 'dBm')}
                      >
                        <option value="watts">W</option>
                        <option value="dBm">dBm</option>
                      </select>
                    </div>
                  </div>

                  <div className="erp-input-group">
                    <label>Antenna Gain</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={antennaGainB}
                        onChange={(e) => setAntennaGainB(e.target.value)}
                        step="0.1"
                      />
                      <select
                        className="select-unit"
                        value={antennaUnitB}
                        onChange={(e) => setAntennaUnitB(e.target.value as 'dBi' | 'dBd')}
                      >
                        <option value="dBi">dBi</option>
                        <option value="dBd">dBd</option>
                      </select>
                    </div>
                  </div>

                  <div className="erp-input-group">
                    <label>Cable Loss</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={cableLossB}
                        onChange={(e) => setCableLossB(e.target.value)}
                        step="0.1"
                      />
                      <span className="unit-label">dB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="erp-results">
                  <div className="erp-result-section">
                    <h3>{pointAName} → {pointBName}</h3>
                    <div className="erp-result-item">
                      <span className="erp-result-label">ERP:</span>
                      <span className="erp-result-value">
                        {formatPower(results.aToB.erpDBm, results.aToB.erpWatts)}
                      </span>
                    </div>
                    <div className="erp-result-item">
                      <span className="erp-result-label">Path Loss (FSPL):</span>
                      <span className="erp-result-value">-{fspl.toFixed(2)} dB</span>
                    </div>
                    <div className="erp-result-item highlight">
                      <span className="erp-result-label">Received at {pointBName}:</span>
                      <span className="erp-result-value">
                        {formatPower(results.aToB.receivedPowerDBm, results.aToB.receivedPowerWatts)}
                      </span>
                    </div>
                  </div>

                  <div className="erp-result-section">
                    <h3>{pointBName} → {pointAName}</h3>
                    <div className="erp-result-item">
                      <span className="erp-result-label">ERP:</span>
                      <span className="erp-result-value">
                        {formatPower(results.bToA.erpDBm, results.bToA.erpWatts)}
                      </span>
                    </div>
                    <div className="erp-result-item">
                      <span className="erp-result-label">Path Loss (FSPL):</span>
                      <span className="erp-result-value">-{fspl.toFixed(2)} dB</span>
                    </div>
                    <div className="erp-result-item highlight">
                      <span className="erp-result-label">Received at {pointAName}:</span>
                      <span className="erp-result-value">
                        {formatPower(results.bToA.receivedPowerDBm, results.bToA.receivedPowerWatts)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
