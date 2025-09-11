#!/usr/bin/env node

/**
 * Smoke test script to verify session idempotency and version conflicts
 * Run with: node scripts/smokeSessions.js
 */

const crypto = require("crypto");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": crypto.randomUUID(),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function testIdempotency() {
  console.log("🧪 Testing session creation idempotency...");
  
  const sessionData = {
    loungeId: "test-lounge-1",
    source: "QR",
    externalRef: "qr:test-token-123",
    customerPhone: "+1234567890",
    flavorMix: { flavors: ["mint", "blueberry"], strength: "medium" }
  };

  // Create session first time
  const response1 = await makeRequest(`${BASE_URL}/api/sessions`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });

  console.log("✅ First creation:", response1.session.id);

  // Try to create same session again (should return existing)
  const response2 = await makeRequest(`${BASE_URL}/api/sessions`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });

  console.log("✅ Second creation (idempotent):", response2.session.id);

  if (response1.session.id === response2.session.id) {
    console.log("✅ Idempotency test PASSED - Same session returned");
  } else {
    console.log("❌ Idempotency test FAILED - Different sessions created");
  }

  return response1.session;
}

async function testVersionConflicts(sessionId) {
  console.log("\n🧪 Testing optimistic concurrency control...");

  // Get current session version
  const currentSession = await makeRequest(`${BASE_URL}/api/sessions/${sessionId}`);
  const currentVersion = currentSession.session.version;
  console.log(`📊 Current version: ${currentVersion}`);

  // Simulate concurrent updates
  const update1 = makeRequest(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      expectedVersion: currentVersion,
      state: "ACTIVE",
      note: "First update"
    }),
  });

  const update2 = makeRequest(`${BASE_URL}/api/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      expectedVersion: currentVersion, // Same version - should cause conflict
      state: "PAUSED",
      note: "Second update"
    }),
  });

  try {
    const [result1, result2] = await Promise.allSettled([update1, update2]);
    
    if (result1.status === "fulfilled" && result2.status === "rejected") {
      console.log("✅ Version conflict test PASSED - One update succeeded, one failed");
      console.log("✅ Successful update:", result1.value.session.version);
      console.log("✅ Failed update:", result2.reason.message);
    } else if (result1.status === "rejected" && result2.status === "fulfilled") {
      console.log("✅ Version conflict test PASSED - One update succeeded, one failed");
      console.log("✅ Successful update:", result2.value.session.version);
      console.log("✅ Failed update:", result1.reason.message);
    } else {
      console.log("❌ Version conflict test FAILED - Both updates should not succeed");
    }
  } catch (error) {
    console.log("❌ Version conflict test ERROR:", error);
  }
}

async function testDifferentSources() {
  console.log("\n🧪 Testing different session sources...");

  const sources = [
    { source: "QR", externalRef: "qr:token-456" },
    { source: "RESERVE", externalRef: "res:reservation-789" },
    { source: "WALK_IN", externalRef: "walkin:uuid-abc123" }
  ];

  for (const { source, externalRef } of sources) {
    const sessionData = {
      loungeId: "test-lounge-1",
      source,
      externalRef,
      customerPhone: "+1234567890"
    };

    const response = await makeRequest(`${BASE_URL}/api/sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    });

    console.log(`✅ Created ${source} session:`, response.session.id);
  }
}

async function testLoungeIsolation() {
  console.log("\n🧪 Testing lounge isolation...");

  const sessionData1 = {
    loungeId: "lounge-1",
    source: "QR",
    externalRef: "same-token",
    customerPhone: "+1111111111"
  };

  const sessionData2 = {
    loungeId: "lounge-2",
    source: "QR", 
    externalRef: "same-token", // Same external ref, different lounge
    customerPhone: "+2222222222"
  };

  const [response1, response2] = await Promise.all([
    makeRequest(`${BASE_URL}/api/sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData1),
    }),
    makeRequest(`${BASE_URL}/api/sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData2),
    })
  ]);

  if (response1.session.id !== response2.session.id) {
    console.log("✅ Lounge isolation test PASSED - Different sessions for different lounges");
  } else {
    console.log("❌ Lounge isolation test FAILED - Same session for different lounges");
  }
}

async function main() {
  console.log("🚀 Starting session smoke tests...\n");

  try {
    // Test idempotency
    const session = await testIdempotency();
    
    // Test version conflicts
    await testVersionConflicts(session.id);
    
    // Test different sources
    await testDifferentSources();
    
    // Test lounge isolation
    await testLoungeIsolation();
    
    console.log("\n🎉 All smoke tests completed!");
    
  } catch (error) {
    console.error("❌ Smoke test failed:", error);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);