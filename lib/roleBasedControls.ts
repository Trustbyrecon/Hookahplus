/**
 * Role-Based Controls for Hookah+ Production
 * Implements FOH, BOH, Manager roles with scoped permissions
 */

export type UserRole = 'foh' | 'boh' | 'manager' | 'admin' | 'system';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastActive: Date;
  trustLevel: number; // 0-100
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: string[];
}

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  foh: [
    { action: 'read', resource: 'sessions' },
    { action: 'update', resource: 'sessions', conditions: ['state:delivered', 'state:active'] },
    { action: 'create', resource: 'refill_requests' },
    { action: 'read', resource: 'tables' },
    { action: 'update', resource: 'tables' },
    { action: 'create', resource: 'reservations' },
    { action: 'read', resource: 'floor_health' }
  ],
  boh: [
    { action: 'read', resource: 'sessions' },
    { action: 'update', resource: 'sessions', conditions: ['state:prep', 'state:heating', 'state:ready'] },
    { action: 'create', resource: 'prep_events' },
    { action: 'read', resource: 'prep_queue' },
    { action: 'update', resource: 'prep_queue' }
  ],
  manager: [
    { action: 'read', resource: '*' },
    { action: 'update', resource: '*' },
    { action: 'create', resource: '*' },
    { action: 'delete', resource: 'sessions' },
    { action: 'create', resource: 'comps' },
    { action: 'create', resource: 'refunds' },
    { action: 'read', resource: 'analytics' },
    { action: 'read', resource: 'audit_logs' }
  ],
  admin: [
    { action: '*', resource: '*' }
  ],
  system: [
    { action: '*', resource: '*' }
  ]
};

export class RoleBasedController {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    // Initialize default users for testing
    this.users.set('foh_001', {
      id: 'foh_001',
      name: 'FOH Staff',
      role: 'foh',
      permissions: ROLE_PERMISSIONS.foh.map(p => `${p.action}:${p.resource}`),
      lastActive: new Date(),
      trustLevel: 85
    });

    this.users.set('boh_001', {
      id: 'boh_001',
      name: 'BOH Staff',
      role: 'boh',
      permissions: ROLE_PERMISSIONS.boh.map(p => `${p.action}:${p.resource}`),
      lastActive: new Date(),
      trustLevel: 90
    });

    this.users.set('manager_001', {
      id: 'manager_001',
      name: 'Manager',
      role: 'manager',
      permissions: ROLE_PERMISSIONS.manager.map(p => `${p.action}:${p.resource}`),
      lastActive: new Date(),
      trustLevel: 95
    });
  }

  /**
   * Check if user has permission to perform action on resource
   */
  hasPermission(userId: string, action: string, resource: string, context?: any): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Admin and system have all permissions
    if (user.role === 'admin' || user.role === 'system') return true;

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    const permission = rolePermissions.find(p => 
      (p.action === action || p.action === '*') && 
      (p.resource === resource || p.resource === '*')
    );

    if (!permission) return false;

    // Check conditions if any
    if (permission.conditions && context) {
      return this.checkConditions(permission.conditions, context);
    }

    return true;
  }

  /**
   * Check permission conditions
   */
  private checkConditions(conditions: string[], context: any): boolean {
    return conditions.every(condition => {
      const [key, value] = condition.split(':');
      return context[key] === value;
    });
  }

  /**
   * Authorize action with audit logging
   */
  authorize(userId: string, action: string, resource: string, context?: any): boolean {
    const hasPermission = this.hasPermission(userId, action, resource, context);
    
    if (hasPermission) {
      this.logAction(userId, action, resource, 'authorized', context);
    } else {
      this.logAction(userId, action, resource, 'denied', context);
    }

    return hasPermission;
  }

  /**
   * Log action for audit trail
   */
  private logAction(userId: string, action: string, resource: string, result: string, context?: any) {
    const logEntry = {
      timestamp: new Date(),
      userId,
      action,
      resource,
      result,
      context,
      trustLevel: this.users.get(userId)?.trustLevel || 0
    };

    // In production, this would be stored in a database
    console.log('AUDIT LOG:', logEntry);
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Create new user
   */
  createUser(user: Omit<User, 'lastActive' | 'trustLevel'>): User {
    const newUser: User = {
      ...user,
      lastActive: new Date(),
      trustLevel: 50 // Default trust level
    };

    this.users.set(user.id, newUser);
    return newUser;
  }

  /**
   * Update user trust level
   */
  updateTrustLevel(userId: string, trustLevel: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.trustLevel = Math.max(0, Math.min(100, trustLevel));
    user.lastActive = new Date();
    return true;
  }

  /**
   * Get all users by role
   */
  getUsersByRole(role: UserRole): User[] {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  /**
   * Check if user can access session
   */
  canAccessSession(userId: string, sessionId: string): boolean {
    const user = this.users.get(userId);
    const session = this.sessions.get(sessionId);
    
    if (!user || !session) return false;

    // FOH can access delivered/active sessions
    if (user.role === 'foh') {
      return ['DELIVERED', 'ACTIVE'].includes(session.state);
    }

    // BOH can access prep sessions
    if (user.role === 'boh') {
      return ['PREP', 'HEATING', 'READY_FOR_DELIVERY'].includes(session.state);
    }

    // Manager and admin can access all sessions
    return ['manager', 'admin', 'system'].includes(user.role);
  }
}

// Export singleton instance
export const roleController = new RoleBasedController();
