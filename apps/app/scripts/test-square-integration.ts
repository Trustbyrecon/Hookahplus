#!/usr/bin/env tsx

/**
 * Square POS Integration Test Script
 * 
 * Comprehensive test suite for Square POS integration including:
 * - OAuth initialization
 * - Order creation and idempotency
 * - Item upserting
 * - Order closing with external tender
 * - Reconciliation methods
 * 
 * Usage:
 *   tsx apps/app/scripts/test-square-integration.ts [venueId]
 * 
 * Environment Variables Required:
 *   - SQUARE_APPLICATION_ID (for OAuth)
 *   - SQUARE_APPLICATION_SECRET (for OAuth)
 *   - ENCRYPTION_KEY (for token encryption)
 *   - TRUSTLOCK_SECRET (for trust lock signatures)
 *   - STRIPE_SECRET_KEY (optional, for reconciliation tests)
 * 
 * Or ensure Square is connected via OAuth for the venue.
 */

import { SquareAdapter } from '../lib/pos/square';
import type { HpOrder, HpItem, ExternalTender } from '../lib/pos/types';
import { prisma } from '../lib/db';
import crypto from 'crypto';

// Simple trust lock creation for testing
function createTrustLock(orderId: string): { sig: string } {
  const secret = process.env.TRUSTLOCK_SECRET;
  if (!secret) {
    throw new Error('TRUSTLOCK_SECRET environment variable is required');
  }
  const sig = crypto.createHmac('sha256', secret).update(orderId).digest('hex');
  return { sig };
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

class SquareIntegrationTester {
  private results: TestResult[] = [];
  private venueId: string;
  private adapter: SquareAdapter;
  private testOrderId: string;
  private posOrderId: string | null = null;

  constructor(venueId: string) {
    this.venueId = venueId;
    this.adapter = new SquareAdapter({ venueId });
    this.testOrderId = `test_sq_${Date.now()}`;
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Square POS Integration Test Suite\n');
    console.log(`📍 Venue ID: ${this.venueId}`);
    console.log(`🆔 Test Order ID: ${this.testOrderId}\n`);

    try {
      // Test 1: Check OAuth connection
      await this.testOAuthConnection();

      // Test 2: Initialize adapter
      await this.testAdapterInitialization();

      // Test 3: Test capabilities
      await this.testCapabilities();

      // Test 4: Create order (idempotency test)
      await this.testOrderCreation();

      // Test 5: Test idempotency (create same order again)
      await this.testIdempotency();

      // Test 6: Upsert items
      await this.testItemUpsert();

      // Test 7: Close order with external tender
      await this.testOrderClosing();

      // Test 8: Reconciliation (if Stripe configured)
      await this.testReconciliation();

      // Print results
      this.printResults();

    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
      this.addResult('Fatal Error', false, error instanceof Error ? error.message : String(error));
      this.printResults();
      process.exit(1);
    }
  }

  private async testOAuthConnection(): Promise<void> {
    const testName = 'OAuth Connection Check';
    console.log(`\n1️⃣ Testing ${testName}...`);

    try {
      // This script is used in multiple environments. Some deployments use Supabase
      // for Square OAuth storage and do not have a `squareMerchant` model in Prisma.
      const squareMerchantDelegate = (prisma as any)?.squareMerchant;
      let merchant: any = null;
      try {
        merchant =
          squareMerchantDelegate?.findUnique
            ? await squareMerchantDelegate.findUnique({ where: { loungeId: this.venueId } })
            : null;
      } catch (e) {
        // If DB isn't reachable, continue with legacy env mode checks.
        console.log('   ⚠️  DB unavailable for OAuth lookup; continuing with legacy env checks');
        merchant = null;
      }

      if (merchant) {
        console.log('   ✅ Square merchant found in database');
        console.log(`   📊 Merchant ID: ${merchant.merchantId}`);
        console.log(`   📍 Locations: ${merchant.locationIds.length}`);
        console.log(`   🔑 Token expires: ${merchant.expiresAt ? merchant.expiresAt.toISOString() : 'Never'}`);
        this.addResult(testName, true, undefined, {
          merchantId: merchant.merchantId,
          locationCount: merchant.locationIds.length,
          hasExpiration: !!merchant.expiresAt
        });
      } else {
        if (!squareMerchantDelegate?.findUnique) {
          console.log('   ⚠️  Prisma model `squareMerchant` not found; skipping DB OAuth lookup');
        }
        // Check for legacy env vars
        const hasEnvToken = !!process.env.SQUARE_ACCESS_TOKEN;
        const hasEnvLocation = !!process.env.SQUARE_LOCATION_ID;

        if (hasEnvToken && hasEnvLocation) {
          console.log('   ⚠️  Using legacy environment variables (not OAuth)');
          console.log('   📝 Note: OAuth is recommended for production');
          this.addResult(testName, true, undefined, { mode: 'legacy' });
        } else {
          console.log('\n   📋 Setup Options:');
          console.log('   1. Connect Square via OAuth (Recommended):');
          console.log('      - Navigate to: /square/connect in your app');
          console.log('      - Complete OAuth flow for venue:', this.venueId);
          console.log('   2. Set environment variables (Legacy):');
          console.log('      - Add to .env.local:');
          console.log('      - SQUARE_ACCESS_TOKEN=your_token');
          console.log('      - SQUARE_LOCATION_ID=your_location_id');
          console.log('\n   💡 See SQUARE_OAUTH_SETUP.md for detailed instructions\n');
          throw new Error('No Square connection found. Please connect Square via OAuth or set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID');
        }
      }
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testAdapterInitialization(): Promise<void> {
    const testName = 'Adapter Initialization';
    console.log(`\n2️⃣ Testing ${testName}...`);

    try {
      await this.adapter.initialize();
      console.log('   ✅ Adapter initialized successfully');
      try {
        const dbg = (this.adapter as any)?.debugState?.();
        if (dbg) {
          console.log(`   🔎 Auth mode: ${dbg.authMode}${dbg.merchantId ? ` (merchant: ${dbg.merchantId})` : ''}`);
        }
      } catch {
        // ignore
      }
      this.addResult(testName, true);
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testCapabilities(): Promise<void> {
    const testName = 'Adapter Capabilities';
    console.log(`\n3️⃣ Testing ${testName}...`);

    try {
      const capabilities = await this.adapter.capabilities();
      console.log('   📊 Capabilities:', capabilities);
      
      if (capabilities.orderInjection && capabilities.externalTender) {
        console.log('   ✅ All required capabilities available');
        this.addResult(testName, true, undefined, capabilities);
      } else {
        throw new Error(`Missing capabilities: ${JSON.stringify(capabilities)}`);
      }
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private createTestOrder(): HpOrder {
    return {
      hp_order_id: this.testOrderId,
      venue_id: this.venueId,
      table: 'T-TEST-1',
      guest_count: 2,
      items: [
        {
          sku: 'HOOKAH_SESSION',
          name: 'Hookah Session (Test)',
          qty: 1,
          unit_amount: 2500, // $25.00
          notes: 'Test session - can be deleted'
        },
        {
          sku: 'FLAVOR_ADDON',
          name: 'Blue Mist Flavor',
          qty: 1,
          unit_amount: 200, // $2.00
          notes: 'Test add-on'
        }
      ],
      totals: {
        subtotal: 2700,
        tax: 216, // 8% tax
        grand_total: 2916 // $29.16
      },
      trust_lock: createTrustLock(this.testOrderId)
    };
  }

  private async testOrderCreation(): Promise<void> {
    const testName = 'Order Creation';
    console.log(`\n4️⃣ Testing ${testName}...`);

    try {
      const testOrder = this.createTestOrder();
      console.log(`   📋 Creating order: ${testOrder.hp_order_id}`);
      console.log(`   📊 Items: ${testOrder.items.length}`);
      console.log(`   💰 Total: $${(testOrder.totals!.grand_total / 100).toFixed(2)}`);

      const result = await this.adapter.attachOrder(testOrder);
      this.posOrderId = result.pos_order_id;

      console.log(`   ✅ Order ${result.created ? 'created' : 'found'}: ${result.pos_order_id}`);
      this.addResult(testName, true, undefined, {
        posOrderId: result.pos_order_id,
        created: result.created
      });
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testIdempotency(): Promise<void> {
    const testName = 'Idempotency Test';
    console.log(`\n5️⃣ Testing ${testName}...`);

    try {
      if (!this.posOrderId) {
        throw new Error('No POS order ID from previous test');
      }

      const testOrder = this.createTestOrder();
      console.log(`   🔄 Attempting to create duplicate order: ${testOrder.hp_order_id}`);

      const result = await this.adapter.attachOrder(testOrder);

      if (result.pos_order_id === this.posOrderId && !result.created) {
        console.log(`   ✅ Idempotency working: returned existing order ${result.pos_order_id}`);
        this.addResult(testName, true, undefined, {
          posOrderId: result.pos_order_id,
          created: result.created
        });
      } else {
        throw new Error(`Idempotency failed: got different order ID or marked as created`);
      }
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testItemUpsert(): Promise<void> {
    const testName = 'Item Upsert';
    console.log(`\n6️⃣ Testing ${testName}...`);

    try {
      if (!this.posOrderId) {
        throw new Error('No POS order ID from previous test');
      }

      const updatedItems: HpItem[] = [
        {
          sku: 'HOOKAH_SESSION',
          name: 'Hookah Session (Test)',
          qty: 1,
          unit_amount: 2500,
          notes: 'Test session - can be deleted'
        },
        {
          sku: 'FLAVOR_ADDON',
          name: 'Blue Mist Flavor',
          qty: 1,
          unit_amount: 200,
          notes: 'Test add-on'
        },
        {
          sku: 'DRINK_001',
          name: 'Mint Tea (Test)',
          qty: 2,
          unit_amount: 500, // $5.00 each
          notes: 'Test drink - can be deleted'
        }
      ];

      console.log(`   📦 Upserting ${updatedItems.length} items to order ${this.posOrderId}`);
      await this.adapter.upsertItems(this.posOrderId, updatedItems);
      console.log(`   ✅ Items upserted successfully`);
      this.addResult(testName, true, undefined, { itemCount: updatedItems.length });
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testOrderClosing(): Promise<void> {
    const testName = 'Order Closing with External Tender';
    console.log(`\n7️⃣ Testing ${testName}...`);

    try {
      if (!this.posOrderId) {
        throw new Error('No POS order ID from previous test');
      }

      const externalTender: ExternalTender = {
        provider: 'stripe',
        reference: `pi_test_${Date.now()}`,
        amount: 3700, // Updated total with new items
        currency: 'USD'
      };

      console.log(`   💳 Closing order ${this.posOrderId} with external tender`);
      console.log(`   📊 Payment: ${externalTender.provider} ${externalTender.reference}`);
      console.log(`   💰 Amount: $${(externalTender.amount / 100).toFixed(2)}`);

      await this.adapter.closeOrder(this.posOrderId, externalTender);
      console.log(`   ✅ Order closed successfully`);
      this.addResult(testName, true, undefined, {
        posOrderId: this.posOrderId,
        tender: externalTender
      });
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async testReconciliation(): Promise<void> {
    const testName = 'Reconciliation Methods';
    console.log(`\n8️⃣ Testing ${testName}...`);

    try {
      if (!this.posOrderId) {
        console.log('   ⚠️  Skipping: No POS order ID available');
        this.addResult(testName, true, 'Skipped - no order ID', { skipped: true });
        return;
      }

      // Test reconcileTicket method
      if (this.adapter.reconcileTicket) {
        console.log(`   🔍 Testing reconcileTicket for order ${this.posOrderId}`);
        const match = await this.adapter.reconcileTicket(this.posOrderId);
        
        if (match) {
          console.log(`   ✅ Match found: ${match.stripeChargeId}`);
          console.log(`   📊 Confidence: ${match.matchConfidence}`);
          console.log(`   💰 Amount: $${(match.amountCents / 100).toFixed(2)}`);
        } else {
          console.log(`   ℹ️  No match found (expected if no Stripe charge exists)`);
        }
      } else {
        console.log(`   ⚠️  reconcileTicket method not available`);
      }

      // Test getReconciliationReport method
      if (this.adapter.getReconciliationReport) {
        console.log(`   📊 Testing getReconciliationReport`);
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

        const report = await this.adapter.getReconciliationReport(startDate, endDate);
        console.log(`   ✅ Report generated:`);
        console.log(`      - Total POS Tickets: ${report.totalPosTickets}`);
        console.log(`      - Total Stripe Charges: ${report.totalStripeCharges}`);
        console.log(`      - Matched: ${report.matched}`);
        console.log(`      - Reconciliation Rate: ${(report.reconciliationRate * 100).toFixed(1)}%`);
        console.log(`      - Pricing Parity: ${(report.pricingParity * 100).toFixed(1)}%`);

        this.addResult(testName, true, undefined, {
          hasReconcileTicket: !!this.adapter.reconcileTicket,
          hasReconciliationReport: !!this.adapter.getReconciliationReport,
          report: report
        });
      } else {
        console.log(`   ⚠️  getReconciliationReport method not available`);
        this.addResult(testName, true, 'Reconciliation methods not fully implemented', {
          hasReconcileTicket: !!this.adapter.reconcileTicket,
          hasReconciliationReport: false
        });
      }
    } catch (error) {
      console.error(`   ❌ ${testName} failed:`, error);
      // Don't throw - reconciliation is optional
      this.addResult(testName, false, error instanceof Error ? error.message : String(error));
    }
  }

  private addResult(name: string, passed: boolean, error?: string, details?: any): void {
    this.results.push({ name, passed, error, details });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    this.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`);
      }
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('-'.repeat(60) + '\n');

    if (failed === 0) {
      console.log('🎉 All tests passed! Square integration is working correctly.\n');
      console.log('📝 Next Steps:');
      console.log('   1. Test with real Square sandbox account');
      console.log('   2. Verify orders appear in Square dashboard');
      console.log('   3. Test webhook handling');
      console.log('   4. Validate reconciliation accuracy\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const venueId = process.argv[2] || process.env.DEFAULT_VENUE_ID || 'default_venue';

  if (!venueId) {
    console.error('❌ Error: Venue ID required');
    console.error('Usage: tsx apps/app/scripts/test-square-integration.ts [venueId]');
    process.exit(1);
  }

  const tester = new SquareIntegrationTester(venueId);
  await tester.runAllTests();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SquareIntegrationTester };

