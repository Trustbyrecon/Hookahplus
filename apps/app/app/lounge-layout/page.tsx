'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import { 
  LayoutGrid,
  Plus,
  Trash2,
  Save,
  MapPin,
  TrendingUp,
  Zap,
  BarChart3,
  Clock,
  DollarSign,
  User,
  Flame,
  AlertCircle,
  CheckCircle,
  Eye,
  Activity,
  Sparkles,
  Play,
  Pause,
  Square,
  RefreshCw,
  Package,
  Truck,
} from 'lucide-react';
import { LoungeHeatMap } from '../../components/LoungeHeatMap';
import { TableAnalytics } from '../../components/TableAnalytics';

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  seatingType: string;
}

export default function LoungeLayoutPage() {
  return (
    <SessionProvider>
      <LoungeLayoutPageContent />
    </SessionProvider>
  );
}

function LoungeLayoutPageContent() {
  const { sessions, refreshSessions, loading: sessionsLoading } = useSessionContext();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'layout' | 'live' | 'analytics'>('live');
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [heatMapMetric, setHeatMapMetric] = useState<'revenue' | 'utilization' | 'sessions'>('revenue');

  // Load existing layout on mount
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const response = await fetch('/api/lounges?layout=true');
        if (response.ok) {
          const data = await response.json();
          if (data.layout && data.layout.tables) {
            const loadedTables = data.layout.tables.map((table: any) => ({
              id: table.id,
              name: table.name,
              x: table.coordinates?.x || table.x || 50,
              y: table.coordinates?.y || table.y || 50,
              capacity: table.capacity || 4,
              seatingType: table.seatingType || 'Booth'
            }));
            setTables(loadedTables);
          }
        }
      } catch (error) {
        console.error('Error loading layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, []);

  // Auto-refresh sessions every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSessions();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshSessions]);

  // Load analytics data
  useEffect(() => {
    if (viewMode === 'analytics') {
      const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const response = await fetch(`/api/lounges/analytics?timeRange=${timeRange}&metric=${heatMapMetric}`);
          if (response.ok) {
            const data = await response.json();
            setAnalyticsData(data);
          }
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setAnalyticsLoading(false);
        }
      };
      loadAnalytics();
    }
  }, [viewMode, timeRange, heatMapMetric]);

  // Match sessions to tables
  // Filter: Only show sessions with payment confirmed (exclude unconfirmed pre-orders)
  const tableSessions = useMemo(() => {
    const sessionMap = new Map<string, any>();
    sessions.forEach(session => {
      // Filter out unconfirmed pre-orders - only show sessions with payment confirmed
      const isPaid = session.paymentStatus === 'succeeded' || 
                     (session.externalRef && (session.externalRef.startsWith('cs_') || session.externalRef.startsWith('test_cs_'))) ||
                     session.status === 'PAID_CONFIRMED' ||
                     (session.status !== 'NEW' && session.status !== 'PENDING');
      
      // Only include sessions that are paid/confirmed
      if (!isPaid) {
        return; // Skip unconfirmed sessions
      }
      
      if (session.tableId) {
        // Match by tableId (could be "T-001" or just table name)
        const matchingTable = tables.find(t => 
          t.id === session.tableId || 
          t.name === session.tableId ||
          t.name.toLowerCase() === session.tableId.toLowerCase()
        );
        if (matchingTable) {
          sessionMap.set(matchingTable.id, session);
        }
      }
    });
    return sessionMap;
  }, [sessions, tables]);

  // Get table status
  const getTableStatus = (tableId: string) => {
    const session = tableSessions.get(tableId);
    if (!session) return 'available';
    
    // Determine status based on session state
    if (session.status === 'ACTIVE' || session.status === 'DELIVERED') {
      if (session.coalStatus === 'needs_refill' || session.refillStatus === 'requested') {
        return 'needs_attention';
      }
      if (session.coalStatus === 'burnt_out') {
        return 'urgent';
      }
      return 'active';
    }
    
    if (['PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'].includes(session.status)) {
      return 'preparing';
    }
    
    return 'available';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 border-green-400';
      case 'needs_attention': return 'bg-yellow-500 border-yellow-400';
      case 'urgent': return 'bg-red-500 border-red-400';
      case 'preparing': return 'bg-blue-500 border-blue-400';
      default: return 'bg-zinc-700 border-zinc-500';
    }
  };

  const seatingTypes = [
    'Booth',
    'Couch',
    'Bar Seating',
    'Outdoor',
    'VIP',
    'Private Room'
  ];

  const handleAddTable = () => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: `T-${tables.length + 1}`,
      x: 50,
      y: 50,
      capacity: 4,
      seatingType: 'Booth'
    };
    setTables([...tables, newTable]);
    setSelectedTable(newTable.id);
  };

  /**
   * Loads a demo layout for testing and calibration
   * Includes:
   * - 10 tables covering all 6 seating types (Booth, Couch, Bar Seating, Outdoor, VIP, Private Room)
   * - Various capacities (2, 4, 6, 8, 10) for capacity testing
   * - Strategic positioning in 3 zones (top/main, middle/mixed, bottom/premium)
   * - Table IDs: table-001 through table-010
   * - Table names: T-001 through T-010 (for session matching tests)
   */
  const handleLoadDemoLayout = () => {
    if (tables.length > 0) {
      const confirmed = window.confirm(
        'This will replace your current layout with a demo layout. Continue?'
      );
      if (!confirmed) return;
    }
    
    const demoLayout: Table[] = [
      { id: 'table-001', name: 'T-001', x: 20, y: 20, capacity: 4, seatingType: 'Booth' },
      { id: 'table-002', name: 'T-002', x: 40, y: 20, capacity: 4, seatingType: 'Booth' },
      { id: 'table-003', name: 'T-003', x: 60, y: 20, capacity: 6, seatingType: 'Couch' },
      { id: 'table-004', name: 'T-004', x: 80, y: 20, capacity: 2, seatingType: 'Bar Seating' },
      { id: 'table-005', name: 'T-005', x: 20, y: 50, capacity: 6, seatingType: 'Couch' },
      { id: 'table-006', name: 'T-006', x: 50, y: 50, capacity: 8, seatingType: 'Outdoor' },
      { id: 'table-007', name: 'T-007', x: 80, y: 50, capacity: 4, seatingType: 'Booth' },
      { id: 'table-008', name: 'T-008', x: 20, y: 80, capacity: 10, seatingType: 'VIP' },
      { id: 'table-009', name: 'T-009', x: 50, y: 80, capacity: 6, seatingType: 'Couch' },
      { id: 'table-010', name: 'T-010', x: 80, y: 80, capacity: 8, seatingType: 'Private Room' }
    ];
    setTables(demoLayout);
    setSelectedTable(null);
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter(table => table.id !== id));
    if (selectedTable === id) {
      setSelectedTable(null);
    }
  };

  const handleClearLayout = () => {
    if (tables.length === 0) return;
    const confirmed = window.confirm('Clear all tables from the layout?');
    if (confirmed) {
      setTables([]);
      setSelectedTable(null);
    }
  };

  const handleTableClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table.id);
  };

  const handleTableDragStart = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedTable(table.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
  };

  const handleTableDrag = (tableId: string, e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTables(tables.map(t => 
      t.id === tableId 
        ? { ...t, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : t
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/lounges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_layout',
          tables: tables
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // If using localStorage fallback, save to localStorage
        if (result.storageMethod === 'localStorage' && result.layoutData) {
          try {
            localStorage.setItem('lounge_layout', JSON.stringify(result.layoutData));
            console.log('[Layout] Saved to localStorage as fallback');
          } catch (storageError) {
            console.error('[Layout] Failed to save to localStorage:', storageError);
          }
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save layout' }));
        console.error('Save layout error:', errorData);
        setSaveStatus('error');
        // Show error alert with details
        alert(`Failed to save layout: ${errorData.error || 'Unknown error'}\n\nDetails: ${errorData.details || 'Please check the console for more information.'}`);
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      setSaveStatus('error');
      alert(`Error saving layout: ${error instanceof Error ? error.message : 'Network or connection error. Please try again.'}`);
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);
  const selectedTableSession = selectedTable ? tableSessions.get(selectedTable) : null;
  
  // Calculate live stats
  const liveStats = useMemo(() => {
    const activeCount = Array.from(tableSessions.values()).filter(s => 
      s.status === 'ACTIVE' || s.status === 'DELIVERED'
    ).length;
    const totalRevenue = Array.from(tableSessions.values()).reduce((sum, s) => sum + (s.amount || 0), 0);
    return {
      activeSessions: activeCount,
      totalTables: tables.length,
      occupiedTables: tableSessions.size,
      totalRevenue
    };
  }, [tableSessions, tables]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      {/* Hero Section with Value Proposition */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Digitize your lounge in minutes, optimize forever
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-6">
              Visual floor plan management with AI-powered table optimization
            </p>
            
            {/* Value Proposition Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-xl px-6 py-3 mb-8">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <div className="text-left">
                <div className="text-xl font-bold text-teal-400">↑ 22% better table utilization, automated heat mapping</div>
                <div className="text-xs text-zinc-400">See which tables perform best and optimize your layout automatically</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-sm">Visual floor plan</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-sm">AI-powered optimization</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span className="text-sm">Real-time analytics</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={handleLoadDemoLayout}
                className="bg-teal-900/20 border-teal-500/30 hover:bg-teal-900/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Demo Layout
              </Button>
              <Button
                variant="outline"
                onClick={handleAddTable}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
              {tables.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearLayout}
                  className="text-red-400 border-red-500/30 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Layout
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={tables.length === 0 || saveStatus === 'saving'}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error - Try Again' :
                 'Save Layout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Analytics View */}
        {viewMode === 'analytics' ? (
          <div className="space-y-6">
            {/* Controls */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Time Range:</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Metric:</span>
                  <select
                    value={heatMapMetric}
                    onChange={(e) => setHeatMapMetric(e.target.value as any)}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="utilization">Utilization</option>
                    <option value="sessions">Sessions</option>
                  </select>
                </div>
              </div>
            </Card>

            {analyticsLoading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
                <p className="text-zinc-400">Loading analytics...</p>
              </Card>
            ) : analyticsData ? (
              <>
                {/* Heat Map */}
                <Card className="p-6">
                  <LoungeHeatMap
                    tables={tables.map(t => ({
                      id: t.id,
                      name: t.name,
                      x: t.x,
                      y: t.y,
                      capacity: t.capacity
                    }))}
                    heatMapData={analyticsData.heatMap || []}
                    metric={heatMapMetric}
                    onTableClick={(tableId) => {
                      setSelectedTable(tableId);
                      setViewMode('live');
                    }}
                  />
                </Card>

                {/* Analytics Dashboard */}
                <TableAnalytics
                  tableMetrics={analyticsData.tables || []}
                  zoneMetrics={analyticsData.zones || []}
                  summary={analyticsData.summary || {
                    totalTables: tables.length,
                    totalRevenue: 0,
                    totalSessions: 0,
                    averageUtilization: 0,
                    averageSessionValue: 0
                  }}
                  trends={analyticsData.trends}
                  onTableSelect={(tableId) => {
                    setSelectedTable(tableId);
                    setViewMode('live');
                  }}
                />
              </>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No analytics data available</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Layout Canvas */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Lounge Floor Plan</h2>
                    {viewMode === 'live' && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-zinc-400">{liveStats.activeSessions} Active</span>
                        </div>
                        <div className="flex items-center gap-2" title="Total revenue from all active sessions">
                          <DollarSign className="w-4 h-4 text-teal-400" />
                          <span className="text-zinc-400">${liveStats.totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700">
                      <button
                        onClick={() => setViewMode('layout')}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          viewMode === 'layout'
                            ? 'bg-teal-500 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Layout Mode - Edit and move tables"
                      >
                        Layout
                      </button>
                      <button
                        onClick={() => setViewMode('live')}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          viewMode === 'live'
                            ? 'bg-teal-500 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Live Mode - View active sessions"
                      >
                        Live
                      </button>
                      <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          viewMode === 'analytics'
                            ? 'bg-teal-500 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Analytics Mode - View heat maps and metrics"
                      >
                        Analytics
                      </button>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {tables.length} table{tables.length !== 1 ? 's' : ''} configured
                    </div>
                  </div>
                </div>
              
              <div
                className="relative w-full h-[600px] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg overflow-hidden"
                onMouseMove={(e) => {
                  if (isDragging && selectedTable) {
                    handleTableDrag(selectedTable, e);
                  }
                }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedTable(null)}
              >
                {tables.map((table) => {
                  const session = tableSessions.get(table.id);
                  const status = viewMode === 'live' ? getTableStatus(table.id) : 'available';
                  const statusColor = getStatusColor(status);
                  
                  return (
                  <div
                    key={table.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedTable === table.id ? 'ring-2 ring-teal-500 z-10' : 'z-0'
                    } ${viewMode === 'live' && session ? 'cursor-pointer' : 'cursor-move'}`}
                    style={{
                      left: `${table.x}%`,
                      top: `${table.y}%`
                    }}
                    onClick={(e) => handleTableClick(table, e)}
                    onMouseDown={(e) => {
                      if (viewMode === 'layout') {
                        handleTableDragStart(table, e);
                      }
                    }}
                  >
                    {/* Distinctive shapes based on seating type */}
                    {table.seatingType === 'Booth' && (
                      <div className={`w-20 h-12 rounded-lg flex flex-col items-center justify-center border-2 ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-teal-500 text-white border-teal-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {table.seatingType === 'Couch' && (
                      <div className={`w-24 h-16 rounded-xl flex flex-col items-center justify-center border-2 ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-purple-500 text-white border-purple-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-purple-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {table.seatingType === 'Bar Seating' && (
                      <div className={`w-16 h-8 rounded-full flex flex-col items-center justify-center border-2 ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-blue-500 text-white border-blue-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-blue-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {table.seatingType === 'Outdoor' && (
                      <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 border-dashed ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-green-500 text-white border-green-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-green-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {table.seatingType === 'VIP' && (
                      <div className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2 ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-yellow-500 text-white border-yellow-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-yellow-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {table.seatingType === 'Private Room' && (
                      <div className={`w-24 h-20 rounded-lg flex flex-col items-center justify-center border-2 ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-red-500 text-white border-red-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-red-500'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                    {!['Booth', 'Couch', 'Bar Seating', 'Outdoor', 'VIP', 'Private Room'].includes(table.seatingType) && (
                      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                        viewMode === 'live' && session
                          ? `${statusColor} text-white`
                          : selectedTable === table.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      } transition-colors relative`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        {viewMode === 'live' && session ? (
                          <div className="text-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            <span>{session.customerName?.split(' ')[0] || 'Active'}</span>
                          </div>
                        ) : (
                          <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                        )}
                        {viewMode === 'live' && session && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-900"></div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
                
                {tables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <LayoutGrid className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-4">No tables configured yet</p>
                      <Button
                        variant="outline"
                        onClick={handleAddTable}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Table
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedTableData ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedTableSession ? 'Active Session' : 'Table Details'}
                  </h3>
                  {viewMode === 'layout' && (
                    <button
                      onClick={() => handleDeleteTable(selectedTableData.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedTableSession ? (
                    <>
                      {/* Session Info */}
                      <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-teal-400" />
                            <span className="font-semibold text-white">Active Session</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            getTableStatus(selectedTableData.id) === 'active' ? 'bg-green-500/20 text-green-400' :
                            getTableStatus(selectedTableData.id) === 'needs_attention' ? 'bg-yellow-500/20 text-yellow-400' :
                            getTableStatus(selectedTableData.id) === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {selectedTableSession.status}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-300">{selectedTableSession.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-300">
                              ${((selectedTableSession.amount || selectedTableSession.priceCents || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-300">
                              {Math.floor((selectedTableSession.sessionDuration || 0) / 60)} min
                            </span>
                          </div>
                          {selectedTableSession.flavor && (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400">Flavor:</span>
                              <span className="text-zinc-300">{selectedTableSession.flavor}</span>
                            </div>
                          )}
                          {selectedTableSession.coalStatus === 'needs_refill' && (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <AlertCircle className="w-4 h-4" />
                              <span>Needs Refill</span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => window.location.href = `/sessions`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Session Details
                        </Button>
                      </div>

                      {/* Mini Session Control Panel - NAN Workflow */}
                      <div className="mt-4 pt-4 border-t border-zinc-700">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Session Control</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {/* PAID_CONFIRMED or PENDING with payment confirmed */}
                          {(selectedTableSession.status === 'PAID_CONFIRMED' || 
                            (selectedTableSession.status === 'PENDING' && 
                             (selectedTableSession.paymentStatus === 'succeeded' || 
                              (selectedTableSession.externalRef && selectedTableSession.externalRef.startsWith('cs_'))))) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/sessions`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      sessionId: selectedTableSession.id,
                                      action: 'CLAIM_PREP',
                                      userRole: 'MANAGER',
                                      operatorId: 'lounge-layout',
                                      notes: 'Claim prep from lounge layout'
                                    })
                                  });
                                  if (response.ok) {
                                    refreshSessions();
                                  } else {
                                    const error = await response.json().catch(() => ({ error: 'Failed to claim prep' }));
                                    const errorMsg = error.details || error.error || 'Failed to claim prep';
                                    console.error('[Lounge Layout] Claim Prep error:', error);
                                    alert(`Error: ${errorMsg}\n\nCurrent Status: ${error.currentStatus || 'unknown'}\nValid Actions: ${error.validTransitions?.join(', ') || 'none'}`);
                                  }
                                } catch (error) {
                                  console.error('Error claiming prep:', error);
                                  alert('Failed to claim prep. Please try again.');
                                }
                              }}
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Claim Prep
                            </Button>
                          ) : null}
                          
                          {(selectedTableSession.status === 'PREP_IN_PROGRESS' ||
                            (selectedTableSession.status === 'ACTIVE' && selectedTableSession.assignedBOHId)) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30"
                              onClick={async () => {
                                try {
                                  console.log('[Lounge Layout] Heat Up - Session data:', {
                                    id: selectedTableSession.id,
                                    status: selectedTableSession.status,
                                    paymentStatus: selectedTableSession.paymentStatus,
                                    externalRef: selectedTableSession.externalRef,
                                    assignedBOHId: selectedTableSession.assignedBOHId
                                  });
                                  const response = await fetch(`/api/sessions`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      sessionId: selectedTableSession.id,
                                      action: 'HEAT_UP',
                                      userRole: 'MANAGER',
                                      operatorId: 'lounge-layout',
                                      notes: 'Heat up from lounge layout'
                                    })
                                  });
                                  if (response.ok) {
                                    refreshSessions();
                                  } else {
                                    const error = await response.json().catch(() => ({ error: 'Failed to heat up' }));
                                    const errorMsg = error.details || error.error || 'Failed to heat up';
                                    console.error('[Lounge Layout] Heat Up error:', error);
                                    alert(`Error: ${errorMsg}\n\nCurrent Status: ${error.currentStatus || 'unknown'}\nValid Actions: ${error.validTransitions?.join(', ') || 'none'}`);
                                  }
                                } catch (error) {
                                  console.error('Error heating up:', error);
                                  alert('Failed to heat up. Please try again.');
                                }
                              }}
                            >
                              <Flame className="w-3 h-3 mr-1" />
                              Heat Up
                            </Button>
                          ) : null}

                          {(selectedTableSession.status === 'HEAT_UP' || 
                            selectedTableSession.status === 'READY_FOR_DELIVERY') ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/sessions`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      sessionId: selectedTableSession.id,
                                      action: 'DELIVER_NOW',
                                      userRole: 'MANAGER',
                                      operatorId: 'lounge-layout',
                                      notes: 'Deliver from lounge layout'
                                    })
                                  });
                                  if (response.ok) {
                                    refreshSessions();
                                  } else {
                                    const error = await response.json().catch(() => ({ error: 'Failed to deliver' }));
                                    const errorMsg = error.details || error.error || 'Failed to deliver';
                                    console.error('[Lounge Layout] Deliver error:', error);
                                    alert(`Error: ${errorMsg}\n\nCurrent Status: ${error.currentStatus || 'unknown'}\nValid Actions: ${error.validTransitions?.join(', ') || 'none'}`);
                                  }
                                } catch (error) {
                                  console.error('Error delivering:', error);
                                  alert('Failed to deliver. Please try again.');
                                }
                              }}
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Deliver
                            </Button>
                          ) : null}

                          {selectedTableSession.status === 'OUT_FOR_DELIVERY' || selectedTableSession.status === 'DELIVERED' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-green-500/20 border-green-500/30"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/sessions`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      sessionId: selectedTableSession.id,
                                      action: 'START_ACTIVE',
                                      userRole: 'MANAGER',
                                      operatorId: 'lounge-layout',
                                      notes: 'Start active from lounge layout'
                                    })
                                  });
                                  if (response.ok) {
                                    refreshSessions();
                                  } else {
                                    const error = await response.json().catch(() => ({ error: 'Failed to start active' }));
                                    const errorMsg = error.details || error.error || 'Failed to start active';
                                    console.error('[Lounge Layout] Start Active error:', error);
                                    alert(`Error: ${errorMsg}\n\nCurrent Status: ${error.currentStatus || 'unknown'}\nValid Actions: ${error.validTransitions?.join(', ') || 'none'}`);
                                  }
                                } catch (error) {
                                  console.error('Error starting session:', error);
                                  alert('Failed to start active. Please try again.');
                                }
                              }}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start Active
                            </Button>
                          ) : null}

                          {selectedTableSession.status === 'ACTIVE' ? (
                            <>
                              {selectedTableSession.coalStatus === 'needs_refill' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/sessions`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                          sessionId: selectedTableSession.id,
                                          action: 'ADD_COAL_SWAP',
                                          coalStatus: 'active',
                                          userRole: 'MANAGER',
                                          operatorId: 'lounge-layout',
                                          notes: 'Refill coal from lounge layout'
                                        })
                                      });
                                      if (response.ok) {
                                        refreshSessions();
                                      } else {
                                        const error = await response.json().catch(() => ({ error: 'Failed to refill coal' }));
                                        alert(`Error: ${error.error || error.details || 'Failed to refill coal'}`);
                                      }
                                    } catch (error) {
                                      console.error('Error refilling coal:', error);
                                      alert('Failed to refill coal. Please try again.');
                                    }
                                  }}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Refill Coal
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/sessions`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ 
                                        sessionId: selectedTableSession.id,
                                        action: 'CLOSE_SESSION',
                                        userRole: 'MANAGER',
                                        operatorId: 'lounge-layout',
                                        notes: 'Close session from lounge layout'
                                      })
                                    });
                                    if (response.ok) {
                                      refreshSessions();
                                    } else {
                                      const error = await response.json().catch(() => ({ error: 'Failed to close session' }));
                                      const errorMsg = error.details || error.error || 'Failed to close session';
                                      console.error('[Lounge Layout] Close Session error:', error);
                                      alert(`Error: ${errorMsg}\n\nCurrent Status: ${error.currentStatus || 'unknown'}\nValid Actions: ${error.validTransitions?.join(', ') || 'none'}`);
                                    }
                                  } catch (error) {
                                    console.error('Error closing session:', error);
                                    alert('Failed to close session. Please try again.');
                                  }
                                }}
                              >
                                <Square className="w-3 h-3 mr-1" />
                                Close
                              </Button>
                            </>
                          ) : null}
                        </div>
                        {/* Show message if no actions available */}
                        {(() => {
                          const hasPaidConfirmed = selectedTableSession.status === 'PAID_CONFIRMED' || 
                            (selectedTableSession.status === 'PENDING' && 
                             (selectedTableSession.paymentStatus === 'succeeded' || 
                              (selectedTableSession.externalRef && selectedTableSession.externalRef.startsWith('cs_'))));
                          const hasPrepActions = selectedTableSession.status === 'PREP_IN_PROGRESS' ||
                            (selectedTableSession.status === 'ACTIVE' && selectedTableSession.assignedBOHId);
                          const hasDeliveryActions = selectedTableSession.status === 'HEAT_UP' ||
                            selectedTableSession.status === 'READY_FOR_DELIVERY';
                          const hasStartActive = selectedTableSession.status === 'OUT_FOR_DELIVERY' ||
                            selectedTableSession.status === 'DELIVERED';
                          const hasActiveActions = selectedTableSession.status === 'ACTIVE';
                          
                          const hasAnyActions = hasPaidConfirmed || hasPrepActions || hasDeliveryActions || hasStartActive || hasActiveActions;
                          
                          return !hasAnyActions && (
                            <div className="mt-2 p-2 bg-zinc-800/50 rounded text-xs text-zinc-400 text-center">
                              No actions available for current state: <span className="font-medium">{selectedTableSession.status}</span>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="pt-4 border-t border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-2">Table Info</div>
                        <div className="text-xs text-zinc-500">
                          {selectedTableData.name} • {selectedTableData.capacity} seats • {selectedTableData.seatingType}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {viewMode === 'live' && (
                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Live Mode Active</span>
                          </div>
                          <p className="text-xs text-yellow-300/80 mt-1">
                            Switch to <strong>Layout Mode</strong> to edit table details and move tables.
                          </p>
                        </div>
                      )}
                      {/* Table Configuration */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Table Name
                        </label>
                        <input
                          type="text"
                          value={selectedTableData.name}
                          onChange={(e) => {
                            setTables(tables.map(t =>
                              t.id === selectedTableData.id
                                ? { ...t, name: e.target.value }
                                : t
                            ));
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={viewMode === 'live'}
                          placeholder={viewMode === 'live' ? 'Switch to Layout Mode to edit' : 'Enter table name'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={selectedTableData.capacity}
                          onChange={(e) => {
                            setTables(tables.map(t =>
                              t.id === selectedTableData.id
                                ? { ...t, capacity: parseInt(e.target.value) || 0 }
                                : t
                            ));
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                          min="1"
                          disabled={viewMode === 'live'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Seating Type
                        </label>
                        <select
                          value={selectedTableData.seatingType}
                          onChange={(e) => {
                            setTables(tables.map(t =>
                              t.id === selectedTableData.id
                                ? { ...t, seatingType: e.target.value }
                                : t
                            ));
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                          disabled={viewMode === 'live'}
                        >
                          {seatingTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <p className="text-xs text-zinc-400 mt-1">
                          Current: {selectedTableData.seatingType}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-1">Position</div>
                        <div className="text-xs text-zinc-500">
                          X: {selectedTableData.x.toFixed(1)}% | Y: {selectedTableData.y.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center text-zinc-400">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p className="text-sm">Select a table to edit its details</p>
                </div>
              </Card>
            )}

            {/* Status Legend (Live Mode) */}
            {viewMode === 'live' && (
              <Card className="p-6 bg-zinc-900/50">
                <h3 className="text-sm font-semibold mb-3">Status Legend</h3>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded border border-green-400"></div>
                    <span>Active Session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-400"></div>
                    <span>Needs Attention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded border border-red-400"></div>
                    <span>Urgent (Burnt Out)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded border border-blue-400"></div>
                    <span>Preparing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-zinc-700 rounded border border-zinc-500"></div>
                    <span>Available</span>
                  </li>
                </ul>
              </Card>
            )}

            {/* Instructions */}
            <Card className="p-6 bg-zinc-900/50">
              <h3 className="text-sm font-semibold mb-3">
                {viewMode === 'live' ? 'Live Mode' : 'Layout Mode'}
              </h3>
              <ul className="space-y-2 text-xs text-zinc-400">
                {viewMode === 'live' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Click a table to view active session details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Color indicates session status (green=active, yellow=needs attention, red=urgent)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>The dollar amount shows total revenue from all active sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Data refreshes every 15 seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Switch to <strong>Layout mode</strong> to edit tables and move them around</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Click "Add Table" to place tables on your floor plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Drag tables to reposition them</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Click a table to edit its details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400">•</span>
                      <span>Save your layout when finished</span>
                    </li>
                  </>
                )}
              </ul>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

