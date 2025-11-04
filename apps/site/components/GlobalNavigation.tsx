"use client";

import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../utils/cn';
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  HelpCircle, 
  FileText,
  Flame,
  ChefHat,
  UserCheck,
  Crown,
  CreditCard,
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  QrCode,
  Workflow
} from 'lucide-react';

// AI Agent Collaboration Interface
interface FlowState {
  currentWorkflow: 'idle' | 'data-generation' | 'session-management' | 'customer-journey' | 'admin-setup' | 'ai-optimization';
  activeRole: 'owner' | 'foh' | 'boh' | 'admin';
  dataStatus: 'empty' | 'populated' | 'active' | 'flowing';
  nextAction: string;
  progress: number;
  trustLockStatus: 'active' | 'pending' | 'verified';
  aiAgents: {
    aliethia: { status: 'active' | 'idle' | 'processing'; task: string; efficiency: number };
    echoPrime: { status: 'active' | 'idle' | 'processing'; task: string; efficiency: number };
    tier3: { status: 'active' | 'idle' | 'processing'; task: string; efficiency: number };
  };
  flowConstant: {
    lambda: number;
    resonance: 'low' | 'medium' | 'high' | 'optimal';
    alignment: number;
  };
  recommendations: Array<{
    id: string;
    type: 'navigation' | 'workflow' | 'optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    action?: string;
    icon: React.ReactNode;
  }>;
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
  icon: React.ReactNode;
  description?: string;
  flowState: 'idle' | 'active' | 'completed' | 'required';
  nextAction?: string;
  aiRecommendation?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  agentOptimized?: boolean;
  flowScore?: number;
  lastAccessed?: Date;
  usageFrequency?: number;
}

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<FlowState>({
    currentWorkflow: 'ai-optimization',
    activeRole: 'owner',
    dataStatus: 'flowing',
    nextAction: 'AI agents are optimizing your navigation flow',
    progress: 87,
    trustLockStatus: 'active',
    aiAgents: {
      aliethia: { status: 'active', task: 'Navigation optimization', efficiency: 94 },
      echoPrime: { status: 'active', task: 'Workflow analysis', efficiency: 89 },
      tier3: { status: 'processing', task: 'Flow constant calculation', efficiency: 92 }
    },
    flowConstant: {
      lambda: 0.87,
      resonance: 'high',
      alignment: 91
    },
    recommendations: [
      {
        id: 'nav-1',
        type: 'navigation',
        priority: 'high',
        message: 'Sessions page has high activity - consider pinning',
        action: '/sessions',
        icon: <Flame className="w-4 h-4" />
      },
      {
        id: 'workflow-1',
        type: 'workflow',
        priority: 'medium',
        message: 'Staff operations could benefit from AI optimization',
        action: '/staff-ops',
        icon: <Users className="w-4 h-4" />
      }
    ]
  });

  // AI Agent Collaboration - Dynamic Flow State Management
  useEffect(() => {
    const updateFlowState = () => {
      // Simulate AI agent collaboration with reflexive intelligence
      const workflows = ['ai-optimization', 'session-management', 'customer-journey', 'admin-setup', 'data-generation'];
      const roles = ['owner', 'foh', 'boh', 'admin'];
      const dataStatuses = ['flowing', 'active', 'populated'];
      const resonances = ['high', 'optimal', 'medium'] as const;
      
      setFlowState(prev => ({
        ...prev,
        currentWorkflow: workflows[Math.floor(Math.random() * workflows.length)] as any,
        activeRole: roles[Math.floor(Math.random() * roles.length)] as any,
        dataStatus: dataStatuses[Math.floor(Math.random() * dataStatuses.length)] as any,
        progress: Math.min(100, prev.progress + Math.floor(Math.random() * 3) - 1),
        nextAction: 'Reflexive agents are optimizing your navigation flow',
        aiAgents: {
          aliethia: { 
            status: 'active', 
            task: 'Navigation flow optimization', 
            efficiency: Math.min(100, prev.aiAgents.aliethia.efficiency + Math.floor(Math.random() * 2) - 1)
          },
          echoPrime: { 
            status: 'active', 
            task: 'User behavior analysis', 
            efficiency: Math.min(100, prev.aiAgents.echoPrime.efficiency + Math.floor(Math.random() * 2) - 1)
          },
          tier3: { 
            status: 'processing', 
            task: 'Flow constant Λ∞ calculation', 
            efficiency: Math.min(100, prev.aiAgents.tier3.efficiency + Math.floor(Math.random() * 2) - 1)
          }
        },
        flowConstant: {
          lambda: Math.min(1, prev.flowConstant.lambda + (Math.random() * 0.02 - 0.01)),
          resonance: resonances[Math.floor(Math.random() * resonances.length)],
          alignment: Math.min(100, prev.flowConstant.alignment + Math.floor(Math.random() * 2) - 1)
        }
      }));
    };

    const interval = setInterval(updateFlowState, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigationGroups: NavGroup[] = [
    {
      label: 'Core Operations',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10',
      flowState: 'active',
      description: 'Essential workflow management',
      aiInsight: 'Reflexive agents optimizing core operations',
      items: [
        {
          label: 'Dashboard',
          href: '/',
          icon: <Home className="w-4 h-4" />,
          description: 'Main control center',
          flowState: 'active',
          nextAction: 'Monitor system status',
          aiRecommendation: 'Check recent activity',
          priority: 'high',
          agentOptimized: true,
          flowScore: 95,
          usageFrequency: 85
        },
        {
          label: 'Sessions',
          href: '/sessions',
          icon: <Flame className="w-4 h-4" />,
          description: 'Fire session management',
          flowState: 'active',
          nextAction: 'Manage active sessions',
          aiRecommendation: 'Review session analytics',
          priority: 'critical',
          agentOptimized: true,
          flowScore: 98,
          usageFrequency: 92
        }
      ]
    },
    {
      label: 'Staff Operations',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      flowState: 'active',
      description: 'Staff management and operations',
      aiInsight: 'AI agents optimizing staff coordination',
      items: [
        {
          label: 'Staff Ops',
          href: '/staff-ops',
          icon: <Users className="w-4 h-4" />,
          description: 'Staff operations center',
          flowState: 'active',
          nextAction: 'Coordinate staff activities',
          aiRecommendation: 'Check staff assignments',
          priority: 'high',
          agentOptimized: true,
          flowScore: 88,
          usageFrequency: 78
        },
        {
          label: 'Staff Panel',
          href: '/staff-panel',
          icon: <UserCheck className="w-4 h-4" />,
          description: 'Staff management panel',
          flowState: 'active',
          nextAction: 'Manage staff assignments',
          aiRecommendation: 'Review staff performance',
          priority: 'medium',
          agentOptimized: true,
          flowScore: 82,
          usageFrequency: 65
        }
      ]
    },
    {
      label: 'Administration',
      color: 'text-red-300',
      bgColor: 'bg-red-500/10',
      flowState: 'idle',
      description: 'System administration and control',
      aiInsight: 'Admin functions ready for reflexive optimization',
      items: [
        {
          label: 'Admin',
          href: '/admin',
          icon: <Crown className="w-4 h-4" />,
          description: 'Administrative control center',
          flowState: 'idle',
          nextAction: 'Access admin functions',
          aiRecommendation: 'Review system settings',
          priority: 'low',
          agentOptimized: false,
          flowScore: 45,
          usageFrequency: 25
        },
        {
          label: 'QR Generator',
          href: '/admin/qr-generator',
          icon: <QrCode className="w-4 h-4" />,
          description: 'Generate QR codes for tables',
          flowState: 'idle',
          nextAction: 'Create QR codes for lounge',
          aiRecommendation: 'Generate table QR codes',
          priority: 'medium',
          agentOptimized: true,
          flowScore: 75,
          usageFrequency: 40
        }
      ]
    },
    {
      label: 'Integration',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      flowState: 'active',
      description: 'Smart payment architecture and partnerships',
      aiInsight: 'AI agents monitoring integration opportunities',
      items: [
        {
          label: 'Flavor Demo',
          href: '/flavor-demo',
          icon: <Sparkles className="w-4 h-4" />,
          description: 'Try the flavor wheel experience',
          flowState: 'active',
          nextAction: 'Experience interactive demo',
          aiRecommendation: 'See the future of flavor selection',
          priority: 'medium',
          agentOptimized: true,
          flowScore: 85,
          usageFrequency: 55
        }
      ]
    },
    {
      label: 'Support & Resources',
      color: 'text-green-300',
      bgColor: 'bg-green-500/10',
      flowState: 'active',
      description: 'Help and documentation',
      aiInsight: 'AI-powered support system active',
      items: [
        {
          label: 'Support',
          href: '/support',
          icon: <HelpCircle className="w-4 h-4" />,
          description: 'Get help and support',
          flowState: 'active',
          nextAction: 'Access support resources',
          aiRecommendation: 'AI agents ready to assist',
          priority: 'medium',
          agentOptimized: true,
          flowScore: 90,
          usageFrequency: 35
        },
        {
          label: 'Docs',
          href: '/docs',
          icon: <FileText className="w-4 h-4" />,
          description: 'Documentation and guides',
          flowState: 'active',
          nextAction: 'Browse documentation',
          aiRecommendation: 'Comprehensive guides available',
          priority: 'medium',
          agentOptimized: true,
          flowScore: 88,
          usageFrequency: 30
        }
      ]
    }
  ];

  const getFlowStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return '😴';
      case 'active': return '⚡';
      case 'completed': return '✅';
      case 'required': return '🔧';
      default: return '⚡';
    }
  };

  const getFlowStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-zinc-400';
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'required': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-zinc-400 bg-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getFlowScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'processing': return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'idle': return <AlertTriangle className="w-3 h-3 text-zinc-400" />;
      default: return <CheckCircle className="w-3 h-3 text-green-400" />;
    }
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-xl font-bold text-white">HOOKAH+</span>
            </div>
            
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationGroups.map((group) => (
              <div key={group.label} className="relative">
                <div className="flex items-center space-x-1">
                  {group.items
                    .sort((a, b) => {
                      // Sort by priority first, then by flow score
                      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
                      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
                      
                      if (aPriority !== bPriority) return bPriority - aPriority;
                      return (b.flowScore || 0) - (a.flowScore || 0);
                    })
                    .map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <div key={item.href} className="relative group">
                        <a
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          
                          {/* Priority and Flow Indicators */}
                          <div className="flex items-center space-x-1">
                            {item.agentOptimized && (
                              <Brain className="w-3 h-3 text-primary-400" />
                            )}
                          </div>
                        </a>
                        
                        {/* Simplified Tooltip */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                            <p className="text-xs text-zinc-300">{item.description}</p>
                            
                            {item.aiRecommendation && (
                              <div className="bg-primary-500/10 border border-primary-500/30 rounded p-2">
                                <div className="flex items-center mb-1">
                                  <Brain className="w-3 h-3 text-primary-400 mr-1" />
                                  <span className="text-xs font-medium text-primary-300">AI Insight</span>
                                </div>
                                <p className="text-xs text-zinc-300">{item.aiRecommendation}</p>
                              </div>
                            )}
                            
                            {item.nextAction && (
                              <div className="flex items-center text-xs text-zinc-400">
                                <Target className="w-3 h-3 mr-1" />
                                <span>{item.nextAction}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* AI Agent Status */}
            <div className="hidden xl:flex items-center space-x-3">
              {/* AI Agents hidden from public navigation */}
              {/* <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-primary-400" />
                <span className="text-xs text-zinc-400">Agents:</span>
                <div className="flex items-center space-x-1">
                  {getAgentStatusIcon(flowState.aiAgents.aliethia.status)}
                  <span className="text-xs text-zinc-300">Aliethia</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getAgentStatusIcon(flowState.aiAgents.echoPrime.status)}
                  <span className="text-xs text-zinc-300">EchoPrime</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getAgentStatusIcon(flowState.aiAgents.tier3.status)}
                  <span className="text-xs text-zinc-300">Tier3</span>
                </div>
              </div> */}
            </div>

            {/* Trust Lock Status */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400">Trust-Lock: TLH-v1::active</span>
              </div>
            </div>

            {/* AI Recommendations */}
            {flowState.recommendations.length > 0 && (
              <div className="hidden lg:flex items-center space-x-2">
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-sm text-zinc-400 hover:text-white transition-colors">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>AI Insights</span>
                  </button>
                  
                  {/* Simplified AI Recommendations Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white mb-2">AI Recommendations</h3>
                      {flowState.recommendations.map((rec) => (
                        <div key={rec.id} className="bg-zinc-800 border border-zinc-600 rounded p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            {rec.icon}
                            <span className="text-xs text-zinc-400">{rec.type}</span>
                          </div>
                          <p className="text-xs text-zinc-300">{rec.message}</p>
                          {rec.action && (
                            <a href={rec.action} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                              Take action →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support and Docs - Clean links */}
            <div className="flex items-center space-x-2">
              <a
                href="/support"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Support
              </a>
              <a
                href="/docs"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Docs
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-zinc-800">
        <div className="px-4 py-2 space-y-1">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;
