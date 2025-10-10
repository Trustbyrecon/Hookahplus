"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Minimize2,
  Play,
  Pause,
  TrendingUp,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Lightbulb
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
  const [isOnboardingMode, setIsOnboardingMode] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [systemHealth, setSystemHealth] = useState('EXCELLENT');
  const [trustScore, setTrustScore] = useState(87);
  const [liveSessions, setLiveSessions] = useState(0);
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
  const [realTimeData, setRealTimeData] = useState({
    totalSessions: 12,
    activeSessions: 4,
    totalRevenue: 3850,
    lastUpdated: new Date()
  });

  // Onboarding steps for frictionless experience
  const onboardingSteps = [
    {
      title: "Welcome to Hookah+ Layout Preview",
      description: "This is your visual grounder - a real-time view of your lounge's operational status",
      icon: <Target className="w-8 h-8 text-teal-400" />,
      action: "Get Started"
    },
    {
      title: "Live Layout Visualization",
      description: "See your lounge layout with real-time occupancy, sessions, and revenue tracking",
      icon: <MapPin className="w-8 h-8 text-blue-400" />,
      action: "Explore Layout"
    },
    {
      title: "FOH/BOH Control Panel",
      description: "Manage table assignments, staff coordination, and session monitoring",
      icon: <Users className="w-8 h-8 text-green-400" />,
      action: "Open Control Panel"
    },
    {
      title: "Real-Time Sync",
      description: "Data syncs automatically with guest orders, staff actions, and payment systems",
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      action: "Enable Live Mode"
    }
  ];

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

  // Enhanced data loading with cross-repository sync
  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      // Sync with multiple repositories for comprehensive data
      const [sessionsResponse, guestResponse, analyticsResponse] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/guest/sessions'),
        fetch('/api/analytics/layout')
      ]);
      
      const sessionsData = await sessionsResponse.json();
      const guestData = await guestResponse.json();
      const analyticsData = await analyticsResponse.json();
      
      // Merge data from all sources
      const allSessions = [
        ...(sessionsData.sessions || []),
        ...(guestData.sessions || [])
      ];
      
      setSessionsData(allSessions);
      
      // Calculate comprehensive statistics
      const totalSessions = allSessions.length;
      const activeSessions = allSessions.filter((s: any) => 
        s.state === 'ACTIVE' || s.status === 'active'
      ).length;
      const totalRevenue = allSessions.reduce((sum: number, s: any) => 
        sum + (s.priceCents || s.totalAmount || 0), 0) / 100;
      
      // Update real-time data
      setRealTimeData({
        totalSessions,
        activeSessions,
        totalRevenue,
        lastUpdated: new Date()
      });
      
      // Update layout data with real information
      setLayoutData(prev => ({
        ...prev,
        totalSessions,
        activeSessions,
        totalRevenue,
        zones: prev.zones.map(zone => {
          // Count sessions for this zone from all sources
          const zoneSessions = allSessions.filter((s: any) => 
            s.tableId === zone.id || s.zone === zone.id || s.table === zone.id
          );
          const occupied = zoneSessions.length;
          const sessions = zoneSessions.filter((s: any) => 
            s.state === 'ACTIVE' || s.status === 'active'
          ).length;
          
          return {
            ...zone,
            occupied,
            available: zone.capacity - occupied,
            sessions
          };
        })
      }));
      
      // Update system health based on data quality
      const dataQuality = allSessions.length > 0 ? 'EXCELLENT' : 'GOOD';
      setSystemHealth(dataQuality);
      
      // Update trust score based on data consistency
      const trustScore = Math.min(95, 70 + (allSessions.length * 2));
      setTrustScore(trustScore);
      
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Onboarding modal component
  const OnboardingModal = () => {
    if (!isOnboardingMode) return null;
    
    const currentStep = onboardingSteps[onboardingStep];
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            {currentStep.icon}
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">{currentStep.title}</h2>
            <p className="text-zinc-400">{currentStep.description}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= onboardingStep ? 'bg-teal-400' : 'bg-zinc-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              
              <button
                onClick={() => {
                  if (onboardingStep < onboardingSteps.length - 1) {
                    setOnboardingStep(onboardingStep + 1);
                  } else {
                    setIsOnboardingMode(false);
                    setIsLiveMode(true);
                  }
                }}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <>
                    {currentStep.action}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Start Live Mode'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      {/* Onboarding Modal */}
      <OnboardingModal />
      
      <div className="flex h-screen">
        {/* Main Layout Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header with System Status */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Layout Preview</h1>
                <p className="text-zinc-400">Real-time layout management with live session tracking</p>
                
                {/* System Status Bar */}
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth === 'EXCELLENT' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-zinc-300">System Health {systemHealth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-zinc-300">Trust Score {trustScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300">Live Sessions {liveSessions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'text-green-400 animate-spin' : 'text-zinc-400'}`} />
                    <span className="text-zinc-300">
                      {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsOnboardingMode(true)}
                  className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Onboarding
                </button>
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
            
            {/* Enhanced Visual Grounder Output */}
            <div 
              className="relative mx-auto border-2 border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl"
              style={{ 
                width: '600px', 
                height: '400px',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center'
              }}
            >
              {/* Live Mode Indicator */}
              {isLiveMode && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  LIVE
                </div>
              )}
              
              {layoutData.zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`absolute ${getZoneColor(zone.color)} opacity-80 hover:opacity-100 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    selectedTable === zone.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                  } ${
                    zone.sessions > 0 ? 'animate-pulse' : ''
                  }`}
                  style={{
                    left: zone.coordinates.x,
                    top: zone.coordinates.y,
                    width: zone.coordinates.width,
                    height: zone.coordinates.height,
                    borderRadius: '8px',
                    boxShadow: zone.sessions > 0 ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => setSelectedTable(zone.id)}
                >
                  <div className="p-2 text-white text-sm font-medium flex items-center justify-between">
                    <span>{zone.name}</span>
                    {zone.sessions > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        <span className="text-xs">ACTIVE</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 left-2 text-xs text-white font-semibold">
                    {zone.occupied}/{zone.capacity}
                  </div>
                  {zone.sessions > 0 && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                      {zone.sessions}
                    </div>
                  )}
                  
                  {/* Zone Status Indicator */}
                  <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full ${
                    zone.occupied === zone.capacity ? 'bg-red-400' :
                    zone.occupied > zone.capacity * 0.7 ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                </div>
              ))}
              
              {/* Layout Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Layout Controls */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs text-zinc-400 px-1.5">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className="p-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
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
