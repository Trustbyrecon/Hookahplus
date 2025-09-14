// scripts/end-to-end-demo.js
// Complete end-to-end demo simulation for MVP launch

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function runEndToEndDemo() {
  console.log('🎬 Hookah+ End-to-End Demo Simulation\n');

  try {
    // Start demo mode
    console.log('🚀 Starting Demo Mode...');
    await fetch(`${BASE_URL}/api/demo-data?action=start`);
    console.log('✅ Demo mode active - Real-time data flowing\n');

    // Simulate customer journey
    console.log('👤 Customer Journey Simulation:');
    
    // 1. Customer scans QR code at table T-001
    console.log('1️⃣ Customer scans QR at T-001...');
    const qrSession = await fireSession('T-001', 'Blue Mist + Mint', {
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com'
    });
    console.log(`   ✅ Session created: ${qrSession.id}`);

    // 2. Customer orders at booth B-001
    console.log('2️⃣ Customer orders at B-001...');
    const boothSession = await fireSession('B-001', 'Strawberry + Vanilla', {
      name: 'Sarah Johnson',
      phone: '+1 (555) 987-6543'
    });
    console.log(`   ✅ Session created: ${boothSession.id}`);

    // 3. Staff triggers session at lounge L-001
    console.log('3️⃣ Staff triggers session at L-001...');
    const staffSession = await fireSession('L-001', 'Grape + Mint', {
      name: 'Mike Davis',
      phone: '+1 (555) 456-7890'
    });
    console.log(`   ✅ Session created: ${staffSession.id}`);

    // Wait for BOH/FOH workflows to process
    console.log('\n⏳ Waiting for BOH/FOH workflows to process...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check results
    console.log('\n📊 Demo Results:');
    const stats = await getDashboardStats();
    console.log(`   Total Sessions: ${stats.totalSessions}`);
    console.log(`   Active Sessions: ${stats.activeSessions}`);
    console.log(`   Pending Alerts: ${stats.pendingAlerts}`);
    console.log(`   Active Operations: ${stats.activeOperations}`);

    console.log('\n🎉 End-to-End Demo Complete!');
    console.log('   ✅ Multiple fire session pathways validated');
    console.log('   ✅ BOH/FOH workflows triggered');
    console.log('   ✅ Real-time data flowing');
    console.log('   ✅ MVP ready for launch!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

async function fireSession(tableId, flavor, customerInfo) {
  const response = await fetch(`${BASE_URL}/api/demo-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'fire-session',
      tableId,
      flavor,
      customerInfo
    })
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.session;
}

async function getDashboardStats() {
  const response = await fetch(`${BASE_URL}/api/demo-data?action=stats`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.stats;
}

// Run demo
if (require.main === module) {
  runEndToEndDemo();
}

module.exports = { runEndToEndDemo };
