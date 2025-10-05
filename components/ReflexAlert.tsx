// components/ReflexAlert.tsx
// Reflex Alert - System alerts and notifications

import React, { useState, useEffect } from 'react';
import type { GhostLogEntry, FailureAnalysis } from '../types/reflex';

interface ReflexAlertProps {
  entries: GhostLogEntry[];
  onDismiss?: (entryId: string) => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

interface AlertState {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  dismissed: boolean;
}

export default function ReflexAlert({
  entries,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 5000
}: ReflexAlertProps) {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  useEffect(() => {
    const newAlerts: AlertState[] = [];

    entries.forEach(entry => {
      // Only show alerts for recent failures or escalations
      if (entry.outcome === 'escalation' || entry.outcome === 'failure') {
        const alertType = entry.outcome === 'escalation' ? 'error' : 'warning';
        
        newAlerts.push({
          id: entry.id,
          type: alertType,
          title: `${entry.agentId} - ${entry.action}`,
          message: entry.escalationReason || `Operation failed with score ${Math.round(entry.score * 100)}`,
          timestamp: entry.timestamp,
          dismissed: false
        });
      }
    });

    setAlerts(prevAlerts => {
      const existingIds = new Set(prevAlerts.map(a => a.id));
      const newUniqueAlerts = newAlerts.filter(alert => !existingIds.has(alert.id));
      return [...prevAlerts, ...newUniqueAlerts];
    });
  }, [entries]);

  useEffect(() => {
    if (autoDismiss) {
      const timers = alerts
        .filter(alert => !alert.dismissed)
        .map(alert => {
          return setTimeout(() => {
            handleDismiss(alert.id);
          }, dismissDelay);
        });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [alerts, autoDismiss, dismissDelay]);

  const handleDismiss = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
    
    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  const getAlertIcon = (type: string): string => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border shadow-lg ${getAlertColor(alert.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs mt-2 opacity-75">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleDismiss(alert.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
