// app/lib/users.ts
import type { User, TrustLevel, UserRole } from "./workflow";

// Demo users for testing the trust system
export const demoUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Runner",
    role: "RUNNER",
    trustLevel: "BASIC",
    permissions: ["deliver", "mark_out", "set_buffer", "set_zone", "add_item"]
  },
  {
    id: "user-2", 
    name: "Sam Supervisor",
    role: "SUPERVISOR",
    trustLevel: "VERIFIED",
    permissions: ["deliver", "mark_out", "mark_delivered", "start_active", "set_buffer", "set_zone", "add_item", "extend_min", "undo", "reassign_runner"]
  },
  {
    id: "user-3",
    name: "Morgan Manager", 
    role: "MANAGER",
    trustLevel: "VERIFIED",
    permissions: ["deliver", "mark_out", "mark_delivered", "start_active", "set_buffer", "set_zone", "add_item", "extend_min", "undo", "reassign_runner"]
  },
  {
    id: "user-4",
    name: "Casey Owner",
    role: "OWNER", 
    trustLevel: "ADMIN",
    permissions: ["*"] // All permissions
  }
];

// Get user by ID
export function getUser(id: string): User | undefined {
  return demoUsers.find(user => user.id === id);
}

// Get all users
export function getAllUsers(): User[] {
  return demoUsers;
}

// Check if user has specific permission
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes("*") || user.permissions.includes(permission);
}

// Check if user can perform action based on trust level
export function canPerformAction(user: User, actionType: string): boolean {
  // Map action types to permissions
  const actionPermissions: Record<string, string> = {
    "DELIVER_NOW": "deliver",
    "MARK_OUT": "mark_out",
    "MARK_DELIVERED": "mark_delivered", 
    "START_ACTIVE": "start_active",
    "CLOSE": "close",
    "SET_BUFFER": "set_buffer",
    "SET_ZONE": "set_zone",
    "ADD_ITEM": "add_item",
    "EXTEND_MIN": "extend_min",
    "UNDO": "undo",
    "REASSIGN_RUNNER": "reassign_runner",
    "CANCEL": "cancel"
  };
  
  const requiredPermission = actionPermissions[actionType];
  if (!requiredPermission) return false;
  
  return hasPermission(user, requiredPermission);
}

// Get user display info
export function getUserDisplayInfo(user: User) {
  const roleColors = {
    "STAFF": "text-blue-300",
    "RUNNER": "text-green-300", 
    "SUPERVISOR": "text-yellow-300",
    "MANAGER": "text-orange-300",
    "OWNER": "text-red-300"
  };
  
  const trustColors = {
    "NONE": "text-gray-400",
    "BASIC": "text-green-400",
    "VERIFIED": "text-yellow-400", 
    "ADMIN": "text-red-400"
  };
  
  return {
    roleColor: roleColors[user.role] || "text-gray-300",
    trustColor: trustColors[user.trustLevel] || "text-gray-300"
  };
}

// Mock authentication (in real app, this would integrate with your auth system)
export function authenticateUser(userId: string): User | null {
  const user = getUser(userId);
  if (user) {
    // In real app, you'd validate tokens, check session, etc.
    return user;
  }
  return null;
}

// Get current user (placeholder - in real app, this would come from auth context)
export function getCurrentUser(): User | null {
  // For demo purposes, return the first user
  // In real app, this would come from React context, cookies, etc.
  return demoUsers[0];
}
