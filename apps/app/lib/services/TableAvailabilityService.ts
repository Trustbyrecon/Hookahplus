/**
 * TableAvailabilityService
 * 
 * Comprehensive service for managing table availability, capacity validation,
 * reservations, and preventing double-booking.
 */

import { TableLayoutService, LayoutTable } from './TableLayoutService';

export interface TableStatus {
  tableId: string;
  tableName: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: number;
  remainingCapacity: number;
  activeSessionId?: string;
  reservationId?: string;
  reservedUntil?: Date;
  canAccommodate: boolean;
  suggestedAlternatives?: string[]; // Table IDs
}

export interface AvailabilityCheck {
  tableId: string;
  partySize: number;
  requestedTime?: Date; // For future reservations
}

export interface AvailabilityResult {
  available: boolean;
  tableStatus: TableStatus;
  error?: string;
  suggestions?: TableStatus[]; // Alternative tables
  canCombine?: boolean; // Can combine multiple tables
  combinationOptions?: Array<{ tables: string[]; totalCapacity: number }>;
}

export interface Reservation {
  id: string;
  tableId: string;
  reservedFrom: Date;
  reservedUntil: Date;
  partySize: number;
  customerName?: string;
  customerPhone?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export class TableAvailabilityService {
  private static reservations: Map<string, Reservation> = new Map();
  private static reservationCache: { reservations: Reservation[]; timestamp: number } | null = null;
  private static CACHE_TTL = 60000; // 1 minute

  /**
   * Check table availability with comprehensive validation
   */
  static async checkTableAvailability(
    check: AvailabilityCheck,
    activeSessions: Array<{ tableId: string; status: string; id: string }>
  ): Promise<AvailabilityResult> {
    // Load table from layout
    const tableValidation = await TableLayoutService.validateTableId(check.tableId);
    if (!tableValidation.valid || !tableValidation.table) {
      return {
        available: false,
        tableStatus: {
          tableId: check.tableId,
          tableName: check.tableId,
          status: 'maintenance',
          capacity: 0,
          remainingCapacity: 0,
          canAccommodate: false
        },
        error: tableValidation.error
      };
    }

    const table = tableValidation.table;

    // Check capacity
    const capacityCheck = TableLayoutService.validateCapacity(table, check.partySize);
    if (!capacityCheck.valid) {
      // Find alternative tables
      const alternatives = await this.findAlternativeTables(check.partySize, activeSessions);
      
      return {
        available: false,
        tableStatus: {
          tableId: table.id,
          tableName: table.name,
          status: 'maintenance',
          capacity: table.capacity,
          remainingCapacity: 0,
          canAccommodate: false
        },
        error: capacityCheck.error,
        suggestions: alternatives.map(alt => ({
          tableId: alt.table.id,
          tableName: alt.table.name,
          status: alt.isAvailable ? 'available' : 'occupied',
          capacity: alt.table.capacity,
          remainingCapacity: alt.isAvailable ? alt.table.capacity : 0,
          canAccommodate: alt.canAccommodate(check.partySize)
        }))
      };
    }

    // Check active sessions
    const activeSession = activeSessions.find(s => {
      return s.tableId === table.id ||
             s.tableId === table.name ||
             s.tableId?.toLowerCase() === table.name.toLowerCase();
    });

    if (activeSession) {
      const isActive = ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(activeSession.status);
      
      if (isActive) {
        // Find alternative tables
        const alternatives = await this.findAlternativeTables(check.partySize, activeSessions);
        
        return {
          available: false,
          tableStatus: {
            tableId: table.id,
            tableName: table.name,
            status: 'occupied',
            capacity: table.capacity,
            remainingCapacity: 0,
            activeSessionId: activeSession.id,
            canAccommodate: false
          },
          error: `Table "${table.name}" is currently occupied.`,
          suggestions: alternatives
        };
      }
    }

    // Check reservations
    const reservations = await this.getActiveReservations();
    const conflictingReservation = reservations.find(r => 
      r.tableId === table.id &&
      r.status !== 'cancelled' &&
      (!check.requestedTime || this.isTimeOverlapping(check.requestedTime, r.reservedFrom, r.reservedUntil))
    );

    if (conflictingReservation) {
      return {
        available: false,
        tableStatus: {
          tableId: table.id,
          tableName: table.name,
          status: 'reserved',
          capacity: table.capacity,
          remainingCapacity: 0,
          reservationId: conflictingReservation.id,
          reservedUntil: conflictingReservation.reservedUntil,
          canAccommodate: false
        },
        error: `Table "${table.name}" is reserved until ${conflictingReservation.reservedUntil.toLocaleTimeString()}.`
      };
    }

    // Table is available
    return {
      available: true,
      tableStatus: {
        tableId: table.id,
        tableName: table.name,
        status: 'available',
        capacity: table.capacity,
        remainingCapacity: table.capacity - check.partySize,
        canAccommodate: true
      }
    };
  }

  /**
   * Get all available tables for a party size
   */
  static async getAvailableTables(
    partySize: number,
    activeSessions: Array<{ tableId: string; status: string; id: string }>,
    requestedTime?: Date
  ): Promise<TableStatus[]> {
    const tables = await TableLayoutService.loadTables();
    const reservations = await this.getActiveReservations();
    const now = requestedTime || new Date();

    const availability: TableStatus[] = [];

    for (const table of tables) {
      // Check capacity
      if (partySize > table.capacity) {
        continue; // Skip tables that can't accommodate
      }

      // Check active sessions
      const activeSession = activeSessions.find(s => {
        return s.tableId === table.id ||
               s.tableId === table.name ||
               s.tableId?.toLowerCase() === table.name.toLowerCase();
      });

      const isOccupied = activeSession && 
        ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(activeSession.status);

      // Check reservations
      const reservation = reservations.find(r => 
        r.tableId === table.id &&
        r.status !== 'cancelled' &&
        this.isTimeOverlapping(now, r.reservedFrom, r.reservedUntil)
      );

      let status: 'available' | 'occupied' | 'reserved' | 'maintenance' = 'available';
      if (isOccupied) {
        status = 'occupied';
      } else if (reservation) {
        status = 'reserved';
      }

      availability.push({
        tableId: table.id,
        tableName: table.name,
        status,
        capacity: table.capacity,
        remainingCapacity: isOccupied ? 0 : table.capacity - partySize,
        activeSessionId: activeSession?.id,
        reservationId: reservation?.id,
        reservedUntil: reservation?.reservedUntil,
        canAccommodate: !isOccupied && !reservation && partySize <= table.capacity
      });
    }

    return availability.sort((a, b) => {
      // Sort by: available first, then by capacity (closest fit)
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (b.status === 'available' && a.status !== 'available') return 1;
      return a.capacity - b.capacity; // Closest fit first
    });
  }

  /**
   * Find alternative tables for a party size
   */
  private static async findAlternativeTables(
    partySize: number,
    activeSessions: Array<{ tableId: string; status: string; id: string }>
  ): Promise<Array<{ table: LayoutTable; isAvailable: boolean; canAccommodate: (size: number) => boolean }>> {
    const tables = await TableLayoutService.loadTables();
    const availableTables = await this.getAvailableTables(partySize, activeSessions);
    
    return availableTables
      .filter(ta => ta.canAccommodate)
      .slice(0, 5) // Top 5 alternatives
      .map(ta => {
        const table = tables.find(t => t.id === ta.tableId);
        if (!table) return null;
        return {
          table,
          isAvailable: ta.status === 'available',
          canAccommodate: (size: number) => size <= table.capacity
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }

  /**
   * Find table combinations for large parties
   */
  static async findTableCombinations(
    partySize: number,
    activeSessions: Array<{ tableId: string; status: string; id: string }>
  ): Promise<Array<{ tables: string[]; totalCapacity: number; tableNames: string[] }>> {
    const tables = await TableLayoutService.loadTables();
    const availableTables = await this.getAvailableTables(partySize, activeSessions);
    
    // Filter to only available tables
    const available = availableTables.filter(ta => ta.status === 'available');
    
    // Find combinations of 2-3 tables that can accommodate party
    const combinations: Array<{ tables: string[]; totalCapacity: number; tableNames: string[] }> = [];
    
    // Try 2-table combinations
    for (let i = 0; i < available.length; i++) {
      for (let j = i + 1; j < available.length; j++) {
        const totalCapacity = available[i].capacity + available[j].capacity;
        if (totalCapacity >= partySize) {
          combinations.push({
            tables: [available[i].tableId, available[j].tableId],
            totalCapacity,
            tableNames: [available[i].tableName, available[j].tableName]
          });
        }
      }
    }
    
    // Try 3-table combinations if needed
    if (combinations.length < 3) {
      for (let i = 0; i < available.length; i++) {
        for (let j = i + 1; j < available.length; j++) {
          for (let k = j + 1; k < available.length; k++) {
            const totalCapacity = available[i].capacity + available[j].capacity + available[k].capacity;
            if (totalCapacity >= partySize) {
              combinations.push({
                tables: [available[i].tableId, available[j].tableId, available[k].tableId],
                totalCapacity,
                tableNames: [available[i].tableName, available[j].tableName, available[k].tableName]
              });
            }
          }
        }
      }
    }
    
    // Sort by total capacity (closest fit first)
    return combinations
      .sort((a, b) => a.totalCapacity - b.totalCapacity)
      .slice(0, 5); // Top 5 combinations
  }

  /**
   * Create a temporary reservation
   */
  static async createReservation(
    tableId: string,
    reservedFrom: Date,
    reservedUntil: Date,
    partySize: number,
    customerName?: string,
    customerPhone?: string
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    // Validate table exists
    const tableValidation = await TableLayoutService.validateTableId(tableId);
    if (!tableValidation.valid || !tableValidation.table) {
      return { success: false, error: tableValidation.error };
    }

    // Check capacity
    const capacityCheck = TableLayoutService.validateCapacity(tableValidation.table, partySize);
    if (!capacityCheck.valid) {
      return { success: false, error: capacityCheck.error };
    }

    // Check if table is available at requested time
    const activeSessions: Array<{ tableId: string; status: string; id: string }> = [];
    const availability = await this.checkTableAvailability(
      { tableId, partySize, requestedTime: reservedFrom },
      activeSessions
    );

    if (!availability.available) {
      return { success: false, error: availability.error };
    }

    // Create reservation
    const reservationId = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reservation: Reservation = {
      id: reservationId,
      tableId,
      reservedFrom,
      reservedUntil,
      partySize,
      customerName,
      customerPhone,
      status: 'confirmed'
    };

    this.reservations.set(reservationId, reservation);
    this.reservationCache = null; // Clear cache

    return { success: true, reservationId };
  }

  /**
   * Get active reservations
   */
  static async getActiveReservations(): Promise<Reservation[]> {
    // Check cache
    if (this.reservationCache && Date.now() - this.reservationCache.timestamp < this.CACHE_TTL) {
      return this.reservationCache.reservations;
    }

    // In a real app, this would fetch from database
    // For now, return in-memory reservations
    const now = new Date();
    const active = Array.from(this.reservations.values())
      .filter(r => r.status !== 'cancelled' && r.reservedUntil > now);

    this.reservationCache = {
      reservations: active,
      timestamp: Date.now()
    };

    return active;
  }

  /**
   * Cancel a reservation
   */
  static async cancelReservation(reservationId: string): Promise<{ success: boolean; error?: string }> {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      return { success: false, error: 'Reservation not found' };
    }

    reservation.status = 'cancelled';
    this.reservations.set(reservationId, reservation);
    this.reservationCache = null; // Clear cache

    return { success: true };
  }

  /**
   * Check if time overlaps with reservation
   */
  private static isTimeOverlapping(
    requestedTime: Date,
    reservedFrom: Date,
    reservedUntil: Date
  ): boolean {
    return requestedTime >= reservedFrom && requestedTime <= reservedUntil;
  }

  /**
   * Clear expired reservations
   */
  static clearExpiredReservations() {
    const now = new Date();
    for (const [id, reservation] of this.reservations.entries()) {
      if (reservation.reservedUntil < now) {
        this.reservations.delete(id);
      }
    }
    this.reservationCache = null;
  }
}


