#!/usr/bin/env node

const crypto = require("crypto");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function createActiveSession() {
  console.log("🚀 Creating active session for build verification...");
  
  const sessionData = {
    loungeId: "build-test-lounge",
    source: "QR",
    externalRef: `qr:build-test-${Date.now()}`,
    customerPhone: "+1234567890",
    flavorMix: { 
      flavors: ["mint", "blueberry"], 
      strength: "medium",
      buildTest: true,
      timestamp: new Date().toISOString()
    }
  };

  try {
    // Create session
    const createResponse = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify(sessionData),
    });

    if (!createResponse.ok) {
      throw new Error(`HTTP ${createResponse.status}: ${await createResponse.text()}`);
    }

    const { session } = await createResponse.json();
    console.log("✅ Session created:", session.id);

    // Activate session
    const activateResponse = await fetch(`${BASE_URL}/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedVersion: session.version,
        state: "ACTIVE",
        note: "Build test session - left active for verification"
      }),
    });

    if (!activateResponse.ok) {
      throw new Error(`HTTP ${activateResponse.status}: ${await activateResponse.text()}`);
    }

    const { session: activeSession } = await activateResponse.json();
    console.log("✅ Session activated:", activeSession.id);
    console.log("📊 Session state:", activeSession.state);
    console.log("🏢 Lounge ID:", activeSession.loungeId);
    console.log("📱 Customer Phone:", activeSession.customerPhone);
    console.log("🎯 External Ref:", activeSession.externalRef);
    console.log("🔄 Version:", activeSession.version);
    console.log("📅 Created:", new Date(activeSession.createdAt).toLocaleString());
    
    console.log("\n🎉 Active session created and left running for build verification!");
    console.log("🔗 Session ID:", activeSession.id);
    
    return activeSession;
  } catch (error) {
    console.error("❌ Failed to create active session:", error.message);
    process.exit(1);
  }
}

createActiveSession();
