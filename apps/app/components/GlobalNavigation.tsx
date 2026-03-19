"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  TrendingUp,
  Target
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SecureRoleSelector } from './SecureRoleSelector';
import { clientClient } from '../lib/supabase-client';
import FunctionalHelp from './FunctionalHelp';
import { STATUS_TO_TRACKER_STAGE, TrackerStage } from '../types/enhancedSession';

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
  const searchParams = useSearchParams();
  const isDemoMode = searchParams?.get('mode') === 'demo';
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
  const [workflowProgress, setWorkflowProgress] = useState<{
    payment: number;
    prep: number;
    ready: number;
    deliver: number;
    light: number;
    currentStage: string;
  }>({
    payment: 0,
    prep: 0,
    ready: 0,
    deliver: 0,
    light: 0,
    currentStage: 'Payment'
  });
  const [showHelp, setShowHelp] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('manager');

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

  // Load persisted active role (used by selectors across the app)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedRole = localStorage.getItem('active_role');
    if (storedRole) {
      setActiveRole(storedRole);
    }
  }, []);

  // Check admin verification status
  useEffect(() => {
    const checkAdminVerification = async () => {
      try {
        const supabase = clientClient();
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
        // Fetch real session count and calculate workflow progress
        let sessionsResponse: Response;
        try {
          sessionsResponse = await fetch('/api/sessions');
        } catch (networkErr) {
          const msg = networkErr instanceof Error ? networkErr.message : 'Unknown';
          if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
            console.debug('[GlobalNavigation] Sessions API unavailable (network)');
          } else {
            console.warn('[GlobalNavigation] Sessions fetch failed:', msg);
          }
          return;
        }
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          
          // Handle graceful fallback mode (database not configured)
          if (sessionsData.fallbackMode) {
            setSessionCount(0);
            setWorkflowProgress({
              payment: 0,
              prep: 0,
              ready: 0,
              deliver: 0,
              light: 0,
              currentStage: 'Payment'
            });
            return; // Exit early, no error state needed
          }
          
          if (sessionsData.success && sessionsData.sessions) {
            const sessions = sessionsData.sessions;
            // Match FSD: "Live Sessions" = active only (ACTIVE, DELIVERED, OUT_FOR_DELIVERY)
            const activeCount = sessions.filter((s: any) => {
              const status = s.status || s.state || 'NEW';
              return ['ACTIVE', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(status);
            }).length;
            setSessionCount(activeCount);
            
            // Calculate workflow progress across all sessions using canonical 5-stage model
            const workflowStages = {
              payment: 0,
              prep: 0,
              ready: 0,
              deliver: 0,
              light: 0
            };
            const stageOrder: TrackerStage[] = ['Payment', 'Prep', 'Ready', 'Deliver', 'Light'];
            let currentStage: TrackerStage = 'Payment';
            let maxStageIndex = 0;
            
            sessions.forEach((session: any) => {
              const status = session.status || session.state || 'NEW';
              const trackerStage: TrackerStage =
                (session.stage as TrackerStage) ||
                STATUS_TO_TRACKER_STAGE[status as keyof typeof STATUS_TO_TRACKER_STAGE] ||
                'Payment';
              
              if (trackerStage === 'Payment') workflowStages.payment++;
              if (trackerStage === 'Prep') workflowStages.prep++;
              if (trackerStage === 'Ready') workflowStages.ready++;
              if (trackerStage === 'Deliver') workflowStages.deliver++;
              if (trackerStage === 'Light') workflowStages.light++;
              
              const idx = stageOrder.indexOf(trackerStage);
              if (idx > maxStageIndex) {
                maxStageIndex = idx;
                currentStage = trackerStage;
              }
            });
            
            // Convert to percentages
            const total = sessions.length || 1;
            setWorkflowProgress({
              payment: Math.round((workflowStages.payment / total) * 100),
              prep: Math.round((workflowStages.prep / total) * 100),
              ready: Math.round((workflowStages.ready / total) * 100),
              deliver: Math.round((workflowStages.deliver / total) * 100),
              light: Math.round((workflowStages.light / total) * 100),
              currentStage
            });
          }
        }

        // Fetch Trust-Lock status (skip if 401 in First Light mode - expected)
        let currentTrustLockStatus: 'active' | 'pending' | 'verified' = 'active';
        let currentVerificationRate = 100;
        
        let trustLockResponse: Response;
        try {
          trustLockResponse = await fetch('/api/trust-lock/status');
        } catch (networkErr) {
          const msg = networkErr instanceof Error ? networkErr.message : 'Unknown';
          if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
            console.debug('[GlobalNavigation] Trust-Lock API unavailable (network)');
          } else {
            console.warn('[GlobalNavigation] Trust-Lock fetch failed:', msg);
          }
          // Keep defaults, skip Reflex score update
          return;
        }
        if (trustLockResponse.ok) {
          const trustLockData = await trustLockResponse.json();
          if (trustLockData.success) {
            currentTrustLockStatus = trustLockData.status;
            currentVerificationRate = trustLockData.metrics?.verificationRate || (trustLockData.firstLightMode ? 100 : 0);
            setTrustLockStatus(currentTrustLockStatus);
            setTrustLockVerificationRate(currentVerificationRate);
            console.log('[GlobalNavigation] Trust-Lock status:', currentTrustLockStatus, 'Verification rate:', currentVerificationRate);
          }
        } else if (trustLockResponse.status === 401) {
          // In First Light mode, 401 is expected - don't log as error
          // The endpoint should return 200 in First Light mode, but if it doesn't, just skip
          console.log('[GlobalNavigation] Trust-Lock status: Skipped (First Light mode)');
          // Set default values for First Light mode
          currentTrustLockStatus = 'active';
          currentVerificationRate = 100;
          setTrustLockStatus('active');
          setTrustLockVerificationRate(100);
        } else {
          // Other errors - set to pending with low rate
          console.warn('[GlobalNavigation] Trust-Lock status fetch failed:', trustLockResponse.status);
          currentTrustLockStatus = 'pending';
          currentVerificationRate = 0;
          setTrustLockStatus('pending');
          setTrustLockVerificationRate(0);
        }

        // Calculate Reflex score based on Trust-Lock verification rate
        // Score formula: Verified (95%+): 92, Active (80-94%): 87-91, Pending (<80%): 60-82
        if (currentTrustLockStatus === 'verified') {
          setReflexScore(92);
        } else if (currentTrustLockStatus === 'active') {
          // Scale score based on verification rate: 80% = 87, 94% = 91
          const baseScore = 87;
          const rateBonus = Math.min((currentVerificationRate - 80) * 0.25, 4); // Max +4 points
          setReflexScore(Math.min(Math.round(baseScore + rateBonus), 91));
        } else {
          // Pending: scale from 60 (0%) to 82 (80%)
          const minScore = 60;
          const maxScore = 82;
          const rateFactor = Math.min(currentVerificationRate / 80, 1); // Cap at 80%
          setReflexScore(Math.round(minScore + (maxScore - minScore) * rateFactor));
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          console.debug('[GlobalNavigation] System status unavailable (network)');
        } else {
          console.error('[GlobalNavigation] Error fetching system status:', error);
        }
      }
    };

    // Update immediately on mount
    updateSystemStatus();
    
    // Listen for session updates to refresh status immediately
    const handleSessionUpdate = () => {
      console.log('[GlobalNavigation] Session updated event received, refreshing status...');
      updateSystemStatus();
    };
    
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    // Also update periodically (reduced to 15 seconds for better responsiveness)
    const interval = setInterval(updateSystemStatus, 15000); // Update every 15 seconds
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []); // Remove trustLockStatus dependency to avoid infinite loops

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
          label: 'Onboarding',
          href: '/onboarding/CODIGO',
          icon: <Target className="w-4 h-4" />,
          description: 'Lounge setup and configuration',
          flowState: 'idle',
          nextAction: 'Complete onboarding steps',
          aiRecommendation: 'Configure lounge identity, pricing, POS'
        },
        // NOTE: Public pricing + ROI live on hookahplus.net (marketing site).
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
          label: 'Pricing Intelligence',
          href: '/admin/pricing-intelligence',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'Internal pricing strategy board',
          flowState: 'idle',
          nextAction: 'Configure pricing tiers',
          aiRecommendation: 'Optimize add-on pricing for maximum revenue'
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
        {
          label: 'POS Inbox',
          href: '/admin/pos-inbox',
          icon: <FileText className="w-4 h-4" />,
          description: 'Review POS tickets and attach to sessions',
          flowState: 'active',
          nextAction: 'Attach recent tickets to sessions',
          aiRecommendation: 'Use AliethiaSandbox locally; validate Aliethia in prod'
        },
        {
          label: 'POS Ops',
          href: '/admin/pos-ops',
          icon: <BarChart3 className="w-4 h-4" />,
          description: 'POS operational view and exception counts',
          flowState: 'active',
          nextAction: 'Pull tickets, review exceptions, and reconcile',
          aiRecommendation: 'Keep unassigned tickets near zero'
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
    <>
    <nav className="relative z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Bar - Simplified for demo mode */}
        {isDemoMode ? (
          <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-teal-300 font-medium">DEMO MODE</span>
                <span className="text-zinc-500">Safe to explore - no real charges</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-zinc-300">Demo Sessions {isMounted ? sessionCount : '...'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-zinc-400">Last updated: {isMounted ? currentTime : '--:--:--'}</span>
            </div>
          </div>
        ) : (
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
              {/* Workflow Progress Indicator */}
              <div className="flex items-center space-x-2 px-2 py-1 bg-zinc-800/50 rounded border border-zinc-700">
                <span className="text-[10px] text-zinc-400 font-medium">Flow:</span>
                <div className="flex items-center gap-0.5">
                  <div className={`w-1.5 h-1.5 rounded ${workflowProgress.payment > 0 ? 'bg-green-500' : 'bg-zinc-600'}`} title={`Payment: ${workflowProgress.payment}%`} />
                  <div className={`w-1.5 h-1.5 rounded ${workflowProgress.prep > 0 ? 'bg-green-500' : 'bg-zinc-600'}`} title={`Prep: ${workflowProgress.prep}%`} />
                  <div className={`w-1.5 h-1.5 rounded ${workflowProgress.ready > 0 ? workflowProgress.currentStage === 'Ready' ? 'bg-teal-400 animate-pulse' : 'bg-green-500' : 'bg-zinc-600'}`} title={`Ready: ${workflowProgress.ready}%`} />
                  <div className={`w-1.5 h-1.5 rounded ${workflowProgress.deliver > 0 ? workflowProgress.currentStage === 'Deliver' ? 'bg-teal-400 animate-pulse' : 'bg-green-500' : 'bg-zinc-600'}`} title={`Deliver: ${workflowProgress.deliver}%`} />
                  <div className={`w-1.5 h-1.5 rounded ${workflowProgress.light > 0 ? workflowProgress.currentStage === 'Light' ? 'bg-orange-400 animate-pulse' : 'bg-orange-500' : 'bg-zinc-600'}`} title={`Light: ${workflowProgress.light}%`} />
                </div>
                <span className="text-[10px] text-teal-400 font-semibold ml-1">{workflowProgress.currentStage}</span>
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
        )}

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

          {/* Main Navigation Links - Simplified for demo mode */}
          <div className="hidden md:flex items-center space-x-8">
            {isDemoMode ? (
              <>
                <Link href="/fire-session-dashboard" className="text-zinc-300 hover:text-white transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/sessions" className="text-zinc-300 hover:text-white transition-colors font-medium">
                  Sessions
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
            
            {/* Quick Access Dropdown - Desktop - Hidden in demo mode */}
            {!isDemoMode && (
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
                    {isDemoMode ? (
                      <>
                        {/* Demo Experience */}
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Demo Experience</h3>
                          <div className="space-y-2">
                            <Link
                              href="/fire-session-dashboard"
                              onClick={() => setQuickAccessOpen(false)}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                            >
                              <Flame className="w-5 h-5 text-orange-400" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white group-hover:text-teal-400">Fire Session Dashboard</div>
                                <div className="text-xs text-zinc-400">Create and manage sessions</div>
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
                                <div className="text-xs text-zinc-400">View all sessions</div>
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
                                <div className="text-xs text-zinc-400">Get help with the demo</div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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

                        {/* Marketing */}
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Marketing</h3>
                          <div className="space-y-2">
                            <Link
                              href="/campaigns"
                              onClick={() => setQuickAccessOpen(false)}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                            >
                              <Target className="w-5 h-5 text-amber-400" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white group-hover:text-teal-400">Marketing Campaigns</div>
                                <div className="text-xs text-zinc-400">Promotions, coupons & happy hour</div>
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
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Right Side Actions - Hide advanced features in demo mode */}
          <div className="flex items-center space-x-4">
            {!isDemoMode && (
              <>
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

                {/* Role Dropdown with Security - single authoritative selector */}
                <SecureRoleSelector
                  currentRole={activeRole}
                  onRoleChange={(role) => {
                    setActiveRole(role);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('active_role', role);
                      window.dispatchEvent(new CustomEvent('activeRoleChanged', { detail: { role } }));
                    }
                  }}
                />

                {/* Search */}
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </>
            )}
            {isDemoMode && (
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-zinc-800">
        <div className="px-4 py-2 space-y-1">
          {/* Mobile Quick Access Button - Hidden in demo mode */}
          {!isDemoMode && (
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

                  {/* Marketing */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Marketing</h3>
                    <div className="space-y-1">
                      <Link
                        href="/campaigns"
                        onClick={() => setQuickAccessOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <Target className="w-4 h-4 text-amber-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">Marketing Campaigns</div>
                          <div className="text-xs text-zinc-400">Promotions, coupons & happy hour</div>
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
          )}

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
    
    {/* Functional Help Modal */}
    <FunctionalHelp 
      isOpen={showHelp} 
      onClose={() => setShowHelp(false)}
      isDemoMode={isDemoMode}
    />
  </>
  );
};

// Wrapper component with Suspense boundary for useSearchParams
const GlobalNavigationWithSuspense: React.FC = () => {
  return (
    <Suspense fallback={<div className="h-16 bg-zinc-950 border-b border-zinc-800"></div>}>
      <GlobalNavigation />
    </Suspense>
  );
};

export default GlobalNavigationWithSuspense;
