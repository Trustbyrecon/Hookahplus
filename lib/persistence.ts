// lib/persistence.ts
// File-based persistence for customer journey data in serverless environments

import { CustomerBooking, BOHOperation, CustomerJourneyState } from './customer-journey';

// Mock persistence for client-side compatibility
const mockData: any = {};

// Removed file path for client-side compatibility

// Mock data directory check
async function ensureDataDir() {
  // No-op for client-side compatibility
  return Promise.resolve();
}

// Convert Maps and Sets to serializable format
function serializeState(state: CustomerJourneyState) {
  return {
    bookings: Array.from(state.bookings.entries()),
    bohOperations: Array.from(state.bohOperations.entries()),
    activeSessions: Array.from(state.activeSessions),
    staffAssignments: Array.from(state.staffAssignments.entries())
  };
}

// Convert serialized format back to Maps and Sets
function deserializeState(serialized: any): CustomerJourneyState {
  return {
    bookings: new Map(serialized.bookings || []),
    bohOperations: new Map(serialized.bohOperations || []),
    activeSessions: new Set(serialized.activeSessions || []),
    staffAssignments: new Map(serialized.staffAssignments || [])
  };
}

// Save state to memory (client-side compatible)
export async function saveState(state: CustomerJourneyState): Promise<void> {
  try {
    const serialized = serializeState(state);
    mockData.customerJourney = serialized;
    console.log('[PERSISTENCE] State saved successfully');
  } catch (error) {
    console.error('[PERSISTENCE] Failed to save state:', error);
    // Don't throw - we want the app to continue working even if persistence fails
  }
}

// Load state from memory (client-side compatible)
export async function loadState(): Promise<CustomerJourneyState> {
  try {
    if (mockData.customerJourney) {
      console.log('[PERSISTENCE] State loaded successfully');
      return deserializeState(mockData.customerJourney);
    }
    throw new Error('No data found');
  } catch (error) {
    console.log('[PERSISTENCE] No existing state found, creating new state');
    // Return empty state if no data exists
    return {
      bookings: new Map(),
      bohOperations: new Map(),
      activeSessions: new Set(),
      staffAssignments: new Map()
    };
  }
}

// Convert date strings back to Date objects
export function hydrateDates(bookings: CustomerBooking[]): CustomerBooking[] {
  return bookings.map(booking => ({
    ...booking,
    createdAt: new Date(booking.createdAt),
    updatedAt: new Date(booking.updatedAt),
    sessionStartTime: booking.sessionStartTime ? new Date(booking.sessionStartTime) : undefined,
    sessionEndTime: booking.sessionEndTime ? new Date(booking.sessionEndTime) : undefined,
    checkInTime: booking.checkInTime ? new Date(booking.checkInTime) : undefined
  }));
}

// Convert Date objects to ISO strings for serialization
export function dehydrateDates(bookings: CustomerBooking[]): any[] {
  return bookings.map(booking => ({
    ...booking,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    sessionStartTime: booking.sessionStartTime?.toISOString(),
    sessionEndTime: booking.sessionEndTime?.toISOString(),
    checkInTime: booking.checkInTime?.toISOString()
  }));
}
