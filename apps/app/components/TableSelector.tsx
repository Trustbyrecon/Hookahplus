"use client";

import React, { useState } from 'react';
import { Search, Users, MapPin, Clock, Crown, Star } from 'lucide-react';
import { TableType, TABLE_TYPES, getTableAvailabilityStats, getTableTypeStats } from '../lib/tableTypes';

interface TableSelectorProps {
  selectedTableId?: string;
  onTableSelect: (table: TableType) => void;
  showAvailability?: boolean;
  showCapacity?: boolean;
  showPricing?: boolean;
  className?: string;
}

export function TableSelector({
  selectedTableId,
  onTableSelect,
  showAvailability = true,
  showCapacity = true,
  showPricing = false,
  className = ''
}: TableSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TableType['type'] | 'all'>('all');
  const [filterAvailability, setFilterAvailability] = useState<TableType['availability'] | 'all'>('all');

  const availabilityStats = getTableAvailabilityStats();
  const typeStats = getTableTypeStats();

  const filteredTables = TABLE_TYPES.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || table.type === filterType;
    const matchesAvailability = filterAvailability === 'all' || table.availability === filterAvailability;
    
    return matchesSearch && matchesType && matchesAvailability;
  });

  const getAvailabilityColor = (availability: TableType['availability']) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'occupied': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'reserved': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'maintenance': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getAvailabilityIcon = (availability: TableType['availability']) => {
    switch (availability) {
      case 'available': return '✅';
      case 'occupied': return '🔴';
      case 'reserved': return '🟡';
      case 'maintenance': return '🔧';
      default: return '❓';
    }
  };

  const getTypeIcon = (type: TableType['type']) => {
    switch (type) {
      case 'bar': return '🍺';
      case 'booth': return '🪑';
      case 'table': return '🪑';
      case 'patio': return '🌿';
      case 'vip': return '👑';
      case 'sectional': return '🛋️';
      default: return '🪑';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tables by name, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TableType['type'] | 'all')}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="bar">Bar</option>
            <option value="booth">Booth</option>
            <option value="table">Table</option>
            <option value="patio">Patio</option>
            <option value="vip">VIP</option>
            <option value="sectional">Sectional</option>
          </select>

          {/* Availability Filter */}
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value as TableType['availability'] | 'all')}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      {showAvailability && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-800/80 rounded-lg border border-zinc-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{availabilityStats.total}</div>
            <div className="text-sm text-zinc-200 font-medium">Total Tables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{availabilityStats.available}</div>
            <div className="text-sm text-zinc-200 font-medium">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{availabilityStats.occupied}</div>
            <div className="text-sm text-zinc-200 font-medium">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{availabilityStats.occupancyRate}%</div>
            <div className="text-sm text-zinc-200 font-medium">Occupancy</div>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedTableId === table.id
                ? 'border-teal-500 bg-teal-500/20 ring-2 ring-teal-500/20 shadow-lg'
                : 'border-zinc-600 bg-zinc-800/80 hover:border-zinc-500 hover:bg-zinc-800/90 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(table.type)}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{table.name}</h3>
                  <p className="text-sm text-zinc-200 capitalize font-medium">{table.type}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(table.availability)}`}>
                {getAvailabilityIcon(table.availability)} {table.availability}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-white">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{table.location}</span>
              </div>
              
              {showCapacity && (
                <div className="flex items-center space-x-2 text-sm text-white">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="font-medium">Capacity: {table.capacity} people</span>
                </div>
              )}

              {showPricing && (
                <div className="flex items-center space-x-2 text-sm text-white">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">Price: {table.priceMultiplier}x base rate</span>
                </div>
              )}

              <p className="text-sm text-zinc-200 mt-2 leading-relaxed">{table.description}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No tables found</h3>
          <p className="text-zinc-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
