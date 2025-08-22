#!/usr/bin/env ts-node

/**
 * POS Adapter Test Harness
 * 
 * Usage:
 * npm run test:pos [provider] [venue_id]
 * 
 * Examples:
 * npm run test:pos square venue_demo
 * npm run test:pos toast venue_toast
 * npm run test:pos clover venue_clover
 */

import { makePosAdapter } from "../lib/pos/factory";
import { createTrustLock } from "../lib/trustlock";

async function main() {
  const provider = (process.argv[2] as any) ?? "square";
  const venueId = process.argv[3] ?? "venue_demo";
  
  console.log(`🚀 Testing ${provider} POS adapter for venue: ${venueId}\n`);

  const hpOrder = {
    hp_order_id: `hp_ord_demo_${Date.now()}`,
    venue_id: venueId,
    table: "T-7",
    guest_count: 2,
    items: [
      { 
        sku: "HOOKAH_SESSION", 
        name: "Hookah Session", 
        qty: 1, 
        unit_amount: 3000,
        notes: "Premium hookah experience"
      },
      { 
        sku: "FLAVOR_ADDON", 
        name: "Blue Mist", 
        qty: 1, 
        unit_amount: 200,
        notes: "Extra flavor shot"
      },
      {
        sku: "DRINK_001",
        name: "Mint Tea",
        qty: 2,
        unit_amount: 500,
        notes: "Hot, no sugar"
      }
    ],
    service_charge: { amount: 400, currency: "USD" as const },
    discounts: [
      { name: "First Time Customer", amount: 500 }
    ],
    taxes: [
      { name: "Sales Tax", amount: 320 }
    ],
    totals: { 
      subtotal: 4200, 
      tax: 320, 
      grand_total: 4520 
    },
    trust_lock: createTrustLock(`hp_ord_demo_${Date.now()}`)
  };

  try {
    console.log("📋 Test Order Data:");
    console.log(`   - Order ID: ${hpOrder.hp_order_id}`);
    console.log(`   - Table: ${hpOrder.table}`);
    console.log(`   - Items: ${hpOrder.items.length}`);
    console.log(`   - Total: $${(hpOrder.totals.grand_total / 100).toFixed(2)}\n`);

    // Test adapter creation
    console.log("1️⃣ Creating POS adapter...");
    const adapter = makePosAdapter(provider, venueId);
    console.log("✅ Adapter created successfully\n");

    // Test capabilities
    console.log("2️⃣ Testing adapter capabilities...");
    const capabilities = await adapter.capabilities();
    console.log("📊 Capabilities:", capabilities);
    console.log("✅ Capabilities test passed\n");

    // Test order attachment
    console.log("3️⃣ Testing order attachment...");
    const { pos_order_id, created } = await adapter.attachOrder(hpOrder);
    console.log(`📋 Attach result: ${created ? 'Created' : 'Found'} order ${pos_order_id}`);
    console.log("✅ Order attachment test passed\n");

    // Test item upsert
    console.log("4️⃣ Testing item upsert...");
    const updatedItems = [
      ...hpOrder.items,
      {
        sku: "SNACK_001",
        name: "Mixed Nuts",
        qty: 1,
        unit_amount: 800,
        notes: "Premium selection"
      }
    ];
    await adapter.upsertItems(pos_order_id, updatedItems);
    console.log(`📦 Updated ${updatedItems.length} items`);
    console.log("✅ Item upsert test passed\n");

    // Test order closure with external tender
    console.log("5️⃣ Testing order closure with external tender...");
    const externalTender = {
      provider: "stripe" as const,
      reference: `pi_test_${Date.now()}`,
      amount: 5320, // Updated total with new item
      currency: "USD" as const
    };
    await adapter.closeOrder(pos_order_id, externalTender);
    console.log("✅ Order closure test passed\n");

    console.log("🎉 All tests passed! POS integration is working correctly.\n");
    console.log("📝 Test Summary:");
    console.log(`   - Provider: ${provider}`);
    console.log(`   - Venue ID: ${venueId}`);
    console.log(`   - Hookah+ Order ID: ${hpOrder.hp_order_id}`);
    console.log(`   - POS Order ID: ${pos_order_id}`);
    console.log(`   - Items: ${updatedItems.length}`);
    console.log(`   - Final Amount: $${(externalTender.amount / 100).toFixed(2)}`);
    console.log(`   - Payment Provider: ${externalTender.provider}`);

  } catch (error) {
    console.error("❌ Test failed:", error instanceof Error ? error.message : error);
    console.error("\n🔍 Debug information:");
    console.error("   - Check your POS credentials");
    console.error("   - Verify environment variables are set");
    console.error("   - Ensure you have API access");
    console.error("   - Check POS API documentation for any changes");
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main().catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
}

export { main as testPosIntegration };
