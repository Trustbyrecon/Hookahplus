"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// AI Agent Collaboration Interface
interface FlowState {
  currentWorkflow: 'idle' | 'data-generation' | 'session-management' | 'customer-journey' | 'admin-setup';
  activeRole: 'owner' | 'foh' | 'boh' | 'admin';
  dataStatus: 'empty' | 'populated' | 'active' | 'flowing';
  nextAction: string;
  progress: number;
  trustLockStatus: 'active' | 'pending' | 'verified';
}

interface NavGroup {
  label: string;
  items: NavItem[];
  color: string;
  bgColor: string;
  flowState: 'idle' | 'active' | 'completed' | 'required';
  description: string;
  aiInsight: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  flowState: 'idle' | 'active' | 'completed' | 'required';
  nextAction?: string;
  aiRecommendation?: string;
}

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<FlowState>({
    currentWorkflow: 'idle',
    activeRole: 'owner',
    dataStatus: 'empty',
    nextAction: 'Generate demo data to see the system in action',
    progress: 0,
    trustLockStatus: 'active'
  });

  // AI Agent Collaboration - Dynamic Flow State Management
  useEffect(() => {
    // Simulate AI agents analyzing current state and recommending next actions
    const updateFlowState = () => {
      const currentPage = pathname;
      
      if (currentPage.includes('fire-session-dashboard')) {
        setFlowState(prev => ({
          ...prev,
          currentWorkflow: 'session-management',
          activeRole: 'foh',
          dataStatus: 'empty',
          nextAction: '🔥 Generate 10 Floor Sessions to populate the dashboard',
          progress: 25,
          trustLockStatus: 'active'
        }));
      } else if (currentPage.includes('dashboard')) {
        setFlowState(prev => ({
          ...prev,
          currentWorkflow: 'data-generation',
          activeRole: 'owner',
          dataStatus: 'empty',
          nextAction: '📊 Generate demo data to see live orders & sessions',
          progress: 10,
          trustLockStatus: 'active'
        }));
      } else if (currentPage.includes('admin-control')) {
        setFlowState(prev => ({
          ...prev,
          currentWorkflow: 'admin-setup',
          activeRole: 'admin',
          dataStatus: 'empty',
          nextAction: '⚙️ Configure system settings and generate initial data',
          progress: 50,
          trustLockStatus: 'verified'
        }));
      } else if (currentPage.includes('demo-flow')) {
        setFlowState(prev => ({
          ...prev,
          currentWorkflow: 'customer-journey',
          activeRole: 'owner',
          dataStatus: 'populated',
          nextAction: '📱 Experience the complete customer QR workflow',
          progress: 75,
          trustLockStatus: 'active'
        }));
      }
    };

    updateFlowState();
    const interval = setInterval(updateFlowState, 5000); // AI agents update every 5 seconds
    
    return () => clearInterval(interval);
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      label: 'Core',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-500/10',
      flowState: flowState.currentWorkflow === 'session-management' ? 'active' : 'idle',
      description: 'AI Insights operationalization and session workflow',
      aiInsight: 'AI Agent: Core system is ready for session data generation. We have the ability to generate data so lets give them something to experience here.',
      items: [
        { 
          label: 'Dashboard', 
          href: '/dashboard', 
          icon: '🏠', 
          description: 'Main lounge overview',
          flowState: pathname === '/dashboard' ? 'active' : 'idle',
          nextAction: 'Generate demo data',
          aiRecommendation: 'Start here to see the system overview'
        },
        { 
          label: 'Sessions', 
          href: '/sessions', 
          icon: '🍃', 
          description: 'Active hookah sessions',
          flowState: 'idle',
          nextAction: 'View active sessions',
          aiRecommendation: 'Monitor real-time session status'
        },
        { 
          label: 'Fire Session', 
          href: '/fire-session-dashboard', 
          icon: '🔥', 
          description: 'AI-powered session workflow',
          flowState: pathname === '/fire-session-dashboard' ? 'active' : 'idle',
          nextAction: 'Generate 5 floor sessions',
          aiRecommendation: 'Experience AI Insights in action with integrated FOH/BOH workflow'
        }
      ]
    },
    {
      label: 'Demo',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      flowState: flowState.currentWorkflow === 'customer-journey' ? 'active' : 'idle',
      description: 'Customer journey and system demonstration',
      aiInsight: 'AI Agent: Demo flow ready to showcase customer experience',
      items: [
        { 
          label: 'Demo Flow', 
          href: '/demo-flow', 
          icon: '📱', 
          description: 'Customer journey demo',
          flowState: pathname === '/demo-flow' ? 'active' : 'idle',
          nextAction: 'Experience QR workflow',
          aiRecommendation: 'See the complete customer journey'
        },
        { 
          label: 'Interactive', 
          href: '/demo', 
          icon: '🚀', 
          description: 'Interactive demo',
          flowState: 'idle',
          nextAction: 'Try interactive features',
          aiRecommendation: 'Hands-on system exploration'
        },
        { 
          label: 'Demo Video', 
          href: '/demo-video', 
          icon: '🎬', 
          description: 'Video walkthrough',
          flowState: 'idle',
          nextAction: 'Watch system overview',
          aiRecommendation: 'Visual system introduction'
        }
      ]
    },
    {
      label: 'Business',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      flowState: 'idle',
      description: 'Revenue optimization and business tools',
      aiInsight: 'AI Agent: Business tools ready for ROI analysis',
      items: [
        { 
          label: 'ROI Calculator', 
          href: '/roi-calculator', 
          icon: '💰', 
          description: 'Calculate returns',
          flowState: 'idle',
          nextAction: 'Calculate potential returns',
          aiRecommendation: 'Understand system value proposition'
        },
        { 
          label: 'Landing', 
          href: '/landing', 
          icon: '🎯', 
          description: 'Main landing page',
          flowState: 'idle',
          nextAction: 'View public page',
          aiRecommendation: 'Customer-facing information'
        },
        { 
          label: 'Preorders', 
          href: '/owner-cta?form=preorder', 
          icon: '💳', 
          description: 'Start preorders',
          flowState: 'idle',
          nextAction: 'Begin preorder process',
          aiRecommendation: 'Start revenue generation'
        }
      ]
    },
    {
      label: 'Admin',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      flowState: flowState.currentWorkflow === 'admin-setup' ? 'active' : 'idle',
      description: 'System administration and configuration',
      aiInsight: 'AI Agent: Admin tools ready for system setup',
      items: [
        { 
          label: 'Control Center', 
          href: '/admin-control', 
          icon: '⚙️', 
          description: 'Admin dashboard',
          flowState: pathname === '/admin-control' ? 'active' : 'idle',
          nextAction: 'Configure system',
          aiRecommendation: 'Central system administration'
        },
        { 
          label: 'Customers', 
          href: '/admin-customers', 
          icon: '👥', 
          description: 'Customer management',
          flowState: 'idle',
          nextAction: 'Manage customer data',
          aiRecommendation: 'Customer relationship management'
        },
        { 
          label: 'Connectors', 
          href: '/admin-connectors', 
          icon: '🔗', 
          description: 'Integration management',
          flowState: 'idle',
          nextAction: 'Configure integrations',
          aiRecommendation: 'System connectivity setup'
        }
      ]
    },
    {
      label: 'POS',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      flowState: 'idle',
      description: 'Payment and point of sale integration',
      aiInsight: 'AI Agent: POS integration ready for payment processing',
      items: [
        { 
          label: 'Square POS', 
          href: '/square-pos', 
          icon: '💳', 
          description: 'Square integration',
          flowState: 'idle',
          nextAction: 'Configure payments',
          aiRecommendation: 'Secure payment processing setup'
        }
      ]
    }
  ];

  const getCurrentGroup = () => {
    return navGroups.find(group => 
      group.items.some(item => item.href === pathname)
    );
  };

  const currentGroup = getCurrentGroup();
  const currentPage = currentGroup?.items.find(item => item.href === pathname);

  // Flow Conductor Status Indicators
  const getFlowStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'completed': return 'text-blue-400';
      case 'required': return 'text-orange-400';
      default: return 'text-zinc-400';
    }
  };

  const getFlowStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'completed': return '🔵';
      case 'required': return '🟠';
      default: return '⚪';
    }
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Logo and Current Page */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
            <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            {currentGroup && (
              <div className={`${currentGroup.bgColor} text-zinc-300 text-sm font-medium px-3 py-1 rounded-lg border border-zinc-700 transition-all duration-300`}>
                {currentGroup.label.toUpperCase()}
              </div>
            )}
          </div>

          {/* Current Page and Flow Status */}
          <div className="flex items-center space-x-6">
            {/* Current Page Info */}
            {currentPage && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-white">
                  <span className="text-lg">{currentPage.icon}</span>
                  <span className="font-medium">{currentPage.label}</span>
                </div>
                <div className="text-sm text-zinc-400">{currentPage.description}</div>
              </div>
            )}

            {/* Flow Conductor Status */}
            <div className="flex items-center space-x-4">
              {/* Workflow Progress */}
              <div className="text-center">
                <div className="text-xs text-zinc-400 mb-1">Workflow Progress</div>
                <div className="w-20 bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${flowState.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-emerald-400 mt-1">{flowState.progress}%</div>
              </div>

              {/* Trust Lock Status */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${flowState.trustLockStatus === 'active' ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {flowState.trustLockStatus === 'active' ? '🔒' : '⚠️'}
                </span>
                <span className="text-xs text-zinc-400">Trust-Lock: {flowState.trustLockStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Conductor Bar - AI Agent Insights and Next Actions */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-t border-zinc-700 py-3">
          <div className="flex items-center justify-between">
            {/* AI Agent Collaboration Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 text-sm">🤖</span>
                <span className="text-xs text-zinc-400">AI Agents:</span>
                <span className="text-xs text-emerald-400">Collaborating</span>
              </div>
              
              {/* Current Workflow */}
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 text-sm">🔄</span>
                <span className="text-xs text-zinc-400">Workflow:</span>
                <span className="text-xs text-blue-400 capitalize">{flowState.currentWorkflow.replace('-', ' ')}</span>
              </div>

              {/* Active Role */}
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 text-sm">👤</span>
                <span className="text-xs text-zinc-400">Role:</span>
                <span className="text-xs text-purple-400 uppercase">{flowState.activeRole}</span>
              </div>
            </div>

            {/* Next Action Recommendation */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-zinc-400">🎯 Next Action:</span>
              <span className="text-sm text-emerald-300 font-medium">{flowState.nextAction}</span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex space-x-1 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeGroup === group.label
                    ? `${group.bgColor} text-white border border-zinc-600`
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className={`${getFlowStatusIcon(group.flowState)} text-xs`}></span>
                <span>{group.label}</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Dropdown Menu */}
              {activeGroup === group.label && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl z-50">
                  {/* Group Header with AI Insight */}
                  <div className="p-4 border-b border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{group.label}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getFlowStatusColor(group.flowState)} bg-zinc-800`}>
                        {group.flowState}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{group.description}</p>
                    <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg p-3">
                      <div className="text-xs text-emerald-400 mb-1">🤖 AI Insight:</div>
                      <div className="text-xs text-zinc-300">{group.aiInsight}</div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="p-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block p-3 rounded-lg transition-all duration-200 ${
                          pathname === item.href
                            ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                            : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className={`text-xs ${getFlowStatusColor(item.flowState)}`}>
                            {getFlowStatusIcon(item.flowState)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-zinc-400 mb-2">{item.description}</div>
                        
                        {/* AI Recommendation */}
                        {item.aiRecommendation && (
                          <div className="bg-zinc-800/50 rounded p-2">
                            <div className="text-xs text-emerald-400 mb-1">💡 AI Recommendation:</div>
                            <div className="text-xs text-zinc-300">{item.aiRecommendation}</div>
                          </div>
                        )}

                        {/* Next Action */}
                        {item.nextAction && (
                          <div className="mt-2 text-xs text-blue-400">
                            ➡️ {item.nextAction}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;
