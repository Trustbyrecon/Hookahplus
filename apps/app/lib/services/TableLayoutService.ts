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
  private static layoutCacheByLounge = new Map<string, { layout: any; timestamp: number }>();
  private static CACHE_TTL = 30000; // 30 seconds

  /**
   * Demo/default table metadata used when no layout exists yet.
   * This enables a graceful onboarding flow where sessions can still be created.
   */
  private static readonly DEMO_TABLES: LayoutTable[] = [
    { id: 'table-001', name: 'T-001', seatingType: 'Booth', capacity: 4, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-002', name: 'T-002', seatingType: 'Booth', capacity: 4, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-003', name: 'T-003', seatingType: 'Couch', capacity: 6, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-004', name: 'T-004', seatingType: 'Bar Seating', capacity: 2, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-005', name: 'T-005', seatingType: 'Couch', capacity: 6, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-006', name: 'T-006', seatingType: 'Outdoor', capacity: 8, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-007', name: 'T-007', seatingType: 'Booth', capacity: 4, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-008', name: 'T-008', seatingType: 'VIP', capacity: 10, coordinates: { x: 0, y: 0 }, zone: 'VIP Section' },
    { id: 'table-009', name: 'T-009', seatingType: 'Couch', capacity: 6, coordinates: { x: 0, y: 0 }, zone: 'Main Floor' },
    { id: 'table-010', name: 'T-010', seatingType: 'Private Room', capacity: 8, coordinates: { x: 0, y: 0 }, zone: 'Private Section' },
  ];

  private static normalizeTableToken(input: string | undefined | null): string {
    return (input || '').trim();
  }

  /**
   * Build a set of candidate IDs/names for matching.
   * Supports:
   * - `table-002` <-> `T-002`
   * - `Table-002` / `Table 002` (LaunchPad-generated names)
   */
  private static tableIdCandidates(raw: string): string[] {
    const token = this.normalizeTableToken(raw);
    if (!token) return [];

    const out = new Set<string>([token]);
    const lower = token.toLowerCase();

    // Match common numeric patterns
    const mTable = lower.match(/^table[-\s]?0*(\d{1,4})$/);
    const mT = lower.match(/^t[-\s]?0*(\d{1,4})$/);
    const mName = lower.match(/^table[-\s]+0*(\d{1,4})$/);

    const numStr = (mTable?.[1] || mT?.[1] || mName?.[1]) ?? null;
    if (numStr) {
      const n = parseInt(numStr, 10);
      const pad = String(n).padStart(3, '0');
      out.add(`table-${pad}`);
      out.add(`T-${pad}`);
      out.add(`Table-${pad}`);
      out.add(`Table ${pad}`);
      // Also accept non-padded forms
      out.add(`table-${n}`);
      out.add(`T-${n}`);
      out.add(`Table-${n}`);
      out.add(`Table ${n}`);
    }

    return Array.from(out);
  }

  private static inferTableFromToken(raw: string): LayoutTable | null {
    const token = this.normalizeTableToken(raw);
    if (!token) return null;

    const candidates = this.tableIdCandidates(token).map(s => s.toLowerCase());
    // Prefer explicit demo table definition when it matches any candidate.
    const demoMatch = this.DEMO_TABLES.find(t =>
      candidates.includes(t.id.toLowerCase()) || candidates.includes(t.name.toLowerCase())
    );
    if (demoMatch) return demoMatch;

    // If it's a numeric table token outside the baked demo list, still allow it with sane defaults.
    const lower = token.toLowerCase();
    const m = lower.match(/(?:^table[-\s]?|^t[-\s]?|^table[-\s]+)0*(\d{1,4})$/);
    if (!m) return null;

    const n = parseInt(m[1], 10);
    const pad = String(n).padStart(3, '0');
    return {
      id: `table-${pad}`,
      name: `T-${pad}`,
      seatingType: 'Booth',
      capacity: 4,
      coordinates: { x: 0, y: 0 },
      zone: 'Main Floor',
    };
  }

  /**
   * Load tables from saved layout
   */
  static async loadTables(loungeId?: string): Promise<LayoutTable[]> {
    try {
      const cacheKey = (loungeId || '').trim() || 'HOPE_GLOBAL_FORUM';
      // Check cache first
      const cached = this.layoutCacheByLounge.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.layout?.tables || [];
      }

      const url = loungeId
        ? `/api/lounges?layout=true&loungeId=${encodeURIComponent(loungeId)}`
        : '/api/lounges?layout=true';
      const response = await fetch(url);
      if (!response.ok) {
        console.warn('[TableLayoutService] Failed to load layout, returning empty array');
        return [];
      }

      const data = await response.json();
      const tables = data.layout?.tables || [];

      // Cache the result
      this.layoutCacheByLounge.set(cacheKey, {
        layout: data.layout,
        timestamp: Date.now()
      });

      return tables;
    } catch (error) {
      console.error('[TableLayoutService] Error loading tables:', error);
      return [];
    }
  }

  /**
   * Validate tableId exists in saved layout
   */
  static async validateTableId(
    tableId: string,
    loungeId?: string
  ): Promise<{ valid: boolean; table?: LayoutTable; error?: string }> {
    const tables = await this.loadTables(loungeId);

    const candidates = this.tableIdCandidates(tableId);
    const candidateLower = new Set(candidates.map(c => c.toLowerCase()));

    // Try exact match first (id), then name/id case-insensitive against candidates
    let table =
      tables.find(t => t.id === tableId) ||
      tables.find(t => candidateLower.has((t.id || '').toLowerCase()) || candidateLower.has((t.name || '').toLowerCase()));

    // Graceful fallback: if layout isn't configured or doesn't include this table, infer a default.
    if (!table) {
      const allowInference = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_TABLES === 'true';
      if (allowInference) {
        const inferred = this.inferTableFromToken(tableId);
        if (inferred) {
          return { valid: true, table: inferred };
        }
      }

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
    activeSessions: Array<{ tableId: string; status: string }>,
    loungeId?: string
  ): Promise<{ available: boolean; hasActiveSession: boolean; activeSessionId?: string; error?: string }> {
    // First validate table exists
    const validation = await this.validateTableId(tableId, loungeId);
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
    activeSessions: Array<{ tableId: string; status: string }>,
    loungeId?: string
  ): Promise<TableAvailability[]> {
    const tables = await this.loadTables(loungeId);
    
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
    this.layoutCacheByLounge.clear();
  }
}

