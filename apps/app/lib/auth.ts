import { NextRequest } from 'next/server';
import { serverClient } from './supabase';
import { prisma } from './db';

/**
 * Get current authenticated user from request
 * Returns null if not authenticated
 */
export async function getCurrentUser(req?: NextRequest) {
  try {
    const supabase = serverClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
    return null;
  }
}

/**
 * Get current active tenant ID from JWT claims or session
 * Returns null if not set
 */
export async function getCurrentTenant(req?: NextRequest): Promise<string | null> {
  try {
    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    // Try to get tenant_id from JWT claims
    const tenantId = session.user.user_metadata?.tenant_id || 
                     session.user.app_metadata?.tenant_id;

    if (tenantId) {
      return tenantId;
    }

    // If not in JWT, try to get from user's first membership
    const user = await getCurrentUser(req);
    if (!user) {
      return null;
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'asc', // Get first/oldest membership
      },
    });

    return membership?.tenantId || null;
  } catch (error) {
    console.error('[Auth] Error getting current tenant:', error);
    return null;
  }
}

/**
 * Get current user's role for active tenant
 * Returns null if not authenticated or no membership
 */
export async function getCurrentRole(req?: NextRequest): Promise<string | null> {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return null;
    }

    const tenantId = await getCurrentTenant(req);
    if (!tenantId) {
      return null;
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenantId,
        },
      },
    });

    return membership?.role || null;
  } catch (error) {
    console.error('[Auth] Error getting current role:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

/**
 * Require specific role(s) - throws error if user doesn't have required role
 */
export async function requireRole(
  req: NextRequest | undefined,
  allowedRoles: ('owner' | 'admin' | 'staff' | 'viewer')[]
) {
  const user = await requireAuth(req);
  const role = await getCurrentRole(req);

  if (!role || !allowedRoles.includes(role as any)) {
    throw new Error(`Forbidden: Requires one of these roles: ${allowedRoles.join(', ')}`);
  }

  return { user, role };
}

/**
 * Check if user has any of the allowed roles
 * Returns boolean (doesn't throw)
 */
export async function hasRole(
  req: NextRequest | undefined,
  allowedRoles: ('owner' | 'admin' | 'staff' | 'viewer')[]
): Promise<boolean> {
  try {
    const role = await getCurrentRole(req);
    if (!role) {
      return false;
    }
    return allowedRoles.includes(role as any);
  } catch (error) {
    return false;
  }
}

/**
 * Set active tenant in user's session/JWT
 * This should be called after login or tenant switching
 */
export async function setActiveTenant(userId: string, tenantId: string) {
  try {
    const supabase = serverClient();
    
    // Update user metadata with active tenant
    const { error } = await supabase.auth.updateUser({
      data: {
        tenant_id: tenantId,
      },
    });

    if (error) {
      throw error;
    }

    // Also get the role for this tenant
    const membership = await prisma.membership.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId,
        },
      },
    });

    if (membership) {
      // Update role in metadata as well
      await supabase.auth.updateUser({
        data: {
          tenant_id: tenantId,
          role: membership.role,
        },
      });
    }

    return true;
  } catch (error) {
    console.error('[Auth] Error setting active tenant:', error);
    return false;
  }
}

