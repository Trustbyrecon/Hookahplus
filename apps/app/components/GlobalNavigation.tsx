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
  QrCode,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SecureRoleSelector } from './SecureRoleSelector';
import { createClient } from '@supabase/supabase-js';

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
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>({
    currentWorkflow: 'idle',
    activeRole: 'owner',
    dataStatus: 'empty',
    nextAction: 'Generate demo data to see the system in action',
    progress: 0,
    trustLockStatus: 'active'
  });

  const [sessionCount, setSessionCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [trustLockStatus, setTrustLockStatus] = useState<'active' | 'pending' | 'verified'>('active');
  const [trustLockVerificationRate, setTrustLockVerificationRate] = useState<number>(100);
  const [reflexScore, setReflexScore] = useState<number>(87);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  // Close Quick Access dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (quickAccessOpen && !target.closest('.quick-access-dropdown')) {
        setQuickAccessOpen(false);
      }
    };
    if (quickAccessOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quickAccessOpen]);

  // Fix hydration mismatch - only render time after mount
  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Check admin verification status
  useEffect(() => {
    const checkAdminVerification = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseAnonKey) return;

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check user metadata for admin verification
          const adminVerified = user.user_metadata?.admin_verified === true;
          const activeRole = user.user_metadata?.active_role;
          const roleVerifiedAt = user.user_metadata?.role_verified_at;
          
          // Also check if user has admin/owner membership
          const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .in('role', ['admin', 'owner'])
            .limit(1)
            .single();

          // User is verified admin if:
          // 1. Has admin_verified flag in metadata, OR
          // 2. Has admin/owner membership and active_role is admin
          setIsAdminVerified(
            adminVerified || 
            (membership && activeRole === 'admin' && roleVerifiedAt) ||
            (membership && (membership.role === 'admin' || membership.role === 'owner'))
          );
        }
      } catch (error) {
        console.error('[GlobalNavigation] Error checking admin verification:', error);
      }
    };

    checkAdminVerification();
    // Re-check periodically in case verification status changes
    const interval = setInterval(checkAdminVerification, 30000);
    return () => clearInterval(interval);
  }, []);

  // System Status Management - Real Data
  useEffect(() => {
    const updateSystemStatus = async () => {
      try {
        // Fetch real session count
        const sessionsResponse = await fetch('/api/sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.success && sessionsData.sessions) {
            setSessionCount(sessionsData.sessions.length);
          }
        }

        // Fetch Trust-Lock status
        const trustLockResponse = await fetch('/api/trust-lock/status');
        if (trustLockResponse.ok) {
          const trustLockData = await trustLockResponse.json();
          if (trustLockData.success) {
            setTrustLockStatus(trustLockData.status);
            setTrustLockVerificationRate(trustLockData.metrics?.verificationRate || 100);
          }
        }

        // Fetch Reflex score (placeholder - implement API later)
        // For now, calculate based on Trust-Lock status
        if (trustLockStatus === 'verified') {
          setReflexScore(92);
        } else if (trustLockStatus === 'active') {
          setReflexScore(87);
        } else {
          setReflexScore(82);
        }
      } catch (error) {
        console.error('[GlobalNavigation] Error fetching system status:', error);
      }
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [trustLockStatus]);

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
    <nav className="relative z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                trustLockStatus === 'verified' ? 'bg-green-400 animate-pulse' :
                trustLockStatus === 'active' ? 'bg-blue-400' :
                'bg-yellow-400'
              }`}></div>
              <span className="text-zinc-300">Trust-Lock {trustLockStatus.toUpperCase()}</span>
              <span className="text-zinc-500">({trustLockVerificationRate}%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                reflexScore >= 90 ? 'bg-green-400' :
                reflexScore >= 85 ? 'bg-blue-400' :
                'bg-yellow-400'
              }`}></div>
              <span className="text-zinc-300">Reflex Score {reflexScore}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-zinc-300">Live Sessions {isMounted ? sessionCount : '...'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-zinc-400">Auto-refresh: ON</span>
            <span className="text-zinc-400">Last updated: {isMounted ? currentTime : '--:--:--'}</span>
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
            
            {/* Quick Access Dropdown - Desktop */}
            <div className="relative quick-access-dropdown">
              <button
                onClick={() => setQuickAccessOpen(!quickAccessOpen)}
                className="flex items-center space-x-1 text-zinc-300 hover:text-white transition-colors font-medium"
                aria-label="Quick Access Menu"
                aria-expanded={quickAccessOpen}
              >
                <span>Quick Access</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${quickAccessOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {quickAccessOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 md:w-[28rem] lg:w-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-[9999] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                  <div className="p-4 space-y-6">
                    {/* Core Operations */}
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Core Operations</h3>
                      <div className="space-y-2">
                        <Link
                          href="/fire-session-dashboard"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <Flame className="w-5 h-5 text-orange-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Fire Session Dashboard</div>
                            <div className="text-xs text-zinc-400">Live session management</div>
                          </div>
                        </Link>
                        <Link
                          href="/sessions"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <BarChart3 className="w-5 h-5 text-teal-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Sessions</div>
                            <div className="text-xs text-zinc-400">Session overview & history</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Owner & Admin */}
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Owner & Admin</h3>
                      <div className="space-y-2">
                        <Link
                          href="/operator"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <Crown className="w-5 h-5 text-emerald-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Operator Dashboard</div>
                            <div className="text-xs text-zinc-400">Enterprise control & metrics</div>
                          </div>
                        </Link>
                        <Link
                          href="/analytics"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Analytics</div>
                            <div className="text-xs text-zinc-400">Reports & insights</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Staff */}
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Staff</h3>
                      <div className="space-y-2">
                        <Link
                          href="/staff-ops"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <Users className="w-5 h-5 text-purple-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Staff Operations</div>
                            <div className="text-xs text-zinc-400">Daily operations & tasks</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Setup & Configuration */}
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Setup & Configuration</h3>
                      <div className="space-y-2">
                        <Link
                          href="/lounge-layout"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <Eye className="w-5 h-5 text-indigo-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Lounge Layout</div>
                            <div className="text-xs text-zinc-400">Digitize your floor plan</div>
                          </div>
                        </Link>
                        <Link
                          href="/qr-generator"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <QrCode className="w-5 h-5 text-cyan-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">QR Generator</div>
                            <div className="text-xs text-zinc-400">Generate table QR codes</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Support */}
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Support</h3>
                      <div className="space-y-2">
                        <Link
                          href="/help"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                        >
                          <HelpCircle className="w-5 h-5 text-pink-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white group-hover:text-teal-400">Help Center</div>
                            <div className="text-xs text-zinc-400">Support & documentation</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

            {/* Role Dropdown with Security */}
            <SecureRoleSelector
              currentRole="foh"
              onRoleChange={(role) => {
                // Handle role change (could update state, localStorage, etc.)
                console.log('Role changed to:', role);
                // TODO: Update user's active role in session/localStorage
              }}
            />

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
          {/* Mobile Quick Access Button */}
          <div className="mb-4 pb-4 border-b border-zinc-800">
            <button
              onClick={() => setQuickAccessOpen(!quickAccessOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Quick Access Menu"
              aria-expanded={quickAccessOpen}
            >
              <span className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Quick Access</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${quickAccessOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Mobile Quick Access Dropdown */}
            {quickAccessOpen && (
              <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto">
                <div className="p-3 space-y-4">
                  {/* Core Operations */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Core Operations</h3>
                    <div className="space-y-1">
                      <Link
                        href="/fire-session-dashboard"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <Flame className="w-4 h-4 text-orange-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Fire Session Dashboard</div>
                          <div className="text-xs text-zinc-400">Live session management</div>
                        </div>
                      </Link>
                      <Link
                        href="/sessions"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-teal-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Sessions</div>
                          <div className="text-xs text-zinc-400">Session overview & history</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Owner & Admin */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Owner & Admin</h3>
                    <div className="space-y-1">
                      {/* Administrator - Only visible after magic link verification */}
                      {isAdminVerified && (
                        <Link
                          href="/admin"
                          onClick={() => setQuickAccessOpen(false)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors border border-teal-500/30 bg-teal-500/10"
                        >
                          <Shield className="w-4 h-4 text-teal-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Administrator</div>
                            <div className="text-xs text-zinc-400">Admin control center</div>
                          </div>
                        </Link>
                      )}
                      <Link
                        href="/operator"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <Crown className="w-4 h-4 text-emerald-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Operator Dashboard</div>
                          <div className="text-xs text-zinc-400">Enterprise control & metrics</div>
                        </div>
                      </Link>
                      <Link
                        href="/analytics"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Analytics</div>
                          <div className="text-xs text-zinc-400">Reports & insights</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Staff */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Staff</h3>
                    <div className="space-y-1">
                      <Link
                        href="/staff-ops"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Staff Operations</div>
                          <div className="text-xs text-zinc-400">Daily operations & tasks</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Setup & Configuration */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Setup & Configuration</h3>
                    <div className="space-y-1">
                      <Link
                        href="/lounge-layout"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Lounge Layout</div>
                          <div className="text-xs text-zinc-400">Digitize your floor plan</div>
                        </div>
                      </Link>
                      <Link
                        href="/qr-generator"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">QR Generator</div>
                          <div className="text-xs text-zinc-400">Generate table QR codes</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Support */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Support</h3>
                    <div className="space-y-1">
                      <Link
                        href="/help"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-pink-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Help Center</div>
                          <div className="text-xs text-zinc-400">Support & documentation</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regular Mobile Navigation Items */}
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
