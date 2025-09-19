// app/lib/users.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin' | 'owner';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  role: 'customer';
  preferences?: {
    favoriteFlavors?: string[];
    dietaryRestrictions?: string[];
    seatingPreference?: string;
  };
  orderHistory?: {
    orderId: string;
    date: Date;
    amount: number;
    items: string[];
  }[];
}

export interface Staff extends User {
  role: 'staff' | 'admin' | 'owner';
  permissions: string[];
  shiftSchedule?: {
    start: Date;
    end: Date;
    days: string[];
  };
}

export function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  return {
    ...data,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'role'>): Customer {
  return {
    ...data,
    role: 'customer',
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createStaff(data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff {
  return {
    ...data,
    id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function updateUser(user: User, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User {
  return {
    ...user,
    ...updates,
    updatedAt: new Date(),
  };
}

// Demo data for development
export const demoUsers: User[] = [
  createUser({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    role: "customer"
  }),
  createUser({
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-0124",
    role: "staff"
  }),
  createUser({
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  })
];

// Permission checking
export function canPerformAction(user: User, action: string): boolean {
  if (user.role === 'owner' || user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'staff') {
    const staffActions = ['view_sessions', 'update_session', 'view_orders'];
    return staffActions.includes(action);
  }
  
  if (user.role === 'customer') {
    const customerActions = ['view_own_orders', 'create_order'];
    return customerActions.includes(action);
  }
  
  return false;
}

// Additional function for fire session dashboard
export function getUserDisplayInfo(user: User): { name: string; role: string; avatar?: string } {
  return {
    name: user.name,
    role: user.role,
    avatar: user.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random` : undefined
  };
}
