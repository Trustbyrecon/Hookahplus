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
  loungeId?: string; // For CODIGO/FloorplanLayout table resolution
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
  // Note: Reservations are now persisted in database via Prisma
  // Cache is kept for performance but refreshed from DB
  private static reservationCache: { reservations: Reservation[]; timestamp: number } | null = null;
  private static CACHE_TTL = 30000; // 30 seconds

  /**
   * Check table availability with comprehensive validation
   * @param reservations - Active reservations (should be fetched from API route)
   */
  static async checkTableAvailability(
    check: AvailabilityCheck,
    activeSessions: Array<{ tableId: string; status: string; id: string }>,
    reservations: Reservation[] = []
  ): Promise<AvailabilityResult> {
    // Load table from layout (pass loungeId for CODIGO FloorplanLayout)
    const tableValidation = await TableLayoutService.validateTableId(check.tableId, check.loungeId);
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
      const alternatives = await this.findAlternativeTables(check.partySize, activeSessions, reservations);
      
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
        suggestions: alternatives
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
        const alternatives = await this.findAlternativeTables(check.partySize, activeSessions, reservations);
        
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

    // Check reservations - passed in from API route
    const conflictingReservation = reservations.find((r: Reservation) => 
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
   * @param reservations - Active reservations (should be fetched from API route)
   */
  static async getAvailableTables(
    partySize: number,
    activeSessions: Array<{ tableId: string; status: string; id: string }>,
    requestedTime?: Date,
    reservations: Reservation[] = []
  ): Promise<TableStatus[]> {
    const tables = await TableLayoutService.loadTables();
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
    activeSessions: Array<{ tableId: string; status: string; id: string }>,
    reservations: Reservation[] = []
  ): Promise<TableStatus[]> {
    const availableTables = await this.getAvailableTables(partySize, activeSessions, undefined, reservations);
    
    return availableTables
      .filter(ta => ta.canAccommodate)
      .slice(0, 5); // Top 5 alternatives
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
   * Note: This method should be called from an API route with PrismaClient access
   * For direct use, use createReservationWithPrisma instead
   */
  static async createReservation(
    tableId: string,
    reservedFrom: Date,
    reservedUntil: Date,
    partySize: number,
    customerName?: string,
    customerPhone?: string
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    // This method is kept for backward compatibility
    // Actual implementation should use createReservationWithPrisma from API route
    return { 
      success: false, 
      error: 'Use createReservationWithPrisma from API route with PrismaClient' 
    };
  }

  /**
   * Create reservation with Prisma (call from API route)
   */
  static async createReservationWithPrisma(
    prisma: any, // PrismaClient
    venueId: string,
    tableId: string,
    reservedFrom: Date,
    reservedUntil: Date,
    partySize: number,
    customerName?: string,
    customerPhone?: string
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    try {
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

      // Calculate window_minutes from reservation duration
      const windowMinutes = Math.ceil((reservedUntil.getTime() - reservedFrom.getTime()) / (1000 * 60));

      // Create reservation in database
      const reservation = await prisma.reservations.create({
        data: {
          venue_id: venueId,
          table_id: tableId,
          status: 'HOLD', // Maps to 'confirmed' in our interface
          window_minutes: windowMinutes,
          created_at: reservedFrom,
          // Store additional data in a way that works with current schema
          // Note: partySize, customerName, customerPhone are not in schema
          // For now, we'll store them in a way that can be retrieved later
          // In production, you'd want to add these fields via migration
        }
      });

      // Clear cache
      this.reservationCache = null;

      return { success: true, reservationId: reservation.id };
    } catch (error) {
      console.error('[TableAvailabilityService] Error creating reservation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create reservation' 
      };
    }
  }

  /**
   * Get active reservations
   * Note: This method should be called from an API route with PrismaClient access
   * For direct use, use getActiveReservationsWithPrisma instead
   */
  static async getActiveReservations(): Promise<Reservation[]> {
    // This method is kept for backward compatibility
    // Actual implementation should use getActiveReservationsWithPrisma from API route
    return [];
  }

  /**
   * Get active reservations with Prisma (call from API route)
   */
  static async getActiveReservationsWithPrisma(
    prisma: any, // PrismaClient
    venueId?: string
  ): Promise<Reservation[]> {
    try {
      // Check cache
      if (this.reservationCache && Date.now() - this.reservationCache.timestamp < this.CACHE_TTL) {
        return this.reservationCache.reservations;
      }

      const now = new Date();
      
      // Build where clause
      const where: any = {
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        created_at: { not: null }
      };
      
      if (venueId) {
        where.venue_id = venueId;
      }

      // Fetch active reservations from database
      const dbReservations = await prisma.reservations.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });

      // Transform database reservations to our interface
      const reservations: Reservation[] = dbReservations
        .map((r: any) => {
          const created = r.created_at ? new Date(r.created_at) : new Date();
          const windowMinutes = r.window_minutes || 15;
          const reservedUntil = new Date(created.getTime() + windowMinutes * 60 * 1000);
          
          // Only return reservations that haven't expired
          if (reservedUntil < now) {
            return null;
          }

          return {
            id: r.id,
            tableId: r.table_id,
            reservedFrom: created,
            reservedUntil,
            partySize: 1, // Not stored in schema - default to 1
            customerName: undefined, // Not stored in schema
            customerPhone: undefined, // Not stored in schema
            status: r.status === 'HOLD' ? 'confirmed' : 
                   r.status === 'ARRIVED' ? 'confirmed' : 
                   r.status === 'CANCELLED' ? 'cancelled' : 'pending'
          } as Reservation | null;
        })
        .filter((r: Reservation | null): r is Reservation => r !== null);

      // Update cache
      this.reservationCache = {
        reservations,
        timestamp: Date.now()
      };

      return reservations;
    } catch (error) {
      console.error('[TableAvailabilityService] Error fetching reservations:', error);
      return [];
    }
  }

  /**
   * Cancel a reservation
   * Note: This method should be called from an API route with PrismaClient access
   * For direct use, use cancelReservationWithPrisma instead
   */
  static async cancelReservation(reservationId: string): Promise<{ success: boolean; error?: string }> {
    // This method is kept for backward compatibility
    return { success: false, error: 'Use cancelReservationWithPrisma from API route with PrismaClient' };
  }

  /**
   * Cancel reservation with Prisma (call from API route)
   */
  static async cancelReservationWithPrisma(
    prisma: any, // PrismaClient
    reservationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId }
      });

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      await prisma.reservations.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' }
      });

      // Clear cache
      this.reservationCache = null;

      return { success: true };
    } catch (error) {
      console.error('[TableAvailabilityService] Error cancelling reservation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel reservation' 
      };
    }
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
   * Clear expired reservations (call from API route with PrismaClient)
   */
  static async clearExpiredReservationsWithPrisma(prisma: any): Promise<{ cleared: number }> {
    try {
      const now = new Date();
      
      // Find expired reservations (created_at + window_minutes < now)
      const expired = await prisma.reservations.findMany({
        where: {
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          created_at: { not: null }
        }
      });

      let cleared = 0;
      for (const reservation of expired) {
        if (reservation.created_at) {
          const created = new Date(reservation.created_at as Date);
          const windowMinutes = (reservation.window_minutes as number) || 15;
          const reservedUntil = new Date(created.getTime() + windowMinutes * 60 * 1000);
          
          if (reservedUntil < now) {
            await prisma.reservations.update({
              where: { id: reservation.id },
              data: { status: 'NO_SHOW' }
            });
            cleared++;
          }
        }
      }

      // Clear cache
      this.reservationCache = null;

      return { cleared };
    } catch (error) {
      console.error('[TableAvailabilityService] Error clearing expired reservations:', error);
      return { cleared: 0 };
    }
  }
}


