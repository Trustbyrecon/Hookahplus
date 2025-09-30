export interface MasterSeatingType {
  id: string;
  name: string;
  type: 'bar' | 'booth' | 'table' | 'patio' | 'vip' | 'sectional' | 'high-top' | 'lounge';
  capacity: number;
  available: number;
  occupied: number;
  sessions: number;
  color: string;
  icon: string;
  description: string;
  priceMultiplier: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zone?: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  lastUpdated: string;
}

export const MASTER_SEATING_TYPES: MasterSeatingType[] = [
  {
    id: 'bar-counter-001',
    name: 'Bar Counter 1',
    type: 'bar',
    capacity: 1,
    available: 1,
    occupied: 0,
    sessions: 0,
    color: 'orange',
    icon: '🍺',
    description: 'Cozy spot at the main bar',
    priceMultiplier: 1.0,
    coordinates: { x: 50, y: 20, width: 200, height: 60 },
    zone: 'bar_a',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'booth-w-001',
    name: 'Booth W 1',
    type: 'booth',
    capacity: 4,
    available: 4,
    occupied: 0,
    sessions: 0,
    color: 'blue',
    icon: '🛋️',
    description: 'Comfortable booth seating',
    priceMultiplier: 1.1,
    coordinates: { x: 300, y: 20, width: 150, height: 100 },
    zone: 'booth_w',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'table-section-001',
    name: 'Table Section 1',
    type: 'table',
    capacity: 6,
    available: 6,
    occupied: 0,
    sessions: 0,
    color: 'green',
    icon: '🍽️',
    description: 'Standard table for groups',
    priceMultiplier: 1.0,
    coordinates: { x: 50, y: 150, width: 300, height: 120 },
    zone: 'table_section',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'vip-area-001',
    name: 'VIP Area 1',
    type: 'vip',
    capacity: 8,
    available: 8,
    occupied: 0,
    sessions: 0,
    color: 'purple',
    icon: '👑',
    description: 'Exclusive VIP lounge area',
    priceMultiplier: 1.5,
    coordinates: { x: 400, y: 150, width: 120, height: 100 },
    zone: 'vip_area',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'patio-seating-001',
    name: 'Patio Seating 1',
    type: 'patio',
    capacity: 8,
    available: 8,
    occupied: 0,
    sessions: 0,
    color: 'teal',
    icon: '🌳',
    description: 'Outdoor seating with a view',
    priceMultiplier: 1.2,
    coordinates: { x: 50, y: 300, width: 200, height: 80 },
    zone: 'patio_area',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'sectional-lounge-001',
    name: 'Sectional Lounge 1',
    type: 'sectional',
    capacity: 12,
    available: 12,
    occupied: 0,
    sessions: 0,
    color: 'pink',
    icon: '🪑',
    description: 'Large sectional for big parties',
    priceMultiplier: 1.3,
    coordinates: { x: 300, y: 300, width: 250, height: 100 },
    zone: 'lounge_area',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'high-top-001',
    name: 'High Top 1',
    type: 'high-top',
    capacity: 4,
    available: 4,
    occupied: 0,
    sessions: 0,
    color: 'yellow',
    icon: '🪜',
    description: 'High top table for casual dining',
    priceMultiplier: 1.05,
    coordinates: { x: 100, y: 100, width: 80, height: 80 },
    zone: 'bar_area',
    status: 'available',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lounge-chair-001',
    name: 'Lounge Chair 1',
    type: 'lounge',
    capacity: 2,
    available: 2,
    occupied: 0,
    sessions: 0,
    color: 'indigo',
    icon: '🪑',
    description: 'Comfortable lounge chair seating',
    priceMultiplier: 1.1,
    coordinates: { x: 200, y: 100, width: 60, height: 60 },
    zone: 'lounge_area',
    status: 'available',
    lastUpdated: new Date().toISOString()
  }
];

export const getSeatingTypeStats = () => {
  const stats = MASTER_SEATING_TYPES.reduce((acc, type) => {
    if (!acc[type.type]) {
      acc[type.type] = {
        total: 0,
        available: 0,
        occupied: 0,
        sessions: 0,
        capacity: 0
      };
    }
    acc[type.type].total += 1;
    acc[type.type].available += type.available;
    acc[type.type].occupied += type.occupied;
    acc[type.type].sessions += type.sessions;
    acc[type.type].capacity += type.capacity;
    return acc;
  }, {} as Record<string, { total: number; available: number; occupied: number; sessions: number; capacity: number }>);

  return stats;
};

export const getZoneStats = () => {
  const zoneSet = new Set(MASTER_SEATING_TYPES.map(type => type.zone).filter(Boolean));
  const zones = Array.from(zoneSet);
  return zones.map(zone => {
    const zoneTypes = MASTER_SEATING_TYPES.filter(type => type.zone === zone);
    return {
      zone,
      total: zoneTypes.length,
      available: zoneTypes.reduce((sum, type) => sum + type.available, 0),
      occupied: zoneTypes.reduce((sum, type) => sum + type.occupied, 0),
      sessions: zoneTypes.reduce((sum, type) => sum + type.sessions, 0),
      capacity: zoneTypes.reduce((sum, type) => sum + type.capacity, 0)
    };
  });
};

export const updateSeatingTypeStatus = (id: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance') => {
  const type = MASTER_SEATING_TYPES.find(t => t.id === id);
  if (type) {
    type.status = status;
    type.lastUpdated = new Date().toISOString();
    
    if (status === 'occupied') {
      type.available = Math.max(0, type.available - 1);
      type.occupied = Math.min(type.capacity, type.occupied + 1);
    } else if (status === 'available') {
      type.available = Math.min(type.capacity, type.available + 1);
      type.occupied = Math.max(0, type.occupied - 1);
    }
  }
  return type;
};

export const addSessionToSeatingType = (id: string) => {
  const type = MASTER_SEATING_TYPES.find(t => t.id === id);
  if (type) {
    type.sessions += 1;
    type.lastUpdated = new Date().toISOString();
  }
  return type;
};

export const removeSessionFromSeatingType = (id: string) => {
  const type = MASTER_SEATING_TYPES.find(t => t.id === id);
  if (type) {
    type.sessions = Math.max(0, type.sessions - 1);
    type.lastUpdated = new Date().toISOString();
  }
  return type;
};
