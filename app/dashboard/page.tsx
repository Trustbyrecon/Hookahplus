"use client";

import { useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";

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
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float-delay-1"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-float-delay-2"></div>
      </div>

      <GlobalNavigation />
      
      {/* Premium Header with Enhanced Flow Conductor Status */}
      <div className="relative z-10">
        <div className="glass border-b border-zinc-800/50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="text-4xl md:text-5xl font-black mb-3">
                  <span className="gradient-text">Unified Lounge</span>
                  <span className="text-white"> Dashboard</span>
                </h1>
                <p className="text-xl text-zinc-300 font-light">AI-Powered Hookah Lounge Management System</p>
              </div>
              
              {/* Enhanced Flow Conductor Status */}
              <div className={`text-right transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="glass rounded-2xl p-4 border border-zinc-700/50">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-emerald-400 text-lg">🔄</span>
                    <span className="text-sm text-zinc-400">Workflow:</span>
                    <span className="text-sm text-emerald-400 capitalize font-medium">{dashboardState.currentWorkflow.replace('-', ' ')}</span>
                  </div>
                  <div className="w-40 bg-zinc-800/50 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-700 shadow-lg"
                      style={{ width: `${dashboardState.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-emerald-400 font-medium">{dashboardState.progress}% Complete</div>
                </div>
              </div>
            </div>

            {/* Enhanced AI Agent Collaboration Bar */}
            <div className={`glass rounded-2xl p-6 border border-zinc-700/50 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">AI Agents:</span>
                    <span className="text-sm text-emerald-400 font-medium">Collaborating</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">Role:</span>
                    <span className="text-sm text-blue-400 font-medium uppercase">{dashboardState.activeRole}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">Trust-Lock:</span>
                    <span className="text-sm text-purple-400 font-medium">{dashboardState.trustLockStatus}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-zinc-400 mb-2">🎯 Next Action:</div>
                  <div className="text-base text-emerald-300 font-medium max-w-xs">{dashboardState.nextAction}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* AI Insights and Human Feedback with Premium Styling */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* AI Agent Insights */}
          <div className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-0.5 rounded-2xl">
              <div className="glass rounded-2xl p-6 h-full card-hover">
                <h3 className="text-xl font-bold text-purple-300 mb-6 flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  AI Agent Insights
                </h3>
                <div className="space-y-4">
                  {dashboardState.aiInsights.map((insight, index) => (
                    <div key={index} className="glass rounded-xl p-4 border border-purple-500/20 group-hover:border-purple-500/40 transition-all duration-300">
                      <div className="text-sm text-purple-200 leading-relaxed">{insight}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Human Feedback */}
          <div className="group">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-0.5 rounded-2xl">
              <div className="glass rounded-2xl p-6 h-full card-hover">
                <h3 className="text-xl font-bold text-orange-300 mb-6 flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  Human Feedback
                </h3>
                <div className="space-y-4">
                  {dashboardState.humanFeedback.map((feedback, index) => (
                    <div key={index} className="glass rounded-xl p-4 border border-orange-500/20 group-hover:border-orange-500/40 transition-all duration-300">
                      <div className="text-sm text-orange-200 leading-relaxed">{feedback}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Control Actions */}
        <div className={`glass rounded-2xl border border-zinc-700/50 p-8 mb-8 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-teal-300 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            Control Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateDemoData}
              className="btn-primary group"
            >
              <span className="flex items-center gap-3">
                🎯 Generate Demo Data
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button
              onClick={startMobileOrderTimer}
              disabled={isTimerActive}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              📱 Start Mobile Order Timer
            </button>
            
            <button
              onClick={resetTimer}
              className="btn-secondary group"
            >
              <span className="flex items-center gap-3">
                🔄 Reset Timer
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </span>
            </button>
            
            <a
              href="/fire-session-dashboard"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔥 Fire Session Dashboard
            </a>
            
            <a
              href="/admin-control"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ⚙️ Admin Control
            </a>
          </div>
        </div>

        {/* Premium Key Metrics */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {[
            { icon: "📊", label: "Total Orders", value: metrics.totalOrders, color: "from-teal-500 to-cyan-500" },
            { icon: "💰", label: "Total Revenue", value: `$${metrics.totalRevenue.toFixed(2)}`, color: "from-emerald-500 to-green-500" },
            { icon: "📱", label: "Mobile Orders", value: metrics.mobileOrders, color: "from-purple-500 to-pink-500" },
            { icon: "🍃", label: "Active Sessions", value: metrics.activeSessions, color: "from-blue-500 to-indigo-500" }
          ].map((metric, index) => (
            <div key={index} className="group">
              <div className={`bg-gradient-to-br ${metric.color} p-0.5 rounded-2xl`}>
                <div className="glass rounded-2xl p-6 h-full card-hover">
                  <div className="flex items-center">
                    <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{metric.icon}</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-zinc-400 mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Mobile Order Status and Workflow Simulation */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Mobile Order Status */}
          <div className="group">
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 p-0.5 rounded-2xl">
              <div className="glass rounded-2xl p-6 h-full card-hover">
                <h3 className="text-xl font-bold text-teal-300 mb-6 flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  Mobile Order Status
                </h3>
                
                {/* Enhanced Timer */}
                <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl p-6 border border-teal-500/30 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-black text-teal-300 mb-3 font-mono">
                      {Math.floor(mobileOrderTimer / 60)}:{(mobileOrderTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-teal-200 mb-4 leading-relaxed">
                      Timer automatically generates mobile orders for FOH/BOH transparency
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={startMobileOrderTimer}
                        disabled={isTimerActive}
                        className="bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-400 transition-all duration-300 font-medium hover:scale-105"
                      >
                        Start
                      </button>
                      <button
                        onClick={resetTimer}
                        className="bg-zinc-600 text-white px-6 py-2 rounded-xl hover:bg-zinc-500 transition-all duration-300 font-medium hover:scale-105"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { value: metrics.totalOrders, label: "Active Orders" },
                    { value: metrics.mobileOrders, label: "Mobile Orders" },
                    { value: metrics.activeSessions, label: "Delivered (Ready)" },
                    { value: `$${metrics.totalRevenue.toFixed(2)}`, label: "Mobile Revenue" }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                      <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                      <div className="text-sm text-zinc-400">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="text-sm text-blue-200 leading-relaxed">
                    💡 <strong>Pro Tip:</strong> Mobile orders appear automatically when customers complete QR workflow. 
                    FOH/BOH Link: Order sync instantly across all dashboards for transparency.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Mobile Workflow Simulation */}
          <div className="group">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-0.5 rounded-2xl">
              <div className="glass rounded-2xl p-6 h-full card-hover">
                <h3 className="text-xl font-bold text-emerald-300 mb-6 flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  Live Mobile Workflow Simulation
                </h3>
                
                <div className="space-y-4">
                  {[
                    { step: 1, icon: '📱', title: 'QR Scan', desc: 'Customer scans table QR' },
                    { step: 2, icon: '🍃', title: 'Flavor Pick', desc: 'AI recommendations' },
                    { step: 3, icon: '💳', title: 'Stripe Pay', desc: 'Secure payment' },
                    { step: 4, icon: '✅', title: 'Confirm', desc: 'Instant notification' },
                    { step: 5, icon: '📊', title: 'Monitor', desc: 'Real-time tracking' }
                  ].map((step) => (
                    <div key={step.step} className="flex items-center space-x-4 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {step.step}
                      </div>
                      <div className="text-2xl">{step.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{step.title}</div>
                        <div className="text-sm text-zinc-400">{step.desc}</div>
                      </div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-center">
                    <div className="text-emerald-300 font-bold mb-2 text-lg">🎉 Workflow Complete!</div>
                    <div className="text-sm text-emerald-200 leading-relaxed">
                      Customer order appears in sessions above. This simulates the complete customer journey from QR scan to order confirmation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Live Orders & Sessions */}
        <div className={`glass rounded-2xl border border-zinc-700/50 mb-8 transition-all duration-1000 delay-1400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="px-6 py-4 border-b border-zinc-700/50">
            <h2 className="text-xl font-bold text-teal-300 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              Live Orders & Sessions
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Real-time updates every 5 seconds • {metrics.totalOrders} orders • Live data with no time restrictions
            </p>
          </div>
          
          <div className="p-6">
            {sessions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <div className="text-6xl mb-6 animate-float">🍃</div>
                <p className="text-xl mb-3 font-medium">No orders yet...</p>
                <p className="text-sm">Click 'Generate Demo Data' to populate the dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="glass rounded-2xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 card-hover">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{getStatusIcon(session.status)}</span>
                        <div>
                          <div className="font-bold text-white text-lg">
                            {session.customer} - Table {session.table}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {session.flavor} • ${(session.amount / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(session.status)}`}>
                          {session.status.toUpperCase()}
                        </span>
                        <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                          {session.type === 'mobile' ? '📱' : '👤'} {session.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                      <div>Created: {session.createdAt.toLocaleTimeString()}</div>
                      <div>Duration: {session.duration}m</div>
                      <div>Priority: {session.priority}</div>
                    </div>

                    {/* Enhanced Workflow Progress */}
                    <div>
                      <div className="text-xs text-zinc-400 mb-3">Workflow Progress:</div>
                      <div className="flex space-x-2">
                        {session.workflow.map((step, index) => (
                          <div key={index} className="flex-1 bg-zinc-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-lg"
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

        {/* Premium Aliethia Memory - AI-Powered Insights */}
        <div className={`glass rounded-2xl border border-pink-500/20 p-8 transition-all duration-1000 delay-1600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-pink-300 mb-6 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            Aliethia Memory - AI-Powered Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🔥", title: "Top 3 Mixes Today", color: "from-pink-500 to-rose-500" },
              { icon: "👥", title: "Returning Customers", color: "from-purple-500 to-violet-500" },
              { icon: "🎁", title: "Promotional Offers", color: "from-orange-500 to-red-500" }
            ].map((insight, index) => (
              <div key={index} className="group">
                <div className={`bg-gradient-to-br ${insight.color} p-0.5 rounded-2xl`}>
                  <div className="glass rounded-2xl p-6 h-full card-hover">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{insight.icon}</span>
                      <h3 className="font-bold text-white">{insight.title}</h3>
                    </div>
                    <div className="text-sm text-zinc-400 leading-relaxed">
                      {sessions.length > 0 ? 'Analyzing data patterns...' : 'Generate demo data to see insights'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-3 p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-pink-300 font-medium">
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
