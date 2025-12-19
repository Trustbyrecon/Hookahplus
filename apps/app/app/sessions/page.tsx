"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  Star as StarIcon,
  MessageSquare,
  Timer,
  BarChart2,
  PieChart,
  LineChart
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import { Card, Button, Badge } from '../../components';
import { Session, SessionStatus, SessionTeam, SessionNotes } from '../../types/session';
import { SessionQueueManager } from '../../components/SessionQueueManager';
import { SessionMonitor } from '../../components/SessionMonitor';
import { StaffWorkflowAssistant } from '../../components/StaffWorkflowAssistant';
import { FOHTimerInterface } from '../../components/FOHTimerInterface';
import { ManagerTimerDashboard } from '../../components/ManagerTimerDashboard';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import SessionAnalyticsCard from '../../components/SessionAnalyticsCard';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import SyncIndicator from '../../components/SyncIndicator';
import { FireSession, STATUS_TO_TRACKER_STAGE, STATUS_TO_STAGE, ROLE_PERMISSIONS, TrackerStage } from '../../types/enhancedSession';

export default function SessionsPage() {
  return (
    <SessionProvider>
      <SessionsPageContent />
    </SessionProvider>
  );
}

function SessionsPageContent() {
  const [activeView, setActiveView] = useState('overview');
  const [managementView, setManagementView] = useState('queue');
  const [showAdvancedManagement, setShowAdvancedManagement] = useState(false);
  const { sessions: contextSessions, metrics: contextMetrics, sessionTimers, loading: contextLoading, lastUpdated, refreshSessions } = useSessionContext();
  const [sessionNotes, setSessionNotes] = useState<SessionNotes[]>([]);
  const [sessionFlags, setSessionFlags] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Fix hydration mismatch - only render counts after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use real sessions from context - no mock data
  const sessions = contextSessions;
  
  // Derive staff members from sessions
  const staffMembers = useMemo(() => {
    const staffMap = new Map<string, { id: string; name: string; role: 'BOH' | 'FOH'; status: 'active' | 'busy' | 'offline' }>();
    
    sessions.forEach(session => {
      // Extract BOH staff
      if (session.assignedStaff?.boh) {
        const staffId = session.assignedStaff.boh;
        if (!staffMap.has(`boh_${staffId}`)) {
          staffMap.set(`boh_${staffId}`, {
            id: `boh_${staffId}`,
            name: staffId, // In real implementation, this would come from a staff API
            role: 'BOH',
            status: 'active'
          });
        }
      }
      
      // Extract FOH staff
      if (session.assignedStaff?.foh) {
        const staffId = session.assignedStaff.foh;
        if (!staffMap.has(`foh_${staffId}`)) {
          staffMap.set(`foh_${staffId}`, {
            id: `foh_${staffId}`,
            name: staffId, // In real implementation, this would come from a staff API
            role: 'FOH',
            status: 'active'
          });
        }
      }
    });
    
    return Array.from(staffMap.values());
  }, [sessions]);
  
  // Filter sessions by role using STATUS_TO_STAGE
  const roleFilteredSessions = useMemo(() => {
    if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      return sessions; // Managers and admins see all sessions
    }
    
    return sessions.filter(session => {
      const stage = STATUS_TO_STAGE[session.status as keyof typeof STATUS_TO_STAGE];
      if (userRole === 'BOH') {
        return stage === 'BOH';
      } else if (userRole === 'FOH') {
        return stage === 'FOH';
      }
      return true;
    });
  }, [sessions, userRole]);
  
  // Group sessions by NAN tracker stage
  const sessionsByStage = useMemo(() => {
    const grouped: Record<TrackerStage, FireSession[]> = {
      Payment: [],
      Prep: [],
      Ready: [],
      Deliver: [],
      Light: []
    };
    
    sessions.forEach(session => {
      const stage = STATUS_TO_TRACKER_STAGE[session.status as keyof typeof STATUS_TO_TRACKER_STAGE];
      if (grouped[stage]) {
        grouped[stage].push(session);
      }
    });
    
    return grouped;
  }, [sessions]);

  const views = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'queue', label: 'Queue Manager', icon: <Users className="w-4 h-4" /> },
    { id: 'monitor', label: 'Live Monitor', icon: <Activity className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow Assistant', icon: <Zap className="w-4 h-4" /> },
    { id: 'timers', label: 'Timer Management', icon: <Timer className="w-4 h-4" /> },
    { id: 'performance', label: 'Staff Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'all-timers', label: 'All Timer Sessions', icon: <Clock className="w-4 h-4" /> }
  ];


  const handleStateChange = (sessionId: string, newState: SessionStatus, note?: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            state: newState,
            updatedAt: new Date(),
            ...(newState === 'ACTIVE' && !session.startedAt && { startedAt: new Date() }),
            ...(newState === 'COMPLETED' && { endedAt: new Date() })
          }
        : session
    ));
  };

  const handleAssignStaff = (sessionId: string, staffId: string, role: 'BOH' | 'FOH') => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            [`assigned${role}Id`]: staffId,
            updatedAt: new Date()
          }
        : session
    ));
  };

  const [bulkActionProgress, setBulkActionProgress] = useState<{
    isRunning: boolean;
    completed: number;
    total: number;
    errors: Array<{ sessionId: string; error: string }>;
  } | null>(null);

  const handleBulkAction = async (action: string, sessionIds: string[]) => {
    if (sessionIds.length === 0) {
      alert('Please select at least one session');
      return;
    }

    try {
      // Map action names to API actions
      const actionMap: Record<string, string> = {
        'start_prep': 'CLAIM_PREP',
        'mark_ready': 'READY_FOR_DELIVERY',
        'take_delivery': 'DELIVER_NOW',
        'pause': 'PUT_ON_HOLD',
        'complete': 'CLOSE_SESSION',
        'delete': 'VOID_SESSION',
        'cancel': 'VOID_SESSION'
      };

      const apiAction = actionMap[action] || action.toUpperCase();
      
      // Confirm destructive actions
      if (['delete', 'cancel', 'complete'].includes(action)) {
        const confirmed = confirm(
          `Are you sure you want to ${action} ${sessionIds.length} session(s)?`
        );
        if (!confirmed) return;
      }

      // Initialize progress tracking
      setBulkActionProgress({
        isRunning: true,
        completed: 0,
        total: sessionIds.length,
        errors: []
      });

      // Execute bulk action with progress tracking
      const results = await Promise.allSettled(
        sessionIds.map(async (sessionId, index) => {
          try {
            const response = await fetch(`/api/sessions`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                action: apiAction,
                userRole
              })
            });

            if (!response.ok) {
              const responseText = await response.text();
              let error;
              try {
                error = JSON.parse(responseText);
              } catch {
                error = { details: responseText || `HTTP ${response.status}` };
              }
              throw new Error(error.details || error.error || `Failed to ${action} session ${sessionId}`);
            }

            const responseText = await response.text();
            let result;
            if (!responseText) {
              result = { success: true, sessionId };
            } else {
              try {
                result = JSON.parse(responseText);
              } catch (e) {
                result = { success: true, sessionId, rawResponse: responseText };
              }
            }

            // Update progress
            setBulkActionProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1
            } : null);

            return result;
          } catch (error) {
            // Update progress with error
            setBulkActionProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              errors: [...prev.errors, {
                sessionId,
                error: error instanceof Error ? error.message : 'Unknown error'
              }]
            } : null);
            throw error;
          }
        })
      );

      // Count successes and failures
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      // Clear progress after a delay
      setTimeout(() => {
        setBulkActionProgress(null);
      }, 3000);

      if (failures > 0) {
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error')
          .slice(0, 5) // Limit to first 5 errors
          .join('\n');
        
        const errorCount = failures > 5 ? ` (showing first 5 of ${failures})` : '';
        
        alert(
          `Bulk action completed with errors:\n` +
          `✅ ${successes} succeeded\n` +
          `❌ ${failures} failed${errorCount}\n\n` +
          `Errors:\n${errors}`
        );
      } else {
        alert(`✅ Successfully ${action}d ${successes} session(s)`);
      }

      // Refresh sessions after bulk action
      await refreshSessions();
    } catch (error) {
      console.error('[Bulk Action] Error:', error);
      setBulkActionProgress(null);
      alert(`Failed to execute bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics - Use real metrics from SessionContext */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Sessions</p>
              <p className="text-2xl font-bold text-white">
                {isMounted ? contextMetrics.activeSessions : '...'}
              </p>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{isMounted ? contextMetrics.totalSessions : '...'}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Staff On Duty</p>
              <p className="text-2xl font-bold text-white">{isMounted ? staffMembers.length : '...'}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. Duration</p>
              <p className="text-2xl font-bold text-white">
                {isMounted && contextMetrics.avgDuration > 0
                  ? `${Math.round(contextMetrics.avgDuration)}m`
                  : '...'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Recent Sessions - Show NAN tracker stage */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <Flame className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p>No sessions yet</p>
            </div>
          ) : (
            sessions.slice(0, 5).map(session => {
              const trackerStage = STATUS_TO_TRACKER_STAGE[session.status as keyof typeof STATUS_TO_TRACKER_STAGE];
              return (
                <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">{session.tableId}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{session.customerName}</h4>
                      <p className="text-sm text-zinc-400">{session.flavor} • ${(session.amount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      trackerStage === 'Light' ? 'bg-green-500/20 text-green-400' :
                      trackerStage === 'Deliver' ? 'bg-purple-500/20 text-purple-400' :
                      trackerStage === 'Ready' ? 'bg-yellow-500/20 text-yellow-400' :
                      trackerStage === 'Prep' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {trackerStage}
                    </Badge>
                    {sessionTimers[session.id] && sessionTimers[session.id].isActive && (
                      <Badge className="bg-teal-500/20 text-teal-400">
                        Timer: {Math.floor(sessionTimers[session.id].remaining / 60)}m
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return renderOverview();
      case 'queue': return (
        <SessionQueueManager
          sessions={roleFilteredSessions as any}
          userRole={userRole}
          onBulkAction={handleBulkAction}
        />
      );
      case 'monitor': return (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Live Monitor - NAN Workflow Stages</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['Payment', 'Prep', 'Ready', 'Deliver', 'Light'] as TrackerStage[]).map(stage => (
                <div key={stage} className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{stage}</h4>
                    <Badge className="bg-zinc-700 text-white">
                      {sessionsByStage[stage].length}
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessionsByStage[stage].map(session => (
                      <div key={session.id} className="text-sm p-2 bg-zinc-700/50 rounded">
                        <div className="font-medium text-white">{session.tableId}</div>
                        <div className="text-zinc-400">{session.customerName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <SessionMonitor
            sessions={roleFilteredSessions as any}
            userRole={userRole}
            onRefresh={refreshSessions}
          />
        </div>
      );
      case 'workflow': return (
        <StaffWorkflowAssistant
          sessions={roleFilteredSessions as any}
          userRole={userRole}
          staffMembers={staffMembers}
          onAssignStaff={handleAssignStaff}
          onBulkAction={handleBulkAction}
        />
      );
      case 'timers': return (
        <div className="space-y-6">
          {userRole === 'FOH' && (
            <FOHTimerInterface
              assignedSessions={sessions.filter(s => s.assignedStaff?.foh) as any}
              onTimerAction={(sessionId, action) => {
                console.log(`Timer action ${action} for session ${sessionId}`);
              }}
              onSessionComplete={(sessionId) => {
                handleBulkAction('complete', [sessionId]);
              }}
            />
          )}
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">🚀 APP BUILD Enhanced Sessions Dashboard v2.0</h2>
                <p className="text-zinc-400">ROUTE: /sessions (APP BUILD) - Enhanced card-based session management</p>
              </div>
              <SimpleFSDDesign
                sessions={sessions}
                userRole={userRole}
                onSessionAction={async (action, sessionId) => {
                  await handleBulkAction(action.toLowerCase().replace('_', '_'), [sessionId]);
                  await refreshSessions();
                }}
                className="w-full"
              />
            </div>
          )}
        </div>
      );
      case 'performance': return (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Staff Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.map(staff => {
                const staffSessions = sessions.filter(s => 
                  (staff.role === 'BOH' && s.assignedStaff?.boh === staff.id.replace('boh_', '')) ||
                  (staff.role === 'FOH' && s.assignedStaff?.foh === staff.id.replace('foh_', ''))
                );
                const completedSessions = staffSessions.filter(s => s.status === 'CLOSED' || s.status === 'ACTIVE');
                const avgDuration = staffSessions.length > 0
                  ? Math.round(staffSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / staffSessions.length / 60)
                  : 0;
                
                return (
                  <div key={staff.id} className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{staff.name}</h4>
                      <Badge className={staff.role === 'BOH' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
                        {staff.role}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Sessions:</span>
                        <span className="text-white">{completedSessions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Avg Duration:</span>
                        <span className="text-white">{avgDuration}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {staffMembers.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p>No staff assignments found</p>
              </div>
            )}
          </Card>
        </div>
      );
      case 'all-timers': return (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All Timer Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(sessionTimers).length === 0 ? (
                <div className="col-span-full text-center py-8 text-zinc-400">
                  <Timer className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p>No active timers</p>
                </div>
              ) : (
                Object.entries(sessionTimers).map(([sessionId, timer]) => {
                  const session = sessions.find(s => s.id === sessionId);
                  if (!session) return null;
                  
                  return (
                    <div key={sessionId} className="p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Table {session.tableId}</h4>
                        <Badge className={
                          timer.isActive ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {timer.isActive ? 'running' : 'stopped'}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">{session.customerName}</p>
                      <p className="text-sm text-zinc-300">
                        Remaining: {Math.floor(timer.remaining / 60)}m {timer.remaining % 60}s
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />
        
        <PageHero
          headline="Sessions Management"
          subheadline="Advanced session management, monitoring, and workflow optimization. View session history, manage queues, and optimize staff workflows."
          benefit={{
            value: isMounted ? `${contextMetrics.activeSessions} Active Sessions` : '... Active Sessions',
            description: 'Monitor and manage all lounge sessions',
            icon: <Flame className="w-5 h-5 text-orange-400" />
          }}
          primaryCTA={{
            text: 'View Fire Dashboard',
            href: '/fire-session-dashboard'
          }}
          secondaryCTA={{
            text: 'View Analytics',
            href: '/analytics'
          }}
          trustIndicators={[
            { icon: <Activity className="w-4 h-4" />, text: 'Real-time monitoring' },
            { icon: <Users className="w-4 h-4" />, text: 'Multi-role support' }
          ]}
        />

        {/* Sync Indicator */}
        <div className="mb-6">
          <SyncIndicator
            lastUpdated={lastUpdated}
            isLoading={contextLoading || loading}
            autoRefreshInterval={30}
          />
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeView === view.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {view.icon}
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">Current Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="BOH">BOH (Back of House)</option>
              <option value="FOH">FOH (Front of House)</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Bulk Action Progress Indicator */}
        {bulkActionProgress && bulkActionProgress.isRunning && (
          <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Processing Bulk Action</span>
              <span className="text-xs text-zinc-400">
                {bulkActionProgress.completed} / {bulkActionProgress.total}
              </span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(bulkActionProgress.completed / bulkActionProgress.total) * 100}%`
                }}
              />
            </div>
            {bulkActionProgress.errors.length > 0 && (
              <div className="text-xs text-red-400 mt-2">
                {bulkActionProgress.errors.length} error(s) occurred
              </div>
            )}
          </div>
        )}

        {/* Related Features */}
        <div className="mt-16 border-t border-zinc-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Related Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/fire-session-dashboard"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Fire Session Dashboard</span>
              </div>
              <p className="text-sm text-zinc-400">Live session management with real-time updates</p>
            </Link>
            <Link
              href="/analytics"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Analytics</span>
              </div>
              <p className="text-sm text-zinc-400">View detailed analytics and reports</p>
            </Link>
            <Link
              href="/staff-ops"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Staff Operations</span>
              </div>
              <p className="text-sm text-zinc-400">Daily operations and staff management</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}