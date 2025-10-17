import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import type { PathResult } from '../types';
import { getClearanceStatus, getCompassDirection } from '../utils/formatting';
import './LOSPanel.css';

Chart.register(...registerables);

interface LOSPanelProps {
  result: PathResult | null;
  onClose?: () => void;
  onHoverPoint?: (index: number | null) => void;
  onReverseCalculation?: () => void;
  currentName1?: string;
  currentName2?: string;
  frequency: number;
  onFrequencyChange: (freq: number) => void;
  onOpenERPCalculator?: () => void;
}

export default function LOSPanel({ result, onClose, onHoverPoint, onReverseCalculation, currentName1, currentName2, frequency, onFrequencyChange, onOpenERPCalculator }: LOSPanelProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const onHoverPointRef = useRef(onHoverPoint);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update ref when callback changes without recreating chart
  useEffect(() => {
    onHoverPointRef.current = onHoverPoint;
  }, [onHoverPoint]);

  useEffect(() => {
    if (!result || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare datasets
    const datasets: any[] = [
      {
        label: 'Terrain Elevation',
        data: result.elevations,
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#ff6b6b',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        order: 3
      },
      {
        label: 'Line of Sight',
        data: result.los.losLine,
        borderColor: result.los.isBlocked ? '#dc3545' : '#28a745',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        order: 2
      }
    ];

    // Add Fresnel zone if available
    if (result.fresnelZone) {
      datasets.push({
        label: '1st Fresnel Zone',
        data: result.fresnelZone.upper,
        borderColor: 'rgba(100, 150, 255, 0.5)',
        backgroundColor: 'rgba(100, 150, 255, 0.1)',
        fill: '+1', // Fill to next dataset (lower boundary)
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1,
        borderDash: [3, 3],
        order: 1
      });

      datasets.push({
        label: 'Fresnel Lower',
        data: result.fresnelZone.lower,
        borderColor: 'rgba(100, 150, 255, 0.5)',
        backgroundColor: 'rgba(100, 150, 255, 0.1)',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1,
        borderDash: [3, 3],
        hidden: true, // Hide from legend
        order: 1
      });
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: result.distances,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        onHover: (_event, activeElements) => {
          if (onHoverPointRef.current) {
            if (activeElements.length > 0) {
              const index = activeElements[0].index;
              onHoverPointRef.current(index);
            } else {
              onHoverPointRef.current(null);
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Elevation Profile'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Distance (km)'
            },
            ticks: {
              callback: function(value: string | number): string {
                // Get the actual label (distance) from the chart data
                const label = this.getLabelForValue(value as number);
                const numValue = typeof label === 'string' ? parseFloat(label) : label;
                return numValue.toFixed(1);
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Elevation (m)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [result]);

  if (!result) return null;

  const { distance, elevations, los, height1, height2, name1, name2, fspl, fresnelZone } = result;

  // Use current names if provided, otherwise fall back to result names
  const displayName1 = currentName1 || name1;
  const displayName2 = currentName2 || name2;

  // Compass SVG component
  const CompassSVG = ({ bearing, size = 60 }: { bearing: number; size?: number }) => {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'inline-block' }}>
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" fill="#f8f9fa" stroke="#333" strokeWidth="2" />

        {/* Cardinal marks */}
        <line x1="50" y1="5" x2="50" y2="15" stroke="#333" strokeWidth="2" />
        <text x="50" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#dc3545">N</text>

        <line x1="95" y1="50" x2="85" y2="50" stroke="#333" strokeWidth="1.5" />
        <text x="80" y="54" textAnchor="middle" fontSize="10" fill="#666">E</text>

        <line x1="50" y1="95" x2="50" y2="85" stroke="#333" strokeWidth="1.5" />
        <text x="50" y="92" textAnchor="middle" fontSize="10" fill="#666">S</text>

        <line x1="5" y1="50" x2="15" y2="50" stroke="#333" strokeWidth="1.5" />
        <text x="20" y="54" textAnchor="middle" fontSize="10" fill="#666">W</text>

        {/* Degree marks every 45° */}
        {[45, 135, 225, 315].map(angle => {
          const rad = (angle - 90) * Math.PI / 180;
          const x1 = 50 + 42 * Math.cos(rad);
          const y1 = 50 + 42 * Math.sin(rad);
          const x2 = 50 + 48 * Math.cos(rad);
          const y2 = 50 + 48 * Math.sin(rad);
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#999" strokeWidth="1" />;
        })}

        {/* Needle pointing to bearing */}
        <g transform={`rotate(${bearing} 50 50)`}>
          {/* Red arrow pointing to bearing direction */}
          <polygon points="50,15 46,50 50,45 54,50" fill="#dc3545" stroke="#000" strokeWidth="1" />
          {/* Gray tail */}
          <polygon points="50,55 46,50 54,50" fill="#999" />
        </g>

        {/* Center dot */}
        <circle cx="50" cy="50" r="3" fill="#333" />
      </svg>
    );
  };

  return (
    <div className={`los-panel ${isExpanded ? 'panel-expanded' : ''}`}>
      <div className="los-header">
        <h3>Line of Sight Analysis</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className={`los-status ${los.isBlocked ? 'los-blocked' : 'los-clear'}`}>
            {los.isBlocked ? 'BLOCKED' : 'CLEAR'}
          </div>
          <button
            className="btn-expand-chart"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse chart" : "Expand chart"}
          >
            {isExpanded ? '⬇' : '⬆'}
          </button>
          {onReverseCalculation && (
            <button
              className="btn-reverse-calc"
              onClick={onReverseCalculation}
              title="Reverse calculation direction"
            >
              ⇅
            </button>
          )}
          {onClose && (
            <button
              className="btn-close-los"
              onClick={onClose}
              title="Close analysis"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="los-info">
        <div className="los-detail">
          <strong>{displayName1}</strong> elevation: {elevations[0].toFixed(1)} m
          {height1 > 0 && ` (+${height1}m antenna = ${(elevations[0] + height1).toFixed(1)}m)`}
        </div>
        <div className="los-detail">
          <strong>{displayName2}</strong> elevation: {elevations[elevations.length - 1].toFixed(1)} m
          {height2 > 0 && ` (+${height2}m antenna = ${(elevations[elevations.length - 1] + height2).toFixed(1)}m)`}
        </div>
        <div className="los-detail">
          <strong>Distance:</strong> {distance.toFixed(2)} km
        </div>

        {/* Bearing/Azimuth */}
        {result.bearing !== undefined && result.reverseBearing !== undefined && (
          <div className="los-detail" style={{ marginTop: '12px' }}>
            <strong>Antenna Aiming:</strong>
            {isExpanded ? (
              // Expanded view: Show compasses
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                {/* Forward bearing */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <CompassSVG bearing={result.bearing} size={70} />
                  <div style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{displayName1} → {displayName2}</div>
                    <div>Azimuth: {result.bearing.toFixed(1)}° ({getCompassDirection(result.bearing)})</div>
                    {result.elevationAngle !== undefined && (
                      <div>Elevation: {result.elevationAngle > 0 ? '+' : ''}{result.elevationAngle.toFixed(2)}°</div>
                    )}
                  </div>
                </div>

                {/* Reverse bearing */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <CompassSVG bearing={result.reverseBearing} size={70} />
                  <div style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{displayName2} → {displayName1}</div>
                    <div>Azimuth: {result.reverseBearing.toFixed(1)}° ({getCompassDirection(result.reverseBearing)})</div>
                    {result.reverseElevationAngle !== undefined && (
                      <div>Elevation: {result.reverseElevationAngle > 0 ? '+' : ''}{result.reverseElevationAngle.toFixed(2)}°</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Collapsed view: Text only
              <div style={{ marginLeft: '8px', fontSize: '12px', color: '#555', marginTop: '4px' }}>
                <div>
                  {displayName1} → {displayName2}: {result.bearing.toFixed(1)}° ({getCompassDirection(result.bearing)})
                  {result.elevationAngle !== undefined && `, ${result.elevationAngle > 0 ? '+' : ''}${result.elevationAngle.toFixed(2)}° elev`}
                </div>
                <div>
                  {displayName2} → {displayName1}: {result.reverseBearing.toFixed(1)}° ({getCompassDirection(result.reverseBearing)})
                  {result.reverseElevationAngle !== undefined && `, ${result.reverseElevationAngle > 0 ? '+' : ''}${result.reverseElevationAngle.toFixed(2)}° elev`}
                </div>
              </div>
            )}
          </div>
        )}

        {los.isBlocked ? (
          <>
            <div className="los-detail">
              <strong>Blocked at:</strong> {los.blockDistance?.toFixed(2)} km
            </div>
            <div className="los-detail">
              <strong>Obstacle height:</strong> {los.maxObstacle.toFixed(1)} m above LOS
            </div>
          </>
        ) : (
          <div className="los-detail" style={{ color: 'green' }}>
            <strong>Path is clear!</strong> No obstructions detected.
          </div>
        )}

        {(height1 > 0 || height2 > 0) && (
          <div className="los-detail" style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
            Antenna heights: {height1}m and {height2}m included
          </div>
        )}

        {/* Frequency Selection */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
          <div className="los-detail" style={{ marginBottom: '6px' }}>
            <strong>Frequency:</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className={`btn-freq ${frequency >= 144 && frequency <= 148 ? 'active' : ''}`}
              onClick={() => onFrequencyChange(145.5)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              2m
            </button>
            <button
              className={`btn-freq ${frequency >= 420 && frequency <= 450 ? 'active' : ''}`}
              onClick={() => onFrequencyChange(433.5)}
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
                RF Analysis ({result.frequency} MHz)
              </div>
              {onOpenERPCalculator && (
                <button
                  onClick={onOpenERPCalculator}
                  className="btn-erp"
                  title="Open ERP/Link Budget Calculator"
                >
                  🔌 ERP Calculator
                </button>
              )}
            </div>
            <div className="los-detail">
              <strong>Free Space Path Loss:</strong> {fspl.toFixed(2)} dB
            </div>
            {fresnelZone && (
              <>
                <div className="los-detail">
                  <strong>1st Fresnel Zone Radius:</strong> {fresnelZone.radius.toFixed(1)} m
                </div>
                <div className="los-detail">
                  <strong>Fresnel Clearance:</strong>{' '}
                  <span style={{ color: getClearanceStatus(fresnelZone.minClearance).color, fontWeight: 'bold' }}>
                    {fresnelZone.minClearanceMeters.toFixed(1)}m / {fresnelZone.radius.toFixed(1)}m ({fresnelZone.minClearance.toFixed(0)}%) {getClearanceStatus(fresnelZone.minClearance).emoji}
                  </span>
                </div>
                <div className="los-detail" style={{ fontSize: '11px', color: getClearanceStatus(fresnelZone.minClearance).color, marginTop: '2px' }}>
                  {getClearanceStatus(fresnelZone.minClearance).text} - {(fresnelZone.radius * 0.6).toFixed(1)}m needed for 60%
                </div>
                {fresnelZone.minClearance < 60 && (
                  <div className="los-detail" style={{ fontSize: '11px', color: '#ff8c00', marginTop: '4px' }}>
                    ⚠️ Minimum clearance at {fresnelZone.minClearanceDistance.toFixed(2)} km
                  </div>
                )}
              </>
            )}
            <div className="los-detail" style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
              {result.frequency >= 30 && result.frequency < 300 ? 'VHF' : result.frequency >= 300 && result.frequency <= 3000 ? 'UHF' : 'RF'}
            </div>
          </div>
        )}
      </div>

      <div
        className={`chart-container ${isExpanded ? 'chart-expanded' : ''}`}
        onMouseLeave={() => {
          if (onHoverPoint) {
            onHoverPoint(null);
          }
        }}
      >
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
