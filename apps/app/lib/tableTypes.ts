export interface TableType {
  id: string;
  name: string;
  type: 'bar' | 'booth' | 'table' | 'patio' | 'vip' | 'sectional';
  capacity: number;
  availability: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: string;
  description: string;
  icon: string;
  color: string;
  priceMultiplier: number; // For pricing adjustments based on table type
}

export const TABLE_TYPES: TableType[] = [
  {
    id: 'bar-001',
    name: 'Bar-001',
    type: 'bar',
    capacity: 2,
    availability: 'available',
    location: 'Main Bar',
    description: 'Bar seating with hookah setup',
    icon: '🍺',
    color: 'bg-amber-500',
    priceMultiplier: 1.0
  },
  {
    id: 'bar-002',
    name: 'Bar-002',
    type: 'bar',
    capacity: 2,
    availability: 'available',
    location: 'Main Bar',
    description: 'Bar seating with hookah setup',
    icon: '🍺',
    color: 'bg-amber-500',
    priceMultiplier: 1.0
  },
  {
    id: 'booth-001',
    name: 'Booth-001',
    type: 'booth',
    capacity: 4,
    availability: 'available',
    location: 'Main Floor',
    description: 'Semi-private booth seating',
    icon: '🪑',
    color: 'bg-blue-500',
    priceMultiplier: 1.1
  },
  {
    id: 'booth-002',
    name: 'Booth-002',
    type: 'booth',
    capacity: 4,
    availability: 'occupied',
    location: 'Main Floor',
    description: 'Semi-private booth seating',
    icon: '🪑',
    color: 'bg-blue-500',
    priceMultiplier: 1.1
  },
  {
    id: 'table-001',
    name: 'Table-001',
    type: 'table',
    capacity: 6,
    availability: 'available',
    location: 'Main Floor',
    description: 'Standard table seating',
    icon: '🪑',
    color: 'bg-green-500',
    priceMultiplier: 1.0
  },
  {
    id: 'table-002',
    name: 'Table-002',
    type: 'table',
    capacity: 6,
    availability: 'reserved',
    location: 'Main Floor',
    description: 'Standard table seating',
    icon: '🪑',
    color: 'bg-green-500',
    priceMultiplier: 1.0
  },
  {
    id: 'patio-001',
    name: 'Patio-001',
    type: 'patio',
    capacity: 8,
    availability: 'available',
    location: 'Outdoor Patio',
    description: 'Outdoor patio seating',
    icon: '🌿',
    color: 'bg-emerald-500',
    priceMultiplier: 1.2
  },
  {
    id: 'patio-002',
    name: 'Patio-002',
    type: 'patio',
    capacity: 8,
    availability: 'available',
    location: 'Outdoor Patio',
    description: 'Outdoor patio seating',
    icon: '🌿',
    color: 'bg-emerald-500',
    priceMultiplier: 1.2
  },
  {
    id: 'vip-001',
    name: 'VIP-001',
    type: 'vip',
    capacity: 10,
    availability: 'available',
    location: 'VIP Section',
    description: 'Premium VIP seating with premium service',
    icon: '👑',
    color: 'bg-purple-500',
    priceMultiplier: 1.5
  },
  {
    id: 'vip-002',
    name: 'VIP-002',
    type: 'vip',
    capacity: 10,
    availability: 'occupied',
    location: 'VIP Section',
    description: 'Premium VIP seating with premium service',
    icon: '👑',
    color: 'bg-purple-500',
    priceMultiplier: 1.5
  },
  {
    id: 'sectional-001',
    name: 'Sectional-001',
    type: 'sectional',
    capacity: 12,
    availability: 'available',
    location: 'Lounge Area',
    description: 'Large sectional seating for groups',
    icon: '🛋️',
    color: 'bg-orange-500',
    priceMultiplier: 1.3
  },
  {
    id: 'sectional-002',
    name: 'Sectional-002',
    type: 'sectional',
    capacity: 12,
    availability: 'maintenance',
    location: 'Lounge Area',
    description: 'Large sectional seating for groups',
    icon: '🛋️',
    color: 'bg-orange-500',
    priceMultiplier: 1.3
  }
];

export const getTableTypeById = (id: string): TableType | undefined => {
  return TABLE_TYPES.find(table => table.id === id);
};

export const getTablesByType = (type: TableType['type']): TableType[] => {
  return TABLE_TYPES.filter(table => table.type === type);
};

export const getAvailableTables = (): TableType[] => {
  return TABLE_TYPES.filter(table => table.availability === 'available');
};

export const getTableAvailabilityStats = () => {
  const stats = {
    total: TABLE_TYPES.length,
    available: TABLE_TYPES.filter(t => t.availability === 'available').length,
    occupied: TABLE_TYPES.filter(t => t.availability === 'occupied').length,
    reserved: TABLE_TYPES.filter(t => t.availability === 'reserved').length,
    maintenance: TABLE_TYPES.filter(t => t.availability === 'maintenance').length
  };
  
  return {
    ...stats,
    occupancyRate: ((stats.occupied + stats.reserved) / stats.total * 100).toFixed(1)
  };
};

export const getTableTypeStats = () => {
  const typeStats: Record<TableType['type'], { count: number; available: number; capacity: number }> = {
    bar: { count: 0, available: 0, capacity: 0 },
    booth: { count: 0, available: 0, capacity: 0 },
    table: { count: 0, available: 0, capacity: 0 },
    patio: { count: 0, available: 0, capacity: 0 },
    vip: { count: 0, available: 0, capacity: 0 },
    sectional: { count: 0, available: 0, capacity: 0 }
  };

  TABLE_TYPES.forEach(table => {
    typeStats[table.type].count++;
    if (table.availability === 'available') {
      typeStats[table.type].available++;
    }
    typeStats[table.type].capacity += table.capacity;
  });

  return typeStats;
};
