"use client";

import React from "react";
import { BOHActions, FOHActions, ManagerActions } from "./SessionActions";
import { Session } from "../types/session";

interface RoleBasedActionsProps {
  session: Session;
  userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onStateChange?: (sessionId: string, transition: string, note?: string, edge?: string) => void;
  onFlagIssue?: (type: string, severity: string, description: string) => void;
}

export function RoleBasedActions({ session, userRole, onStateChange, onFlagIssue }: RoleBasedActionsProps) {
  // Define which actions are visible for each role
  const getVisibleActions = () => {
    switch (userRole) {
      case 'BOH':
        return (
          <BOHActions
            sessionId={session.id}
            state={session.state}
            userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
            onStateChange={() => onStateChange?.(session.id, 'START_PREP')}
          />
        );
      
      case 'FOH':
        return (
          <FOHActions
            sessionId={session.id}
            state={session.state}
            userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
            onStateChange={() => onStateChange?.(session.id, 'TAKE_DELIVERY')}
          />
        );
      
      case 'MANAGER':
        return (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 mb-2">Manager - Full Customer Journey Control:</div>
            
            {/* BOH Actions */}
            <div className="space-y-1">
              <div className="text-xs text-zinc-500">BOH Actions:</div>
              <BOHActions
                sessionId={session.id}
                state={session.state}
                userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                onStateChange={() => onStateChange?.(session.id, 'START_PREP')}
              />
            </div>
            
            {/* FOH Actions */}
            <div className="space-y-1">
              <div className="text-xs text-zinc-500">FOH Actions:</div>
              <FOHActions
                sessionId={session.id}
                state={session.state}
                userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                onStateChange={() => onStateChange?.(session.id, 'TAKE_DELIVERY')}
              />
            </div>
            
            {/* Manager Actions */}
            <div className="space-y-1">
              <div className="text-xs text-zinc-500">Manager Actions:</div>
              <ManagerActions
                sessionId={session.id}
                state={session.state}
                userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                onStateChange={() => onStateChange?.(session.id, 'COMPLETE')}
                onFlagIssue={onFlagIssue}
              />
            </div>
          </div>
        );
      
      case 'ADMIN':
        return (
          <div className="space-y-2">
            <div className="text-xs text-zinc-400 mb-2">Admin Actions (All Permissions):</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-orange-400 mb-1">BOH Actions:</div>
                <BOHActions
                  sessionId={session.id}
                  state={session.state}
                  userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                  onStateChange={() => onStateChange?.(session.id, 'START_PREP')}
                />
              </div>
              <div>
                <div className="text-xs text-blue-400 mb-1">FOH Actions:</div>
                <FOHActions
                  sessionId={session.id}
                  state={session.state}
                  userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                  onStateChange={() => onStateChange?.(session.id, 'TAKE_DELIVERY')}
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-purple-400 mb-1">Manager Actions:</div>
              <ManagerActions
                sessionId={session.id}
                state={session.state}
                userRoles={['BOH', 'FOH', 'MANAGER', 'ADMIN']}
                onStateChange={() => onStateChange?.(session.id, 'COMPLETE')}
                onFlagIssue={onFlagIssue}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-xs text-zinc-500">
            No actions available for your role
          </div>
        );
    }
  };

  // Get role-specific styling
  const getRoleStyling = () => {
    switch (userRole) {
      case 'BOH':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'FOH':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'MANAGER':
      case 'ADMIN':
        return 'border-purple-500/30 bg-purple-500/5';
      default:
        return 'border-zinc-500/30 bg-zinc-500/5';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'BOH': return 'Back of House';
      case 'FOH': return 'Front of House';
      case 'MANAGER': return 'Manager';
      case 'ADMIN': return 'Administrator';
      default: return 'Unknown Role';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'BOH': return '👨‍🍳';
      case 'FOH': return '👥';
      case 'MANAGER': return '👔';
      case 'ADMIN': return '👑';
      default: return '❓';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getRoleStyling()}`}>
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">{getRoleIcon()}</span>
        <span className="text-sm font-medium text-zinc-300">
          {getRoleLabel()} Actions
        </span>
      </div>
      
      {getVisibleActions()}
    </div>
  );
}

// Role Selector Component for testing/demo purposes
interface RoleSelectorProps {
  currentRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onRoleChange: (role: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN') => void;
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles = [
    { value: 'BOH', label: 'Back of House', icon: '👨‍🍳', color: 'text-orange-400' },
    { value: 'FOH', label: 'Front of House', icon: '👥', color: 'text-blue-400' },
    { value: 'MANAGER', label: 'Manager', icon: '👔', color: 'text-purple-400' },
    { value: 'ADMIN', label: 'Administrator', icon: '👑', color: 'text-red-400' }
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-zinc-400">Role:</span>
      <div className="flex bg-zinc-800 rounded-lg p-1">
        {roles.map(role => (
          <button
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              currentRole === role.value
                ? `${role.color} bg-current/20 shadow-md`
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <span>{role.icon}</span>
            <span>{role.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
