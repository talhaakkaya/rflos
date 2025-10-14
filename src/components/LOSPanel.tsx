import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { PathResult } from '../types';
import './LOSPanel.css';

Chart.register(...registerables);

interface LOSPanelProps {
  result: PathResult | null;
  onClose?: () => void;
}

export default function LOSPanel({ result, onClose }: LOSPanelProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!result || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: result.distances,
        datasets: [
          {
            label: 'Terrain Elevation',
            data: result.elevations,
            borderColor: '#8B4513',
            backgroundColor: 'rgba(139, 69, 19, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 0
          },
          {
            label: 'Line of Sight',
            data: result.los.losLine,
            borderColor: result.los.isBlocked ? '#dc3545' : '#28a745',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Elevation Profile'
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

  const { distance, elevations, los, height1, height2, name1, name2 } = result;

  return (
    <div className="los-panel">
      <div className="los-header">
        <h3>Line of Sight Analysis</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className={`los-status ${los.isBlocked ? 'los-blocked' : 'los-clear'}`}>
            {los.isBlocked ? 'BLOCKED' : 'CLEAR'}
          </div>
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
          <strong>{name1}</strong> elevation: {elevations[0].toFixed(1)} m
          {height1 > 0 && ` (+${height1}m antenna = ${(elevations[0] + height1).toFixed(1)}m)`}
        </div>
        <div className="los-detail">
          <strong>{name2}</strong> elevation: {elevations[elevations.length - 1].toFixed(1)} m
          {height2 > 0 && ` (+${height2}m antenna = ${(elevations[elevations.length - 1] + height2).toFixed(1)}m)`}
        </div>
        <div className="los-detail">
          <strong>Distance:</strong> {distance.toFixed(2)} km
        </div>

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
      </div>

      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
