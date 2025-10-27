import { useState, useEffect } from 'react';
import './ERPCalculator.css';
import {
  calculateLinkBudget,
  wattsTodBm,
  dBdTodBi,
  calculateLinkMargin,
  calculateFadeMargin,
  getLinkQuality,
  MODULATION_TYPES
} from '../utils/linkBudget';
import type { ModulationType } from '../utils/linkBudget';
import { X } from 'lucide-react';

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

  // Receiver sensitivity and modulation
  const [modulationType, setModulationType] = useState<ModulationType>('FM 25kHz');
  const [rxSensitivityA, setRxSensitivityA] = useState<string>(MODULATION_TYPES['FM 25kHz'].sensitivity.toString());
  const [rxSensitivityB, setRxSensitivityB] = useState<string>(MODULATION_TYPES['FM 25kHz'].sensitivity.toString());

  const [results, setResults] = useState<ReturnType<typeof calculateLinkBudget> | null>(null);
  const [linkMargins, setLinkMargins] = useState<{
    aToB: { linkMargin: number; fadeMargin: number; quality: ReturnType<typeof getLinkQuality> };
    bToA: { linkMargin: number; fadeMargin: number; quality: ReturnType<typeof getLinkQuality> };
  } | null>(null);

  // Update receiver sensitivities when modulation type changes
  useEffect(() => {
    if (modulationType !== 'Custom') {
      const modData = MODULATION_TYPES[modulationType];
      setRxSensitivityA(modData.sensitivity.toString());
      setRxSensitivityB(modData.sensitivity.toString());
    }
  }, [modulationType]);

  useEffect(() => {
    if (isOpen && fspl) {
      calculateResults();
    }
  }, [isOpen, txPowerA, txPowerUnitA, antennaGainA, antennaUnitA, cableLossA,
      txPowerB, txPowerUnitB, antennaGainB, antennaUnitB, cableLossB, fspl,
      rxSensitivityA, rxSensitivityB, modulationType]);

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

    // Calculate link margins
    const rxSensA = parseFloat(rxSensitivityA) || -116;
    const rxSensB = parseFloat(rxSensitivityB) || -116;
    const requiredSNR = MODULATION_TYPES[modulationType].requiredSNR;

    const linkMarginAtoB = calculateLinkMargin(linkBudget.aToB.receivedPowerDBm, rxSensB);
    const fadeMarginAtoB = calculateFadeMargin(linkMarginAtoB, requiredSNR);
    const qualityAtoB = getLinkQuality(fadeMarginAtoB);

    const linkMarginBtoA = calculateLinkMargin(linkBudget.bToA.receivedPowerDBm, rxSensA);
    const fadeMarginBtoA = calculateFadeMargin(linkMarginBtoA, requiredSNR);
    const qualityBtoA = getLinkQuality(fadeMarginBtoA);

    setLinkMargins({
      aToB: {
        linkMargin: linkMarginAtoB,
        fadeMargin: fadeMarginAtoB,
        quality: qualityAtoB
      },
      bToA: {
        linkMargin: linkMarginBtoA,
        fadeMargin: fadeMarginBtoA,
        quality: qualityBtoA
      }
    });
  };

  if (!isOpen) return null;

  const formatPower = (dBm: number, watts: number) => {
    if (watts >= 1) {
      return `${dBm.toFixed(2)} dBm (${watts.toFixed(2)} W)`;
    } else if (watts >= 0.001) {
      return `${dBm.toFixed(2)} dBm (${(watts * 1000).toFixed(2)} mW)`;
    } else if (watts >= 0.000001) {
      return `${dBm.toFixed(2)} dBm (${(watts * 1000000).toFixed(2)} µW)`;
    } else if (watts >= 0.000000001) {
      return `${dBm.toFixed(2)} dBm (${(watts * 1000000000).toFixed(2)} nW)`;
    } else {
      return `${dBm.toFixed(2)} dBm (${watts.toExponential(2)} W)`;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link Budget Calculator</h2>
          <button className="btn-icon-lg btn-danger-solid" onClick={onClose}><X size={20} /></button>
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

              {/* Modulation and Receiver Sensitivity */}
              <div style={{ marginTop: '16px' }}>
                <div className="erp-point-section">
                  <h3>Receiver Sensitivity & Modulation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="erp-input-group">
                    <label>Modulation Type</label>
                    <select
                      className="select-unit"
                      style={{ width: '100%', padding: '8px' }}
                      value={modulationType}
                      onChange={(e) => setModulationType(e.target.value as ModulationType)}
                    >
                      {Object.keys(MODULATION_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="erp-input-group">
                    <label>Required SNR</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="text"
                        value={MODULATION_TYPES[modulationType].requiredSNR}
                        disabled
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                      <span className="unit-label">dB</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div className="erp-input-group">
                    <label>{pointAName} RX Sensitivity</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={rxSensitivityA}
                        onChange={(e) => {
                          setRxSensitivityA(e.target.value);
                          if (modulationType !== 'Custom') setModulationType('Custom');
                        }}
                        step="1"
                      />
                      <span className="unit-label">dBm</span>
                    </div>
                  </div>

                  <div className="erp-input-group">
                    <label>{pointBName} RX Sensitivity</label>
                    <div className="erp-input-with-unit">
                      <input
                        className="input-data"
                        type="number"
                        value={rxSensitivityB}
                        onChange={(e) => {
                          setRxSensitivityB(e.target.value);
                          if (modulationType !== 'Custom') setModulationType('Custom');
                        }}
                        step="1"
                      />
                      <span className="unit-label">dBm</span>
                    </div>
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
                    {linkMargins && (
                      <>
                        <div className="erp-result-item">
                          <span className="erp-result-label">RX Sensitivity:</span>
                          <span className="erp-result-value">{rxSensitivityB} dBm</span>
                        </div>
                        <div className="erp-result-item">
                          <span className="erp-result-label">Link Margin:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.aToB.linkMargin >= 0 ? '#28a745' : '#dc3545' }}>
                            {linkMargins.aToB.linkMargin >= 0 ? '+' : ''}{linkMargins.aToB.linkMargin.toFixed(2)} dB
                          </span>
                        </div>
                        <div className="erp-result-item">
                          <span className="erp-result-label">Fade Margin:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.aToB.quality.color }}>
                            {linkMargins.aToB.fadeMargin >= 0 ? '+' : ''}{linkMargins.aToB.fadeMargin.toFixed(2)} dB
                          </span>
                        </div>
                        <div className="erp-result-item highlight">
                          <span className="erp-result-label">Link Quality:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.aToB.quality.color, fontWeight: 'bold' }}>
                            {linkMargins.aToB.quality.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                          {linkMargins.aToB.quality.description}
                        </div>
                      </>
                    )}
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
                    {linkMargins && (
                      <>
                        <div className="erp-result-item">
                          <span className="erp-result-label">RX Sensitivity:</span>
                          <span className="erp-result-value">{rxSensitivityA} dBm</span>
                        </div>
                        <div className="erp-result-item">
                          <span className="erp-result-label">Link Margin:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.bToA.linkMargin >= 0 ? '#28a745' : '#dc3545' }}>
                            {linkMargins.bToA.linkMargin >= 0 ? '+' : ''}{linkMargins.bToA.linkMargin.toFixed(2)} dB
                          </span>
                        </div>
                        <div className="erp-result-item">
                          <span className="erp-result-label">Fade Margin:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.bToA.quality.color }}>
                            {linkMargins.bToA.fadeMargin >= 0 ? '+' : ''}{linkMargins.bToA.fadeMargin.toFixed(2)} dB
                          </span>
                        </div>
                        <div className="erp-result-item highlight">
                          <span className="erp-result-label">Link Quality:</span>
                          <span className="erp-result-badge" style={{ color: linkMargins.bToA.quality.color, fontWeight: 'bold' }}>
                            {linkMargins.bToA.quality.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                          {linkMargins.bToA.quality.description}
                        </div>
                      </>
                    )}
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
