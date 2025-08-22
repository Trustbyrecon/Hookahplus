// scripts/generate-demo-data.js
// Generate realistic historical data for Hookah+ dashboard demo

const { addOrder, markPaid } = require('../lib/orders');

// Simulate orders over a realistic time period for live demo
const startTime = new Date();
startTime.setHours(startTime.getHours() - 1); // 1 hour ago for demo purposes
const endTime = new Date(); // Current time

// Realistic hookah flavors and durations
const flavors = [
  'Blue Mist + Mint',
  'Double Apple',
  'Grape + Mint', 
  'Peach + Mint',
  'Strawberry + Mint',
  'Watermelon + Mint',
  'Mango + Mint',
  'Pineapple + Mint'
];

const durations = [
  { label: '30 min', value: 3000, time: 30 },
  { label: '60 min', value: 5000, time: 60 },
  { label: '90 min', value: 7000, time: 90 }
];

const tables = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006'];

// Generate realistic order timestamps (more orders during peak hours)
function generateOrderTimes() {
  const times = [];
  const baseTime = startTime.getTime();
  const duration = endTime.getTime() - baseTime;
  
  // Generate 15-20 orders over the time period
  const numOrders = Math.floor(Math.random() * 6) + 15; // 15-20 orders
  
  for (let i = 0; i < numOrders; i++) {
    // More orders in the middle of the time period (peak time)
    let timeOffset;
    if (i < numOrders * 0.7) { // 70% of orders in peak time
      timeOffset = (duration * 0.25) + (Math.random() * duration * 0.5); // Middle period
    } else {
      timeOffset = Math.random() * duration; // Spread remaining orders
    }
    
    const orderTime = new Date(baseTime + timeOffset);
    times.push(orderTime);
  }
  
  return times.sort((a, b) => a - b); // Sort chronologically
}

// Generate realistic order data
function generateOrderData() {
  const orderTimes = generateOrderTimes();
  const orders = [];
  
  orderTimes.forEach((orderTime, index) => {
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    
    // Create order ID
    const orderId = `ord_${Math.random().toString(36).slice(2, 10)}`;
    
    // Simulate some orders being paid, some still pending
    const isPaid = Math.random() > 0.3; // 70% paid, 30% pending
    
    const order = {
      id: orderId,
      tableId: table,
      flavor: flavor,
      amount: duration.value,
      currency: 'usd',
      status: isPaid ? 'paid' : 'created',
      createdAt: orderTime.getTime()
    };
    
    orders.push(order);
    
    // Add to the orders system
    addOrder(order);
    
    // If paid, mark it as paid
    if (isPaid) {
      markPaid(orderId);
    }
  });
  
  return orders;
}

// Main execution
console.log('🍃 Generating simulated Hookah+ lounge data...');
console.log(`📅 Time period: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);

const generatedOrders = generateOrderData();

console.log(`✅ Generated ${generatedOrders.length} orders:`);
console.log(`   - Paid orders: ${generatedOrders.filter(o => o.status === 'paid').length}`);
console.log(`   - Pending orders: ${generatedOrders.filter(o => o.status === 'created').length}`);

// Show some sample orders
console.log('\n📋 Sample orders:');
generatedOrders.slice(0, 5).forEach(order => {
  const time = new Date(order.createdAt).toLocaleTimeString();
  const status = order.status === 'paid' ? '✅' : '⏳';
  console.log(`   ${status} ${time} | Table ${order.tableId} | ${order.flavor} | $${(order.amount / 100).toFixed(2)} | ${order.status}`);
});

console.log('\n🎯 Now refresh your dashboard to see the historical data!');
console.log('   - Aliethia memory widget should show top flavors');
console.log('   - Returning customers count should be visible');
console.log('   - Live orders table should be populated');

module.exports = { generateOrderData };
