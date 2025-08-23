"use client";

import { useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";
import { designSystem, applyDesignToken } from "../../lib/designSystem";

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

const UnifiedDashboard = () => {
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
      delivered: '🎯',
      active: '🍃',
      completed: '🎉'
    };
    return icons[status] || '❓';
  };

  const calculateMetrics = () => {
    const totalOrders = sessions.length;
    const paidOrders = sessions.filter(s => s.status !== 'pending').length;
    const totalRevenue = sessions.reduce((sum, s) => sum + s.amount, 0);
    const pendingOrders = sessions.filter(s => s.status === 'pending').length;
    const mobileOrders = sessions.filter(s => s.type === 'mobile').length;
    const activeSessions = sessions.filter(s => s.status === 'active').length;

    return {
      totalOrders,
      paidOrders,
      totalRevenue: totalRevenue / 100, // Convert from cents
      pendingOrders,
      mobileOrders,
      activeSessions
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      {/* Header with Flow Conductor Status */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-teal-400 mb-2">Unified Lounge Dashboard</h1>
              <p className="text-zinc-400">AI-Powered Hookah Lounge Management System</p>
            </div>
            
            {/* Flow Conductor Status */}
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-emerald-400 text-sm">🔄</span>
                <span className="text-xs text-zinc-400">Workflow:</span>
                <span className="text-xs text-emerald-400 capitalize">{dashboardState.currentWorkflow.replace('-', ' ')}</span>
              </div>
              <div className="w-32 bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dashboardState.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-emerald-400 mt-1">{dashboardState.progress}% Complete</div>
            </div>
          </div>

          {/* AI Agent Collaboration Bar */}
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-xl p-4 border border-zinc-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 text-sm">🤖</span>
                  <span className="text-xs text-zinc-400">AI Agents:</span>
                  <span className="text-xs text-emerald-400">Collaborating</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 text-sm">👤</span>
                  <span className="text-xs text-zinc-400">Role:</span>
                  <span className="text-xs text-blue-400 uppercase">{dashboardState.activeRole}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 text-sm">🔒</span>
                  <span className="text-xs text-zinc-400">Trust-Lock:</span>
                  <span className="text-xs text-purple-400">{dashboardState.trustLockStatus}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400 mb-1">🎯 Next Action:</div>
                <div className="text-sm text-emerald-300 font-medium">{dashboardState.nextAction}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Insights and Human Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Agent Insights */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">🤖 AI Agent Insights</h3>
            <div className="space-y-3">
              {dashboardState.aiInsights.map((insight, index) => (
                <div key={index} className="bg-zinc-800/50 rounded-lg p-3 border border-purple-500/20">
                  <div className="text-sm text-purple-200">{insight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Feedback */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 p-6">
            <h3 className="text-lg font-semibold text-orange-300 mb-4">👥 Human Feedback</h3>
            <div className="space-y-3">
              {dashboardState.humanFeedback.map((feedback, index) => (
                <div key={index} className="bg-zinc-800/50 rounded-lg p-3 border border-orange-500/20">
                  <div className="text-sm text-orange-200">{feedback}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Actions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Control Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateDemoData}
              className="bg-teal-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-teal-400 transition-colors font-medium"
            >
              🎯 Generate Demo Data
            </button>
            
            <button
              onClick={startMobileOrderTimer}
              disabled={isTimerActive}
              className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-400 disabled:opacity-50 transition-colors font-medium"
            >
              📱 Start Mobile Order Timer
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors font-medium"
            >
              🔄 Reset Timer
            </button>
            
            <a
              href="/fire-session-dashboard"
              className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors font-medium"
            >
              🔥 Fire Session Dashboard
            </a>
            
            <a
              href="/admin-control"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors font-medium"
            >
              ⚙️ Admin Control
            </a>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Orders</p>
                <p className="text-2xl font-semibold text-white">{metrics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-white">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Mobile Orders</p>
                <p className="text-2xl font-semibold text-white">{metrics.mobileOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-2xl">🍃</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Active Sessions</p>
                <p className="text-2xl font-semibold text-white">{metrics.activeSessions}</p>
              </div>
            </div>
          </div>
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

            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-xs text-blue-200">
                💡 Pro Tip: Mobile orders appear automatically when customers complete QR workflow. 
                FOH/BOH Link: Order sync instantly across all dashboards for transparency.
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

            <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-center">
                <div className="text-emerald-300 font-medium mb-2">🎉 Workflow Complete!</div>
                <div className="text-sm text-emerald-200">
                  Customer order appears in sessions above. This simulates the complete customer journey from QR scan to order confirmation.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Orders & Sessions */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 mb-8">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-teal-300">Live Orders & Sessions</h2>
            <p className="text-sm text-zinc-400">
              Real-time updates every 5 seconds • {metrics.totalOrders} orders • Live data with no time restrictions
            </p>
          </div>
          
          <div className="p-6">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <div className="text-4xl mb-4">🍃</div>
                <p className="text-lg mb-2">No orders yet...</p>
                <p className="text-sm">Click 'Generate Demo Data' to populate the dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(session.status)}</span>
                        <div>
                          <div className="font-medium text-white">
                            {session.customer} - Table {session.table}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {session.flavor} • ${(session.amount / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status.toUpperCase()}
                        </span>
                        <div className="text-xs text-zinc-400 mt-1">
                          {session.type === 'mobile' ? '📱' : '👤'} {session.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-zinc-400">
                      <div>Created: {session.createdAt.toLocaleTimeString()}</div>
                      <div>Duration: {session.duration}m</div>
                      <div>Priority: {session.priority}</div>
                    </div>

                    {/* Workflow Progress */}
                    <div className="mt-3">
                      <div className="text-xs text-zinc-400 mb-2">Workflow Progress:</div>
                      <div className="flex space-x-2">
                        {session.workflow.map((step, index) => (
                          <div key={index} className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((index + 1) / session.workflow.length) * 100}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aliethia Memory - AI-Powered Insights */}
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 p-6">
          <h2 className="text-xl font-semibold text-pink-300 mb-4">Aliethia Memory - AI-Powered Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-pink-500/20">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🔥</span>
                <h3 className="font-medium text-white">Top 3 Mixes Today</h3>
              </div>
              <div className="text-sm text-zinc-400">
                {sessions.length > 0 ? 'Analyzing flavor preferences...' : 'Generate demo data to see trends'}
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-pink-500/20">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">👥</span>
                <h3 className="font-medium text-white">Returning Customers</h3>
              </div>
              <div className="text-sm text-zinc-400">
                {sessions.length > 0 ? 'Identifying customer patterns...' : 'Generate demo data to see patterns'}
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-pink-500/20">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🎁</span>
                <h3 className="font-medium text-white">Promotional Offers</h3>
              </div>
              <div className="text-sm text-zinc-400">
                {sessions.length > 0 ? 'Generating personalized offers...' : 'Generate demo data to see offers'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              <span className="text-sm text-pink-300">
                Aliethia Status: {sessions.length > 0 ? 'Active - Analyzing data' : 'Dormant - Waiting for data'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
