"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export interface Table {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentSession?: {
    id: string;
    customerName: string;
    startedAt: Date;
    duration: number;
    timeRemaining: number;
  };
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  description: string;
  tables: Table[];
}

interface TableZoneSelectorProps {
  zones: Zone[];
  selectedTable?: string;
  onTableSelect: (tableId: string) => void;
  onZoneFilter?: (zoneId: string | null) => void;
  showTimerInfo?: boolean;
  className?: string;
}

export const TableZoneSelector: React.FC<TableZoneSelectorProps> = ({
  zones,
  selectedTable,
  onTableSelect,
  onZoneFilter,
  showTimerInfo = true,
  className
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  // Filter tables by selected zone
  const filteredTables = selectedZone 
    ? zones.find(z => z.id === selectedZone)?.tables || []
    : zones.flatMap(zone => zone.tables);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'occupied':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'reserved':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'maintenance':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
      default:
        return 'bg-zinc-500/20 border-zinc-500/50 text-zinc-400';
    }
  };

  const getTableStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <Users className="w-4 h-4" />;
      case 'reserved':
        return <Clock className="w-4 h-4" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleZoneSelect = (zoneId: string | null) => {
    setSelectedZone(zoneId);
    onZoneFilter?.(zoneId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Zone Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleZoneSelect(null)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            selectedZone === null
              ? 'bg-teal-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          )}
        >
          All Zones
        </button>
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleZoneSelect(zone.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedZone === zone.id
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
            style={{ 
              borderColor: selectedZone === zone.id ? zone.color : 'transparent',
              borderWidth: selectedZone === zone.id ? '2px' : '0px'
            }}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className={cn(
              'relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
              'hover:scale-105 hover:shadow-lg',
              getTableStatusColor(table.status),
              selectedTable === table.id && 'ring-2 ring-teal-400 ring-offset-2 ring-offset-zinc-900',
              hoveredTable === table.id && 'scale-105 shadow-lg'
            )}
            onClick={() => onTableSelect(table.id)}
            onMouseEnter={() => setHoveredTable(table.id)}
            onMouseLeave={() => setHoveredTable(null)}
          >
            {/* Table Number */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">#{table.number}</span>
              {getTableStatusIcon(table.status)}
            </div>

            {/* Zone */}
            <div className="text-xs opacity-75 mb-1">
              {table.zone}
            </div>

            {/* Capacity */}
            <div className="text-xs opacity-75 mb-2">
              {table.capacity} seats
            </div>

            {/* Current Session Info */}
            {table.currentSession && showTimerInfo && (
              <div className="space-y-1 text-xs">
                <div className="font-medium truncate">
                  {table.currentSession.customerName}
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatTimeRemaining(table.currentSession.timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-1 right-1">
              <div className={cn(
                'w-2 h-2 rounded-full',
                table.status === 'available' && 'bg-green-400',
                table.status === 'occupied' && 'bg-red-400',
                table.status === 'reserved' && 'bg-yellow-400',
                table.status === 'maintenance' && 'bg-gray-400'
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>Available ({filteredTables.filter(t => t.status === 'available').length})</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Occupied ({filteredTables.filter(t => t.status === 'occupied').length})</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span>Reserved ({filteredTables.filter(t => t.status === 'reserved').length})</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Maintenance ({filteredTables.filter(t => t.status === 'maintenance').length})</span>
        </div>
      </div>
    </div>
  );
};

// Mock data generator for development
export const generateMockZones = (): Zone[] => [
  {
    id: 'vip',
    name: 'VIP',
    color: '#8B5CF6',
    description: 'Premium seating area',
    tables: [
      { id: 'vip-1', number: '1', zone: 'VIP', capacity: 6, status: 'occupied', currentSession: { id: 's1', customerName: 'John D.', startedAt: new Date(), duration: 3600, timeRemaining: 1800 } },
      { id: 'vip-2', number: '2', zone: 'VIP', capacity: 4, status: 'available' },
      { id: 'vip-3', number: '3', zone: 'VIP', capacity: 8, status: 'reserved' }
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    color: '#06B6D4',
    description: 'Regular seating area',
    tables: [
      { id: 'std-1', number: '4', zone: 'Standard', capacity: 4, status: 'occupied', currentSession: { id: 's2', customerName: 'Sarah M.', startedAt: new Date(), duration: 3600, timeRemaining: 2400 } },
      { id: 'std-2', number: '5', zone: 'Standard', capacity: 4, status: 'available' },
      { id: 'std-3', number: '6', zone: 'Standard', capacity: 4, status: 'available' },
      { id: 'std-4', number: '7', zone: 'Standard', capacity: 6, status: 'occupied', currentSession: { id: 's3', customerName: 'Mike R.', startedAt: new Date(), duration: 3600, timeRemaining: 900 } }
    ]
  },
  {
    id: 'patio',
    name: 'Patio',
    color: '#10B981',
    description: 'Outdoor seating area',
    tables: [
      { id: 'patio-1', number: '8', zone: 'Patio', capacity: 4, status: 'available' },
      { id: 'patio-2', number: '9', zone: 'Patio', capacity: 6, status: 'maintenance' },
      { id: 'patio-3', number: '10', zone: 'Patio', capacity: 4, status: 'available' }
    ]
  }
];
