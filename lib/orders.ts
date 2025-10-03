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