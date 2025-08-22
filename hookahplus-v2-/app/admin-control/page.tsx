"use client";

import { useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";
import { 
  getAllSessions, 
  getLiveSessions, 
  getSessionsByStatus, 
  seedMultipleSessions,
  seedSession 
} from "@/lib/sessionState";
import { 
  getLiveOrders, 
  getTotalRevenue, 
  getPaidOrderCount, 
  getPendingOrderCount,
  getTopFlavors,
  getFlavorMixLibrary
} from "@/lib/orders";

// Reflex Bloom Roadmap - MVP Launch Features
interface ReflexCard {
  id: string;
  feature: string;
  description: string;
  sprint: string;
  command: string;
  dependencies: string[];
  reflexScore: number;
  bloomLogLink?: string;
  status: 'seed' | 'activate' | 'reflect' | 'trust-lock' | 'bloomed';
  createdAt: number;
  lastUpdated: number;
}

const REFLEX_ROADMAP: ReflexCard[] = [
  {
    id: 'MB-001',
    feature: 'Fire Session State Machine',
    description: 'Core session workflow with FOH/BOH integration',
    sprint: 'S-0',
    command: 'cmd.enableFireSessionWorkflow()',
    dependencies: [],
    reflexScore: 95,
    status: 'bloomed',
    createdAt: Date.now() - 86400000 * 7,
    lastUpdated: Date.now() - 86400000 * 2
  },
  {
    id: 'MB-002',
    feature: 'Session UI Trust Loop',
    description: 'Real-time session monitoring with trust validation',
    sprint: 'S-0',
    command: 'cmd.enableSessionTrustLoop()',
    dependencies: ['MB-001'],
    reflexScore: 87,
    status: 'trust-lock',
    createdAt: Date.now() - 86400000 * 6,
    lastUpdated: Date.now() - 86400000 * 1
  },
  {
    id: 'MB-003',
    feature: 'Mobile QR Workflow',
    description: 'Customer journey from scan to session activation',
    sprint: 'S-1',
    command: 'cmd.deployMobileQRWorkflow()',
    dependencies: ['MB-001', 'MB-002'],
    reflexScore: 78,
    status: 'reflect',
    createdAt: Date.now() - 86400000 * 5,
    lastUpdated: Date.now() - 86400000 * 1
  },
  {
    id: 'MB-004',
    feature: 'Stripe Payment Integration',
    description: 'Secure payment processing with live mode prep',
    sprint: 'S-1',
    command: 'cmd.enableStripePayments()',
    dependencies: ['MB-003'],
    reflexScore: 65,
    status: 'activate',
    createdAt: Date.now() - 86400000 * 4,
    lastUpdated: Date.now()
  },
  {
    id: 'MB-005',
    feature: 'Admin Control Center',
    description: 'Comprehensive dashboard with live analytics',
    sprint: 'S-2',
    command: 'cmd.deployAdminControl()',
    dependencies: ['MB-002', 'MB-003'],
    reflexScore: 92,
    status: 'trust-lock',
    createdAt: Date.now() - 86400000 * 3,
    lastUpdated: Date.now()
  },
  {
    id: 'MB-006',
    feature: 'ROI Calculator & Trust Core',
    description: 'Value communication and pricing validation',
    sprint: 'S-2',
    command: 'cmd.enableTrustCoreROI()',
    dependencies: ['MB-005'],
    reflexScore: 88,
    status: 'reflect',
    createdAt: Date.now() - 86400000 * 2,
    lastUpdated: Date.now()
  },
  {
    id: 'MB-007',
    feature: 'Dynamic Navigation System',
    description: 'Context-aware navigation with FOH/BOH toggle',
    sprint: 'S-3',
    command: 'cmd.deployDynamicNavigation()',
    dependencies: ['MB-005'],
    reflexScore: 73,
    status: 'activate',
    createdAt: Date.now() - 86400000 * 1,
    lastUpdated: Date.now()
  },
  {
    id: 'MB-008',
    feature: 'Reflexive Kanban Integration',
    description: 'Trust-scored development lifecycle tracking',
    sprint: 'S-3',
    command: 'cmd.enableReflexiveKanban()',
    dependencies: ['MB-005', 'MB-007'],
    reflexScore: 0,
    status: 'seed',
    createdAt: Date.now(),
    lastUpdated: Date.now()
  }
];

const AdminControlCenter = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<Record<string, number>>({});
  const [orderStats, setOrderStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    revenue: 0
  });
  const [topFlavors, setTopFlavors] = useState<Array<{ flavor: string; count: number }>>([]);
  const [flavorCombinations, setFlavorCombinations] = useState<Array<{ combination: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [reflexCards, setReflexCards] = useState<ReflexCard[]>(REFLEX_ROADMAP);

  // Refresh data
  const refreshData = () => {
    // Get all live data
    const allSessions = getAllSessions();
    const liveSessions = getLiveSessions();
    const allOrders = getLiveOrders();
    const statusCounts = getSessionsByStatus();
    
    setSessions(allSessions);
    setOrders(allOrders);
    setSessionStats(statusCounts);
    
    // Order statistics
    setOrderStats({
      total: allOrders.length,
      paid: getPaidOrderCount(),
      pending: getPendingOrderCount(),
      revenue: getTotalRevenue()
    });
    
    // Flavor analytics
    const flavors = getTopFlavors();
    const combinations = getFlavorMixLibrary();
    
    setTopFlavors(flavors || []);
    setFlavorCombinations(combinations || []);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSeedMultipleSessions = () => {
    setLoading(true);
    try {
      seedMultipleSessions();
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSingleSession = () => {
    setLoading(true);
    try {
      seedSession(`admin_${Date.now()}`, "T-ADMIN");
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  // Reflex Bloom Roadmap Functions
  const getStatusIcon = (status: ReflexCard['status']) => {
    const icons = {
      'seed': '🌱',
      'activate': '⚡',
      'reflect': '🔍',
      'trust-lock': '🔒',
      'bloomed': '🌸'
    };
    return icons[status];
  };

  const getStatusColor = (status: ReflexCard['status']) => {
    const colors = {
      'seed': 'bg-zinc-800 text-zinc-300',
      'activate': 'bg-blue-500/20 text-blue-300',
      'reflect': 'bg-yellow-500/20 text-yellow-300',
      'trust-lock': 'bg-purple-500/20 text-purple-300',
      'bloomed': 'bg-emerald-500/20 text-emerald-300'
    };
    return colors[status];
  };

  const getSprintColor = (sprint: string) => {
    const colors: Record<string, string> = {
      'S-0': 'bg-red-500/20 text-red-300',
      'S-1': 'bg-orange-500/20 text-orange-300',
      'S-2': 'bg-yellow-500/20 text-yellow-300',
      'S-3': 'bg-green-500/20 text-green-300'
    };
    return colors[sprint] || 'bg-zinc-800 text-zinc-400';
  };

  const handleCardStatusChange = (cardId: string, newStatus: ReflexCard['status']) => {
    setReflexCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, status: newStatus, lastUpdated: Date.now() }
        : card
    ));
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-zinc-800 text-zinc-300",
      PAID_CONFIRMED: "bg-teal-500/20 text-teal-300",
      PREP_IN_PROGRESS: "bg-orange-500/20 text-orange-300",
      HEAT_UP: "bg-red-500/20 text-red-300",
      READY_FOR_DELIVERY: "bg-emerald-500/20 text-emerald-300",
      OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-300",
      DELIVERED: "bg-purple-500/20 text-purple-300",
      ACTIVE: "bg-emerald-500/20 text-emerald-300",
      CLOSE_PENDING: "bg-yellow-500/20 text-yellow-300",
      CLOSED: "bg-zinc-800 text-zinc-400",
      STAFF_HOLD: "bg-yellow-500/20 text-yellow-300",
      STOCK_BLOCKED: "bg-red-500/20 text-red-300"
    };
    return colors[state] || "bg-zinc-800 text-zinc-400";
  };

  const getStateIcon = (state: string) => {
    const icons: Record<string, string> = {
      NEW: "🆕",
      PAID_CONFIRMED: "💰",
      PREP_IN_PROGRESS: "🔧",
      HEAT_UP: "🔥",
      READY_FOR_DELIVERY: "✅",
      OUT_FOR_DELIVERY: "🚚",
      DELIVERED: "🎯",
      ACTIVE: "🍃",
      CLOSE_PENDING: "⏰",
      CLOSED: "🔒",
      STAFF_HOLD: "⏸️",
      STOCK_BLOCKED: "🚫"
    };
    return icons[state] || "❓";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Admin Control Center</h1>
          <p className="text-zinc-400">Live Session Management & Analytics Dashboard</p>
        </div>

        {/* 🌀 Reflex Bloom Roadmap - Reflexive Kanban Integration */}
        <div className="mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-teal-400">🌀 Reflex Bloom Roadmap</h2>
              <div className="text-sm text-zinc-400">
                MVP Launch - Reflexive Kanban Flow
              </div>
            </div>

            {/* Reflex States Kanban Board */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {/* 🌱 Seed */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-sm font-medium text-zinc-300">Seed</div>
                  <div className="text-xs text-zinc-500">
                    {reflexCards.filter(c => c.status === 'seed').length} cards
                  </div>
                </div>
                <div className="space-y-2">
                  {reflexCards.filter(c => c.status === 'seed').map(card => (
                    <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{card.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSprintColor(card.sprint)}`}>
                          {card.sprint}
                        </span>
                      </div>
                      <div className="text-zinc-300 mb-2">{card.feature}</div>
                      <div className="text-zinc-500 text-xs mb-2">{card.command}</div>
                      <button
                        onClick={() => handleCardStatusChange(card.id, 'activate')}
                        className="w-full bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition-colors"
                      >
                        ⚡ Activate
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⚡ Activate */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-sm font-medium text-zinc-300">Activate</div>
                  <div className="text-xs text-zinc-500">
                    {reflexCards.filter(c => c.status === 'activate').length} cards
                  </div>
                </div>
                <div className="space-y-2">
                  {reflexCards.filter(c => c.status === 'activate').map(card => (
                    <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{card.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSprintColor(card.sprint)}`}>
                          {card.sprint}
                        </span>
                      </div>
                      <div className="text-zinc-300 mb-2">{card.feature}</div>
                      <div className="text-zinc-500 text-xs mb-2">Reflex Score: {card.reflexScore}</div>
                      <button
                        onClick={() => handleCardStatusChange(card.id, 'reflect')}
                        className="w-full bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                      >
                        🔍 Reflect
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔍 Reflect */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">🔍</div>
                  <div className="text-sm font-medium text-zinc-300">Reflect</div>
                  <div className="text-xs text-zinc-500">
                    {reflexCards.filter(c => c.status === 'reflect').length} cards
                  </div>
                </div>
                <div className="space-y-2">
                  {reflexCards.filter(c => c.status === 'reflect').map(card => (
                    <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{card.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSprintColor(card.sprint)}`}>
                          {card.sprint}
                        </span>
                      </div>
                      <div className="text-zinc-300 mb-2">{card.feature}</div>
                      <div className="text-zinc-500 text-xs mb-2">Reflex Score: {card.reflexScore}</div>
                      <button
                        onClick={() => handleCardStatusChange(card.id, 'trust-lock')}
                        className="w-full bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs hover:bg-purple-500/30 transition-colors"
                      >
                        🔒 Trust Lock
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔒 Trust Lock */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-sm font-medium text-zinc-300">Trust Lock</div>
                  <div className="text-xs text-zinc-500">
                    {reflexCards.filter(c => c.status === 'trust-lock').length} cards
                  </div>
                </div>
                <div className="space-y-2">
                  {reflexCards.filter(c => c.status === 'trust-lock').map(card => (
                    <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{card.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSprintColor(card.sprint)}`}>
                          {card.sprint}
                        </span>
                      </div>
                      <div className="text-zinc-300 mb-2">{card.feature}</div>
                      <div className="text-zinc-500 text-xs mb-2">Reflex Score: {card.reflexScore}</div>
                      <button
                        onClick={() => handleCardStatusChange(card.id, 'bloomed')}
                        className="w-full bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition-colors"
                      >
                        🌸 Bloom
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🌸 Bloomed */}
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-1">🌸</div>
                  <div className="text-sm font-medium text-zinc-300">Bloomed</div>
                  <div className="text-xs text-zinc-500">
                    {reflexCards.filter(c => c.status === 'bloomed').length} cards
                  </div>
                </div>
                <div className="space-y-2">
                  {reflexCards.filter(c => c.status === 'bloomed').map(card => (
                    <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{card.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSprintColor(card.sprint)}`}>
                          {card.sprint}
                        </span>
                      </div>
                      <div className="text-zinc-300 mb-2">{card.feature}</div>
                      <div className="text-zinc-500 text-xs mb-2">Bloomed: {new Date(card.lastUpdated).toLocaleDateString()}</div>
                      <div className="text-emerald-400 text-xs">✅ Complete</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sprint Lanes */}
            <div className="grid grid-cols-4 gap-4">
              {['S-0', 'S-1', 'S-2', 'S-3'].map(sprint => (
                <div key={sprint} className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                  <div className="text-center mb-3">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSprintColor(sprint)}`}>
                      {sprint}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {reflexCards.filter(c => c.sprint === sprint).length} features
                    </div>
                  </div>
                  <div className="space-y-2">
                    {reflexCards.filter(c => c.sprint === sprint).map(card => (
                      <div key={card.id} className="bg-zinc-900 rounded border border-zinc-600 p-2 text-xs">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(card.status)}`}>
                            {getStatusIcon(card.status)}
                          </span>
                          <span className="font-medium text-white">{card.id}</span>
                        </div>
                        <div className="text-zinc-300 text-xs">{card.feature}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bloom Log Summary */}
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold text-teal-300 mb-3">🌸 Bloom Log Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl text-emerald-400">{reflexCards.filter(c => c.status === 'bloomed').length}</div>
                  <div className="text-zinc-400">Bloomed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-purple-400">{reflexCards.filter(c => c.status === 'trust-lock').length}</div>
                  <div className="text-zinc-400">Trust Locked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-blue-400">{reflexCards.filter(c => c.status === 'activate').length}</div>
                  <div className="text-zinc-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-zinc-400">{reflexCards.filter(c => c.status === 'seed').length}</div>
                  <div className="text-zinc-400">Seeded</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Control Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSeedMultipleSessions}
              disabled={loading}
              className="bg-teal-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-teal-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Seed 10 Demo Sessions"}
            </button>
            <button
              onClick={handleSeedSingleSession}
              disabled={loading}
              className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : "Seed Single Session"}
            </button>
            <button
              onClick={refreshData}
              className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <span className="text-2xl">🍃</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Sessions</p>
                <p className="text-2xl font-semibold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Live Sessions</p>
                <p className="text-2xl font-semibold text-white">{sessions.filter(s => !["CLOSED", "REFUNDED", "VOIDED"].includes(s.state)).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Orders</p>
                <p className="text-2xl font-semibold text-white">{orderStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Revenue</p>
                <p className="text-2xl font-semibold text-white">${(orderStats.revenue / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Session Status Breakdown */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Session Status Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(sessionStats)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStateIcon(state)}</span>
                      <span className="text-sm font-medium text-zinc-300">
                        {state.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Flavors */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Top Flavors</h3>
            {topFlavors.length > 0 ? (
              <div className="space-y-3">
                {topFlavors.map((item, index) => (
                  <div key={item.flavor} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">#{index + 1}</span>
                      <span className="text-sm font-medium text-zinc-300">{item.flavor}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300">
                      {item.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No flavor data available</p>
            )}
          </div>
        </div>

        {/* Live Sessions Table */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Live Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 bg-zinc-800">
                <tr>
                  <th className="p-3 text-left">Session ID</th>
                  <th className="p-3 text-left">Table</th>
                  <th className="p-3 text-left">State</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Created</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <tr key={session.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-3 font-mono text-xs text-zinc-300">{session.id.slice(0, 12)}...</td>
                      <td className="p-3 font-medium text-white">{session.table}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                          {getStateIcon(session.state)} {session.state.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {session.meta.customerId ? (
                          <div className="text-xs">
                            <div className="font-medium text-white">{session.meta.customerId}</div>
                            {session.flags.vip && <div className="text-yellow-400">VIP</div>}
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          session.payment.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {session.payment.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-zinc-400">
                        {session.audit.length > 0 ? 
                          new Date(session.audit[0].ts).toLocaleTimeString() : 
                          'N/A'
                        }
                      </td>
                      <td className="p-3">
                        <button className="text-teal-400 hover:text-teal-300 text-xs transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      <div className="space-y-2">
                        <div className="text-4xl">🍃</div>
                        <div>No sessions available</div>
                        <div className="text-sm">Use the control actions above to seed demo data</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flavor Combinations */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Popular Flavor Combinations</h3>
          {flavorCombinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavorCombinations.slice(0, 9).map((item, index) => (
                <div key={item.combination} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">#{index + 1}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300">
                      {item.count}x
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{item.combination}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No flavor combination data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminControlCenter;
