export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'foh' | 'boh' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: UserProfile;
  permissions: string[];
  trustLevel?: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Mock user data
export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'owner@hookahplus.com',
    name: 'John Owner',
    role: 'owner',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    profile: {
      firstName: 'John',
      lastName: 'Owner',
      phone: '+1-555-0123',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    },
    permissions: ['all']
  },
  {
    id: 'user-002',
    email: 'admin@hookahplus.com',
    name: 'Sarah Admin',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date(),
    lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    profile: {
      firstName: 'Sarah',
      lastName: 'Admin',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    },
    permissions: ['admin', 'manage_users', 'view_reports']
  },
  {
    id: 'user-003',
    email: 'foh@hookahplus.com',
    name: 'Mike Front',
    role: 'foh',
    status: 'active',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date(),
    lastLoginAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    profile: {
      firstName: 'Mike',
      lastName: 'Front',
      preferences: {
        theme: 'auto',
        notifications: false,
        language: 'en'
      }
    },
    permissions: ['foh', 'manage_tables', 'view_orders']
  },
  {
    id: 'user-004',
    email: 'boh@hookahplus.com',
    name: 'Lisa Back',
    role: 'boh',
    status: 'active',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date(),
    lastLoginAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    profile: {
      firstName: 'Lisa',
      lastName: 'Back',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    },
    permissions: ['boh', 'manage_prep', 'view_kitchen']
  }
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

export const getUsersByRole = (role: User['role']): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getActiveUsers = (): User[] => {
  return mockUsers.filter(user => user.status === 'active');
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const user = getUserById(id);
  if (user) {
    Object.assign(user, updates);
    user.updatedAt = new Date();
    return user;
  }
  return null;
};

export const createUserSession = async (userId: string, sessionToken: string, expiresAt: Date): Promise<UserSession> => {
  const session: UserSession = {
    id: `session-${Date.now()}`,
    userId,
    sessionToken,
    expiresAt,
    createdAt: new Date(),
    lastActivityAt: new Date()
  };
  
  // In a real app, this would be stored in a database
  return session;
};

export const validateUserSession = async (sessionToken: string): Promise<User | null> => {
  // Mock session validation
  // In a real app, this would check against stored sessions
  const user = mockUsers[0]; // Return first user for demo
  return user;
};

// Demo users for fire session dashboard
export const demoUsers: User[] = [
  {
    id: 'demo-foh-001',
    email: 'mike@hookahplus.com',
    name: 'Mike Front',
    role: 'foh',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: ['foh:read', 'foh:write'],
    trustLevel: 'high'
  },
  {
    id: 'demo-boh-001',
    email: 'lisa@hookahplus.com',
    name: 'Lisa Back',
    role: 'boh',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: ['boh:read', 'boh:write'],
    trustLevel: 'high'
  },
  {
    id: 'demo-admin-001',
    email: 'sarah@hookahplus.com',
    name: 'Sarah Admin',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: ['admin:read', 'admin:write', 'admin:delete'],
    trustLevel: 'high'
  }
];

export const canPerformAction = (user: User, action: string): boolean => {
  // Mock permission logic
  if (user.trustLevel === 'high') return true;
  if (user.trustLevel === 'medium' && !['cancel', 'close'].includes(action)) return true;
  if (user.trustLevel === 'low' && ['view', 'update'].includes(action)) return true;
  return false;
};

export const getUserDisplayInfo = (userId: string): { name: string; role: string; avatar?: string } => {
  const user = demoUsers.find(u => u.id === userId) || mockUsers.find(u => u.id === userId);
  if (!user) return { name: 'Unknown User', role: 'unknown' };
  
  return {
    name: user.name,
    role: user.role,
    avatar: user.profile?.avatar
  };
};
