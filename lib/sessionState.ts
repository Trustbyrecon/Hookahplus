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
  updatedAt?: Date;
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

// Command types for session state management
export type Command = 
  | 'CONFIRM_PAYMENT'
  | 'START_PREP'
  | 'COMPLETE_PREP'
  | 'DELIVER_TO_TABLE'
  | 'START_SESSION'
  | 'CLOSE_SESSION'
  | 'CANCEL_SESSION'
  | 'UPDATE_NOTES'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM';

// Session storage (in-memory for demo)
const sessionStorage: Map<string, SessionState> = new Map();

export const getSession = (id: string): SessionState | undefined => {
  return sessionStorage.get(id);
};

export const putSession = (session: SessionState): void => {
  sessionStorage.set(session.id, session);
};

export const seedSession = (id: string): SessionState => {
  const session: SessionState = {
    id,
    status: 'NEW',
    customerName: 'Demo Customer',
    tableNumber: 'T1',
    startTime: new Date(),
    totalAmount: 30.00,
    items: [
      { id: '1', name: 'Blueberry Hookah', price: 25.00, quantity: 1, category: 'hookah' },
      { id: '2', name: 'Mint Tea', price: 5.00, quantity: 1, category: 'drink' }
    ]
  };
  
  sessionStorage.set(id, session);
  return session;
};

export const reduce = (
  session: SessionState,
  command: Command,
  actor: 'foh' | 'boh' | 'system' | 'agent',
  data: any = {}
): SessionState => {
  const updatedSession = { ...session };
  
  switch (command) {
    case 'CONFIRM_PAYMENT':
      if (updatedSession.status !== 'NEW') {
        throw new Error('Can only confirm payment for new sessions');
      }
      updatedSession.status = 'PAID_CONFIRMED';
      break;
      
    case 'START_PREP':
      if (updatedSession.status !== 'PAID_CONFIRMED') {
        throw new Error('Can only start prep for paid sessions');
      }
      updatedSession.status = 'PREP_IN_PROGRESS';
      break;
      
    case 'COMPLETE_PREP':
      if (updatedSession.status !== 'PREP_IN_PROGRESS') {
        throw new Error('Can only complete prep for sessions in progress');
      }
      updatedSession.status = 'ACTIVE';
      break;
      
    case 'START_SESSION':
      if (updatedSession.status !== 'ACTIVE') {
        throw new Error('Can only start active sessions');
      }
      // Session is already active
      break;
      
    case 'CLOSE_SESSION':
      updatedSession.status = 'CLOSED';
      updatedSession.endTime = new Date();
      break;
      
    case 'CANCEL_SESSION':
      updatedSession.status = 'CLOSED';
      updatedSession.endTime = new Date();
      break;
      
    case 'UPDATE_NOTES':
      updatedSession.notes = data.notes;
      break;
      
    case 'ADD_ITEM':
      if (data.item) {
        updatedSession.items.push(data.item);
        updatedSession.totalAmount += data.item.price * data.item.quantity;
      }
      break;
      
    case 'REMOVE_ITEM':
      if (data.itemId) {
        const itemIndex = updatedSession.items.findIndex(item => item.id === data.itemId);
        if (itemIndex !== -1) {
          const item = updatedSession.items[itemIndex];
          updatedSession.totalAmount -= item.price * item.quantity;
          updatedSession.items.splice(itemIndex, 1);
        }
      }
      break;
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
  
  updatedSession.updatedAt = new Date();
  return updatedSession;
};

export const getAllSessions = (): SessionState[] => {
  return Array.from(sessionStorage.values());
};

export const getLiveSessions = (): SessionState[] => {
  return Array.from(sessionStorage.values()).filter(session => 
    session.status !== 'CLOSED'
  );
};

export const seedMultipleSessions = (count: number): SessionState[] => {
  const sessions: SessionState[] = [];
  
  for (let i = 0; i < count; i++) {
    const sessionId = `session-${Date.now()}-${i}`;
    const session = seedSession(sessionId);
    sessions.push(session);
  }
  
  return sessions;
};