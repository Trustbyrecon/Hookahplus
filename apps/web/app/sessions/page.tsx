"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  status: string;
  createdAt: number;
  sessionStartTime?: number;
  sessionDuration?: number;
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  customerName?: string;
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth";
  deliveryStatus?: "preparing" | "ready" | "delivered";
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refillTimers, setRefillTimers] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error', timestamp: number}>>([]);

  // Generate demo sessions
  useEffect(() => {
    const demoSessions: Session[] = [
      {
        id: 'demo-1',
        tableId: 'T-7',
        flavor: 'Blue Mist',
        amount: 3200,
        status: 'active',
        createdAt: Date.now(),
        sessionStartTime: Date.now() - 1800000, // 30 minutes ago
        sessionDuration: 1800000,
        coalStatus: 'active',
        customerName: 'Demo Customer 1',
        tableType: 'table',
        deliveryStatus: 'delivered',
      },
      {
        id: 'demo-2',
        tableId: 'T-3',
        flavor: 'Mint Storm',
        amount: 3000,
        status: 'active',
        createdAt: Date.now(),
        sessionStartTime: Date.now() - 900000, // 15 minutes ago
        sessionDuration: 900000,
        coalStatus: 'needs_refill',
        customerName: 'Demo Customer 2',
        tableType: 'table',
        deliveryStatus: 'delivered',
      },
      {
        id: 'demo-3',
        tableId: 'Bar-1',
        flavor: 'Double Apple',
        amount: 2800,
        status: 'active',
        createdAt: Date.now(),
        sessionStartTime: Date.now() - 2700000, // 45 minutes ago
        sessionDuration: 2700000,
        coalStatus: 'burnt_out',
        customerName: 'Demo Customer 3',
        tableType: 'high_boy',
        deliveryStatus: 'delivered',
      }
    ];
    setSessions(demoSessions);
  }, []);

  // Auto-refresh timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRefillTimers(prev => {
        const updated: Record<string, number> = {};
        sessions.forEach(session => {
          if (session.coalStatus === 'active') {
            updated[session.id] = (prev[session.id] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
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

  const getCoalStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔥';
      case 'needs_refill': return '⚠️';
      case 'burnt_out': return '💀';
      default: return '❓';
    }
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const addNotification = (message: string, type: 'success' | 'error') => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleCoalRefill = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, coalStatus: 'active' as const }
        : session
    ));
    addNotification('Coal refilled successfully!', 'success');
  };

  const handleSessionEnd = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'completed' }
        : session
    ));
    addNotification('Session ended successfully!', 'success');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Sessions Dashboard</h1>
              <p className="text-zinc-400">Real-time session monitoring and management</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
              <Link href="/admin" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                ⚙️ Admin
              </Link>
              <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${
                  notification.type === 'success' 
                    ? 'bg-green-600/20 border border-green-500/50' 
                    : 'bg-red-600/20 border border-red-500/50'
                }`}
              >
                <span className={notification.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {notification.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-zinc-400">Active Sessions</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white">
              ${(sessions.reduce((sum, s) => sum + s.amount, 0) / 100).toFixed(2)}
            </div>
            <div className="text-sm text-zinc-400">Total Revenue</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">
              {sessions.filter(s => s.coalStatus === 'needs_refill').length}
            </div>
            <div className="text-sm text-zinc-400">Need Refill</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">
              {sessions.filter(s => s.coalStatus === 'burnt_out').length}
            </div>
            <div className="text-sm text-zinc-400">Burnt Out</div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-6">Active Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <div className="text-6xl mb-4">🫖</div>
              <p className="text-xl">No active sessions</p>
              <p className="text-sm">Sessions will appear here when customers start ordering</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sessions.map(session => (
                <div key={session.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  {/* Session Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🫖</span>
                      <span className="font-semibold text-teal-300">Table {session.tableId}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <p className="text-sm text-zinc-400">Customer</p>
                    <p className="font-medium">{session.customerName || 'Anonymous'}</p>
                  </div>

                  {/* Flavor & Amount */}
                  <div className="mb-3">
                    <p className="text-sm text-zinc-400">Flavor</p>
                    <p className="font-medium text-teal-300">{session.flavor}</p>
                    <p className="text-sm text-zinc-400">Amount: ${(session.amount / 100).toFixed(2)}</p>
                  </div>

                  {/* Session Duration */}
                  <div className="mb-3">
                    <p className="text-sm text-zinc-400">Duration</p>
                    <p className="font-medium">
                      {session.sessionStartTime 
                        ? formatDuration(Date.now() - session.sessionStartTime)
                        : 'Just started'
                      }
                    </p>
                  </div>

                  {/* Coal Status */}
                  <div className="mb-4">
                    <p className="text-sm text-zinc-400">Coal Status</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCoalStatusIcon(session.coalStatus || 'active')}</span>
                      <span className={`font-medium ${getCoalStatusColor(session.coalStatus || 'active')}`}>
                        {session.coalStatus || 'active'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {session.coalStatus === 'needs_refill' && (
                      <button
                        onClick={() => handleCoalRefill(session.id)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        🔥 Refill Coal
                      </button>
                    )}
                    {session.coalStatus === 'burnt_out' && (
                      <button
                        onClick={() => handleCoalRefill(session.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        🔥 Replace Coal
                      </button>
                    )}
                    <button
                      onClick={() => handleSessionEnd(session.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      ✅ End Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Layout Preview */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-8">
          <h2 className="text-xl font-semibold text-teal-300 mb-6">Lounge Layout</h2>
          <div className="bg-zinc-800 rounded-lg p-6">
            <div className="grid grid-cols-6 gap-4 text-center">
              {Array.from({ length: 18 }, (_, i) => {
                const tableId = i < 12 ? `T-${i + 1}` : `Bar-${i - 11}`;
                const session = sessions.find(s => s.tableId === tableId);
                const isActive = session && session.status === 'active';
                
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isActive 
                        ? 'border-teal-500 bg-teal-500/20' 
                        : 'border-zinc-600 bg-zinc-700/50'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {tableId}
                    </div>
                    {isActive && (
                      <div className="text-xs text-teal-400 mt-1">
                        {session?.flavor}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-sm text-zinc-400">
              <span className="inline-block w-4 h-4 bg-teal-500/20 border-2 border-teal-500 rounded mr-2"></span>
              Active Session
              <span className="inline-block w-4 h-4 bg-zinc-700/50 border-2 border-zinc-600 rounded ml-4 mr-2"></span>
              Available
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
