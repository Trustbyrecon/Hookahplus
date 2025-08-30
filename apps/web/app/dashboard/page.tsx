"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// AI Agent Collaboration Interface
interface DashboardState {
  currentWorkflow: 'onboarding' | 'data-generation' | 'session-management' | 'customer-journey' | 'optimization';
  activeRole: 'owner' | 'foh' | 'boh' | 'admin';
  dataStatus: 'empty' | 'populated' | 'active' | 'flowing';
  nextAction: string;
  progress: number;
  trustLockStatus: 'active' | 'pending' | 'verified';
  aiInsights: string[];
  humanFeedback: string[];
}

// Unified Session Interface
interface UnifiedSession {
  id: string;
  type: 'mobile' | 'staff' | 'demo';
  status: 'pending' | 'prep' | 'ready' | 'delivered' | 'active' | 'completed';
  table: string;
  customer: string;
  flavor: string;
  amount: number;
  duration: number;
  createdAt: Date;
  workflow: string[];
  priority: number;
}

const Dashboard = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentWorkflow: 'onboarding',
    activeRole: 'owner',
    dataStatus: 'empty',
    nextAction: '🎯 Welcome to Hookah+! Start by generating demo data to see the system in action',
    progress: 5,
    trustLockStatus: 'active',
    aiInsights: [
      'AI Agent: System ready for initial data generation',
      'AI Agent: Onboarding workflow prepared for new users',
      'AI Agent: Trust-Lock security layer active and verified'
    ],
    humanFeedback: [
      'Lounge Owner: "I need to see how this system works before committing"',
      'Staff Member: "Show me the workflow from customer order to delivery"',
      'Manager: "I want to understand the ROI and efficiency gains"'
    ]
  });

  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'sessions' | 'analytics' | 'workflow'>('overview');
  const [mobileOrderTimer, setMobileOrderTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // AI Agent Collaboration - Dynamic State Management
  useEffect(() => {
    const updateDashboardState = () => {
      if (sessions.length === 0) {
        setDashboardState(prev => ({
          ...prev,
          currentWorkflow: 'onboarding',
          nextAction: '🎯 Generate demo data to see live orders & sessions',
          progress: 5,
          aiInsights: [
            'AI Agent: System ready for initial data generation',
            'AI Agent: Onboarding workflow prepared for new users',
            'AI Agent: Trust-Lock security layer active and verified'
          ]
        }));
      } else if (sessions.length < 5) {
        setDashboardState(prev => ({
          ...prev,
          currentWorkflow: 'data-generation',
          nextAction: '📊 Generate more demo data to see full workflow',
          progress: 25,
          aiInsights: [
            'AI Agent: Initial data generated, ready for workflow demonstration',
            'AI Agent: System beginning to show operational value',
            'AI Agent: Trust-Lock maintaining data integrity'
          ]
        }));
      } else if (sessions.length >= 5) {
        setDashboardState(prev => ({
          ...prev,
          currentWorkflow: 'session-management',
          nextAction: '🔥 Manage active sessions and see workflow in action',
          progress: 50,
          aiInsights: [
            'AI Agent: Sufficient data for workflow demonstration',
            'AI Agent: System showing operational efficiency',
            'AI Agent: Ready for advanced session management'
          ]
        }));
      }
    };

    updateDashboardState();
    const interval = setInterval(updateDashboardState, 5000);
    
    return () => clearInterval(interval);
  }, [sessions.length]);

  // Mobile Order Timer Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && mobileOrderTimer > 0) {
      interval = setInterval(() => {
        setMobileOrderTimer(prev => {
          if (prev <= 1) {
            // Generate mobile order when timer reaches 0
            generateMobileOrder();
            return 60; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, mobileOrderTimer]);

  const generateMobileOrder = () => {
    const newSession: UnifiedSession = {
      id: `mobile_${Date.now()}`,
      type: 'mobile',
      status: 'pending',
      table: `T-${Math.floor(Math.random() * 20) + 1}`,
      customer: `Customer_${Math.floor(Math.random() * 1000)}`,
      flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape', 'Rose', 'Vanilla'][Math.floor(Math.random() * 6)],
      amount: 2500 + Math.floor(Math.random() * 3000),
      duration: 0,
      createdAt: new Date(),
      workflow: ['QR_SCAN', 'FLAVOR_SELECT', 'PAYMENT', 'CONFIRMATION'],
      priority: Math.floor(Math.random() * 100)
    };

    setSessions(prev => [newSession, ...prev]);
  };

  const generateDemoData = () => {
    const demoSessions: UnifiedSession[] = [];
    
    for (let i = 0; i < 15; i++) {
      const session: UnifiedSession = {
        id: `demo_${Date.now()}_${i}`,
        type: Math.random() > 0.7 ? 'mobile' : 'staff',
        status: ['pending', 'prep', 'ready', 'delivered', 'active'][Math.floor(Math.random() * 5)] as any,
        table: `T-${Math.floor(Math.random() * 20) + 1}`,
        customer: `Customer_${Math.floor(Math.random() * 1000)}`,
        flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape', 'Rose', 'Vanilla'][Math.floor(Math.random() * 6)],
        amount: 2500 + Math.floor(Math.random() * 3000),
        duration: Math.floor(Math.random() * 120),
        createdAt: new Date(Date.now() - Math.random() * 3600000),
        workflow: ['QR_SCAN', 'FLAVOR_SELECT', 'PAYMENT', 'CONFIRMATION', 'PREP', 'DELIVERY'],
        priority: Math.floor(Math.random() * 100)
      };
      
      demoSessions.push(session);
    }

    setSessions(demoSessions);
    setDashboardState(prev => ({
      ...prev,
      dataStatus: 'populated',
      progress: 50
    }));
  };

  const startMobileOrderTimer = () => {
    setIsTimerActive(true);
    setMobileOrderTimer(60);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setMobileOrderTimer(60);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-400 bg-yellow-400/20',
      prep: 'text-orange-400 bg-orange-400/20',
      ready: 'text-emerald-400 bg-emerald-400/20',
      delivered: 'text-blue-400 bg-blue-400/20',
      active: 'text-purple-400 bg-purple-400/20',
      completed: 'text-green-400 bg-green-400/20'
    };
    return colors[status] || 'text-zinc-400 bg-zinc-400/20';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      prep: '🔧',
      ready: '✅',
      delivered: '🚚',
      active: '🔥',
      completed: '🎉'
    };
    return icons[status] || '❓';
  };

  // Calculate metrics
  const metrics = {
    totalOrders: sessions.length,
    mobileOrders: sessions.filter(s => s.type === 'mobile').length,
    activeSessions: sessions.filter(s => s.status === 'active').length,
    totalRevenue: sessions.reduce((sum, s) => sum + s.amount, 0) / 100
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Hookah+ Dashboard</h1>
              <p className="text-zinc-400">AI-Powered Lounge Management System</p>
            </div>
            <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Agent Status */}
        <div className="bg-zinc-900 rounded-xl border border-teal-500 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-teal-300">AI Agent Status</h2>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">🔒</span>
              <span className="text-teal-200">Trust-Lock: {dashboardState.trustLockStatus}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-300">{dashboardState.progress}%</div>
              <div className="text-sm text-zinc-400">System Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">{sessions.length}</div>
              <div className="text-sm text-zinc-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300">{dashboardState.currentWorkflow}</div>
              <div className="text-sm text-zinc-400">Current Workflow</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
            <p className="text-teal-200 text-center">{dashboardState.nextAction}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={generateDemoData}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            🚀 Generate Demo Data
          </button>
          
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeView === 'overview' ? 'bg-teal-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            📊 Overview
          </button>
          
          <button
            onClick={() => setActiveView('sessions')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeView === 'sessions' ? 'bg-teal-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            🔥 Sessions
          </button>
          
          <button
            onClick={() => setActiveView('workflow')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeView === 'workflow' ? 'bg-teal-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            ⚡ Workflow
          </button>
        </div>

        {/* Mobile Order Status and Workflow Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mobile Order Status */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Mobile Order Status</h3>
            
            {/* Timer */}
            <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-xl p-4 border border-teal-500/30 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-300 mb-2">
                  {Math.floor(mobileOrderTimer / 60)}:{(mobileOrderTimer % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-teal-200 mb-3">
                  Timer automatically generates mobile orders for FOH/BOH transparency
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={startMobileOrderTimer}
                    disabled={isTimerActive}
                    className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-400 disabled:opacity-50 transition-colors text-sm"
                  >
                    Start
                  </button>
                  <button
                    onClick={resetTimer}
                    className="bg-zinc-600 text-white px-4 py-2 rounded-lg hover:bg-zinc-500 transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{metrics.totalOrders}</div>
                <div className="text-sm text-zinc-400">Active Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{metrics.mobileOrders}</div>
                <div className="text-sm text-zinc-400">Mobile Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{metrics.activeSessions}</div>
                <div className="text-sm text-zinc-400">Delivered (Ready)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${metrics.totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-zinc-400">Mobile Revenue</div>
              </div>
            </div>
          </div>

          {/* Live Mobile Workflow Simulation */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Live Mobile Workflow Simulation</h3>
            
            <div className="space-y-4">
              {[
                { step: 1, icon: '📱', title: 'QR Scan', desc: 'Customer scans table QR' },
                { step: 2, icon: '🍃', title: 'Flavor Pick', desc: 'AI recommendations' },
                { step: 3, icon: '💳', title: 'Stripe Pay', desc: 'Secure payment' },
                { step: 4, icon: '✅', title: 'Confirm', desc: 'Instant notification' },
                { step: 5, icon: '📊', title: 'Monitor', desc: 'Real-time tracking' }
              ].map((step) => (
                <div key={step.step} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{step.title}</div>
                    <div className="text-sm text-zinc-400">{step.desc}</div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {activeView === 'sessions' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getStatusIcon(session.status)}</div>
                    <div>
                      <div className="font-medium text-white">{session.customer}</div>
                      <div className="text-sm text-zinc-400">Table {session.table} • {session.flavor}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">${(session.amount / 100).toFixed(2)}</div>
                    <div className="text-sm text-zinc-400">{session.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">AI Insights</h3>
            <div className="space-y-3">
              {dashboardState.aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-200">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Human Feedback</h3>
            <div className="space-y-3">
              {dashboardState.humanFeedback.map((feedback, index) => (
                <div key={index} className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-sm text-emerald-200">{feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
