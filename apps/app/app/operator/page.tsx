// app/operator/page.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Play, 
  Layout, 
  RefreshCw, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp, 
  Activity, 
  Eye, 
  EyeOff, 
  Menu, 
  X, 
  ChevronDown, 
  Star, 
  Crown, 
  Target, 
  Brain, 
  Heart, 
  Coffee, 
  Wind, 
  Sparkles
} from "lucide-react";
import Ktl4StatusDashboard from '@/components/Ktl4StatusDashboard';

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    window.dispatchEvent(
      new CustomEvent("reflex-agent-log", {
        detail: { agentId, trustLevel, routeName, sessionContext },
      })
    );

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function OperatorPage() {
  useReflexAgent("Operator");
  const [activeSessions, setActiveSessions] = useState(12);
  const [totalRevenue, setTotalRevenue] = useState(2847);
  const [systemHealth, setSystemHealth] = useState(98);
  const [trustScore, setTrustScore] = useState(87);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions(prev => prev + Math.floor(Math.random() * 3) - 1);
      setTotalRevenue(prev => prev + Math.floor(Math.random() * 50));
      setSystemHealth(prev => Math.max(95, Math.min(100, prev + Math.floor(Math.random() * 6) - 3)));
      setTrustScore(prev => Math.max(80, Math.min(95, prev + Math.floor(Math.random() * 4) - 2)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      id: 'start-session',
      title: 'Start New Session',
      description: 'Launch a new hookah session',
      icon: <Play className="w-6 h-6" />,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      action: () => window.location.href = '/fire-session-dashboard'
    },
    {
      id: 'layout-manager',
      title: 'Lounge Layout Manager',
      description: 'Configure table arrangements',
      icon: <Layout className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-500',
      action: () => window.location.href = '/layout-preview'
    },
    {
      id: 'pricing-intelligence',
      title: 'Pricing Intelligence',
      description: 'Revenue optimization & pricing strategy',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-violet-600 hover:bg-violet-500',
      action: () => window.location.href = '/pricing'
    },
    {
      id: 'sync-logs',
      title: 'Sync Business Intelligence',
      description: 'Update customer insights & patterns',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'bg-purple-600 hover:bg-purple-500',
      action: async () => {
        // Trigger Aliethia Memory Layer sync
        const syncButton = document.querySelector('[data-action="sync-logs"]') as HTMLButtonElement;
        if (syncButton) {
          syncButton.innerHTML = '<RefreshCw className="w-6 h-6 animate-spin" /> Syncing...';
          syncButton.disabled = true;
        }

        try {
          const response = await fetch('/api/reflex/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timestamp: Date.now(),
              source: 'operator-dashboard',
              layers: ['recursion', 'silent-fingerprints', 'mirrors', 'rhythm-guard', 'seeded-futures']
            })
          });

          const result = await response.json();
          
          if (result.success) {
            // Update trust score and system health with sync results
            setTrustScore(result.data.trustScore);
            setSystemHealth(result.data.systemHealth);
            
            // Dispatch sync complete event
            window.dispatchEvent(new CustomEvent('reflex-sync-complete', {
              detail: result.data
            }));

            if (syncButton) {
              syncButton.innerHTML = '<RefreshCw className="w-6 h-6" /> Intelligence Updated ✓';
              setTimeout(() => {
                syncButton.innerHTML = '<RefreshCw className="w-6 h-6" /> Sync Business Intelligence';
                syncButton.disabled = false;
              }, 2000);
            }
          } else {
            throw new Error(result.error || 'Sync failed');
          }
        } catch (error) {
          console.error('Reflex sync error:', error);
          if (syncButton) {
            syncButton.innerHTML = '<RefreshCw className="w-6 h-6" /> Sync Failed';
            setTimeout(() => {
              syncButton.innerHTML = '<RefreshCw className="w-6 h-6" /> Sync Business Intelligence';
              syncButton.disabled = false;
            }, 2000);
          }
        }
      }
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View performance metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-orange-600 hover:bg-orange-500',
      action: () => window.location.href = '/fire-session-dashboard'
    }
  ];

  const metrics = [
    {
      title: 'Active Sessions',
      value: activeSessions,
      change: '+3',
      changeType: 'positive',
      icon: <Users className="w-5 h-5" />,
      color: 'text-emerald-400'
    },
    {
      title: 'Today\'s Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12%',
      changeType: 'positive',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      title: 'System Health',
      value: `${systemHealth}%`,
      change: '+2%',
      changeType: 'positive',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      title: 'Trust Score',
      value: trustScore,
      change: '+5',
      changeType: 'positive',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Session T-007 started', time: '2 min ago', type: 'session' },
    { id: 2, action: 'Payment processed for T-003', time: '5 min ago', type: 'payment' },
    { id: 3, action: 'Layout updated - VIP section', time: '12 min ago', type: 'layout' },
    { id: 4, action: 'Reflex logs synchronized', time: '18 min ago', type: 'system' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hookah+ Operator Dashboard</h1>
                <p className="text-sm text-zinc-400">Enterprise-grade lounge management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                <a href="/" className="text-zinc-300 hover:text-white transition-colors text-sm">
                  Dashboard
                </a>
                <a href="/pricing" className="text-zinc-300 hover:text-white transition-colors text-sm">
                  Pricing Intelligence
                </a>
                <a href="/admin/reflex" className="text-zinc-300 hover:text-white transition-colors text-sm">
                  Event Analytics
                </a>
              </div>

              {/* Live Mode Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isLiveMode ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {isLiveMode ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>

              {/* Notifications */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-zinc-400" />
                {showNotifications && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-zinc-700 ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-sm text-zinc-400">{metric.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Quick Actions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                data-action={action.id}
                className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  {action.icon}
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                </div>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* KTL-4 Keep-The-Lights-On Status */}
        <div className="mb-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
            <Ktl4StatusDashboard />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'session' ? 'bg-emerald-400' :
                        activity.type === 'payment' ? 'bg-green-400' :
                        activity.type === 'layout' ? 'bg-blue-400' :
                        'bg-purple-400'
                      }`}></div>
                      <span className="text-white">{activity.action}</span>
                    </div>
                    <span className="text-sm text-zinc-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div>
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Lounge Intelligence Status</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Customer Flow Optimization</span>
                  <span className="text-emerald-400 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Revenue Pattern Recognition</span>
                  <span className="text-blue-400 font-medium">Learning</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Staff Efficiency Tracking</span>
                  <span className="text-purple-400 font-medium">Monitoring</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Predictive Insights</span>
                  <span className="text-orange-400 font-medium">Generating</span>
                </div>
              </div>
            </div>

            {/* Trust Score Visualization */}
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Business Intelligence Score</span>
              </h3>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-zinc-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${trustScore * 2.51} 251`}
                      className="text-emerald-400 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{trustScore}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-2">System Intelligence Level</p>
                <div className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                  {trustScore >= 90 ? "🎯 Peak Performance" : 
                   trustScore >= 85 ? "🚀 High Efficiency" : 
                   trustScore >= 80 ? "✅ Good Standing" : "⚠️ Needs Attention"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
