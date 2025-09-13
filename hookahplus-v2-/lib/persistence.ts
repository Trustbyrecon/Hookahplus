// lib/persistence.ts
// File-based persistence for customer journey data in serverless environments

import { promises as fs } from 'fs';
import path from 'path';
import { CustomerBooking, BOHOperation, CustomerJourneyState } from './customer-journey';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'customer-journey.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
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

// Save state to file
export async function saveState(state: CustomerJourneyState): Promise<void> {
  try {
    await ensureDataDir();
    const serialized = serializeState(state);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(serialized, null, 2), 'utf8');
    console.log('[PERSISTENCE] State saved successfully');
  } catch (error) {
    console.error('[PERSISTENCE] Failed to save state:', error);
    // Don't throw - we want the app to continue working even if persistence fails
  }
}

// Load state from file
export async function loadState(): Promise<CustomerJourneyState> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const serialized = JSON.parse(data);
    console.log('[PERSISTENCE] State loaded successfully');
    return deserializeState(serialized);
  } catch (error) {
    console.log('[PERSISTENCE] No existing state found, creating new state');
    // Return empty state if file doesn't exist
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
