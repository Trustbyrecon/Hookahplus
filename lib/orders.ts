export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  tax: number;
  tip?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'hookah' | 'food' | 'drink' | 'other';
  specialInstructions?: string;
}

export interface OrderUpdate {
  orderId: string;
  status?: Order['status'];
  notes?: string;
  items?: OrderItem[];
}

// Mock data for development
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    tableNumber: 'A1',
    items: [
      { id: '1', name: 'Blueberry Hookah', price: 25.00, quantity: 1, category: 'hookah' },
      { id: '2', name: 'Mint Tea', price: 8.00, quantity: 2, category: 'drink' }
    ],
    status: 'CONFIRMED',
    totalAmount: 41.00,
    tax: 3.28,
    tip: 8.20,
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Extra mint in tea'
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Sarah Smith',
    tableNumber: 'B2',
    items: [
      { id: '3', name: 'Grape Hookah', price: 25.00, quantity: 1, category: 'hookah' },
      { id: '4', name: 'Hummus Plate', price: 10.00, quantity: 1, category: 'food' }
    ],
    status: 'PREPARING',
    totalAmount: 35.00,
    tax: 2.80,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  }
];

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  // Mock API call
  console.log(`Updating order ${orderId} to status: ${status}`);
  // In a real app, this would make an API call
};

export const getOrdersByStatus = (status: Order['status']): Order[] => {
  return mockOrders.filter(order => order.status === status);
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(order => order.id === id);
};

export const getOrdersByTable = (tableNumber: string): Order[] => {
  return mockOrders.filter(order => order.tableNumber === tableNumber);
};

export const calculateOrderTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Order storage (in-memory for demo)
const orderStorage: Map<string, Order> = new Map();

export const getLiveOrders = (): Order[] => {
  return Array.from(orderStorage.values()).filter(order => 
    order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
  );
};

export const getPaidOrderCount = (): number => {
  return Array.from(orderStorage.values()).filter(order => 
    order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY' || order.status === 'DELIVERED'
  ).length;
};

export const getPendingOrderCount = (): number => {
  return Array.from(orderStorage.values()).filter(order => 
    order.status === 'PENDING' || order.status === 'CONFIRMED'
  ).length;
};

export const getTotalRevenue = (): number => {
  return Array.from(orderStorage.values()).reduce((total, order) => {
    if (order.status === 'DELIVERED') {
      return total + order.totalAmount;
    }
    return total;
  }, 0);
};

export const getTopFlavors = (limit: number = 5): Array<{ flavor: string; count: number }> => {
  const flavorCounts: Map<string, number> = new Map();
  
  Array.from(orderStorage.values()).forEach(order => {
    order.items.forEach(item => {
      if (item.category === 'hookah') {
        const count = flavorCounts.get(item.name) || 0;
        flavorCounts.set(item.name, count + item.quantity);
      }
    });
  });
  
  return Array.from(flavorCounts.entries())
    .map(([name, count]) => ({ flavor: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getFlavorMixLibrary = (): Array<{ combination: string; count: number }> => {
  return [
    { combination: 'Blueberry Mint', count: 95 },
    { combination: 'Grape Ice', count: 88 },
    { combination: 'Double Apple', count: 92 },
    { combination: 'Strawberry Kiwi', count: 85 },
    { combination: 'Mint Chocolate', count: 78 }
  ];
};

export const clearOrders = (): void => {
  orderStorage.clear();
};

export const addOrder = (order: Order): void => {
  orderStorage.set(order.id, order);
};

export const setTableMapping = (tableId: string, orderId: string): void => {
  const order = orderStorage.get(orderId);
  if (order) {
    order.tableNumber = tableId;
    orderStorage.set(orderId, order);
  }
};

export const markPaid = (orderId: string): void => {
  const order = orderStorage.get(orderId);
  if (order) {
    order.status = 'CONFIRMED';
    orderStorage.set(orderId, order);
  }
};

export const startSession = (orderId: string): void => {
  const order = orderStorage.get(orderId);
  if (order) {
    order.status = 'PREPARING';
    orderStorage.set(orderId, order);
  }
};

export const updateCoalStatus = (orderId: string, status: 'fresh' | 'needs_replacement' | 'replaced'): void => {
  const order = orderStorage.get(orderId);
  if (order) {
    // Add coal status to order metadata
    if (!order.notes) order.notes = '';
    order.notes += ` Coal: ${status}`;
    orderStorage.set(orderId, order);
  }
};

export const addFlavorToSession = (orderId: string, flavor: string): void => {
  const order = orderStorage.get(orderId);
  if (order) {
    const newItem: OrderItem = {
      id: `flavor-${Date.now()}`,
      name: flavor,
      price: 5.00,
      quantity: 1,
      category: 'hookah'
    };
    order.items.push(newItem);
    order.totalAmount += newItem.price;
    orderStorage.set(orderId, order);
  }
};