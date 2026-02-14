/**
 * KTL-4 Status Dashboard Component
 * 
 * Displays real-time health status for all four critical flows
 * with monitoring, alerts, and emergency controls.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Shield, 
  Activity,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Ktl4HealthStatus {
  flowName: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  lastCheck: string;
  issues: string[];
  metrics: Record<string, number>;
}

interface Ktl4Alert {
  id: string;
  priority: 'P1' | 'P2' | 'P3';
  flowName: string;
  alertType: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export default function Ktl4StatusDashboard() {
  const [healthStatus, setHealthStatus] = useState<Ktl4HealthStatus[]>([]);
  const [alerts, setAlerts] = useState<Ktl4Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load KTL-4 status
  const loadKtl4Status = async () => {
    try {
      const [healthRes, alertsRes] = await Promise.all([
        fetch('/api/ktl4/health-check?action=status'),
        fetch('/api/ktl4/alerts?status=active&limit=10')
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthStatus(healthData.healthStatus || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load KTL-4 status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run health checks
  const runHealthChecks = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/ktl4/health-check?action=run-all', {
        method: 'GET'
      });
      await loadKtl4Status();
    } catch (error) {
      console.error('Failed to run health checks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run reconciliation
  const runReconciliation = async () => {
    try {
      const response = await fetch('/api/ktl4/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_reconciliation',
          operatorId: 'operator_dashboard'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Reconciliation completed:', result);
        await loadKtl4Status();
      }
    } catch (error) {
      console.error('Failed to run reconciliation:', error);
    }
  };

  // Break-glass action
  const executeBreakGlass = async (actionType: string, targetId?: string) => {
    if (!confirm(`Are you sure you want to execute ${actionType}? This is an emergency action.`)) {
      return;
    }

    try {
      const response = await fetch('/api/ktl4/break-glass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          targetId,
          operatorId: 'operator_dashboard',
          reason: `Emergency action executed from dashboard`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Break-glass action executed:', result);
        await loadKtl4Status();
      }
    } catch (error) {
      console.error('Failed to execute break-glass action:', error);
    }
  };

  useEffect(() => {
    loadKtl4Status();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadKtl4Status, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'failed': return 'bg-red-600/10 border-red-600/30 text-red-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-600 text-white';
      case 'P2': return 'bg-yellow-600 text-white';
      case 'P3': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const flowNames = {
    payment_settlement: 'Payment & Settlement',
    session_lifecycle: 'Session Lifecycle',
    order_intake: 'Order Intake',
    pos_sync: 'POS Sync & Ledger'
  };

  if (isLoading && healthStatus.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        <span className="ml-3 text-white/70">Loading KTL-4 Status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">KTL-4 Keep-The-Lights-On</h2>
          <p className="text-sm text-white/70">
            Critical flow monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={runHealthChecks}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
          >
            <Activity className="w-4 h-4 mr-2" />
            {isLoading ? 'Running...' : 'Run Checks'}
          </button>
          
          <button
            onClick={runReconciliation}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reconcile
          </button>
        </div>
      </div>

      {/* Flow Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(flowNames).map(([flowKey, flowName]) => {
          const status = healthStatus.find(s => s.flowName === flowKey);
          const flowStatus = status?.status || 'unknown';
          const issues = status?.issues || [];

          return (
            <motion.div
              key={flowKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${getStatusColor(flowStatus)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{flowName}</h3>
                {getStatusIcon(flowStatus)}
              </div>
              
              <div className="space-y-2">
                <div className="text-xs opacity-75">
                  Status: <span className="font-medium capitalize">{flowStatus}</span>
                </div>
                
                {issues.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium text-red-300 mb-1">Issues:</div>
                    <ul className="space-y-1">
                      {issues.slice(0, 2).map((issue, idx) => (
                        <li key={idx} className="text-red-200">• {issue}</li>
                      ))}
                      {issues.length > 2 && (
                        <li className="text-red-200">• +{issues.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                )}

                {status?.lastCheck && (
                  <div className="text-xs opacity-60">
                    Last check: {new Date(status.lastCheck).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
            Active Alerts ({alerts.length})
          </h3>
          
          <div className="space-y-2">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.priority === 'P1' ? 'border-red-500 bg-red-500/5' :
                  alert.priority === 'P2' ? 'border-yellow-500 bg-yellow-500/5' :
                  'border-blue-500 bg-blue-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {flowNames[alert.flowName as keyof typeof flowNames]} • {alert.alertType}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-white/80 mt-1">{alert.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Controls */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-400" />
          Emergency Controls
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => executeBreakGlass('degraded_mode')}
            className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-sm font-medium transition"
          >
            <Pause className="w-4 h-4 mr-2 inline" />
            Enable Degraded Mode
          </button>
          
          <button
            onClick={() => executeBreakGlass('freeze_station', 'T-001')}
            className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-medium transition"
          >
            <XCircle className="w-4 h-4 mr-2 inline" />
            Freeze Station T-001
          </button>
          
          <button
            onClick={() => executeBreakGlass('emergency_stop')}
            className="p-3 rounded-lg border border-red-600/30 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-medium transition"
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Emergency Stop All
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">System Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthStatus.map((status) => (
            <div key={status.flowName} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/60 mb-2">
                {flowNames[status.flowName as keyof typeof flowNames]}
              </div>
              <div className="space-y-1">
                {Object.entries(status.metrics).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-white/70">{key}:</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
