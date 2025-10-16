// Mock data for site build - matches landing page metrics
export const mockSiteData = {
  // Landing page metrics
  activeSessions: 18,
  projectedRevenue: 12340,
  reflexScore: 92,
  systemHealth: 'EXCELLENT',
  
  // Comprehensive session data
  sessions: [
    // Active Sessions (12)
    {
      id: 'session_001',
      tableId: 'T-001',
      customerName: 'Alex Johnson',
      customerPhone: '+1 (555) 123-4567',
      flavor: 'Blue Mist + Mint',
      amount: 3500, // in cents
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Mike Rodriguez',
        foh: 'Sarah Chen'
      },
      createdAt: Date.now() - 3600000, // 1 hour ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 3600000,
      sessionDuration: 45 * 60, // 45 minutes in seconds
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Customer prefers mild flavors',
      edgeCase: null,
      sessionTimer: {
        remaining: 15 * 60, // 15 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 3600000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_002',
      tableId: 'T-005',
      customerName: 'Maria Garcia',
      customerPhone: '+1 (555) 234-5678',
      flavor: 'Strawberry Kiwi',
      amount: 2800,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'James Wilson',
        foh: 'Emma Davis'
      },
      createdAt: Date.now() - 1800000, // 30 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 1800000,
      sessionDuration: 60 * 60, // 60 minutes
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'VIP customer - premium service',
      edgeCase: null,
      sessionTimer: {
        remaining: 30 * 60, // 30 minutes remaining
        total: 60 * 60,
        isActive: true,
        startedAt: Date.now() - 1800000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_003',
      tableId: 'T-012',
      customerName: 'David Kim',
      customerPhone: '+1 (555) 345-6789',
      flavor: 'Mango Tango',
      amount: 4200,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Lisa Brown',
        foh: 'Tom Anderson'
      },
      createdAt: Date.now() - 2700000, // 45 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 2700000,
      sessionDuration: 90 * 60, // 90 minutes
      coalStatus: 'needs_refill',
      refillStatus: 'requested',
      notes: 'Regular customer - knows the menu well',
      edgeCase: null,
      sessionTimer: {
        remaining: 45 * 60, // 45 minutes remaining
        total: 90 * 60,
        isActive: true,
        startedAt: Date.now() - 2700000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_004',
      tableId: 'T-008',
      customerName: 'Jennifer Lee',
      customerPhone: '+1 (555) 456-7890',
      flavor: 'Grape Mint',
      amount: 3200,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Carlos Martinez',
        foh: 'Rachel Green'
      },
      createdAt: Date.now() - 900000, // 15 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 900000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'First time customer - very excited',
      edgeCase: null,
      sessionTimer: {
        remaining: 30 * 60, // 30 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 900000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_005',
      tableId: 'T-015',
      customerName: 'Robert Taylor',
      customerPhone: '+1 (555) 567-8901',
      flavor: 'Peach Paradise',
      amount: 3800,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Anna Johnson',
        foh: 'Mark Thompson'
      },
      createdAt: Date.now() - 2100000, // 35 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 2100000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Celebrating birthday - extra attention needed',
      edgeCase: null,
      sessionTimer: {
        remaining: 25 * 60, // 25 minutes remaining
        total: 60 * 60,
        isActive: true,
        startedAt: Date.now() - 2100000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_006',
      tableId: 'T-003',
      customerName: 'Amanda White',
      customerPhone: '+1 (555) 678-9012',
      flavor: 'Watermelon Chill',
      amount: 2900,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Kevin Park',
        foh: 'Samantha Lee'
      },
      createdAt: Date.now() - 1200000, // 20 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 1200000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Prefers strong flavors',
      edgeCase: null,
      sessionTimer: {
        remaining: 25 * 60, // 25 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 1200000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_007',
      tableId: 'T-020',
      customerName: 'Michael Brown',
      customerPhone: '+1 (555) 789-0123',
      flavor: 'Cherry Blossom',
      amount: 4100,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Jessica Wang',
        foh: 'Daniel Kim'
      },
      createdAt: Date.now() - 2400000, // 40 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 2400000,
      sessionDuration: 75 * 60, // 75 minutes
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Business meeting - needs quiet table',
      edgeCase: null,
      sessionTimer: {
        remaining: 35 * 60, // 35 minutes remaining
        total: 75 * 60,
        isActive: true,
        startedAt: Date.now() - 2400000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_008',
      tableId: 'T-007',
      customerName: 'Sarah Davis',
      customerPhone: '+1 (555) 890-1234',
      flavor: 'Lemon Mint',
      amount: 2600,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Ryan O\'Connor',
        foh: 'Michelle Chen'
      },
      createdAt: Date.now() - 600000, // 10 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 600000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Light smoker - mild flavors preferred',
      edgeCase: null,
      sessionTimer: {
        remaining: 35 * 60, // 35 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 600000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_009',
      tableId: 'T-014',
      customerName: 'Christopher Wilson',
      customerPhone: '+1 (555) 901-2345',
      flavor: 'Double Apple',
      amount: 3300,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Ashley Rodriguez',
        foh: 'Brandon Lee'
      },
      createdAt: Date.now() - 1500000, // 25 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 1500000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Regular customer - table 14 is his favorite',
      edgeCase: null,
      sessionTimer: {
        remaining: 35 * 60, // 35 minutes remaining
        total: 60 * 60,
        isActive: true,
        startedAt: Date.now() - 1500000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_010',
      tableId: 'T-018',
      customerName: 'Nicole Martinez',
      customerPhone: '+1 (555) 012-3456',
      flavor: 'Pineapple Express',
      amount: 3700,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Tyler Johnson',
        foh: 'Kayla Smith'
      },
      createdAt: Date.now() - 3000000, // 50 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 3000000,
      sessionDuration: 90 * 60, // 90 minutes
      coalStatus: 'needs_refill',
      refillStatus: 'requested',
      notes: 'Group of 4 - very social',
      edgeCase: null,
      sessionTimer: {
        remaining: 40 * 60, // 40 minutes remaining
        total: 90 * 60,
        isActive: true,
        startedAt: Date.now() - 3000000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_011',
      tableId: 'T-022',
      customerName: 'Kevin Park',
      customerPhone: '+1 (555) 123-4567',
      flavor: 'Orange Cream',
      amount: 3100,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Maria Garcia',
        foh: 'Alex Thompson'
      },
      createdAt: Date.now() - 1800000, // 30 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 1800000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Anniversary dinner - romantic setup',
      edgeCase: null,
      sessionTimer: {
        remaining: 30 * 60, // 30 minutes remaining
        total: 60 * 60,
        isActive: true,
        startedAt: Date.now() - 1800000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    {
      id: 'session_012',
      tableId: 'T-025',
      customerName: 'Lisa Anderson',
      customerPhone: '+1 (555) 234-5678',
      flavor: 'Vanilla Mint',
      amount: 2900,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Jake Miller',
        foh: 'Sophie Davis'
      },
      createdAt: Date.now() - 2100000, // 35 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 2100000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Solo customer - enjoys quiet atmosphere',
      edgeCase: null,
      sessionTimer: {
        remaining: 10 * 60, // 10 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 2100000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    },
    
    // BOH Sessions (4)
    {
      id: 'session_013',
      tableId: 'T-009',
      customerName: 'James Rodriguez',
      customerPhone: '+1 (555) 345-6789',
      flavor: 'Mint Chocolate',
      amount: 3600,
      status: 'PREP_IN_PROGRESS',
      currentStage: 'BOH',
      assignedStaff: {
        boh: 'Mike Rodriguez',
        foh: 'Sarah Chen'
      },
      createdAt: Date.now() - 300000, // 5 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 300000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Complex mix - needs extra prep time',
      edgeCase: null,
      sessionTimer: {
        remaining: 40 * 60, // 40 minutes remaining
        total: 45 * 60,
        isActive: false,
        startedAt: Date.now() - 300000
      },
      bohState: 'PREPARING',
      guestTimerDisplay: false
    },
    {
      id: 'session_014',
      tableId: 'T-011',
      customerName: 'Rachel Green',
      customerPhone: '+1 (555) 456-7890',
      flavor: 'Coconut Lime',
      amount: 3400,
      status: 'HEAT_UP',
      currentStage: 'BOH',
      assignedStaff: {
        boh: 'James Wilson',
        foh: 'Emma Davis'
      },
      createdAt: Date.now() - 180000, // 3 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 180000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Heating up - almost ready',
      edgeCase: null,
      sessionTimer: {
        remaining: 57 * 60, // 57 minutes remaining
        total: 60 * 60,
        isActive: false,
        startedAt: Date.now() - 180000
      },
      bohState: 'WARMING_UP',
      guestTimerDisplay: false
    },
    {
      id: 'session_015',
      tableId: 'T-016',
      customerName: 'Tom Anderson',
      customerPhone: '+1 (555) 567-8901',
      flavor: 'Ginger Peach',
      amount: 3200,
      status: 'READY_FOR_DELIVERY',
      currentStage: 'BOH',
      assignedStaff: {
        boh: 'Lisa Brown',
        foh: 'Tom Anderson'
      },
      createdAt: Date.now() - 120000, // 2 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 120000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Ready for pickup - FOH notified',
      edgeCase: null,
      sessionTimer: {
        remaining: 43 * 60, // 43 minutes remaining
        total: 45 * 60,
        isActive: false,
        startedAt: Date.now() - 120000
      },
      bohState: 'READY_FOR_PICKUP',
      guestTimerDisplay: false
    },
    {
      id: 'session_016',
      tableId: 'T-019',
      customerName: 'Emma Davis',
      customerPhone: '+1 (555) 678-9012',
      flavor: 'Rose Petal',
      amount: 3800,
      status: 'READY_FOR_DELIVERY',
      currentStage: 'BOH',
      assignedStaff: {
        boh: 'Carlos Martinez',
        foh: 'Rachel Green'
      },
      createdAt: Date.now() - 60000, // 1 minute ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 60000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Premium blend - ready for delivery',
      edgeCase: null,
      sessionTimer: {
        remaining: 59 * 60, // 59 minutes remaining
        total: 60 * 60,
        isActive: false,
        startedAt: Date.now() - 60000
      },
      bohState: 'READY_FOR_PICKUP',
      guestTimerDisplay: false
    },
    
    // FOH Sessions (2)
    {
      id: 'session_017',
      tableId: 'T-024',
      customerName: 'Mark Thompson',
      customerPhone: '+1 (555) 789-0123',
      flavor: 'Lavender Dreams',
      amount: 3500,
      status: 'OUT_FOR_DELIVERY',
      currentStage: 'FOH',
      assignedStaff: {
        boh: 'Anna Johnson',
        foh: 'Mark Thompson'
      },
      createdAt: Date.now() - 240000, // 4 minutes ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 240000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'En route to table - 2 minutes ETA',
      edgeCase: null,
      sessionTimer: {
        remaining: 41 * 60, // 41 minutes remaining
        total: 45 * 60,
        isActive: false,
        startedAt: Date.now() - 240000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: false
    },
    {
      id: 'session_018',
      tableId: 'T-026',
      customerName: 'Samantha Lee',
      customerPhone: '+1 (555) 890-1234',
      flavor: 'Honeydew Melon',
      amount: 3100,
      status: 'DELIVERED',
      currentStage: 'FOH',
      assignedStaff: {
        boh: 'Kevin Park',
        foh: 'Samantha Lee'
      },
      createdAt: Date.now() - 60000, // 1 minute ago
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 60000,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Just delivered - customer happy',
      edgeCase: null,
      sessionTimer: {
        remaining: 59 * 60, // 59 minutes remaining
        total: 60 * 60,
        isActive: true,
        startedAt: Date.now() - 60000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    }
  ],
  
  // Staff assignments
  staff: {
    boh: ['Mike Rodriguez', 'James Wilson', 'Lisa Brown', 'Carlos Martinez', 'Anna Johnson', 'Kevin Park', 'Jessica Wang', 'Ryan O\'Connor', 'Ashley Rodriguez', 'Tyler Johnson', 'Maria Garcia', 'Jake Miller'],
    foh: ['Sarah Chen', 'Emma Davis', 'Tom Anderson', 'Rachel Green', 'Mark Thompson', 'Samantha Lee', 'Daniel Kim', 'Michelle Chen', 'Brandon Lee', 'Kayla Smith', 'Alex Thompson', 'Sophie Davis']
  },
  
  // Flavor wheel data for guest experience
  flavorWheel: {
    categories: [
      {
        name: 'Fruity',
        colors: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
        flavors: ['Strawberry Kiwi', 'Mango Tango', 'Peach Paradise', 'Watermelon Chill', 'Cherry Blossom', 'Pineapple Express', 'Orange Cream']
      },
      {
        name: 'Minty',
        colors: ['#4ECDC4', '#45B7D1', '#96CEB4'],
        flavors: ['Blue Mist + Mint', 'Grape Mint', 'Lemon Mint', 'Vanilla Mint', 'Mint Chocolate']
      },
      {
        name: 'Creamy',
        colors: ['#FECA57', '#FF9FF3', '#54A0FF'],
        flavors: ['Double Apple', 'Coconut Lime', 'Ginger Peach', 'Rose Petal', 'Lavender Dreams', 'Honeydew Melon']
      }
    ],
    popularCombinations: [
      { primary: 'Strawberry Kiwi', secondary: 'Mint', popularity: 85 },
      { primary: 'Mango Tango', secondary: 'Coconut', popularity: 78 },
      { primary: 'Blue Mist', secondary: 'Mint', popularity: 92 },
      { primary: 'Peach Paradise', secondary: 'Vanilla', popularity: 71 }
    ]
  },
  
  // Trust and loyalty data
  trustMetrics: {
    averageTrustScore: 87,
    loyaltyTiers: {
      bronze: 45,
      silver: 32,
      gold: 18,
      platinum: 5
    },
    flavorPreferences: {
      'Strawberry Kiwi': 23,
      'Mango Tango': 19,
      'Blue Mist + Mint': 17,
      'Peach Paradise': 15,
      'Watermelon Chill': 12,
      'Cherry Blossom': 10,
      'Pineapple Express': 8,
      'Orange Cream': 7,
      'Grape Mint': 6,
      'Lemon Mint': 5
    }
  }
};

// Helper functions for mock data
export const getSessionById = (id: string) => {
  return mockSiteData.sessions.find(session => session.id === id);
};

export const getSessionsByStatus = (status: string) => {
  return mockSiteData.sessions.filter(session => session.status === status);
};

export const getSessionsByStage = (stage: string) => {
  return mockSiteData.sessions.filter(session => session.currentStage === stage);
};

export const getActiveSessions = () => {
  return mockSiteData.sessions.filter(session => session.status === 'ACTIVE');
};

export const getBohSessions = () => {
  return mockSiteData.sessions.filter(session => 
    ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(session.status)
  );
};

export const getFohSessions = () => {
  return mockSiteData.sessions.filter(session => 
    ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(session.status)
  );
};

export const getEdgeCaseSessions = () => {
  return mockSiteData.sessions.filter(session => 
    ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(session.status)
  );
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'ACTIVE': 'text-green-400',
    'PREP_IN_PROGRESS': 'text-orange-400',
    'HEAT_UP': 'text-yellow-400',
    'READY_FOR_DELIVERY': 'text-blue-400',
    'OUT_FOR_DELIVERY': 'text-purple-400',
    'DELIVERED': 'text-teal-400',
    'STAFF_HOLD': 'text-red-400',
    'STOCK_BLOCKED': 'text-red-400',
    'REMAKE': 'text-red-400',
    'REFUND_REQUESTED': 'text-red-400',
    'FAILED_PAYMENT': 'text-red-400'
  };
  return statusColors[status] || 'text-zinc-400';
};

export const getStageIcon = (stage: string) => {
  const stageIcons: Record<string, string> = {
    'BOH': '👨‍🍳',
    'FOH': '👨‍💼',
    'CUSTOMER': '👥'
  };
  return stageIcons[stage] || '👥';
};
