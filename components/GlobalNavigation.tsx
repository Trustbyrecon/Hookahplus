import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description: string;
  flowState: 'active' | 'idle' | 'completed' | 'required';
  nextAction?: string;
  aiRecommendation?: string;
}

interface NavGroup {
  label: string;
  color: string;
  bgColor: string;
  flowState: 'active' | 'idle' | 'completed' | 'required';
  description: string;
  aiInsight?: string;
  items: NavItem[];
}

interface FlowState {
  currentWorkflow: string;
  isGenerating: boolean;
  progress: number;
}

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<NavGroup | null>(null);
  const [flowState, setFlowState] = useState<FlowState>({
    currentWorkflow: 'session-management',
    isGenerating: false,
    progress: 0
  });

  // Determine current navigation group
  useEffect(() => {
    const currentGroup = navGroups.find(group => 
      group.items.some(item => item.href === pathname)
    );
    setActiveGroup(currentGroup || null);
  }, [pathname]);

  // Simulate flow state updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 10, 100)
      }));
    }, 2000);
    
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
          label: 'Customer Journey', 
          href: '/customer-journey', 
          icon: '👤', 
          description: 'Customer experience flow',
          flowState: pathname === '/customer-journey' ? 'active' : 'idle',
          nextAction: 'Start customer journey',
          aiRecommendation: 'Experience the full customer flow'
        },
        { 
          label: 'Demo Flow', 
          href: '/demo-flow', 
          icon: '🎬', 
          description: 'System demonstration',
          flowState: 'idle',
          nextAction: 'Run demo',
          aiRecommendation: 'Showcase system capabilities'
        },
        { 
          label: 'Demo Video', 
          href: '/demo-video', 
          icon: '🎥', 
          description: 'Video demonstration',
          flowState: 'idle',
          nextAction: 'Watch demo video',
          aiRecommendation: 'Visual system overview'
        }
      ]
    },
    {
      label: 'Public',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      flowState: 'idle',
      description: 'Public-facing pages and customer access',
      aiInsight: 'AI Agent: Public pages ready for customer engagement',
      items: [
        { 
          label: 'Landing', 
          href: '/landing', 
          icon: '🌐', 
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
      label: 'Support',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-500/10',
      flowState: 'idle',
      description: 'Customer support and help resources',
      aiInsight: 'AI Agent: Support system ready to assist customers',
      items: [
        { 
          label: 'Help Center', 
          href: '/support', 
          icon: '🎫', 
          description: 'FAQ, contact forms, and support tickets',
          flowState: pathname === '/support' ? 'active' : 'idle',
          nextAction: 'Get help',
          aiRecommendation: 'Customer support and troubleshooting'
        },
        { 
          label: 'Documentation', 
          href: '/docs', 
          icon: '📚', 
          description: 'User guides and API documentation',
          flowState: pathname === '/docs' ? 'active' : 'idle',
          nextAction: 'Read documentation',
          aiRecommendation: 'Comprehensive guides and references'
        },
        { 
          label: 'API Docs', 
          href: '/api-docs', 
          icon: '🔌', 
          description: 'Developer API reference',
          flowState: pathname === '/api-docs' ? 'active' : 'idle',
          nextAction: 'View API reference',
          aiRecommendation: 'Developer resources and integration guides'
        }
      ]
    },
    {
      label: 'Staff',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
      flowState: 'idle',
      description: 'Staff operations and management',
      aiInsight: 'AI Agent: Staff tools ready for operational management',
      items: [
        { 
          label: 'Staff Ops', 
          href: '/staff', 
          icon: '👥', 
          description: 'Staff operations dashboard',
          flowState: pathname === '/staff' ? 'active' : 'idle',
          nextAction: 'Manage staff operations',
          aiRecommendation: 'Staff workflow management'
        },
        { 
          label: 'Staff Panel', 
          href: '/staff-panel', 
          icon: '🧠', 
          description: 'Behavioral memory & customer profiles',
          flowState: pathname === '/staff-panel' ? 'active' : 'idle',
          nextAction: 'Manage customer preferences',
          aiRecommendation: 'Access customer behavioral data and session management'
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
          flowState: pathname === '/admin-customers' ? 'active' : 'idle',
          nextAction: 'Manage customer data',
          aiRecommendation: 'Customer relationship management'
        },
        { 
          label: 'Connectors', 
          href: '/admin-connectors', 
          icon: '🔗', 
          description: 'Integration management',
          flowState: pathname === '/admin-connectors' ? 'active' : 'idle',
          nextAction: 'Configure integrations',
          aiRecommendation: 'System connectivity setup'
        },
        { 
          label: 'Admin', 
          href: '/admin', 
          icon: '⚙️', 
          description: 'System administration',
          flowState: pathname === '/admin' ? 'active' : 'idle',
          nextAction: 'System configuration',
          aiRecommendation: 'Complete admin control center'
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
      case 'active': return '🔄';
      case 'completed': return '✅';
      case 'required': return '⚠️';
      default: return '⏸️';
    }
  };

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Logo and Current Page */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
              <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            </Link>
            {currentGroup && (
              <div className={`${currentGroup.bgColor} text-zinc-300 text-sm font-medium px-3 py-1 rounded-lg border transition-all duration-300`}>
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
            
            <div className="text-center">
              <div className="text-sm text-zinc-400">Flow Status</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getFlowStatusIcon(currentGroup?.flowState || 'idle')}</span>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{currentGroup?.label || 'Navigation'}</span>
                  <span className="text-xs text-zinc-400">{currentGroup?.flowState || 'idle'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-between py-3 border-t border-zinc-800/50">
          <div className="flex space-x-1">
            {navGroups.map((group) => (
              <div key={group.label} className="relative group">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    group === currentGroup
                      ? `${group.bgColor} text-white border border-zinc-600`
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {group.label}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${group.bgColor}`}></div>
                      <h3 className="text-white font-semibold">{group.label}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${group.bgColor} text-zinc-300`}>
                        {group.flowState}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">{group.description}</p>
                    
                    {group.aiInsight && (
                      <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-400 text-sm">🤖</span>
                          <p className="text-yellow-200 text-xs">{group.aiInsight}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block p-3 rounded-lg transition-all duration-200 ${
                            item.href === pathname
                              ? 'bg-zinc-800 text-white'
                              : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{item.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{item.label}</span>
                                <span className={`text-xs ${getFlowStatusColor(item.flowState)}`}>
                                  {getFlowStatusIcon(item.flowState)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                              {item.nextAction && (
                                <p className="text-xs text-blue-400 mt-1">Next: {item.nextAction}</p>
                              )}
                              {item.aiRecommendation && (
                                <p className="text-xs text-emerald-400 mt-1">💡 {item.aiRecommendation}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href="/support"
              className="px-3 py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-600/30 transition-colors"
            >
              🎫 Support
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 bg-blue-600/20 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              📚 Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalNavigation;