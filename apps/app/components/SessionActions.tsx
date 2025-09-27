"use client";

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Flag,
  DollarSign,
  Truck,
  ChefHat,
  UserCheck
} from 'lucide-react';

interface SessionActionsProps {
  sessionId: string;
  state: string;
  userRoles: string[];
  onStateChange: () => void;
}

export function BOHActions({ sessionId, state, userRoles, onStateChange }: SessionActionsProps) {
  const [busy, setBusy] = useState(false);
  
  const can = (role: string) => userRoles.includes(role) || userRoles.includes("ADMIN");

  const act = async (transition: string, extra?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition, ...extra }),
      });
      
      if (response.ok) {
        onStateChange();
      } else {
        const error = await response.json();
        console.error('Transition failed:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Transition error:', error);
      alert('Failed to update session');
    } finally {
      setBusy(false);
    }
  };

  if (!can("BOH") && !can("MANAGER")) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {state === "NEW" && (
        <button 
          className="btn-pretty-pill bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
          disabled={busy} 
          onClick={() => act("START_PREP")}
        >
          <ChefHat className="w-4 h-4 mr-2" />
          Start Prep
        </button>
      )}
      
      {state === "PREP_IN_PROGRESS" && (
        <button 
          className="btn-pretty-pill bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
          disabled={busy} 
          onClick={() => act("MARK_READY")}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark Ready
        </button>
      )}

      <button 
        className="btn-pretty-pill bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
        disabled={busy} 
        onClick={() => act("SET_EDGE_CASE", { edge: "EQUIPMENT_ISSUE", note: "Equipment malfunction" })}
      >
        <Flag className="w-4 h-4 mr-2" />
        Flag Issue
      </button>
    </div>
  );
}

export function FOHActions({ sessionId, state, userRoles, onStateChange }: SessionActionsProps) {
  const [busy, setBusy] = useState(false);
  
  const can = (role: string) => userRoles.includes(role) || userRoles.includes("ADMIN");

  const act = async (transition: string, extra?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition, ...extra }),
      });
      
      if (response.ok) {
        onStateChange();
      } else {
        const error = await response.json();
        console.error('Transition failed:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Transition error:', error);
      alert('Failed to update session');
    } finally {
      setBusy(false);
    }
  };

  if (!can("FOH") && !can("MANAGER")) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {state === "READY_FOR_DELIVERY" && (
        <button 
          className="btn-pretty-pill bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
          disabled={busy} 
          onClick={() => act("TAKE_DELIVERY")}
        >
          <Truck className="w-4 h-4 mr-2" />
          Take Delivery
        </button>
      )}
      
      {state === "OUT_FOR_DELIVERY" && (
        <button 
          className="btn-pretty-pill bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
          disabled={busy} 
          onClick={() => act("START_ACTIVE")}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Active Session
        </button>
      )}
      
      {state === "ACTIVE" && (
        <>
          <button 
            className="btn-pretty-pill bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            disabled={busy} 
            onClick={() => act("PAUSE")}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </button>
          
          <button 
            className="btn-pretty-pill bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
            disabled={busy} 
            onClick={() => act("SET_EDGE_CASE", { edge: "OTHER", note: "Customer requested manager" })}
          >
            <Flag className="w-4 h-4 mr-2" />
            Flag Manager
          </button>
          
          <button 
            className="btn-pretty-pill bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
            disabled={busy} 
            onClick={() => act("COMPLETE")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Close Session
          </button>
        </>
      )}
      
      {state === "PAUSED" && (
        <button 
          className="btn-pretty-pill bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
          disabled={busy} 
          onClick={() => act("RESUME")}
        >
          <Play className="w-4 h-4 mr-2" />
          Resume
        </button>
      )}

      <button 
        className="btn-pretty-pill bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
        disabled={busy} 
        onClick={() => act("SET_EDGE_CASE", { edge: "CUSTOMER_NOT_FOUND", note: "Customer not at table" })}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Customer Issue
      </button>
    </div>
  );
}

export function ManagerActions({ sessionId, state, userRoles, onStateChange }: SessionActionsProps) {
  const [busy, setBusy] = useState(false);
  
  const can = (role: string) => userRoles.includes(role) || userRoles.includes("ADMIN");

  const act = async (transition: string, extra?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transition, ...extra }),
      });
      
      if (response.ok) {
        onStateChange();
      } else {
        const error = await response.json();
        console.error('Transition failed:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Transition error:', error);
      alert('Failed to update session');
    } finally {
      setBusy(false);
    }
  };

  if (!can("MANAGER")) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button 
        className="btn-pretty-pill bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
        disabled={busy} 
        onClick={() => act("CANCEL")}
      >
        <X className="w-4 h-4 mr-2" />
        Cancel Session
      </button>
      
      <button 
        className="btn-pretty-pill bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
        disabled={busy} 
        onClick={() => act("RESOLVE_EDGE_CASE")}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Resolve Issue
      </button>
    </div>
  );
}
