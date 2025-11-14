/**
 * Session Utilities - Helper functions for session management
 * 
 * Agent: Noor (session_agent)
 */

import { FireSession } from '../types/enhancedSession';
import { calculateRemainingTime, formatDuration } from './sessionStateMachine';

/**
 * Calculate session extension cost
 */
export function calculateExtensionCost(
  currentDuration: number,
  extensionMinutes: number,
  pricingModel: 'flat' | 'time-based' = 'time-based'
): number {
  if (pricingModel === 'flat') {
    // Flat rate: charge full session price for extension
    return 30.00;
  } else {
    // Time-based: $0.50 per minute
    return extensionMinutes * 0.50;
  }
}

/**
 * Validate session can be extended
 */
export function canExtendSession(session: FireSession): {
  canExtend: boolean;
  reason?: string;
} {
  if (session.status !== 'ACTIVE') {
    return {
      canExtend: false,
      reason: 'Session must be active to extend'
    };
  }

  if (!session.sessionTimer || !session.sessionTimer.isActive) {
    return {
      canExtend: false,
      reason: 'Session timer must be running to extend'
    };
  }

  const remaining = calculateRemainingTime(session);
  if (remaining <= 0) {
    return {
      canExtend: false,
      reason: 'Session has already expired'
    };
  }

  return { canExtend: true };
}

/**
 * Validate session can be refilled
 */
export function canRefillSession(session: FireSession): {
  canRefill: boolean;
  reason?: string;
} {
  if (session.status !== 'ACTIVE') {
    return {
      canRefill: false,
      reason: 'Session must be active to request refill'
    };
  }

  if (session.refillStatus === 'in_progress') {
    return {
      canRefill: false,
      reason: 'Refill already in progress'
    };
  }

  return { canRefill: true };
}

/**
 * Get session health status
 */
export function getSessionHealth(session: FireSession): {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
} {
  const issues: string[] = [];

  // Check timer
  if (session.sessionTimer) {
    const remaining = calculateRemainingTime(session);
    if (remaining < 5 * 60) { // Less than 5 minutes
      issues.push('Session expiring soon');
    }
    if (remaining <= 0) {
      issues.push('Session expired');
    }
  }

  // Check status
  if (session.status === 'STAFF_HOLD') {
    issues.push('Session on hold');
  }

  if (session.status === 'STOCK_BLOCKED') {
    issues.push('Stock shortage blocking session');
  }

  // Determine overall status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (issues.length > 0) {
    status = issues.some(i => i.includes('expired') || i.includes('blocked')) 
      ? 'critical' 
      : 'warning';
  }

  return { status, issues };
}

/**
 * Format session duration for display
 */
export function formatSessionDuration(seconds: number): string {
  return formatDuration(seconds);
}

/**
 * Get session age (time since creation)
 */
export function getSessionAge(session: FireSession): number {
  const now = Date.now();
  return Math.floor((now - session.createdAt) / 1000);
}

/**
 * Check if session is stale (no activity for extended period)
 */
export function isSessionStale(session: FireSession, staleThresholdMinutes: number = 60): boolean {
  const age = getSessionAge(session);
  const staleThreshold = staleThresholdMinutes * 60;
  
  // If session is active but hasn't been updated recently, it's stale
  if (session.status === 'ACTIVE' && session.updatedAt) {
    const timeSinceUpdate = Math.floor((Date.now() - session.updatedAt) / 1000);
    return timeSinceUpdate > staleThreshold;
  }
  
  return age > staleThreshold;
}

/**
 * Get recommended next action for a session
 */
export function getRecommendedAction(session: FireSession, userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'): {
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
} | null {
  // BOH recommendations
  if (userRole === 'BOH') {
    if (session.status === 'PAID_CONFIRMED') {
      return {
        action: 'CLAIM_PREP',
        description: 'Claim this session for preparation',
        priority: 'high'
      };
    }
    if (session.status === 'PREP_IN_PROGRESS') {
      return {
        action: 'READY_FOR_DELIVERY',
        description: 'Mark hookah as ready for delivery',
        priority: 'high'
      };
    }
  }

  // FOH recommendations
  if (userRole === 'FOH') {
    if (session.status === 'READY_FOR_DELIVERY') {
      return {
        action: 'DELIVER_NOW',
        description: 'Deliver hookah to table',
        priority: 'high'
      };
    }
    if (session.status === 'DELIVERED') {
      return {
        action: 'START_ACTIVE',
        description: 'Light session and start timer',
        priority: 'high'
      };
    }
    if (session.status === 'ACTIVE') {
      const remaining = session.sessionTimer ? calculateRemainingTime(session) : 0;
      if (remaining < 5 * 60) {
        return {
          action: 'CLOSE_SESSION',
          description: 'Session expiring soon, prepare for checkout',
          priority: 'medium'
        };
      }
    }
  }

  // Manager/Admin recommendations
  if (userRole === 'MANAGER' || userRole === 'ADMIN') {
    if (session.status === 'STAFF_HOLD') {
      return {
        action: 'RESOLVE_HOLD',
        description: 'Resolve hold and resume session',
        priority: 'high'
      };
    }
    if (isSessionStale(session)) {
      return {
        action: 'PUT_ON_HOLD',
        description: 'Session appears stale, investigate',
        priority: 'medium'
      };
    }
  }

  return null;
}

