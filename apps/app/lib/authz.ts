import { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface AuthResult {
  user: User;
  roles: string[];
}

// Mock user for development - replace with real auth
export async function requireRole(
  req: NextRequest, 
  allowedRoles: string[]
): Promise<AuthResult> {
  // In production, this would validate JWT tokens, session cookies, etc.
  // For now, we'll use a mock user with all roles for development
  
  const mockUser: User = {
    id: "dev-user-1",
    email: "dev@hookahplus.com",
    name: "Development User",
    roles: ["BOH", "FOH", "MANAGER", "ADMIN"]
  };

  // Check if user has any of the allowed roles
  const hasRole = allowedRoles.some(role => mockUser.roles.includes(role));
  
  if (!hasRole) {
    throw new Error("Insufficient permissions");
  }

  return {
    user: mockUser,
    roles: mockUser.roles
  };
}

export function can(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole) || userRoles.includes("ADMIN");
}
