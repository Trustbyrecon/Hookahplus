// scripts/simple-test.js
// Simple test to verify the demo data generator works

const { demoDataGenerator } = require('../lib/demoDataGenerator.ts');

console.log('🧪 Testing Demo Data Generator...\n');

try {
  // Test 1: Start demo mode
  console.log('1️⃣ Starting demo mode...');
  demoDataGenerator.startDemoMode();
  console.log('✅ Demo mode started');

  // Test 2: Get initial data
  console.log('\n2️⃣ Getting initial data...');
  const sessions = demoDataGenerator.getAllSessions();
  console.log(`✅ Found ${sessions.length} sessions`);

  // Test 3: Fire a session
  console.log('\n3️⃣ Firing a session...');
  const fireSession = demoDataGenerator.fireSession('T-001', 'Blue Mist + Mint', {
    name: 'Test Customer',
    phone: '+1 (555) 123-4567'
  });
  console.log(`✅ Session fired: ${fireSession.id}`);

  // Test 4: Get updated data
  console.log('\n4️⃣ Getting updated data...');
  const updatedSessions = demoDataGenerator.getAllSessions();
  console.log(`✅ Now have ${updatedSessions.length} sessions`);

  // Test 5: Get dashboard stats
  console.log('\n5️⃣ Getting dashboard stats...');
  const stats = demoDataGenerator.getDashboardStats();
  console.log('✅ Dashboard stats:');
  console.log(`   Total Sessions: ${stats.totalSessions}`);
  console.log(`   Active Sessions: ${stats.activeSessions}`);
  console.log(`   Pending Alerts: ${stats.pendingAlerts}`);

  // Test 6: Stop demo mode
  console.log('\n6️⃣ Stopping demo mode...');
  demoDataGenerator.stopDemoMode();
  console.log('✅ Demo mode stopped');

  console.log('\n🎉 All tests passed! Demo data generator is working correctly.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
