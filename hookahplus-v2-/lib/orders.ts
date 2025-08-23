// lib/orders.ts
type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
  // New fields for enhanced tracking
  sessionStartTime?: number;
  sessionDuration?: number; // in minutes
  coalStatus?: "active" | "needs_refill" | "burnt_out" | "paused";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
  // Customer profile metadata for network ecosystem
  customerName?: string;
  customerId?: string; // Unique identifier across lounges
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[]; // Array of previous session IDs
  // Table mapping for ScreenCoder integration
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number }; // Coordinates for lounge layout
  refillTimerStart?: number; // When refill status was set
  sessionPauseTime?: number; // When session was paused due to burnout
  totalPausedTime?: number; // Total time session has been paused
};

let ORDERS: Order[] = [];

export function addOrder(o: Order) {
  ORDERS.unshift(o);
  console.log('Added order:', o.id, 'Total orders now:', ORDERS.length);
}

export function listOrders() {
  console.log('Listing orders, total count:', ORDERS.length);
  return ORDERS.slice(0, 100); // Increased limit for historical data
}

export function markPaid(id: string) {
  const o = ORDERS.find(x => x.id === id);
  if (o) {
    o.status = "paid";
    console.log('Marked order as paid:', id);
  }
}

export function clearOrders() {
  console.log('Clearing orders, previous count:', ORDERS.length);
  ORDERS = [];
}

export function getOrderCount() {
  return ORDERS.length;
}

export function getPaidOrderCount() {
  return ORDERS.filter(o => o.status === 'paid').length;
}

export function getPendingOrderCount() {
  return ORDERS.filter(o => o.status === 'created').length;
}

export function getTotalRevenue() {
  return ORDERS.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);
}

// Enhanced session management
export function startSession(orderId: string) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    order.sessionStartTime = Date.now();
    order.coalStatus = "active";
    order.totalPausedTime = 0;
    console.log('Started session for order:', orderId);
  }
}

export function updateCoalStatus(orderId: string, status: "active" | "needs_refill" | "burnt_out" | "paused") {
  const order = ORDERS.find(o => o.id === orderId);
  if (order) {
    order.coalStatus = status;
    
    // Start refill timer when status changes to needs_refill
    if (status === 'needs_refill') {
      order.refillTimerStart = Date.now();
      console.log('Started refill timer for order:', orderId);
      
      // Set timeout to automatically change to burnt_out after 10 seconds
      setTimeout(() => {
        const currentOrder = ORDERS.find(o => o.id === orderId);
        if (currentOrder && currentOrder.coalStatus === 'needs_refill') {
          currentOrder.coalStatus = 'burnt_out';
          currentOrder.sessionPauseTime = Date.now();
          console.log('Auto-changed to burnt_out after 10 seconds for order:', orderId);
        }
      }, 10000); // 10 seconds
    }
    
    // Handle burnout - pause the session but don't end it
    if (status === 'burnt_out') {
      order.sessionPauseTime = Date.now();
      console.log('Session paused due to burnout for order:', orderId);
    }
    
    // Handle resuming from burnout
    if (status === 'active' && order.sessionPauseTime) {
      const pauseDuration = Date.now() - order.sessionPauseTime;
      order.totalPausedTime = (order.totalPausedTime || 0) + pauseDuration;
      order.sessionPauseTime = undefined;
      console.log('Session resumed from burnout for order:', orderId);
    }
    
    console.log('Updated coal status for order:', orderId, 'to:', status);
  }
}

// New function to handle refill and reset status
export function handleRefill(orderId: string) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.coalStatus === 'needs_refill') {
    order.coalStatus = 'active';
    order.refillTimerStart = undefined; // Clear the refill timer
    console.log('Refilled and reset status to active for order:', orderId);
    return true;
  }
  return false;
}

// Function to get remaining refill time in seconds
export function getRefillTimeRemaining(orderId: string): number {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.coalStatus === 'needs_refill' && order.refillTimerStart) {
    const elapsed = Date.now() - order.refillTimerStart;
    const remaining = 10000 - elapsed; // 10 seconds total
    return Math.max(0, Math.ceil(remaining / 1000));
  }
  return 0;
}

// Function to get current session time accounting for pauses
export function getCurrentSessionTime(orderId: string): number {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.sessionStartTime) {
    const totalElapsed = Date.now() - order.sessionStartTime;
    const totalPaused = order.totalPausedTime || 0;
    const currentPause = order.sessionPauseTime ? (Date.now() - order.sessionPauseTime) : 0;
    return totalElapsed - totalPaused - currentPause;
  }
  return 0;
}

// Function to set table type and position for ScreenCoder integration
export function setTableMapping(orderId: string, tableType: Order['tableType'], position: { x: number; y: number }) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order) {
    order.tableType = tableType;
    order.tablePosition = position;
    console.log('Set table mapping for order:', orderId, tableType, position);
  }
}

export function addFlavorToSession(orderId: string, flavor: string, addOnRate: number = 500) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order && order.status === 'paid') {
    if (!order.addOnFlavors) order.addOnFlavors = [];
    order.addOnFlavors.push(flavor);
    order.addOnRate = (order.addOnRate || 0) + addOnRate;
    order.totalRevenue = (order.baseRate || order.amount) + order.addOnRate;
    console.log('Added flavor to session:', orderId, flavor);
  }
}

// Get all orders (live data, no time restrictions)
export function getRecentOrders() {
  return ORDERS; // Return all orders for live dashboard
}

// Get active sessions (including paused ones) - live data
export function getActiveSessions() {
  return ORDERS.filter(o => 
    o.status === 'paid' && 
    o.sessionStartTime && 
    (o.coalStatus === 'active' || o.coalStatus === 'needs_refill' || o.coalStatus === 'burnt_out')
  );
}

// Get live orders for dashboard (all orders, no time restrictions)
export function getLiveOrders() {
  return ORDERS;
}

// Flavor intent capture for Aliethia
export function getTopFlavors() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  console.log('Getting top flavors from', paidOrders.length, 'paid orders');
  if (paidOrders.length < 3) return null; // Need at least 3 paid orders
  
  const flavorCounts: Record<string, number> = {};
  paidOrders.forEach(o => {
    if (o.flavor) {
      flavorCounts[o.flavor] = (flavorCounts[o.flavor] || 0) + 1;
    }
    // Include add-on flavors
    if (o.addOnFlavors) {
      o.addOnFlavors.forEach(addOn => {
        flavorCounts[addOn] = (flavorCounts[addOn] || 0) + 1;
      });
    }
  });
  
  return Object.entries(flavorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([flavor, count]) => ({ flavor, count }));
}

export function getReturningCustomers() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  console.log('Getting returning customers from', paidOrders.length, 'paid orders');
  if (paidOrders.length < 3) return null;
  
  // Simple calculation: count unique table IDs
  const uniqueTables = new Set(paidOrders.map(o => o.tableId).filter(Boolean));
  return uniqueTables.size;
}

// Get customer's previous 3 sessions for flavor recommendations
export function getCustomerPreviousSessions(customerId: string, currentSessionId: string) {
  const customerOrders = ORDERS.filter(o => 
    o.customerId === customerId && 
    o.id !== currentSessionId && 
    o.status === 'paid' &&
    o.sessionStartTime
  );
  
  return customerOrders
    .sort((a, b) => (b.sessionStartTime || 0) - (a.sessionStartTime || 0))
    .slice(0, 3);
}

// Get flavor mix library (popular combinations)
export function getFlavorMixLibrary() {
  const paidOrders = ORDERS.filter(o => o.status === 'paid');
  const flavorCombinations: Record<string, number> = {};
  
  paidOrders.forEach(o => {
    if (o.flavor) {
      const baseFlavor = o.flavor;
      if (o.addOnFlavors && o.addOnFlavors.length > 0) {
        o.addOnFlavors.forEach(addOn => {
          const combination = `${baseFlavor} + ${addOn}`;
          flavorCombinations[combination] = (flavorCombinations[combination] || 0) + 1;
        });
      } else {
        flavorCombinations[baseFlavor] = (flavorCombinations[baseFlavor] || 0) + 1;
      }
    }
  });
  
  return Object.entries(flavorCombinations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 combinations
    .map(([combination, count]) => ({ combination, count }));
}
