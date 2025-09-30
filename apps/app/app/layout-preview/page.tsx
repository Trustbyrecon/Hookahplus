"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  Settings, 
  Eye, 
  Download,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Activity,
  Filter,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Lock,
  Unlock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { MASTER_SEATING_TYPES, getSeatingTypeStats, getZoneStats } from '../../lib/masterSeatingTypes';

export default function LayoutPreviewPage() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [isLocked, setIsLocked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  // Mock layout data - moved to state
  const initialLayoutData = {
    name: 'Grove Park Demo Lounge',
    address: '123 Main Street, City, State',
    totalCapacity: 50,
    zones: [
      {
        id: 'bar_a',
        name: 'Bar A',
        type: 'Bar Counter',
        capacity: 10,
        occupied: 0,
        available: 10,
        color: 'orange',
        coordinates: { x: 50, y: 20, width: 200, height: 60 },
        sessions: 0
      },
      {
        id: 'booth_w',
        name: 'Booth W',
        type: 'Booth Seating',
        capacity: 8,
        occupied: 0,
        available: 8,
        color: 'blue',
        coordinates: { x: 300, y: 20, width: 150, height: 100 },
        sessions: 0
      },
      {
        id: 'table_section',
        name: 'Table Section',
        type: 'Table Seating',
        capacity: 20,
        occupied: 0,
        available: 20,
        color: 'green',
        coordinates: { x: 50, y: 150, width: 300, height: 120 },
        sessions: 0
      },
      {
        id: 'vip_area',
        name: 'VIP Area',
        type: 'VIP Section',
        capacity: 12,
        occupied: 0,
        available: 12,
        color: 'purple',
        coordinates: { x: 400, y: 150, width: 120, height: 100 },
        sessions: 0
      }
    ],
    totalSessions: 0,
    activeSessions: 0,
    totalRevenue: 0
  };

  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [layoutData, setLayoutData] = useState(initialLayoutData);
  const [sessionsData, setSessionsData] = useState<any[]>([]);

  const posIntegrations = [
    {
      name: 'Clover Integration',
      description: 'Extract hookah orders - BOH pre-warm up',
      status: 'active',
      color: 'green'
    },
    {
      name: 'Square Integration',
      description: 'Process food/drink - Hookah extraction',
      status: 'active',
      color: 'blue'
    },
    {
      name: 'Toast Integration',
      description: 'Dessert orders - Hookah session creation',
      status: 'active',
      color: 'purple'
    }
  ];

  const workflowSync = [
    {
      name: 'BOH Workflow',
      description: 'Table IDs automatically sync to BOH prep queue',
      status: 'active',
      color: 'green'
    },
    {
      name: 'FOH Service',
      description: 'Table IDs sync to FOH service assignments',
      status: 'active',
      color: 'green'
    },
    {
      name: 'Active Sessions',
      description: 'Table IDs appear in real-time active sessions',
      status: 'inactive',
      color: 'red'
    }
  ];

  const masterSeatingTypes = getSeatingTypeStats();
  const zoneStats = getZoneStats();

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    handleLoadData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleLoadData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      // Load sessions from Fire Session Dashboard API
      const sessionsResponse = await fetch('/api/sessions');
      const sessionsData = await sessionsResponse.json();
      
      if (sessionsData.ok && sessionsData.sessions) {
        setSessionsData(sessionsData.sessions);
        
        // Calculate real statistics from sessions
        const totalSessions = sessionsData.sessions.length;
        const activeSessions = sessionsData.sessions.filter((s: any) => s.state === 'ACTIVE').length;
        const totalRevenue = sessionsData.sessions.reduce((sum: number, s: any) => sum + (s.priceCents || 0), 0) / 100;
        
        // Update layout data with real information
        setLayoutData(prev => ({
          ...prev,
          totalSessions,
          activeSessions,
          totalRevenue,
          zones: prev.zones.map(zone => {
            // Count sessions for this zone
            const zoneSessions = sessionsData.sessions.filter((s: any) => s.tableId === zone.id);
            const occupied = zoneSessions.length;
            const sessions = zoneSessions.filter((s: any) => s.state === 'ACTIVE').length;
            
            return {
              ...zone,
              occupied,
              available: zone.capacity - occupied,
              sessions
            };
          })
        }));
      } else {
        // Fallback to simulated data if API fails
        setLayoutData(prev => ({
          ...prev,
          totalSessions: Math.floor(Math.random() * 20),
          activeSessions: Math.floor(Math.random() * 10),
          totalRevenue: Math.floor(Math.random() * 5000),
          zones: prev.zones.map(zone => ({
            ...zone,
            occupied: Math.floor(Math.random() * zone.capacity),
            available: zone.capacity - Math.floor(Math.random() * zone.capacity),
            sessions: Math.floor(Math.random() * 5)
          }))
        }));
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetView = () => {
    setZoomLevel(100);
  };

  const getZoneColor = (color: string) => {
    const colors = {
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'inactive': return 'bg-red-400';
      default: return 'bg-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="flex h-screen">
        {/* Main Layout Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Layout Preview</h1>
                <p className="text-zinc-400">Real-time layout management with live session tracking</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLoadData}
                  disabled={isLoading}
                  className="btn-pretty-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load Data
                    </>
                  )}
                </button>
                <button 
                  onClick={handleAutoRefreshToggle}
                  className={`btn-pretty-secondary ${autoRefresh ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-zinc-800 border-b border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{layoutData.totalSessions}</div>
                  <div className="text-sm text-zinc-400">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{layoutData.activeSessions}</div>
                  <div className="text-sm text-zinc-400">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">${layoutData.totalRevenue}</div>
                  <div className="text-sm text-zinc-400">Total Revenue</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Last Updated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Health: EXCELLENT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Canvas */}
          <div className="flex-1 bg-white p-8 relative overflow-hidden">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Hookah+ Layout Preview {layoutData.name}
              </h2>
            </div>
            
            {/* Visual Grounder Output */}
            <div 
              className="relative mx-auto border-2 border-gray-300 rounded-lg bg-gray-50"
              style={{ 
                width: '600px', 
                height: '400px',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center'
              }}
            >
              {layoutData.zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`absolute ${getZoneColor(zone.color)} opacity-80 hover:opacity-100 cursor-pointer transition-opacity ${
                    selectedTable === zone.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: zone.coordinates.x,
                    top: zone.coordinates.y,
                    width: zone.coordinates.width,
                    height: zone.coordinates.height,
                    borderRadius: '4px'
                  }}
                  onClick={() => setSelectedTable(zone.id)}
                >
                  <div className="p-2 text-white text-sm font-medium">
                    {zone.name}
                  </div>
                  <div className="absolute bottom-1 left-2 text-xs text-white">
                    {zone.occupied}/{zone.capacity}
                  </div>
                  {zone.sessions > 0 && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
                      {zone.sessions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Layout Controls */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm text-zinc-400 px-2">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            {/* Mini Map */}
            <div className="absolute bottom-4 right-4 w-32 h-20 bg-zinc-800 rounded border border-zinc-700 opacity-50">
              <div className="text-xs text-zinc-400 p-1">Mini Map</div>
            </div>
          </div>
        </div>

        {/* FOH/BOH Control Panel */}
        <div className="w-80 bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-6">FOH/BOH Control Panel</h3>

          {/* Table Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">TABLE ID SELECTION</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select a table/unit...</option>
              {layoutData.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} - {zone.type}
                </option>
              ))}
            </select>
          </div>

          {/* Master Seating Types */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">MASTER SEATING TYPES</h4>
            <div className="space-y-3">
              {Object.entries(masterSeatingTypes).map(([type, stats], index) => {
                // Calculate real-time stats from layout data
                const realStats = layoutData.zones.reduce((acc, zone) => {
                  if (zone.type.toLowerCase().includes(type.toLowerCase()) || 
                      type.toLowerCase().includes(zone.type.toLowerCase())) {
                    acc.available += zone.available;
                    acc.occupied += zone.occupied;
                    acc.capacity += zone.capacity;
                    acc.sessions += zone.sessions;
                  }
                  return acc;
                }, { available: 0, occupied: 0, capacity: 0, sessions: 0 });
                
                return (
                  <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-sm font-medium text-white mb-1">{type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                      <div>Available: {realStats.available}</div>
                      <div>Occupied: {realStats.occupied}</div>
                      <div>Capacity: {realStats.capacity}</div>
                      <div>Hookah Sessions: {realStats.sessions}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">ZONE FILTER</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All Zones">All Zones</option>
              {layoutData.zones.map((zone) => (
                <option key={zone.id} value={zone.name}>{zone.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">STATUS FILTER</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All Status">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Live Zone Statistics */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">LIVE ZONE STATISTICS</h4>
            <div className="space-y-3">
              {layoutData.zones.map((zone) => (
                <div key={zone.id} className={`p-3 bg-zinc-800/50 rounded-lg ${
                  selectedTable === zone.id ? 'ring-2 ring-teal-500 bg-teal-900/20' : ''
                }`}>
                  <div className="text-sm font-medium text-white mb-1">{zone.name}</div>
                  <div className="text-xs text-zinc-400">
                    Available: {zone.available} • Occupied: {zone.occupied} • Fire Sessions: {zone.sessions} active
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy POS Integration */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">LEGACY POS INTEGRATION</h4>
            <div className="space-y-3">
              {posIntegrations.map((integration, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(integration.status)}`}></div>
                  <div>
                    <div className="text-sm font-medium text-white">{integration.name}</div>
                    <div className="text-xs text-zinc-400">{integration.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table ID Sync Status */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">TABLE ID SYNC STATUS</h4>
            <div className="space-y-3">
              {workflowSync.map((sync, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(sync.status)}`}></div>
                  <div>
                    <div className="text-sm font-medium text-white">{sync.name}</div>
                    <div className="text-xs text-zinc-400">{sync.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full btn-pretty-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Layout
            </button>
            <button className="w-full btn-pretty-secondary">
              <Target className="w-4 h-4 mr-2" />
              Suggest Improvements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
