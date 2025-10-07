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

  // Simulate fetching table data from App build
  async fetchTableData(loungeId: string, tableId?: string): Promise<TableData[]> {
    // In a real implementation, this would make an API call to the App build
    // For now, we'll simulate the data
    
    const mockTables: TableData[] = [
      {
        tableId: 'T-001',
        loungeId: 'lounge_001',
        loungeName: 'Hookah Paradise Downtown',
        zone: 'VIP',
        capacity: 4,
        status: 'available',
        qrCode: `hookahplus://table/T-001/lounge_001`,
        lastUpdated: new Date()
      },
      {
        tableId: 'T-002',
        loungeId: 'lounge_001',
        loungeName: 'Hookah Paradise Downtown',
        zone: 'Standard',
        capacity: 6,
        status: 'occupied',
        currentSession: {
          sessionId: 'session_002',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          duration: 60,
          customerId: 'customer_002',
          items: [
            { id: '1', name: 'Blue Mist Hookah', quantity: 1, price: 3200 }
          ],
          totalAmount: 3200
        },
        qrCode: `hookahplus://table/T-002/lounge_001`,
        lastUpdated: new Date()
      },
      {
        tableId: 'T-003',
        loungeId: 'lounge_001',
        loungeName: 'Hookah Paradise Downtown',
        zone: 'Patio',
        capacity: 8,
        status: 'available',
        qrCode: `hookahplus://table/T-003/lounge_001`,
        lastUpdated: new Date()
      }
    ];

    // Store tables in memory
    mockTables.forEach(table => {
      this.tables.set(table.tableId, table);
    });

    // Return filtered results
    if (tableId) {
      return mockTables.filter(table => table.tableId === tableId);
    }
    return mockTables.filter(table => table.loungeId === loungeId);
  }

  // Simulate fetching lounge data
  async fetchLoungeData(loungeId: string): Promise<LoungeData | null> {
    const mockLounge: LoungeData = {
      loungeId: 'lounge_001',
      name: 'Hookah Paradise Downtown',
      address: '123 Main St, Downtown, NY 10001',
      phone: '(555) 123-4567',
      hours: 'Mon-Sun: 6PM-2AM',
      features: ['VIP Lounge', 'Outdoor Patio', 'Live Music', 'Full Bar', 'Private Rooms'],
      timezone: 'America/New_York',
      currency: 'USD',
      taxRate: 0.0875 // 8.75%
    };

    this.lounges.set(loungeId, mockLounge);
    return mockLounge;
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

  // Simulate real-time updates from App build
  startRealTimeSync(): void {
    // In a real implementation, this would establish a WebSocket connection
    // to the App build for real-time updates
    setInterval(() => {
      // Simulate occasional updates
      if (Math.random() > 0.8) {
        const tableIds = Array.from(this.tables.keys());
        const randomTableId = tableIds[Math.floor(Math.random() * tableIds.length)];
        const table = this.tables.get(randomTableId);
        
        if (table) {
          // Simulate status change
          const statuses: TableData['status'][] = ['available', 'occupied', 'reserved'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          this.updateTableData(randomTableId, { status: newStatus });
        }
      }
    }, 10000); // Check every 10 seconds
  }
}

export const tableDataSync = TableDataSyncService.getInstance();
