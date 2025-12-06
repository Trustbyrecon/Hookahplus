"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Database, Plus, Eye, RefreshCw, CheckCheck } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export default function FirstLightChecklist({ 
  onStepComplete,
  sessionsCount,
  databaseConnected
}: { 
  onStepComplete?: (stepId: string) => void;
  sessionsCount: number;
  databaseConnected: boolean;
}) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'database',
      label: 'Confirm Database shows Connected',
      icon: Database,
      completed: false
    },
    {
      id: 'create',
      label: 'Create 1 new session',
      icon: Plus,
      completed: false
    },
    {
      id: 'verify',
      label: 'Verify it appears in Active Sessions',
      icon: Eye,
      completed: false
    },
    {
      id: 'refresh',
      label: 'Refresh the page',
      icon: RefreshCw,
      completed: false
    },
    {
      id: 'persist',
      label: 'Confirm the session remains',
      icon: CheckCheck,
      completed: false
    }
  ]);

  // Auto-update based on state
  useEffect(() => {
    setItems(prev => prev.map(item => {
      if (item.id === 'database') {
        return { ...item, completed: databaseConnected };
      }
      if (item.id === 'create' && sessionsCount > 0) {
        return { ...item, completed: true };
      }
      if (item.id === 'verify' && sessionsCount > 0) {
        return { ...item, completed: true };
      }
      return item;
    }));
  }, [databaseConnected, sessionsCount]);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  const handleMarkComplete = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
    if (onStepComplete) {
      onStepComplete(itemId);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <CheckCheck className="w-5 h-5 text-teal-400" />
          First Light Checklist
        </h3>
        <div className="text-sm text-zinc-400">
          {completedCount} of {totalCount} complete
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2 rounded ${
                item.completed ? 'bg-green-900/20' : 'bg-zinc-800/50'
              }`}
            >
              <button
                onClick={() => handleMarkComplete(item.id)}
                className="flex-shrink-0"
                title={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-400 hover:text-zinc-300" />
                )}
              </button>
              <Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className={`text-sm flex-1 ${item.completed ? 'text-green-200 line-through' : 'text-zinc-300'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {completedCount === totalCount && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-800/50 rounded text-sm text-green-200">
          <div className="font-medium mb-1">🎉 First Light Achieved!</div>
          <div className="text-xs text-green-300 mb-3">
            The core sessions engine has run successfully with live data.
          </div>
          <div className="text-xs text-green-400 font-semibold mt-2">
            Next Steps: Enable Metrics → Alpha Stability → Night After Night Flow
          </div>
        </div>
      )}
    </div>
  );
}

