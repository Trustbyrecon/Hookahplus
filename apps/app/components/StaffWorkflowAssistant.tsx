"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Target,
  TrendingUp,
  ChefHat,
  Truck,
  UserCheck,
  Crown,
  Shield,
  Play,
  Pause,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Settings,
  BarChart3,
  Timer,
  Activity
} from 'lucide-react';
import Button from './Button';
import type { AliethiaPolicy } from '../lib/aliethia/types';

interface StaffWorkflowAssistantProps {
  sessions: any[];
  userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  staffMembers: any[];
  onAssignStaff?: (sessionId: string, staffId: string, role: 'BOH' | 'FOH') => void;
  onBulkAction?: (action: string, sessionIds: string[]) => void;
  loungeId?: string;
}

export function StaffWorkflowAssistant({ 
  sessions, 
  userRole, 
  staffMembers, 
  onAssignStaff, 
  onBulkAction,
  loungeId: loungeIdProp
}: StaffWorkflowAssistantProps) {
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [workflowMode, setWorkflowMode] = useState<'balanced' | 'speed' | 'quality'>('balanced');
  const [showStaffStatus, setShowStaffStatus] = useState(true);
  const [aliethiaPolicy, setAliethiaPolicy] = useState<AliethiaPolicy | null>(null);

  const loungeId = useMemo(() => {
    if (loungeIdProp) return loungeIdProp;
    const ids = Array.from(
      new Set(
        (sessions || [])
          .map((s: any) => s?.loungeId)
          .filter(Boolean)
          .map(String)
      )
    );
    // Only apply policy when this view is clearly scoped to a single lounge.
    return ids.length === 1 ? ids[0] : null;
  }, [loungeIdProp, sessions]);

  useEffect(() => {
    let cancelled = false;
    async function loadPolicy() {
      if (!loungeId) {
        setAliethiaPolicy(null);
        return;
      }
      try {
        const res = await fetch(`/api/lounges/${encodeURIComponent(loungeId)}/aliethia/policy`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAliethiaPolicy(data?.policy || null);
      } catch {
        if (!cancelled) setAliethiaPolicy(null);
      }
    }
    loadPolicy();
    return () => {
      cancelled = true;
    };
  }, [loungeId]);

  // Staff workload analysis
  const staffWorkload = useMemo(() => {
    const workload: { [key: string]: { 
      id: string; 
      name: string; 
      role: string; 
      activeSessions: number; 
      completedToday: number; 
      avgSessionTime: number;
      efficiency: number;
      status: 'available' | 'busy' | 'overloaded';
    } } = {};

    staffMembers.forEach(staff => {
      const staffSessions = sessions.filter(s => 
        s.assignedBOHId === staff.id || s.assignedFOHId === staff.id
      );
      
      const activeSessions = staffSessions.filter(s => 
        ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'ACTIVE', 'PAUSED'].includes(s.state)
      ).length;

      const completedToday = staffSessions.filter(s => 
        s.state === 'COMPLETED' && 
        new Date(s.endedAt || s.updatedAt).toDateString() === new Date().toDateString()
      ).length;

      const avgSessionTime = staffSessions.length > 0 
        ? staffSessions.reduce((sum, s) => sum + (s.durationSecs || 0), 0) / staffSessions.length / 60
        : 0;

      const efficiency = completedToday > 0 ? Math.min(100, (completedToday * 60) / Math.max(1, avgSessionTime)) : 0;

      let status: 'available' | 'busy' | 'overloaded' = 'available';
      if (activeSessions >= 3) status = 'overloaded';
      else if (activeSessions >= 2) status = 'busy';

      workload[staff.id] = {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        activeSessions,
        completedToday,
        avgSessionTime: Math.round(avgSessionTime),
        efficiency: Math.round(efficiency),
        status
      };
    });

    return workload;
  }, [sessions, staffMembers]);

  // Workflow recommendations
  const workflowRecommendations = useMemo(() => {
    const promptsEnabled = aliethiaPolicy?.surfacesEnabled?.timed_assist_prompts ?? true;
    const throttleBack = aliethiaPolicy?.throttleBackRecommended ?? false;
    if (!promptsEnabled) return [];

    const recommendations = [];
    const now = new Date();

    // Unassigned sessions
    const unassignedSessions = sessions.filter(s => 
      !s.assignedBOHId && !s.assignedFOHId && 
      ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(s.state)
    );

    if (unassignedSessions.length > 0) {
      recommendations.push({
        type: 'assignment',
        priority: 'high',
        message: `${unassignedSessions.length} sessions need staff assignment`,
        action: 'assign_staff',
        sessions: unassignedSessions.map(s => s.id)
      });
    }

    // Long wait times
    const longWaitSessions = sessions.filter(s => {
      const waitTime = s.startedAt 
        ? (now.getTime() - new Date(s.startedAt).getTime()) / 60000
        : (now.getTime() - new Date(s.createdAt).getTime()) / 60000;
      return waitTime > 15 && ['NEW', 'PREP_IN_PROGRESS'].includes(s.state);
    });

    if (longWaitSessions.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'urgent',
        message: `${longWaitSessions.length} sessions waiting over 15 minutes`,
        action: 'expedite',
        sessions: longWaitSessions.map(s => s.id)
      });
    }

    // Overloaded staff
    const overloadedStaff = Object.values(staffWorkload).filter(s => s.status === 'overloaded');
    if (overloadedStaff.length > 0) {
      recommendations.push({
        type: 'workload',
        priority: 'high',
        message: `${overloadedStaff.length} staff members are overloaded`,
        action: 'redistribute',
        staff: overloadedStaff.map(s => s.id)
      });
    }

    // Edge cases
    const edgeCaseSessions = sessions.filter(s => s.edgeCase);
    if (edgeCaseSessions.length > 0) {
      recommendations.push({
        type: 'issue',
        priority: 'urgent',
        message: `${edgeCaseSessions.length} sessions have issues requiring attention`,
        action: 'resolve_issues',
        sessions: edgeCaseSessions.map(s => s.id)
      });
    }

    const sorted = recommendations.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
    // Passive throttle-back: keep only urgent items when guardrails recommend suppression.
    return throttleBack ? sorted.filter((r: any) => r.priority === 'urgent') : sorted;
  }, [sessions, staffWorkload, aliethiaPolicy]);

  // Auto-assignment logic
  const autoAssignSessions = () => {
    const unassignedSessions = sessions.filter(s => 
      !s.assignedBOHId && !s.assignedFOHId && 
      ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(s.state)
    );

    unassignedSessions.forEach(session => {
      const availableStaff = Object.values(staffWorkload).filter(staff => 
        staff.status !== 'overloaded' && 
        (session.state === 'NEW' || session.state === 'PREP_IN_PROGRESS' ? staff.role === 'BOH' : staff.role === 'FOH')
      );

      if (availableStaff.length > 0) {
        const bestStaff = availableStaff.sort((a, b) => {
          if (workflowMode === 'speed') return a.activeSessions - b.activeSessions;
          if (workflowMode === 'quality') return b.efficiency - a.efficiency;
          return (a.activeSessions + (100 - a.efficiency)) - (b.activeSessions + (100 - b.efficiency));
        })[0];

        onAssignStaff?.(session.id, bestStaff.id, bestStaff.role as 'BOH' | 'FOH');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'busy': return 'text-yellow-400 bg-yellow-500/20';
      case 'overloaded': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Staff Workflow Assistant</span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={autoAssign ? 'primary' : 'outline'}
              onClick={() => setAutoAssign(!autoAssign)}
            >
              {autoAssign ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              Auto-Assign
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={autoAssignSessions}
            >
              <Zap className="w-4 h-4" />
              Assign Now
            </Button>

            <Button
              size="sm"
              variant={showStaffStatus ? 'primary' : 'outline'}
              onClick={() => setShowStaffStatus(!showStaffStatus)}
            >
              {showStaffStatus ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Staff
            </Button>
          </div>
        </div>

        {/* Workflow Mode */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400">Workflow Mode:</span>
          <div className="flex space-x-2">
            {[
              { id: 'balanced', label: 'Balanced', icon: <Target className="w-4 h-4" /> },
              { id: 'speed', label: 'Speed', icon: <Zap className="w-4 h-4" /> },
              { id: 'quality', label: 'Quality', icon: <CheckCircle className="w-4 h-4" /> }
            ].map(mode => (
                <Button
                  key={mode.id}
                  size="sm"
                  variant={workflowMode === mode.id ? 'primary' : 'outline'}
                  onClick={() => setWorkflowMode(mode.id as any)}
                >
                {mode.icon}
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {workflowRecommendations.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span>Workflow Recommendations ({workflowRecommendations.length})</span>
          </h4>
          <div className="space-y-3">
            {workflowRecommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'urgent' ? 'bg-red-500/10 border-red-500/30' :
                  rec.priority === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{rec.message}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (rec.action === 'assign_staff') autoAssignSessions();
                      // Add other action handlers
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {rec.action === 'assign_staff' ? 'Assign' : 'Resolve'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Status */}
      {showStaffStatus && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Staff Status & Workload</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(staffWorkload).map(staff => (
              <div key={staff.id} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-white">{staff.name}</h5>
                    <p className="text-sm text-zinc-400">{staff.role}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                    {staff.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Active Sessions:</span>
                    <span className="text-white">{staff.activeSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Completed Today:</span>
                    <span className="text-white">{staff.completedToday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Avg Time:</span>
                    <span className="text-white">{staff.avgSessionTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Efficiency:</span>
                    <span className="text-white">{staff.efficiency}%</span>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Efficiency</span>
                    <span>{staff.efficiency}%</span>
                  </div>
                  <div className="w-full bg-zinc-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        staff.efficiency >= 80 ? 'bg-green-500' :
                        staff.efficiency >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, staff.efficiency)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <h4 className="font-medium mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => autoAssignSessions()}
            className="bg-green-500 hover:bg-green-600"
          >
            <Users className="w-4 h-4 mr-2" />
            Auto-Assign All
          </Button>
          
          <Button
            onClick={() => onBulkAction?.('start_prep', sessions.filter(s => s.state === 'NEW').map(s => s.id))}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Start All Prep
          </Button>
          
          <Button
            onClick={() => onBulkAction?.('mark_ready', sessions.filter(s => s.state === 'PREP_IN_PROGRESS').map(s => s.id))}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Ready
          </Button>
          
          <Button
            onClick={() => onBulkAction?.('take_delivery', sessions.filter(s => s.state === 'READY_FOR_DELIVERY').map(s => s.id))}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Truck className="w-4 h-4 mr-2" />
            Take All Delivery
          </Button>
        </div>
      </div>
    </div>
  );
}
