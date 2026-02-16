'use client';

export interface TableData {
  tableId: string;
  loungeId: string;
  loungeName: string;
  zone: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentSession?: {
    sessionId: string;
    startTime: Date;
    duration: number;
    customerId: string;
    items: any[];
    totalAmount: number;
  };
  qrCode: string;
  lastUpdated: Date;
}

export interface LoungeData {
  loungeId: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
  timezone: string;
  currency: string;
  taxRate: number;
}

class TableDataSyncService {
  private static instance: TableDataSyncService;
  private tables: Map<string, TableData> = new Map();
  private lounges: Map<string, LoungeData> = new Map();
  private listeners: Set<(data: TableData) => void> = new Set();

  static getInstance(): TableDataSyncService {
    if (!TableDataSyncService.instance) {
      TableDataSyncService.instance = new TableDataSyncService();
    }
    return TableDataSyncService.instance;
  }

  private appBaseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  }

  // Fetch table/session data from app build (DB truth).
  async fetchTableData(loungeId: string, tableId?: string): Promise<TableData[]> {
    try {
      const url = new URL('/api/sessions', this.appBaseUrl());
      url.searchParams.set('loungeId', loungeId);
      if (tableId) url.searchParams.set('tableId', tableId);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));

      const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
      const mapped: TableData[] = sessions.map((s: any) => ({
        tableId: s.table_id || s.tableId || tableId || 'UNKNOWN',
        loungeId: s.loungeId || loungeId,
        loungeName: s.loungeName || loungeId,
        zone: s.zone || 'Main',
        capacity: Number(s.capacity || 4),
        status: (String(s.status || '').toUpperCase() === 'ACTIVE' ? 'occupied' : 'available'),
        currentSession: String(s.status || '').toUpperCase() === 'ACTIVE' ? {
          sessionId: s.id || s.session_id || 'unknown',
          startTime: new Date(s.startedAt || s.createdAt || Date.now()),
          duration: 0,
          customerId: s.customer_name || s.customerRef || 'guest',
          items: [],
          totalAmount: Number(s.price_cents || s.priceCents || 0),
        } : undefined,
        qrCode: `hookahplus://table/${s.table_id || s.tableId || tableId || 'UNKNOWN'}/${loungeId}`,
        lastUpdated: new Date(),
      }));

      mapped.forEach((table) => this.tables.set(table.tableId, table));
      return mapped;
    } catch (error) {
      console.warn('[TableDataSync] Unable to load tables from server:', error);
      return [];
    }
  }

  // Fetch lounge details from app build (DB truth when available).
  async fetchLoungeData(loungeId: string): Promise<LoungeData | null> {
    try {
      const response = await fetch(`${this.appBaseUrl()}/api/lounges/${encodeURIComponent(loungeId)}`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Failed to fetch lounge');
      const lounge = data?.lounge || data;
      const mapped: LoungeData = {
        loungeId,
        name: lounge?.name || loungeId,
        address: lounge?.address || '',
        phone: lounge?.phone || '',
        hours: lounge?.hours || '',
        features: Array.isArray(lounge?.features) ? lounge.features : [],
        timezone: lounge?.timezone || 'UTC',
        currency: lounge?.currency || 'USD',
        taxRate: Number(lounge?.taxRate || 0),
      };
      this.lounges.set(loungeId, mapped);
      return mapped;
    } catch (error) {
      console.warn('[TableDataSync] Could not fetch lounge details:', error);
      return this.lounges.get(loungeId) || null;
    }
  }

  // Subscribe to table data updates
  subscribeToTableUpdates(callback: (data: TableData) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Update table data (called from App build)
  updateTableData(tableId: string, updates: Partial<TableData>): void {
    const currentData = this.tables.get(tableId);
    if (currentData) {
      const updatedData = {
        ...currentData,
        ...updates,
        lastUpdated: new Date()
      };
      this.tables.set(tableId, updatedData);
      
      // Notify listeners
      this.listeners.forEach(callback => callback(updatedData));
    }
  }

  // Get current table data
  getTableData(tableId: string): TableData | null {
    return this.tables.get(tableId) || null;
  }

  // Get lounge data
  getLoungeData(loungeId: string): LoungeData | null {
    return this.lounges.get(loungeId) || null;
  }

  // DB-truth refresh hook (no synthetic random state changes).
  startRealTimeSync(): void {
    // Intentionally no-op here. Consumers should call fetchTableData/fetchLoungeData
    // or use server-driven realtime channels where available.
  }
}

export const tableDataSync = TableDataSyncService.getInstance();
