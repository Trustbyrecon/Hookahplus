"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  MapPin,
  Eye,
  UserPlus,
  QrCode
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
  icon: React.ReactNode;
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

  const [sessionCount, setSessionCount] = useState(0);

  // System Status Management
  useEffect(() => {
    const updateSystemStatus = () => {
      // Simulate realistic system status
      const workflows = ['idle', 'data-generation', 'session-management', 'customer-journey', 'admin-setup'];
      const roles = ['owner', 'foh', 'boh', 'admin'];
      const dataStatuses = ['empty', 'populated', 'active', 'flowing'];
      
      // Simulate session count (more realistic range)
      const newSessionCount = Math.floor(Math.random() * 25) + 5; // 5-30 sessions
      
      setFlowState(prev => ({
        ...prev,
        currentWorkflow: workflows[Math.floor(Math.random() * workflows.length)] as any,
        activeRole: roles[Math.floor(Math.random() * roles.length)] as any,
        dataStatus: dataStatuses[Math.floor(Math.random() * dataStatuses.length)] as any,
        progress: Math.floor(Math.random() * 20) + 40, // 40-60% (more realistic)
        nextAction: 'System monitoring active sessions and workflow optimization'
      }));
      
      setSessionCount(newSessionCount);
    };

    const interval = setInterval(updateSystemStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navigationGroups: NavGroup[] = [
    {
      label: 'Core Operations',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10',
      flowState: 'active',
      description: 'Essential workflow management',
      aiInsight: 'AI agents are optimizing your core operations',
      items: [
        {
          label: 'Dashboard',
          href: '/',
          icon: <Home className="w-4 h-4" />,
          description: 'Main control center',
          flowState: 'active',
          nextAction: 'Monitor system status',
          aiRecommendation: 'Check recent activity'
        },
        {
          label: 'Sessions',
          href: '/sessions',
          icon: <Flame className="w-4 h-4" />,
          description: 'Session overview',
          flowState: 'active',
          nextAction: 'View session list',
          aiRecommendation: 'Check session status'
        },
        {
          label: 'Fire Sessions',
          href: '/fire-session-dashboard',
          icon: <Flame className="w-4 h-4" />,
          description: 'Live session management',
          flowState: 'active',
          nextAction: 'Manage active fire sessions',
          aiRecommendation: 'Monitor live sessions'
        },
        {
          label: 'Operator Dashboard',
          href: '/operator',
          icon: <Crown className="w-4 h-4" />,
          description: 'Enterprise-grade operator control',
          flowState: 'active',
          nextAction: 'Access operator controls',
          aiRecommendation: 'Monitor system metrics and trust score'
        },
        {
          label: 'Pricing Intelligence',
          href: '/pricing',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Revenue optimization and pricing strategy',
          flowState: 'active',
          nextAction: 'Configure pricing tiers',
          aiRecommendation: 'Optimize add-on pricing for maximum revenue'
        }
      ]
    },
    {
      label: 'Staff Operations',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      flowState: 'active',
      description: 'Staff management and operations',
      aiInsight: 'Staff coordination is running smoothly',
      items: [
        {
          label: 'Staff Ops',
          href: '/staff-ops',
          icon: <Users className="w-4 h-4" />,
          description: 'Staff operations center',
          flowState: 'active',
          nextAction: 'Coordinate staff activities',
          aiRecommendation: 'Check staff assignments'
        },
        {
          label: 'Staff Panel',
          href: '/staff-panel',
          icon: <UserCheck className="w-4 h-4" />,
          description: 'Staff management panel',
          flowState: 'active',
          nextAction: 'Manage staff assignments',
          aiRecommendation: 'Review staff performance'
        }
      ]
    },
    {
      label: 'Visual Grounder',
      color: 'text-teal-300',
      bgColor: 'bg-teal-500/10',
      flowState: 'active',
      description: 'AI-powered lounge layout generation',
      aiInsight: 'Create seating maps from photos',
      items: [
        {
          label: 'Visual Grounder',
          href: '/visual-grounder',
          icon: <MapPin className="w-4 h-4" />,
          description: 'Upload photos to generate seating map',
          flowState: 'active',
          nextAction: 'Start visual grounder process',
          aiRecommendation: 'Upload 3-6 photos for best results'
        },
        {
          label: 'Layout Preview',
          href: '/layout-preview',
          icon: <Eye className="w-4 h-4" />,
          description: 'Real-time layout management',
          flowState: 'idle',
          nextAction: 'View generated layout',
          aiRecommendation: 'Deploy layout to dashboard'
        }
      ]
    },
    {
      label: 'Partnership',
      color: 'text-green-300',
      bgColor: 'bg-green-500/10',
      flowState: 'active',
      description: 'Partner program and referrals',
      aiInsight: 'Track your referrals and earnings',
      items: [
        {
          label: 'Partnership',
          href: '/partnership',
          icon: <UserPlus className="w-4 h-4" />,
          description: 'Partnership dashboard',
          flowState: 'active',
          nextAction: 'View partnership status',
          aiRecommendation: 'Check your referral progress'
        }
      ]
    },
    {
      label: 'Administration',
      color: 'text-red-300',
      bgColor: 'bg-red-500/10',
      flowState: 'idle',
      description: 'System administration and control',
      aiInsight: 'Admin functions are ready for use',
      items: [
        {
          label: 'Admin',
          href: '/admin',
          icon: <Crown className="w-4 h-4" />,
          description: 'Administrative control center',
          flowState: 'idle',
          nextAction: 'Access admin functions',
          aiRecommendation: 'Review system settings'
        },
        {
          label: 'QR Generator',
          href: '/admin/qr',
          icon: <QrCode className="w-4 h-4" />,
          description: 'Generate QR codes for lounge sessions',
          flowState: 'active',
          nextAction: 'Create QR codes for tables',
          aiRecommendation: 'Generate QR codes for customer entry flow'
        },
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

  return (
    <nav className="bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-zinc-300">System Health EXCELLENT</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-zinc-300">Trust Score 87%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-zinc-300">Live Sessions 0</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-zinc-400">Auto-refresh: ON</span>
            <span className="text-zinc-400">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-xl font-bold text-white">HOOKAH+</span>
            </Link>
          </div>

          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/fire-session-dashboard" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/preorder/T-001" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Pre-Order
            </Link>
            <Link href="/sessions" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Sessions
            </Link>
            <Link href="/staff-panel" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Staff
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Settings */}
            <button className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>

            {/* Support Docs */}
            <button className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Support Docs</span>
            </button>

            {/* Role Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">Role:</span>
              <select className="bg-zinc-800 border border-zinc-600 rounded-md px-2 py-1 text-sm text-white">
                <option value="manager">MANAGER</option>
                <option value="foh">FOH</option>
                <option value="boh">BOH</option>
                <option value="admin">ADMIN</option>
              </select>
              <span className="text-xs text-zinc-500">(FOH View)</span>
            </div>

            {/* Search */}
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-zinc-800">
        <div className="px-4 py-2 space-y-1">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
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
                    {item.flowState === 'active' && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto" />
                    )}
                  </Link>
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
