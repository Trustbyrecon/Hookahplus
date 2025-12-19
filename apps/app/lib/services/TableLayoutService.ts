/**
 * TableLayoutService
 * 
 * Service for loading and validating tables from saved lounge layout.
 * Integrates layout data with session data for availability checking.
 */

export interface LayoutTable {
  id: string;
  name: string;
  seatingType: string;
  capacity: number;
  coordinates: {
    x: number;
    y: number;
  };
  zone: string;
}

export interface TableAvailability {
  table: LayoutTable;
  isAvailable: boolean;
  hasActiveSession: boolean;
  activeSessionId?: string;
  canAccommodate: (partySize: number) => boolean;
}

export class TableLayoutService {
  private static layoutCache: { layout: any; timestamp: number } | null = null;
  private static CACHE_TTL = 30000; // 30 seconds

  /**
   * Load tables from saved layout
   */
  static async loadTables(): Promise<LayoutTable[]> {
    try {
      // Check cache first
      if (this.layoutCache && Date.now() - this.layoutCache.timestamp < this.CACHE_TTL) {
        return this.layoutCache.layout?.tables || [];
      }

      const response = await fetch('/api/lounges?layout=true');
      if (!response.ok) {
        console.warn('[TableLayoutService] Failed to load layout, returning empty array');
        return [];
      }

      const data = await response.json();
      const tables = data.layout?.tables || [];

      // Cache the result
      this.layoutCache = {
        layout: data.layout,
        timestamp: Date.now()
      };

      return tables;
    } catch (error) {
      console.error('[TableLayoutService] Error loading tables:', error);
      return [];
    }
  }

  /**
   * Validate tableId exists in saved layout
   */
  static async validateTableId(tableId: string): Promise<{ valid: boolean; table?: LayoutTable; error?: string }> {
    const tables = await this.loadTables();
    
    // Try exact match first
    let table = tables.find(t => t.id === tableId);
    
    // Try name match (case-insensitive)
    if (!table) {
      table = tables.find(t => 
        t.name.toLowerCase() === tableId.toLowerCase() ||
        t.name === tableId
      );
    }

    if (!table) {
      return {
        valid: false,
        error: `Table "${tableId}" not found in lounge layout. Please configure tables in Lounge Layout Manager first.`
      };
    }

    return { valid: true, table };
  }

  /**
   * Check if table can accommodate party size
   */
  static validateCapacity(table: LayoutTable, partySize: number): { valid: boolean; error?: string } {
    if (partySize <= 0) {
      return { valid: false, error: 'Party size must be greater than 0' };
    }

    if (partySize > table.capacity) {
      return {
        valid: false,
        error: `Table "${table.name}" has capacity of ${table.capacity} but party size is ${partySize}. Please select a larger table.`
      };
    }

    return { valid: true };
  }

  /**
   * Check table availability against active sessions
   */
  static async checkAvailability(
    tableId: string,
    activeSessions: Array<{ tableId: string; status: string }>
  ): Promise<{ available: boolean; hasActiveSession: boolean; activeSessionId?: string; error?: string }> {
    // First validate table exists
    const validation = await this.validateTableId(tableId);
    if (!validation.valid || !validation.table) {
      return {
        available: false,
        hasActiveSession: false,
        error: validation.error
      };
    }

    // Check for active sessions on this table
    const activeSession = activeSessions.find(s => {
      // Match by exact tableId or by name
      return s.tableId === tableId ||
             s.tableId === validation.table!.name ||
             s.tableId?.toLowerCase() === validation.table!.name.toLowerCase();
    });

    if (activeSession) {
      const isActive = ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(activeSession.status);
      
      if (isActive) {
        return {
          available: false,
          hasActiveSession: true,
          activeSessionId: activeSession.tableId,
          error: `Table "${validation.table!.name}" is currently occupied by an active session.`
        };
      }
    }

    return {
      available: true,
      hasActiveSession: false
    };
  }

  /**
   * Get all tables with availability status
   */
  static async getTablesWithAvailability(
    activeSessions: Array<{ tableId: string; status: string }>
  ): Promise<TableAvailability[]> {
    const tables = await this.loadTables();
    
    return tables.map(table => {
      const activeSession = activeSessions.find(s => {
        return s.tableId === table.id ||
               s.tableId === table.name ||
               s.tableId?.toLowerCase() === table.name.toLowerCase();
      });

      const hasActiveSession = activeSession && 
        ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(activeSession.status);

      return {
        table,
        isAvailable: !hasActiveSession,
        hasActiveSession: !!hasActiveSession,
        activeSessionId: activeSession?.tableId,
        canAccommodate: (partySize: number) => partySize <= table.capacity
      };
    });
  }

  /**
   * Get available tables that can accommodate party size
   */
  static async getAvailableTablesForParty(
    partySize: number,
    activeSessions: Array<{ tableId: string; status: string }>
  ): Promise<TableAvailability[]> {
    const allTables = await this.getTablesWithAvailability(activeSessions);
    
    return allTables.filter(ta => 
      ta.isAvailable && ta.canAccommodate(partySize)
    );
  }

  /**
   * Clear cache (useful after layout updates)
   */
  static clearCache() {
    this.layoutCache = null;
  }
}

