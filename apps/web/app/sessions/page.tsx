"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  tableId: string;
  flavor: string;
  amount: number;
  status: "active" | "paused" | "completed" | "cancelled";
  createdAt: number;
  sessionStartTime: number;
  sessionDuration: number;
  coalStatus: "active" | "needs_refill" | "burnt_out";
  customerName: string;
  tableType: "table" | "booth" | "bar" | "sectional";
  deliveryStatus: "preparing" | "ready" | "delivered";
  totalRevenue: number;
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'analytics'>('active');
  const [refillTimers, setRefillTimers] = useState<Record<string, number>>({});

  // Load real-time sessions from customer journey
  useEffect(() => {
    const loadRealTimeSessions = async () => {
      try {
        const response = await fetch('/api/customer-journey?action=active');
        const result = await response.json();
        
        if (result.success && result.data) {
          const realSessions: Session[] = result.data.map((booking: any) => ({
            id: booking.id,
            tableId: booking.tableId,
            flavor: booking.flavorMix,
            amount: Math.round(booking.totalPrice * 100), // Convert to cents
            status: mapBookingStatusToSession(booking.status),
            createdAt: new Date(booking.createdAt).getTime(),
            sessionStartTime: booking.sessionStartTime ? new Date(booking.sessionStartTime).getTime() : undefined,
            sessionDuration: booking.actualSessionTime || 0,
            coalStatus: 'active' as const,
            customerName: booking.customerName,
            tableType: booking.tableType,
            deliveryStatus: mapBookingStageToDelivery(booking.currentStage),
            totalRevenue: Math.round(booking.totalPrice * 100)
          }));
          
          setSessions(realSessions);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error('Failed to load real-time sessions:', error);
        setSessions([]);
      }
    };

    loadRealTimeSessions();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadRealTimeSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const mapBookingStatusToSession = (status: string): 'active' | 'completed' | 'paused' => {
    switch (status) {
      case 'active': return 'active';
      case 'completed': return 'completed';
      case 'paused': return 'paused';
      default: return 'active';
    }
  };

  const mapBookingStageToDelivery = (stage: string): 'preparing' | 'ready' | 'delivered' => {
    switch (stage) {
      case 'prep': return 'preparing';
      case 'delivery': return 'ready';
      case 'service': return 'delivered';
      default: return 'preparing';
    }
  };

  // Demo sessions removed - now using real-time data from customer journey

  // Update refill timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRefillTimers(prev => {
        const updated = { ...prev };
        sessions.forEach(session => {
          if (session.coalStatus === 'needs_refill') {
            updated[session.id] = (updated[session.id] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getCoalStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'needs_refill': return 'text-yellow-400';
      case 'burnt_out': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const handleCoalRefill = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, coalStatus: 'active' as const }
        : session
    ));
    setRefillTimers(prev => ({ ...prev, [sessionId]: 0 }));
  };

  const handleSessionPause = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'paused' as const }
        : session
    ));
  };

  const handleSessionResume = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'active' as const }
        : session
    ));
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalRevenue = sessions.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Session Management</h1>
              <p className="text-zinc-400">Monitor and manage active hookah sessions</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
              <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white">{activeSessions.length}</div>
            <div className="text-sm text-zinc-400">Active Sessions</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-zinc-400">Total Revenue</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">{activeSessions.length > 0 ? formatDuration(activeSessions[0].sessionDuration) : '0h 0m'}</div>
            <div className="text-sm text-zinc-400">Avg Duration</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🪑</div>
            <div className="text-2xl font-bold text-white">{sessions.filter(s => s.deliveryStatus === 'ready').length}</div>
            <div className="text-sm text-zinc-400">Ready for Delivery</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'active', label: '🔥 Active Sessions', count: activeSessions.length },
            { id: 'completed', label: '✅ Completed', count: completedSessions.length },
            { id: 'analytics', label: '📊 Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Active Sessions Tab */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">🍃</div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-300">Table {session.tableId}</h3>
                      <p className="text-zinc-400">{session.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.toUpperCase()}
                    </div>
                    <div className="text-zinc-400">{formatCurrency(session.amount)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Flavor:</span>
                    <div className="text-teal-300 font-medium">{session.flavor}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Duration:</span>
                    <div className="text-teal-300 font-medium">{formatDuration(session.sessionDuration)}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Table Type:</span>
                    <div className="text-teal-300 font-medium capitalize">{session.tableType}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Coal Status:</span>
                      <span className={`${getCoalStatusColor(session.coalStatus)} font-medium`}>
                        {session.coalStatus.replace('_', ' ')}
                      </span>
                    </div>
                    {session.coalStatus === 'needs_refill' && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⏰</span>
                        <span className="text-yellow-400">{refillTimers[session.id] || 0}s</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {session.coalStatus === 'needs_refill' && (
                      <button
                        onClick={() => handleCoalRefill(session.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        🔥 Refill Coals
                      </button>
                    )}
                    {session.status === 'active' ? (
                      <button
                        onClick={() => handleSessionPause(session.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        ⏸️ Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSessionResume(session.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        ▶️ Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Sessions Tab */}
        {activeTab === 'completed' && (
          <div className="space-y-6">
            {completedSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl text-zinc-400">No completed sessions yet</h3>
                <p className="text-zinc-500">Completed sessions will appear here</p>
              </div>
            ) : (
              completedSessions.map((session) => (
                <div key={session.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">✅</div>
                      <div>
                        <h3 className="text-lg font-semibold text-teal-300">Table {session.tableId}</h3>
                        <p className="text-zinc-400">{session.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-teal-300 font-medium">{formatCurrency(session.amount)}</div>
                      <div className="text-zinc-400 text-sm">{formatDuration(session.sessionDuration)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Session Statistics */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Session Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-300 mb-2">{sessions.length}</div>
                  <div className="text-zinc-400">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">{formatCurrency(totalRevenue)}</div>
                  <div className="text-zinc-400">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">{activeSessions.length}</div>
                  <div className="text-zinc-400">Currently Active</div>
                </div>
              </div>
            </div>

            {/* Popular Flavors */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Popular Flavors</h3>
              <div className="space-y-3">
                {Object.entries(
                  sessions.reduce((acc, session) => {
                    acc[session.flavor] = (acc[session.flavor] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([flavor, count]) => (
                  <div key={flavor} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <span className="text-teal-300">{flavor}</span>
                    <span className="text-zinc-400">{count} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
