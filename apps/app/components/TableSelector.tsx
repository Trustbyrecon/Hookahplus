"use client";

import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, Clock, Crown, Star, AlertCircle } from 'lucide-react';
import { TableType, TABLE_TYPES, getTableAvailabilityStats, getTableTypeStats } from '../lib/tableTypes';
import { useSessionContext } from '../contexts/SessionContext';
import { CODIGO_SEATS } from '../lib/codigoSeats';

// Helper hook that safely uses SessionContext
function useSessionContextSafe() {
  try {
    return useSessionContext();
  } catch (error) {
    // SessionContext not available - return empty sessions
    return { sessions: [] };
  }
}

interface TableSelectorProps {
  selectedTableId?: string;
  onTableSelect: (table: TableType) => void;
  showAvailability?: boolean;
  showCapacity?: boolean;
  showPricing?: boolean;
  useLayoutData?: boolean; // New: Use layout data instead of hardcoded
  partySize?: number; // New: Filter by capacity
  loungeId?: string; // New: Lounge ID for loading LaunchPad config
  className?: string;
}

export function TableSelector({
  selectedTableId,
  onTableSelect,
  showAvailability = true,
  showCapacity = true,
  showPricing = false,
  useLayoutData = true, // Default to using layout data
  partySize,
  loungeId,
  className = ''
}: TableSelectorProps) {
  const { sessions } = useSessionContextSafe();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [layoutTables, setLayoutTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loungeConfig, setLoungeConfig] = useState<any>(null);

  // Load tables from layout and lounge config if enabled
  useEffect(() => {
    if (useLayoutData) {
      const loadTables = async () => {
        try {
          // CODIGO: Use source-of-truth CODIGO_SEATS immediately — no API, sub-2s UX
          if (loungeId === 'CODIGO') {
            const codigoTables = CODIGO_SEATS.map((seat) => ({
              id: seat.id,
              name: seat.label,
              capacity: 2,
              seatingType: seat.id.startsWith('seat-kb') ? 'Bar Seating' : 'Booth',
              zone: seat.id.startsWith('seat-5') ? 'VIP' : 'Main Floor',
              tableId: seat.id,
            }));
            setLayoutTables(codigoTables);
            setLoading(false);
            return;
          }

          // Quick check: If no loungeId, skip loading and use demo tables immediately
          if (!loungeId) {
            console.log('[TableSelector] No loungeId, using demo table fallback immediately');
            setLayoutTables([
              { id: 'table-001', name: 'T-001', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-002', name: 'T-002', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-003', name: 'T-003', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-004', name: 'T-004', capacity: 2, seatingType: 'Bar Seating', zone: 'Main Floor' },
              { id: 'table-005', name: 'T-005', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-006', name: 'T-006', capacity: 8, seatingType: 'Outdoor', zone: 'Main Floor' },
              { id: 'table-007', name: 'T-007', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-008', name: 'T-008', capacity: 10, seatingType: 'VIP', zone: 'VIP Section' },
              { id: 'table-009', name: 'T-009', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-010', name: 'T-010', capacity: 8, seatingType: 'Private Room', zone: 'Private Section' }
            ]);
            setLoading(false);
            return;
          }

          // Load layout tables - try loungeId-specific endpoint first, then fallback
          let loadedTables: any[] = [];
          
          try {
            const layoutResponse = await fetch(`/api/lounges/${loungeId}/layout`);
            if (layoutResponse.ok) {
              const layoutData = await layoutResponse.json();
              // Convert seats to table format
              const seats = layoutData.layout?.seats || [];
              loadedTables = seats.map((seat: any) => ({
                id: seat.tableId || seat.id, // Use tableId (e.g., "table-001") as the id, not the UUID
                name: seat.name || seat.tableId,
                seatingType: seat.seatingType || (seat.zone?.zoneType === 'VIP' ? 'VIP' : 
                            seat.zone?.zoneType === 'OUTDOOR' ? 'Outdoor' : 'Booth'),
                capacity: seat.capacity || 4,
                zone: seat.zone?.name || 'Main Floor',
                coordinates: seat.coordinates || { x: 0, y: 0 }
              }));
            }
          } catch (error) {
            console.error('Error loading layout from loungeId endpoint:', error);
          }
          
          // Fallback to general layout endpoint
          if (loadedTables.length === 0) {
            try {
              const layoutResponse = await fetch(`/api/lounges?layout=true&loungeId=${encodeURIComponent(loungeId)}`);
              if (layoutResponse.ok) {
                const layoutData = await layoutResponse.json();
                loadedTables = layoutData.layout?.tables || layoutData.layout?.seats || [];
              }
            } catch (error) {
              console.error('Error loading layout tables:', error);
            }
          }
          
          // Graceful fallback: Use demo tables if no layout found (for demo/onboarding)
          if (loadedTables.length === 0) {
            console.log('[TableSelector] No layout found, using demo table fallback');
            loadedTables = [
              { id: 'table-001', name: 'T-001', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-002', name: 'T-002', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-003', name: 'T-003', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-004', name: 'T-004', capacity: 2, seatingType: 'Bar Seating', zone: 'Main Floor' },
              { id: 'table-005', name: 'T-005', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-006', name: 'T-006', capacity: 8, seatingType: 'Outdoor', zone: 'Main Floor' },
              { id: 'table-007', name: 'T-007', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
              { id: 'table-008', name: 'T-008', capacity: 10, seatingType: 'VIP', zone: 'VIP Section' },
              { id: 'table-009', name: 'T-009', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
              { id: 'table-010', name: 'T-010', capacity: 8, seatingType: 'Private Room', zone: 'Private Section' }
            ];
          }
          
          setLayoutTables(loadedTables);

          // Load lounge config for LaunchPad data (if loungeId provided)
          try {
            const configResponse = await fetch(`/api/lounges/${loungeId}/config`);
            if (configResponse.ok) {
              const configData = await configResponse.json();
              if (configData.config && configData.config.configData) {
                setLoungeConfig(configData.config.configData);
              }
            }
          } catch (configError) {
            console.error('Error loading lounge config:', configError);
          }
        } catch (error) {
          console.error('Error loading layout tables:', error);
          // On error, use demo tables
          setLayoutTables([
            { id: 'table-001', name: 'T-001', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-002', name: 'T-002', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-003', name: 'T-003', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-004', name: 'T-004', capacity: 2, seatingType: 'Bar Seating', zone: 'Main Floor' },
            { id: 'table-005', name: 'T-005', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-006', name: 'T-006', capacity: 8, seatingType: 'Outdoor', zone: 'Main Floor' },
            { id: 'table-007', name: 'T-007', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-008', name: 'T-008', capacity: 10, seatingType: 'VIP', zone: 'VIP Section' },
            { id: 'table-009', name: 'T-009', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-010', name: 'T-010', capacity: 8, seatingType: 'Private Room', zone: 'Private Section' }
          ]);
        } finally {
          setLoading(false);
        }
      };
      loadTables();
    } else {
      setLoading(false);
    }
  }, [useLayoutData, loungeId]);

  // Generate default tables from LaunchPad config
  const generateTablesFromConfig = (tablesCount: number): TableType[] => {
    const tables: TableType[] = [];
    const capacity = 4; // Default capacity
    
    for (let i = 1; i <= tablesCount; i++) {
      const tableNum = i.toString().padStart(3, '0');
      tables.push({
        id: `table-${tableNum}`,
        name: `Table-${tableNum}`,
        type: 'table',
        capacity: capacity,
        availability: 'available',
        location: 'Main Floor',
        description: 'Standard table seating',
        icon: '🪑',
        color: 'bg-green-500',
        priceMultiplier: 1.0
      });
    }
    
    return tables;
  };

  // Convert layout tables to TableType format and merge with availability
  const getAvailableTables = (): TableType[] => {
    if (useLayoutData && layoutTables.length > 0) {
      return layoutTables.map((table: any) => {
        // Use tableId if available (from Seat model), otherwise use id
        const tableIdentifier = table.tableId || table.id;
        
        // Check if table has active session
        const activeSession = sessions.find(s => {
          const sessionTableId = s.tableId;
          return sessionTableId === tableIdentifier ||
                 sessionTableId === table.name ||
                 sessionTableId === table.tableId ||
                 sessionTableId?.toLowerCase() === table.name?.toLowerCase() ||
                 sessionTableId?.toLowerCase() === tableIdentifier?.toLowerCase();
        });

        const isOccupied = activeSession && 
          ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(activeSession.status);

        // Map seating type to table type
        const mapSeatingTypeToType = (seatingType: string): TableType['type'] => {
          const lower = seatingType.toLowerCase();
          if (lower.includes('bar')) return 'bar';
          if (lower.includes('booth')) return 'booth';
          if (lower.includes('outdoor') || lower.includes('patio')) return 'patio';
          if (lower.includes('vip')) return 'vip';
          if (lower.includes('private') || lower.includes('room')) return 'vip';
          if (lower.includes('couch') || lower.includes('sectional')) return 'sectional';
          return 'table';
        };

        // Map zone to location
        const zone = table.zone || 'Main Floor';
        const location = zone === 'VIP' ? 'VIP Section' :
                        zone === 'Outdoor' ? 'Outdoor Patio' :
                        zone === 'Private' ? 'Private Rooms' :
                        'Main Floor';

        return {
          id: tableIdentifier, // Use tableId (e.g., "table-001") not the UUID
          name: table.name || tableIdentifier,
          type: mapSeatingTypeToType(table.seatingType || 'Booth'),
          capacity: table.capacity || 4,
          availability: isOccupied ? 'occupied' : 'available',
          location: location,
          description: `${table.seatingType || 'Booth'} seating`,
          icon: table.seatingType === 'VIP' ? '👑' : table.seatingType === 'Outdoor' ? '🌿' : '🪑',
          color: table.seatingType === 'VIP' ? 'bg-purple-500' : 
                 table.seatingType === 'Outdoor' ? 'bg-emerald-500' : 
                 'bg-blue-500',
          priceMultiplier: table.seatingType === 'VIP' ? 1.5 : 
                          table.seatingType === 'Outdoor' ? 1.2 : 
                          table.seatingType === 'Private Room' ? 1.5 : 1.0
        };
      });
    }
    
    // Fallback: Use LaunchPad config if available, otherwise hardcoded tables
    if (loungeConfig && loungeConfig.tables_count && loungeConfig.tables_count > 0) {
      return generateTablesFromConfig(loungeConfig.tables_count);
    }
    
    return TABLE_TYPES;
  };

  const availableTables = getAvailableTables();

  // Filter by party size if provided
  const capacityFilteredTables = partySize 
    ? availableTables.filter(t => t.capacity >= partySize)
    : availableTables;

  const filteredTables = capacityFilteredTables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || table.type === filterType;
    const matchesAvailability = filterAvailability === 'all' || table.availability === filterAvailability;
    
    return matchesSearch && matchesType && matchesAvailability;
  });

  // Calculate stats from available tables
  const availabilityStats = {
    total: availableTables.length,
    available: availableTables.filter(t => t.availability === 'available').length,
    occupied: availableTables.filter(t => t.availability === 'occupied').length,
    reserved: availableTables.filter(t => t.availability === 'reserved').length,
    maintenance: availableTables.filter(t => t.availability === 'maintenance').length,
    occupancyRate: ((availableTables.filter(t => t.availability === 'occupied' || t.availability === 'reserved').length) / availableTables.length * 100).toFixed(1)
  };

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
            onChange={(e) => setFilterType(e.target.value)}
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
            onChange={(e) => setFilterAvailability(e.target.value)}
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

      {/* Party Size Warning */}
      {partySize && capacityFilteredTables.length < availableTables.length && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>
            Showing {capacityFilteredTables.length} of {availableTables.length} tables that can accommodate {partySize} people
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && useLayoutData && (
        <div className="text-center py-8 text-zinc-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p>Loading tables from layout...</p>
        </div>
      )}

      {/* No Layout Warning - Only show if not using demo fallback */}
      {!loading && useLayoutData && layoutTables.length === 0 && !loungeId && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          <div>
            <p className="font-medium">No tables configured</p>
            <p className="text-xs text-blue-300 mt-1">
              {loungeConfig && loungeConfig.tables_count ? (
                <>
                  Using {loungeConfig.tables_count} tables from LaunchPad setup. Visit <a href="/lounge-layout" className="underline">Lounge Layout Manager</a> to customize your table layout.
                </>
              ) : (
                <>
              Visit <a href="/lounge-layout" className="underline">Lounge Layout Manager</a> to set up your tables.
              Falling back to default tables.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {showAvailability && !loading && (
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

      {/* Tables Grid - Compact Design */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-zinc-700/50 ${
              selectedTableId === table.id
                ? 'border-teal-500 bg-teal-500/20 ring-1 ring-teal-500/30'
                : 'border-zinc-600 bg-zinc-800/80 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTypeIcon(table.type)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{table.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-zinc-300">
                    <span className="capitalize">{table.type}</span>
                    <span>•</span>
                    <span>{table.location}</span>
                    {showCapacity && (
                      <>
                        <span>•</span>
                        <span>{table.capacity}p</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(table.availability)}`}>
                  {getAvailabilityIcon(table.availability)}
                </div>
                {showCapacity && (
                  <div className="text-xs text-zinc-400">
                    {table.capacity}p
                  </div>
                )}
                {partySize && table.capacity < partySize && (
                  <div className="text-xs text-yellow-400" title="Table too small for party size">
                    ⚠️
                  </div>
                )}
              </div>
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
