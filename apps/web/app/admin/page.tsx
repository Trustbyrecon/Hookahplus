"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Types
export type KPIs = {
  sessions: number;
  revenue: number; // USD
  avgMarginPct: number; // 0..100
  trustScore: number; // 0..100
};

export type MarginRow = {
  id: string;
  item: string; // flavor / product name
  price: number; // selling price
  cost: number; // unit cost
  sold: number; // count in period
};

export type TrustPoint = { t: string; score: number };

export type DeployState = {
  env: "dev" | "staging" | "prod";
  buildStatus: "idle" | "queued" | "building" | "success" | "failed";
  lastDeployedAt?: string;
  version?: string;
};

// Mock data
const MOCK_KPIS: KPIs = { sessions: 182, revenue: 5430, avgMarginPct: 41.7, trustScore: 83 };
const MOCK_MARGINS: MarginRow[] = [
  { id: "m1", item: "Mint Storm", price: 32, cost: 11, sold: 58 },
  { id: "m2", item: "Blue Mist", price: 30, cost: 10, sold: 46 },
  { id: "m3", item: "Double Apple", price: 34, cost: 13, sold: 39 },
  { id: "m4", item: "Grape Burst", price: 28, cost: 9, sold: 27 },
  { id: "m5", item: "Peach Wave", price: 33, cost: 12, sold: 24 },
];
const MOCK_TRUST: TrustPoint[] = [
  { t: "Mon", score: 78 },
  { t: "Tue", score: 81 },
  { t: "Wed", score: 79 },
  { t: "Thu", score: 85 },
  { t: "Fri", score: 88 },
  { t: "Sat", score: 84 },
  { t: "Sun", score: 83 },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'analytics' | 'control'>('overview');
  const [deployState, setDeployState] = useState<DeployState>({
    env: 'prod',
    buildStatus: 'success',
    lastDeployedAt: new Date().toISOString(),
    version: '1.0.0'
  });

  // Auto-refresh for monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      console.log('[Admin] Refreshing monitoring data...');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'building': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'building': return '🔨';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Admin Control Center</h1>
              <p className="text-zinc-400">Hookah+ System Management & Monitoring</p>
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
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'monitoring', label: '🔍 Monitoring', icon: '🔍' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' },
            { id: 'control', label: '⚙️ Control', icon: '⚙️' }
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
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-white">{MOCK_KPIS.sessions}</div>
                <div className="text-sm text-zinc-400">Active Sessions</div>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-white">${MOCK_KPIS.revenue}</div>
                <div className="text-sm text-zinc-400">Revenue Today</div>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-white">{MOCK_KPIS.avgMarginPct}%</div>
                <div className="text-sm text-zinc-400">Avg Margin</div>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-2xl font-bold text-white">{MOCK_KPIS.trustScore}</div>
                <div className="text-sm text-zinc-400">Trust Score</div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✅</span>
                  <span>API Gateway</span>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Database</span>
                  <span className="text-green-400 text-sm">Connected</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✅</span>
                  <span>Stripe Integration</span>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-8">
            {/* Trust Score Chart */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Trust Score Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {MOCK_TRUST.map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-teal-500 rounded-t transition-all hover:bg-teal-400"
                      style={{ height: `${(point.score / 100) * 200}px` }}
                    ></div>
                    <div className="text-xs text-zinc-400 mt-2">{point.t}</div>
                    <div className="text-xs text-teal-400">{point.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', action: 'New order placed', table: 'T-003', amount: '$28.00' },
                  { time: '5 min ago', action: 'Session started', table: 'T-001', amount: '$30.00' },
                  { time: '8 min ago', action: 'Payment completed', table: 'T-007', amount: '$32.00' },
                  { time: '12 min ago', action: 'Customer arrived', table: 'T-005', amount: '-' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-teal-400">📝</span>
                      <span>{activity.action}</span>
                      <span className="text-zinc-400">Table {activity.table}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">{activity.time}</div>
                      <div className="text-teal-400">{activity.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Profit Margins */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Profit Margins</h3>
              <div className="space-y-3">
                {MOCK_MARGINS.map((item) => {
                  const margin = item.price - item.cost;
                  const marginPct = (margin / item.price) * 100;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-teal-400">🍃</span>
                        <span>{item.item}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">${item.price} - ${item.cost} = ${margin}</div>
                        <div className="text-teal-400">{marginPct.toFixed(1)}% margin</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-300 mb-2">$5,430</div>
                  <div className="text-zinc-400">Today's Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">$38,240</div>
                  <div className="text-zinc-400">This Week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Tab */}
        {activeTab === 'control' && (
          <div className="space-y-8">
            {/* Deployment Status */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Deployment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Environment:</span>
                  <span className="text-teal-400">{deployState.env.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Build Status:</span>
                  <span className={`${getStatusColor(deployState.buildStatus)}`}>
                    {getStatusIcon(deployState.buildStatus)} {deployState.buildStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Version:</span>
                  <span className="text-teal-400">{deployState.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Deployed:</span>
                  <span className="text-zinc-400">
                    {deployState.lastDeployedAt ? new Date(deployState.lastDeployedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* System Controls */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">System Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors">
                  🔄 Refresh Data
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                  📊 Export Report
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition-colors">
                  ⚠️ Maintenance Mode
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors">
                  🚨 Emergency Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
