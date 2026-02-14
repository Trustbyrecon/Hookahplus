/**
 * Test Taxonomy Migration
 * 
 * Verifies mapping functions and dual-write functionality
 */

import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';
import { prisma } from '../lib/db';
import {
  mapSessionState,
  mapTrustEvent,
  mapDriftReason,
  isValidSessionStateV1,
  isValidTrustEventTypeV1,
  isValidDriftReasonV1
} from '../lib/taxonomy/enums-v1';

// Load .env.local explicitly
config({ path: resolve(__dirname, '../.env.local') });

async function testMappingFunctions() {
  console.log('\n🧪 Testing Mapping Functions');
  console.log('═'.repeat(60));

  // Test SessionState mapping
  console.log('\n📦 Testing SessionState mapping:');
  const sessionStateTests = [
    { legacy: 'PENDING', session: {}, expected: { state: 'queued', paused: false } },
    { legacy: 'ACTIVE', session: { prep_started_at: new Date() }, expected: { state: 'prep', paused: false } },
    { legacy: 'ACTIVE', session: { handoff_started_at: new Date() }, expected: { state: 'handoff', paused: false } },
    { legacy: 'PAUSED', session: { prep_started_at: new Date() }, expected: { state: 'prep', paused: true } },
    { legacy: 'CLOSED', session: {}, expected: { state: 'closed', paused: false } },
    { legacy: 'CANCELED', session: {}, expected: { state: 'canceled', paused: false } },
  ];

  for (const test of sessionStateTests) {
    const result = mapSessionState(test.legacy as any, test.session);
    const passed = result.state === test.expected.state && result.paused === test.expected.paused;
    console.log(`  ${passed ? '✅' : '❌'} ${test.legacy} → ${result.state} (paused: ${result.paused})`);
    if (!passed) {
      console.log(`     Expected: ${test.expected.state} (paused: ${test.expected.paused})`);
    }
  }

  // Test TrustEventType mapping
  console.log('\n📦 Testing TrustEventType mapping:');
  const trustEventTests = [
    { legacy: 'delivery_on_time', expected: { v1: 'on_time_delivery' } },
    { legacy: 'favorite_applied', expected: { v1: 'fav_used' } },
    { legacy: 'speedy_checkout', expected: { v1: 'fast_checkout' } },
    { legacy: 'unknown_event', expected: { unknown: 'unknown_event' } },
  ];

  for (const test of trustEventTests) {
    const result = mapTrustEvent(test.legacy);
    const passed = (test.expected.v1 && result.v1 === test.expected.v1) ||
                   (test.expected.unknown && result.unknown === test.expected.unknown);
    console.log(`  ${passed ? '✅' : '❌'} ${test.legacy} → ${result.v1 || result.unknown || 'null'}`);
    if (!passed) {
      console.log(`     Expected: ${test.expected.v1 || test.expected.unknown}`);
    }
  }

  // Test DriftReason mapping
  console.log('\n📦 Testing DriftReason mapping:');
  const driftReasonTests = [
    { legacy: 'slow_handoff', expected: { v1: 'slow_handoff' } },
    { legacy: 'handoff_delay', expected: { v1: 'slow_handoff' } },
    { legacy: 'unknown_drift', expected: { unknown: 'unknown_drift' } },
  ];

  for (const test of driftReasonTests) {
    const result = mapDriftReason(test.legacy);
    const passed = (test.expected.v1 && result.v1 === test.expected.v1) ||
                   (test.expected.unknown && result.unknown === test.expected.unknown);
    console.log(`  ${passed ? '✅' : '❌'} ${test.legacy} → ${result.v1 || result.unknown || 'null'}`);
    if (!passed) {
      console.log(`     Expected: ${test.expected.v1 || test.expected.unknown}`);
    }
  }
}

async function testValidationFunctions() {
  console.log('\n🧪 Testing Validation Functions');
  console.log('═'.repeat(60));

  const validStates = ['queued', 'prep', 'handoff', 'delivering', 'delivered', 'checkout', 'closed', 'canceled'];
  const invalidStates = ['PENDING', 'ACTIVE', 'invalid', ''];

  console.log('\n📦 Testing SessionStateV1 validation:');
  for (const state of validStates) {
    const valid = isValidSessionStateV1(state);
    console.log(`  ${valid ? '✅' : '❌'} "${state}" is ${valid ? 'valid' : 'invalid'}`);
  }
  for (const state of invalidStates) {
    const valid = isValidSessionStateV1(state);
    console.log(`  ${valid ? '❌' : '✅'} "${state}" is ${valid ? 'valid (should be invalid)' : 'invalid'}`);
  }

  const validTrustEvents = ['on_time_delivery', 'fav_used', 'fast_checkout', 'corrected_issue', 'staff_greeting', 'loyalty_redeemed'];
  const invalidTrustEvents = ['order.created', 'payment.settled', 'invalid', ''];

  console.log('\n📦 Testing TrustEventTypeV1 validation:');
  for (const event of validTrustEvents) {
    const valid = isValidTrustEventTypeV1(event);
    console.log(`  ${valid ? '✅' : '❌'} "${event}" is ${valid ? 'valid' : 'invalid'}`);
  }
  for (const event of invalidTrustEvents) {
    const valid = isValidTrustEventTypeV1(event);
    console.log(`  ${valid ? '❌' : '✅'} "${event}" is ${valid ? 'valid (should be invalid)' : 'invalid'}`);
  }
}

async function testDualWrite() {
  console.log('\n🧪 Testing Dual-Write Functionality');
  console.log('═'.repeat(60));

  try {
    // Check if v1 columns exist
    const sessionSample = await prisma.session.findFirst({
      select: {
        id: true,
        state: true,
        sessionStateV1: true,
        paused: true
      }
    });

    if (sessionSample) {
      console.log('\n📦 Sample Session:');
      console.log(`  ID: ${sessionSample.id}`);
      console.log(`  Legacy state: ${sessionSample.state}`);
      console.log(`  V1 state: ${sessionSample.sessionStateV1 || 'null'}`);
      console.log(`  Paused: ${sessionSample.paused}`);
      
      if (sessionSample.sessionStateV1) {
        console.log('  ✅ Dual-write is working (v1 column has value)');
      } else {
        console.log('  ⚠️  Dual-write not yet active (v1 column is null)');
      }
    } else {
      console.log('  ⚠️  No sessions found in database');
    }

    const eventSample = await prisma.reflexEvent.findFirst({
      select: {
        id: true,
        type: true,
        trustEventTypeV1: true
      }
    });

    if (eventSample) {
      console.log('\n📦 Sample ReflexEvent:');
      console.log(`  ID: ${eventSample.id}`);
      console.log(`  Legacy type: ${eventSample.type}`);
      console.log(`  V1 type: ${eventSample.trustEventTypeV1 || 'null'}`);
      
      if (eventSample.trustEventTypeV1) {
        console.log('  ✅ Dual-write is working (v1 column has value)');
      } else {
        console.log('  ⚠️  Dual-write not yet active (v1 column is null)');
      }
    } else {
      console.log('  ⚠️  No reflex events found in database');
    }

  } catch (error) {
    console.error('  ❌ Error testing dual-write:', error);
  }
}

async function main() {
  console.log('🚀 Starting Taxonomy Migration Tests');
  console.log('═'.repeat(60));

  try {
    await testMappingFunctions();
    await testValidationFunctions();
    await testDualWrite();

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All tests completed');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

