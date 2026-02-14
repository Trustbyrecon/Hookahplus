"use client";

import React from 'react';
import { HeatMapData } from '../lib/services/TableAnalyticsService';

interface LoungeHeatMapProps {
  tables: Array<{ id: string; name: string; x: number; y: number; capacity: number }>;
  heatMapData: HeatMapData[];
  metric: 'revenue' | 'utilization' | 'sessions';
  onTableClick?: (tableId: string) => void;
  className?: string;
}

export function LoungeHeatMap({
  tables,
  heatMapData,
  metric,
  onTableClick,
  className = ''
}: LoungeHeatMapProps) {
  // Get color intensity based on value (0-1)
  const getColor = (value: number): string => {
    // Use a gradient from cool (blue) to hot (red)
    if (value === 0) return 'rgba(100, 100, 100, 0.3)'; // Gray for no data
    
    // Blue (low) -> Green -> Yellow -> Orange -> Red (high)
    if (value < 0.25) {
      // Blue to Cyan
      const t = value / 0.25;
      return `rgba(${100 + Math.round(155 * t)}, ${150 + Math.round(105 * t)}, ${255}, ${0.3 + t * 0.5})`;
    } else if (value < 0.5) {
      // Cyan to Green
      const t = (value - 0.25) / 0.25;
      return `rgba(${100 + Math.round(155 * (1 - t))}, 255, ${255 - Math.round(100 * t)}, ${0.5 + t * 0.3})`;
    } else if (value < 0.75) {
      // Green to Yellow
      const t = (value - 0.5) / 0.25;
      return `rgba(255, ${255 - Math.round(100 * t)}, ${100 + Math.round(155 * t)}, ${0.6 + t * 0.2})`;
    } else {
      // Yellow to Red
      const t = (value - 0.75) / 0.25;
      return `rgba(255, ${155 - Math.round(155 * t)}, ${0 + Math.round(100 * t)}, ${0.7 + t * 0.3})`;
    }
  };

  // Get border color based on value
  const getBorderColor = (value: number): string => {
    if (value === 0) return 'rgba(150, 150, 150, 0.5)';
    if (value < 0.5) return 'rgba(100, 200, 255, 0.8)';
    if (value < 0.75) return 'rgba(255, 200, 100, 0.8)';
    return 'rgba(255, 100, 100, 0.9)';
  };

  // Format value for display
  const formatValue = (rawValue: number, metric: string): string => {
    switch (metric) {
      case 'revenue':
        return `$${rawValue.toFixed(0)}`;
      case 'utilization':
        return `${rawValue.toFixed(1)}%`;
      case 'sessions':
        return `${rawValue.toFixed(0)}`;
      default:
        return rawValue.toFixed(1);
    }
  };

  // Get metric label
  const getMetricLabel = (): string => {
    switch (metric) {
      case 'revenue':
        return 'Revenue';
      case 'utilization':
        return 'Utilization';
      case 'sessions':
        return 'Sessions';
      default:
        return 'Value';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Legend */}
      <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{getMetricLabel()} Heat Map</span>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Low</span>
            <div className="flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((val) => (
                <div
                  key={val}
                  className="w-6 h-4 rounded"
                  style={{
                    backgroundColor: getColor(val),
                    border: `1px solid ${getBorderColor(val)}`
                  }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Color intensity indicates {getMetricLabel().toLowerCase()} - darker colors = higher values
        </p>
      </div>

      {/* Heat Map Canvas */}
      <div className="relative w-full h-96 bg-zinc-900/50 rounded-lg border border-zinc-700 overflow-hidden">
        {heatMapData.map((data) => {
          const table = tables.find(t => t.id === data.tableId);
          if (!table) return null;

          const color = getColor(data.value);
          const borderColor = getBorderColor(data.value);
          const size = Math.max(40, Math.min(80, 40 + data.value * 40)); // Size based on value

          return (
            <div
              key={data.tableId}
              onClick={() => onTableClick?.(data.tableId)}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
              style={{
                left: `${table.x}%`,
                top: `${table.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${size}px`,
                height: `${size}px`
              }}
              title={`${data.tableName}: ${formatValue(data.rawValue, metric)}`}
            >
              {/* Heat circle */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: color,
                  border: `2px solid ${borderColor}`,
                  boxShadow: `0 0 ${size / 2}px ${color}`
                }}
              />
              
              {/* Table label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {data.tableName}
                </span>
              </div>

              {/* Value badge */}
              {data.value > 0 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-0.5">
                  <span className="text-xs font-semibold text-white">
                    {formatValue(data.rawValue, metric)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {heatMapData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-zinc-400">No data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




