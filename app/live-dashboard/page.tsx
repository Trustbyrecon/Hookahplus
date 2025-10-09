"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LiveSession {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  status: 'active' | 'needs_refill' | 'completed';
  duration: number;
  revenue: number;
  position: { x: number; y: number };
}

export default function LiveDashboard() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setTimeout(() => setIsVisible(true), 100);

    // Generate mock lounge sessions
    const mockSessions: LiveSession[] = [
      {
        id: 'session_001',
        tableId: 'T-001',
        customerName: 'Mike Johnson',
        flavor: 'Grape + Mint',
        status: 'active',
        duration: 45,
        revenue: 35.00,
        position: { x: 20, y: 30 }
      },
      {
        id: 'session_002',
        tableId: 'T-003',
        customerName: 'Sarah Chen',
        flavor: 'Strawberry + Vanilla',
        status: 'needs_refill',
        duration: 78,
        revenue: 42.00,
        position: { x: 60, y: 25 }
      },
      {
        id: 'session_003',
        tableId: 'B-001',
        customerName: 'Carlos Martinez',
        flavor: 'Coconut + Pineapple',
        status: 'active',
        duration: 32,
        revenue: 28.00,
        position: { x: 80, y: 40 }
      }
    ];

    setSessions(mockSessions);
    setRevenue(105.00);

    // Simulate revenue tick-up
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.random() * 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-400 bg-green-400/20',
      needs_refill: 'text-yellow-400 bg-yellow-400/20',
      completed: 'text-blue-400 bg-blue-400/20'
    };
    return colors[status as keyof typeof colors] || 'text-zinc-400 bg-zinc-400/20';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: '🍃',
      needs_refill: '⏰',
      completed: '✅'
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
    } text-white`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border-b border-zinc-700 p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌿</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-teal-400">HOOKAH+</h1>
                <h2 className="text-xl text-zinc-300">Live Dashboard</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-700 hover:bg-zinc-600' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <div className="text-right">
                <div className="text-sm text-zinc-400">Live Revenue</div>
                <div className="text-2xl font-bold text-green-400">${revenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Operational Showcase - Mock Lounge */}
        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-zinc-700 rounded-xl p-6`}>
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Live Lounge Operations</h3>
          <div className="relative bg-zinc-800 rounded-xl p-8 min-h-96">
            {/* Lounge Layout Visualization */}
            <div className="grid grid-cols-4 gap-4 h-80">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`relative rounded-lg border-2 p-4 transition-all duration-500 ${
                    session.status === 'active' 
                      ? 'border-green-500 bg-green-500/10' 
                      : session.status === 'needs_refill'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-blue-500 bg-blue-500/10'
                  }`}
                  style={{
                    gridColumn: `${Math.floor(index / 2) + 1}`,
                    gridRow: `${(index % 2) + 1}`,
                    animation: session.status === 'active' ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getStatusIcon(session.status)}</div>
                    <div className="font-bold text-white text-sm">{session.tableId}</div>
                    <div className="text-xs text-zinc-400">{session.customerName}</div>
                    <div className="text-xs text-zinc-300">{session.flavor}</div>
                    <div className="text-xs text-green-400">${session.revenue.toFixed(2)}</div>
                    <div className="text-xs text-zinc-400">{session.duration}m</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Revenue Animation */}
            <div className="absolute top-4 right-4">
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 animate-pulse">
                <div className="text-green-400 font-bold text-lg">
                  +${(Math.random() * 5 + 1).toFixed(2)} just now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aliethia Memory */}
          <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-pink-500/30 rounded-xl p-6`}>
            <h3 className="text-xl font-semibold text-pink-300 mb-4 flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              Aliethia Memory
            </h3>
            <div className="space-y-3">
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                <div className="text-sm text-pink-200">Suggesting Mix...</div>
                <div className="text-xs text-pink-300">Grape + Mint for returning customer</div>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                <div className="text-sm text-pink-200">Learning Pattern...</div>
                <div className="text-xs text-pink-300">Peak hours: 8-10 PM</div>
              </div>
            </div>
          </div>

          {/* HiTrust Sentinel */}
          <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-blue-500/30 rounded-xl p-6`}>
            <h3 className="text-xl font-semibold text-blue-300 mb-4 flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              HiTrust Sentinel
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-sm text-blue-200">Verifying Transaction...</div>
                <div className="text-xs text-blue-300">Stripe payment confirmed</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-sm text-blue-200">Trust Score: 0.94</div>
                <div className="text-xs text-blue-300">All systems secure</div>
              </div>
            </div>
          </div>

          {/* EP Payments */}
          <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-green-500/30 rounded-xl p-6`}>
            <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-3">
              <span className="text-2xl">💳</span>
              EP Payments
            </h3>
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-sm text-green-200">Revenue Pulse +$45 just now</div>
                <div className="text-xs text-green-300">3 transactions processed</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-sm text-green-200">Stripe Status: Active</div>
                <div className="text-xs text-green-300">99.9% uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise-Grade Polish - Operator Sidebar */}
        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-zinc-700 rounded-xl p-6`}>
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Operator Control Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Sessions</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">Active Sessions</div>
                  <div className="text-lg font-bold text-white">{sessions.filter(s => s.status === 'active').length}</div>
                </button>
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">Needs Refill</div>
                  <div className="text-lg font-bold text-yellow-400">{sessions.filter(s => s.status === 'needs_refill').length}</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Staff Ops</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">FOH Status</div>
                  <div className="text-lg font-bold text-green-400">Online</div>
                </button>
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">BOH Status</div>
                  <div className="text-lg font-bold text-green-400">Online</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Admin</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">System Health</div>
                  <div className="text-lg font-bold text-green-400">99.9%</div>
                </button>
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">API Calls</div>
                  <div className="text-lg font-bold text-blue-400">1.2K/min</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Reports</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">Today's Revenue</div>
                  <div className="text-lg font-bold text-green-400">${revenue.toFixed(2)}</div>
                </button>
                <button className="w-full text-left p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                  <div className="text-sm text-zinc-300">Customer Count</div>
                  <div className="text-lg font-bold text-purple-400">{sessions.length}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Pulse Chart */}
        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-slate-800'} border border-zinc-700 rounded-xl p-6`}>
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">System Pulse</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-sm text-zinc-400">Uptime</div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '99.9%'}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1.2K</div>
              <div className="text-sm text-zinc-400">API Calls/min</div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">45ms</div>
              <div className="text-sm text-zinc-400">Avg Response</div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            📊 Full Dashboard
          </Link>
          <Link href="/demo" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            🎬 See Demo
          </Link>
          <Link href="/pre-order" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            📱 Pre-Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
