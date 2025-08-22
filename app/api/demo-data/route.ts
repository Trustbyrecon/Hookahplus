// app/api/demo-data/route.ts
// Generate demo data for dashboard testing

import { NextResponse } from "next/server";
import { addOrder, markPaid, clearOrders, startSession, updateCoalStatus, addFlavorToSession, setTableMapping } from "../../../lib/orders";

// Simulate orders over a realistic time period for live demo
const startTime = new Date();
startTime.setHours(startTime.getHours() - 1); // 1 hour ago for demo purposes
const endTime = new Date(); // Current time

// Enhanced flavor combinations based on real lounge atmosphere
const flavors = [
  'Double Apple',
  'Mint',
  'Strawberry',
  'Grape',
  'Rose',
  'Vanilla',
  'Coconut',
  'Pineapple',
  'Lavender',
  'Honey',
  'Cardamom',
  'Peach',
  'Blueberry',
  'Cherry',
  'Orange',
  'Strawberry + Mint',
  'Grape + Mint',
  'Rose + Cardamom',
  'Coconut + Pineapple',
  'Lavender + Honey'
];

const durations = [
  { label: '30 min', value: 3000, time: 30 },
  { label: '60 min', value: 5000, time: 60 },
  { label: '90 min', value: 7000, time: 90 },
  { label: '120 min', value: 9000, time: 120 }
];

// Table configuration for ScreenCoder integration
  const tableConfigs = [
    // Bar Area (Left side)
    { id: 'BAR-01', type: 'high_boy' as const, position: { x: 50, y: 100 }, capacity: 2 },
    { id: 'BAR-02', type: 'high_boy' as const, position: { x: 150, y: 100 }, capacity: 2 },
    { id: 'BAR-03', type: 'high_boy' as const, position: { x: 250, y: 100 }, capacity: 2 },
    
    // Main Seating Area (Center)
    { id: 'T-001', type: 'table' as const, position: { x: 100, y: 200 }, capacity: 4 },
    { id: 'T-002', type: 'table' as const, position: { x: 250, y: 200 }, capacity: 4 },
    { id: 'T-003', type: 'table' as const, position: { x: 400, y: 200 }, capacity: 4 },
    { id: 'T-004', type: 'table' as const, position: { x: 550, y: 200 }, capacity: 4 },
    
    // Booth Seating (Right wall)
    { id: 'B-001', type: '2x_booth' as const, position: { x: 700, y: 150 }, capacity: 2 },
    { id: 'B-002', type: '4x_booth' as const, position: { x: 700, y: 250 }, capacity: 4 },
    { id: 'B-003', type: '2x_booth' as const, position: { x: 700, y: 350 }, capacity: 2 },
    
    // Communal Sectionals (Center-back)
    { id: 'C-001', type: '8x_sectional' as const, position: { x: 200, y: 350 }, capacity: 8 },
    { id: 'C-002', type: '4x_sofa' as const, position: { x: 500, y: 350 }, capacity: 4 },
    
    // Window Tables (Left wall)
    { id: 'W-001', type: 'table' as const, position: { x: 50, y: 250 }, capacity: 4 },
    { id: 'W-002', type: 'table' as const, position: { x: 50, y: 350 }, capacity: 4 },
    { id: 'W-003', type: 'table' as const, position: { x: 50, y: 450 }, capacity: 4 }
  ];

// Customer profiles for network ecosystem simulation
const customerProfiles = [
  {
    id: 'cust_001',
    name: 'Alex Rodriguez',
    preferences: {
      favoriteFlavors: ['Double Apple', 'Mint'],
      sessionDuration: 120,
      addOnPreferences: ['Extra Coal', 'Premium Tobacco'],
      notes: 'Prefers window seating, regular customer'
    }
  },
  {
    id: 'cust_002',
    name: 'Sarah Chen',
    preferences: {
      favoriteFlavors: ['Strawberry', 'Vanilla'],
      sessionDuration: 90,
      addOnPreferences: ['Fruit Bowl', 'Herbal Tea'],
      notes: 'Likes booth seating, brings laptop'
    }
  },
  {
    id: 'cust_003',
    name: 'Mike Johnson',
    preferences: {
      favoriteFlavors: ['Grape', 'Mint'],
      sessionDuration: 150,
      addOnPreferences: ['Extra Coal', 'Snacks'],
      notes: 'Bar area regular, sports fan'
    }
  },
  {
    id: 'cust_004',
    name: 'Jasmine Williams',
    preferences: {
      favoriteFlavors: ['Rose', 'Cardamom'],
      sessionDuration: 180,
      addOnPreferences: ['Premium Tea', 'Dessert'],
      notes: 'Communal seating, social butterfly'
    }
  },
  {
    id: 'cust_005',
    name: 'Carlos Martinez',
    preferences: {
      favoriteFlavors: ['Coconut', 'Pineapple'],
      sessionDuration: 100,
      addOnPreferences: ['Tropical Mix', 'Cold Drinks'],
      notes: 'Booth seating, date night regular'
    }
  },
  {
    id: 'cust_006',
    name: 'Emma Thompson',
    preferences: {
      favoriteFlavors: ['Lavender', 'Honey'],
      sessionDuration: 140,
      addOnPreferences: ['Herbal Infusion', 'Light Snacks'],
      notes: 'Window table, book reader'
    }
  }
];

  // Generate realistic order timestamps over the past 2 hours + current
  function generateOrderTimes() {
    const times: Date[] = [];
    const baseTime = startTime.getTime();
    const duration = endTime.getTime() - baseTime;
    
    // Generate 20-30 orders over the time period
    const numOrders = Math.floor(Math.random() * 11) + 20; // 20-30 orders
    
    for (let i = 0; i < numOrders; i++) {
      // More orders during peak hours (7-9 PM)
      let timeOffset;
      if (i < numOrders * 0.6) { // 60% of orders in peak time
        timeOffset = (duration * 0.2) + (Math.random() * duration * 0.6); // 7-9 PM equivalent
      } else {
        timeOffset = Math.random() * duration; // Spread remaining orders
      }
      
      const orderTime = new Date(baseTime + timeOffset);
      times.push(orderTime);
    }
    
    return times.sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
  }



export async function POST() {
  try {
    // Clear existing orders before generating new ones
    clearOrders();
    console.log('Cleared existing orders');
    
    // Define the order type to match lib/orders.ts
    type Order = {
      id: string;
      tableId?: string;
      flavor?: string;
      amount: number;
      currency: string;
      status: "created" | "paid" | "failed";
      createdAt: number;
      sessionStartTime?: number;
      sessionDuration?: number;
      coalStatus?: "active" | "needs_refill" | "burnt_out";
      addOnFlavors?: string[];
      baseRate?: number;
      addOnRate?: number;
      totalRevenue?: number;
      // Customer profile metadata for network ecosystem
      customerName?: string;
      customerId?: string;
      customerPreferences?: {
        favoriteFlavors?: string[];
        sessionDuration?: number;
        addOnPreferences?: string[];
        notes?: string;
      };
      previousSessions?: string[];
      // Table mapping for ScreenCoder integration
      tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
      tablePosition?: { x: number; y: number };
      refillTimerStart?: number;
    };
    
    const orderTimes = generateOrderTimes();
    const orders: Order[] = [];
    console.log('Generating', orderTimes.length, 'orders');
    
    orderTimes.forEach((orderTime, index) => {
      // Enhanced flavor selection with realistic combinations
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const duration = durations[Math.floor(Math.random() * durations.length)];
      const tableConfig = tableConfigs[Math.floor(Math.random() * tableConfigs.length)];
      
      // Create order ID
      const orderId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      
      // Simulate some orders being paid, some still pending
      const isPaid = Math.random() > 0.2; // 80% paid, 20% pending
      
      // Base rate + potential add-ons
      const baseRate = duration.value;
      const hasAddOns = Math.random() > 0.5; // 50% chance of add-ons
      const addOnRate = hasAddOns ? Math.floor(Math.random() * 3 + 1) * 500 : 0; // 1-3 add-ons
      const totalAmount = baseRate + addOnRate;
      
      // Assign customer profile (70% chance of having a profile)
      const hasCustomerProfile = Math.random() > 0.3;
      const customerProfile = hasCustomerProfile ? customerProfiles[Math.floor(Math.random() * customerProfiles.length)] : null;
      
      const order: Order = {
        id: orderId,
        tableId: tableConfig.id,
        flavor: flavor,
        amount: totalAmount,
        currency: 'usd',
        status: isPaid ? 'paid' : 'created',
        createdAt: orderTime.getTime(),
        sessionDuration: duration.time,
        baseRate: baseRate,
        addOnRate: addOnRate,
        totalRevenue: totalAmount,
        // Customer profile data
        customerName: customerProfile?.name || 'Staff Customer',
        customerId: customerProfile?.id,
        customerPreferences: customerProfile?.preferences,
        previousSessions: customerProfile ? [`prev_${Math.random().toString(36).slice(2, 8)}`] : undefined,
        // Table mapping data
        tableType: tableConfig.type,
        tablePosition: tableConfig.position
      };
      
      orders.push(order);
      
      // Add to the orders system
      addOrder(order);
      
      // Set table mapping for ScreenCoder integration
      setTableMapping(orderId, tableConfig.type, tableConfig.position);
      
      console.log(`Added order ${index + 1}:`, orderId, order.status, order.flavor, customerProfile?.name || 'Staff Customer', `at ${tableConfig.id}`);
      
      // If paid, mark it as paid and potentially start session
      if (isPaid) {
        markPaid(orderId);
        
        // Simulate session management for some orders
        if (Math.random() > 0.3) { // 70% of paid orders get sessions
          // Start session
          startSession(orderId);
          
          // Simulate coal status changes over time
          setTimeout(() => {
            if (Math.random() > 0.6) {
              updateCoalStatus(orderId, "needs_refill");
            }
          }, Math.random() * 30000 + 10000); // 10-40 seconds later
          
          // Simulate some orders getting burnt out
          setTimeout(() => {
            if (Math.random() > 0.7) {
              updateCoalStatus(orderId, "burnt_out");
            }
          }, Math.random() * 60000 + 30000); // 30-90 seconds later
          
          // Simulate add-on flavors for some sessions
          if (hasAddOns) {
            setTimeout(() => {
              const addOnFlavor = flavors[Math.floor(Math.random() * flavors.length)];
              addFlavorToSession(orderId, addOnFlavor, 500);
            }, Math.random() * 20000 + 15000); // 15-35 seconds later
          }
        }
      }
    });
    
    console.log('Final order count in system:', orders.length);
    
    return NextResponse.json({ 
      success: true,
      message: `Generated ${orders.length} demo orders`,
      orders: orders.length,
      paid: orders.filter(o => o.status === 'paid').length,
      pending: orders.filter(o => o.status === 'created').length,
      timeRange: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
      activeSessions: orders.filter(o => o.status === 'paid' && o.sessionStartTime).length,
      customersWithProfiles: orders.filter(o => o.customerId).length,
      tableConfigs: tableConfigs.length
    });
    
  } catch (error: any) {
    console.error('Error in demo-data generation:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to /api/demo-data to generate demo orders",
    timeRange: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
    flavors: flavors,
    tables: tableConfigs,
    customerProfiles: customerProfiles.length
  });
}
