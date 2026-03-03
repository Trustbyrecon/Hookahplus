'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Activity,
  Brain,
  Target,
  Shield
} from 'lucide-react';
import { cn } from '../utils/cn';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface RealTimeEvent {
  id: string;
  timestamp: Date;
  type: 'page_view' | 'conversion' | 'engagement' | 'error' | 'ai_agent';
  app: 'guest' | 'app' | 'site';
  details: string;
  value?: number;
}

const RealTimeAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'page_views',
      name: 'Page Views',
      value: 1247,
      change: 12.5,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'conversions',
      name: 'Conversions',
      value: 89,
      change: 8.3,
      trend: 'up',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: 156,
      change: -2.1,
      trend: 'down',
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-400'
    },
    {
      id: 'ai_interactions',
      name: 'AI Interactions',
      value: 234,
      change: 15.7,
      trend: 'up',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-orange-400'
    }
  ]);

  const [realtimeEvents, setRealtimeEvents] = useState<RealTimeEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000),
      type: 'page_view',
      app: 'guest',
      details: 'Guest portal loaded',
      value: 1
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 2000),
      type: 'conversion',
      app: 'site',
      details: 'Support contact form submitted',
      value: 5
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3000),
      type: 'ai_agent',
      app: 'app',
      details: 'Flow Constant Λ∞ updated',
      value: 0.87
    }
  ]);

  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 3),
        change: metric.change + (Math.random() - 0.5) * 2
      })));

      // Add new events
      const eventTypes: RealTimeEvent['type'][] = ['page_view', 'conversion', 'engagement', 'ai_agent'];
      const apps: RealTimeEvent['app'][] = ['guest', 'app', 'site'];
      
      const newEvent: RealTimeEvent = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        app: apps[Math.floor(Math.random() * apps.length)],
        details: `Real-time ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} event`,
        value: Math.floor(Math.random() * 10)
      };

      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4" />;
      case 'conversion': return <Target className="w-4 h-4" />;
      case 'engagement': return <Activity className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'ai_agent': return <Brain className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'page_view': return 'text-blue-400';
      case 'conversion': return 'text-green-400';
      case 'engagement': return 'text-purple-400';
      case 'error': return 'text-red-400';
      case 'ai_agent': return 'text-orange-400';
      default: return 'text-zinc-400';
    }
  };

  const getAppColor = (app: RealTimeEvent['app']) => {
    switch (app) {
      case 'guest': return 'bg-blue-500/20 text-blue-400';
      case 'app': return 'bg-purple-500/20 text-purple-400';
      case 'site': return 'bg-green-500/20 text-green-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Real-Time Analytics Dashboard</h1>
              <p className="text-zinc-400">Live monitoring of Hookah+ ecosystem performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )} />
                <span className="text-sm text-zinc-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-zinc-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-lg bg-zinc-700/50", metric.color)}>
                  {metric.icon}
                </div>
                <div className={cn(
                  "flex items-center space-x-1 text-sm",
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                )}>
                  <TrendingUp className={cn(
                    "w-4 h-4",
                    metric.trend === 'down' && "rotate-180"
                  )} />
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-400">{metric.name}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-Time Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Events Feed */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Live Events Feed</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-zinc-400">Live</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {realtimeEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-3 p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50"
                  >
                    <div className={cn("p-2 rounded-lg", getEventColor(event.type))}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {event.details}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          getAppColor(event.app)
                        )}>
                          {event.app}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{event.timestamp.toLocaleTimeString()}</span>
                        {event.value && (
                          <>
                            <span>•</span>
                            <span>Value: {event.value}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">System Status</h2>
            
            <div className="space-y-4">
              {/* GA4 Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Google Analytics 4</div>
                    <div className="text-xs text-zinc-400">Tracking active</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              {/* AI Agents Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm font-medium text-white">AI Agents</div>
                    <div className="text-xs text-zinc-400">3 agents active</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              {/* Flow Constant Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Flow Constant Λ∞</div>
                    <div className="text-xs text-zinc-400">0.87 (High resonance)</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>

              {/* Trust-Lock Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-teal-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Trust-Lock Security</div>
                    <div className="text-xs text-zinc-400">TLH-v1::active</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
