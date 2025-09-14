import { NextRequest } from 'next/server';

export type UserRole = 'guest' | 'staff' | 'admin';

export interface AuthContext {
  role: UserRole;
  actorId?: string;
  venueId?: string;
}

export function getAuthContext(request: NextRequest): AuthContext {
  const role = (request.headers.get('x-role') as UserRole) || 'guest';
  const actorId = request.headers.get('x-actor-id') || undefined;
  const venueId = request.headers.get('x-venue-id') || undefined;

  return { role, actorId, venueId };
}

export function requireRole(requiredRole: UserRole, userRole: UserRole): boolean {
  const roleHierarchy = { guest: 0, staff: 1, admin: 2 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessProfile(profileId: string, authContext: AuthContext): boolean {
  // Staff and admin can access any profile
  if (authContext.role === 'staff' || authContext.role === 'admin') {
    return true;
  }
  
  // Guests can only access their own profile
  return authContext.actorId === profileId;
}

export function canAccessVenue(venueId: string, authContext: AuthContext): boolean {
  // Admin can access any venue
  if (authContext.role === 'admin') {
    return true;
  }
  
  // Staff can only access their assigned venue
  if (authContext.role === 'staff') {
    return authContext.venueId === venueId;
  }
  
  // Guests cannot access venue-specific data
  return false;
}
