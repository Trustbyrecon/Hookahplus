'use client';

import React, { useState } from 'react';
import { X, Search, MapPin, Users } from 'lucide-react';

// Table types - matching app build structure
interface TableType {
  id: string;
  name: string;
  type: 'bar' | 'booth' | 'table' | 'patio' | 'vip' | 'sectional';
  capacity: number;
  availability: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: string;
  description: string;
}

// Mock table data - in production, fetch from API
const AVAILABLE_TABLES: TableType[] = [
  { id: 'bar-001', name: 'Bar-001', type: 'bar', capacity: 2, availability: 'available', location: 'Main Bar', description: 'Bar seating' },
  { id: 'bar-002', name: 'Bar-002', type: 'bar', capacity: 2, availability: 'available', location: 'Main Bar', description: 'Bar seating' },
  { id: 'booth-001', name: 'Booth-001', type: 'booth', capacity: 4, availability: 'available', location: 'Main Floor', description: 'Semi-private booth' },
  { id: 'table-001', name: 'Table-001', type: 'table', capacity: 6, availability: 'available', location: 'Main Floor', description: 'Standard table' },
  { id: 'table-002', name: 'Table-002', type: 'table', capacity: 6, availability: 'available', location: 'Main Floor', description: 'Standard table' },
  { id: 'patio-001', name: 'Patio-001', type: 'patio', capacity: 8, availability: 'available', location: 'Outdoor Patio', description: 'Outdoor seating' },
  { id: 'vip-001', name: 'VIP-001', type: 'vip', capacity: 10, availability: 'available', location: 'VIP Section', description: 'Premium VIP seating' },
  { id: 'sectional-001', name: 'Sectional-001', type: 'sectional', capacity: 12, availability: 'available', location: 'Lounge Area', description: 'Large sectional' },
];

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tableId: string, tableName: string) => void;
  partySize?: number;
  priority?: 'VIP' | 'NORMAL';
}

export default function TableSelectorModal({
  isOpen,
  onClose,
  onSelect,
  partySize = 2,
  priority = 'NORMAL'
}: TableSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('available');

  if (!isOpen) return null;

  // Filter tables
  const filteredTables = AVAILABLE_TABLES.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = filterAvailability === 'all' || table.availability === filterAvailability;
    const fitsParty = table.capacity >= partySize;
    return matchesSearch && matchesAvailability && fitsParty;
  });

  // Sort: VIP tables first if priority is VIP, then by capacity
  const sortedTables = [...filteredTables].sort((a, b) => {
    if (priority === 'VIP' && a.type === 'vip' && b.type !== 'vip') return -1;
    if (priority === 'VIP' && a.type !== 'vip' && b.type === 'vip') return 1;
    return a.capacity - b.capacity;
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden relative">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Select Table</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Party size: {partySize} {priority === 'VIP' && '• VIP Priority'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 pb-4 border-b border-zinc-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tables..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'available')}
              className="px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            >
              <option value="available">Available Only</option>
              <option value="all">All Tables</option>
            </select>
          </div>
        </div>

        {/* Tables List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {sortedTables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">No tables found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    onSelect(table.id, table.name);
                    onClose();
                  }}
                  className="w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-lg hover:border-teal-500 hover:bg-zinc-700/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(table.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{table.name}</h3>
                          {table.type === 'vip' && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{table.location}</span>
                          <span>•</span>
                          <Users className="w-3 h-3" />
                          <span>{table.capacity} seats</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{table.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(table.availability)}`}>
                      {table.availability === 'available' ? '✅ Available' : table.availability}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

