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
