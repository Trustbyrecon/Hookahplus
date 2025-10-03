export interface SessionState {
  id: string;
  status: 'NEW' | 'PAID_CONFIRMED' | 'PREP_IN_PROGRESS' | 'ACTIVE' | 'CLOSED';
  customerName: string;
  tableNumber: string;
  startTime: Date;
  endTime?: Date;
  totalAmount: number;
  items: SessionItem[];
  notes?: string;
}

export interface SessionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'hookah' | 'food' | 'drink' | 'other';
}

export interface SessionUpdate {
  sessionId: string;
  status?: SessionState['status'];
  notes?: string;
  items?: SessionItem[];
}

// Mock data for development
export const mockSessions: SessionState[] = [
  {
    id: '1',
    status: 'NEW',
    customerName: 'John Doe',
    tableNumber: 'A1',
    startTime: new Date(),
    totalAmount: 45.00,
    items: [
      { id: '1', name: 'Blueberry Hookah', price: 25.00, quantity: 1, category: 'hookah' },
      { id: '2', name: 'Mint Tea', price: 8.00, quantity: 2, category: 'drink' }
    ],
    notes: 'First time customer'
  },
  {
    id: '2',
    status: 'PREP_IN_PROGRESS',
    customerName: 'Sarah Smith',
    tableNumber: 'B2',
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    totalAmount: 35.00,
    items: [
      { id: '3', name: 'Grape Hookah', price: 25.00, quantity: 1, category: 'hookah' },
      { id: '4', name: 'Hummus Plate', price: 10.00, quantity: 1, category: 'food' }
    ]
  }
];

export const updateSessionStatus = async (sessionId: string, status: SessionState['status']): Promise<void> => {
  // Mock API call
  console.log(`Updating session ${sessionId} to status: ${status}`);
  // In a real app, this would make an API call
};

export const getSessionsByStatus = (status: SessionState['status']): SessionState[] => {
  return mockSessions.filter(session => session.status === status);
};

export const getSessionById = (id: string): SessionState | undefined => {
  return mockSessions.find(session => session.id === id);
};