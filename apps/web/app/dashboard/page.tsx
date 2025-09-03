"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CustomerFlowLogic from "../../components/CustomerFlowLogic";
import AgentMDIntegration from "../../components/AgentMDIntegration";
import VisualGrounderOnboarding from "../../components/VisualGrounderOnboarding";
import DeployedSeatingMap from "../../components/DeployedSeatingMap";

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

  const [activeView, setActiveView] = useState<'overview' | 'sessions' | 'workflow' | 'agents' | 'onboarding'>('overview');
  const [unifiedSessions, setUnifiedSessions] = useState<UnifiedSession[]>([]);

  // Simulate session data generation
  const generateDemoData = () => {
    const demoSessions: UnifiedSession[] = [
      {
        id: 'session_001',
        type: 'mobile',
        status: 'active',
        table: 'T-001',
        customer: 'John Doe',
        flavor: 'Blue Mist + Mint',
        amount: 30,
        duration: 45,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        workflow: ['Order Placed', 'Payment Confirmed', 'BOH Prep', 'FOH Delivery', 'Active Session'],
        priority: 1
      },
      {
        id: 'session_002',
        type: 'staff',
        status: 'prep',
        table: 'T-003',
        customer: 'Sarah Wilson',
        flavor: 'Double Apple',
        amount: 25,
        duration: 60,
        createdAt: new Date(Date.now() - 900000), // 15 minutes ago
        workflow: ['Order Placed', 'Payment Confirmed', 'BOH Prep'],
        priority: 2
      },
      {
        id: 'session_003',
        type: 'demo',
        status: 'pending',
        table: 'T-005',
        customer: 'Demo Customer',
        flavor: 'Grape Mint',
        amount: 35,
        duration: 90,
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        workflow: ['Order Placed'],
        priority: 3
      }
    ];

    setUnifiedSessions(demoSessions);
    setDashboardState(prev => ({
      ...prev,
      dataStatus: 'populated',
      nextAction: '🎉 Demo data generated! Your system is now active with sample sessions',
      progress: 75,
      aiInsights: [
        'AI Agent: Demo data successfully generated',
        'AI Agent: 3 active sessions detected across mobile, staff, and demo channels',
        'AI Agent: Workflow optimization recommendations ready'
      ]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'prep': return 'text-yellow-400';
      case 'ready': return 'text-blue-400';
      case 'delivered': return 'text-purple-400';
      case 'pending': return 'text-orange-400';
      case 'completed': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'prep': return '🟡';
      case 'ready': return '🔵';
      case 'delivered': return '🟣';
      case 'pending': return '🟠';
      case 'completed': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Hookah+ Dashboard</h1>
              <p className="text-zinc-400">Unified Session Management & AI Agent Orchestration</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={generateDemoData}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎯 Generate Demo Data
              </button>
              <Link 
                href="/agent-commander" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🤖 Agent CMD
              </Link>
              <Link 
                href="/layout-preview" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🗺️ Layout Preview
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === 'overview' 
                ? 'bg-teal-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveView('sessions')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === 'sessions' 
                ? 'bg-teal-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🔥 Sessions
          </button>
          <button
            onClick={() => setActiveView('workflow')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === 'workflow' 
                ? 'bg-teal-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⚡ Workflow
          </button>
          <button
            onClick={() => setActiveView('agents')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === 'agents' 
                ? 'bg-teal-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🤖 AGENT.MD
          </button>
          <button
            onClick={() => setActiveView('onboarding')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeView === 'onboarding' 
                ? 'bg-teal-600 text-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🔍 Visual Grounder
          </button>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-teal-300 mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{unifiedSessions.length}</div>
                  <div className="text-sm text-zinc-400">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {unifiedSessions.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-zinc-400">Live Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {unifiedSessions.filter(s => s.status === 'prep').length}
                  </div>
                  <div className="text-sm text-zinc-400">In Preparation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    ${unifiedSessions.reduce((sum, s) => sum + s.amount, 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Total Revenue</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/sessions" 
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-teal-500 transition-colors"
              >
                <div className="text-3xl mb-3">🔥</div>
                <h3 className="text-xl font-semibold text-white mb-2">Session Management</h3>
                <p className="text-zinc-400">Monitor and manage active hookah sessions</p>
              </Link>
              
              <Link 
                href="/staff" 
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-teal-500 transition-colors"
              >
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">Staff Operations</h3>
                <p className="text-zinc-400">Staff panel for order processing and management</p>
              </Link>
              
              <Link 
                href="/agent-commander" 
                className="bg-zinc-900 rounded-xl border border-orange-500 p-6 hover:border-orange-400 transition-colors"
              >
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl font-semibold text-orange-300 mb-2">Agent Commander</h3>
                <p className="text-zinc-400">AGENT.MD suite orchestration and control</p>
              </Link>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeView === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Unified Sessions</h3>
              <div className="space-y-4">
                {unifiedSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-zinc-400">No sessions yet. Generate demo data to see the system in action.</p>
                  </div>
                ) : (
                  unifiedSessions.map((session) => (
                    <div key={session.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getStatusIcon(session.status)}</span>
                          <div>
                            <div className="text-white font-medium">
                              {session.customer} - {session.flavor}
                            </div>
                            <div className="text-sm text-zinc-400">
                              Table {session.table} • ${session.amount} • {session.duration}min
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getStatusColor(session.status)}`}>
                            {session.status.toUpperCase()}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {session.type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {session.workflow.map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                            <span className="text-sm text-zinc-400">{step}</span>
                            {index < session.workflow.length - 1 && (
                              <div className="w-4 h-px bg-zinc-600"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeView === 'workflow' && (
          <div className="space-y-6">
            <CustomerFlowLogic />
            
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Workflow Management</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-white font-medium">Order Processing</div>
                    <div className="text-sm text-zinc-400">Mobile & Staff Orders</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">👨‍🍳</div>
                    <div className="text-white font-medium">BOH Preparation</div>
                    <div className="text-sm text-zinc-400">Hookah Assembly</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-white font-medium">FOH Delivery</div>
                    <div className="text-sm text-zinc-400">Customer Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENT.MD Tab */}
        {activeView === 'agents' && (
          <div className="space-y-6">
            <AgentMDIntegration />
          </div>
        )}

        {/* Visual Grounder Tab */}
        {activeView === 'onboarding' && (
          <div className="space-y-6">
            <DeployedSeatingMap />
            <VisualGrounderOnboarding />
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