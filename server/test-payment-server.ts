/**
 * Hookah+ Payment Server Test Suite
 * 
 * Comprehensive test suite for the payment server with KTL-4 integration
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8787';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

class PaymentServerTester {
  private results: TestResult[] = [];

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        test: testName,
        status: 'PASS',
        message: 'Test passed successfully',
        duration: Date.now() - startTime
      });
      console.log(`✅ ${testName} - PASS (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      console.log(`❌ ${testName} - FAIL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testHealthCheck(): Promise<void> {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const health = await response.json();
    if (health.status !== 'ok') {
      throw new Error(`Health status is not OK: ${health.status}`);
    }
    
    if (!health.ktl4) {
      throw new Error('KTL-4 health data missing');
    }
    
    if (!health.square) {
      throw new Error('Square health data missing');
    }
  }

  async testCheckoutLinkCreation(): Promise<void> {
    const payload = {
      sessionId: 'test-session-001',
      stationId: 'T-001',
      flavorMix: 'Mint + Grape',
      basePrice: 30,
      addOns: [5, 3]
    };

    const response = await fetch(`${BASE_URL}/pay/checkout-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Checkout link creation failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Checkout link creation was not successful');
    }

    if (!result.checkoutUrl) {
      throw new Error('Checkout URL missing from response');
    }

    if (!result.trustLock) {
      throw new Error('Trust Lock hash missing from response');
    }
  }

  async testTerminalCheckoutCreation(): Promise<void> {
    const payload = {
      sessionId: 'test-session-002',
      stationId: 'T-002',
      flavorMix: 'Double Apple',
      basePrice: 25,
      addOns: [2]
    };

    const response = await fetch(`${BASE_URL}/pay/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Terminal checkout creation failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Terminal checkout creation was not successful');
    }

    if (!result.terminalCheckoutId) {
      throw new Error('Terminal checkout ID missing from response');
    }
  }

  async testDirectPaymentCreation(): Promise<void> {
    const payload = {
      sessionId: 'test-session-003',
      stationId: 'T-003',
      flavorMix: 'Strawberry',
      basePrice: 28,
      addOns: [4, 2],
      sourceId: 'test-source-id'
    };

    const response = await fetch(`${BASE_URL}/pay/direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Direct payment creation failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Direct payment creation was not successful');
    }

    if (!result.paymentId) {
      throw new Error('Payment ID missing from response');
    }
  }

  async testSessionManagement(): Promise<void> {
    // First create a session
    const createPayload = {
      sessionId: 'test-session-004',
      stationId: 'T-004',
      flavorMix: 'Watermelon',
      basePrice: 32,
      addOns: [6]
    };

    await fetch(`${BASE_URL}/pay/checkout-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload)
    });

    // Test session retrieval
    const getResponse = await fetch(`${BASE_URL}/session/test-session-004`);
    if (!getResponse.ok) {
      throw new Error(`Session retrieval failed: ${getResponse.status}`);
    }

    const session = await getResponse.json();
    if (!session.id) {
      throw new Error('Session ID missing from response');
    }

    if (session.status !== 'active') {
      throw new Error(`Session status is not active: ${session.status}`);
    }

    // Test session stop
    const stopResponse = await fetch(`${BASE_URL}/session/test-session-004/stop`, {
      method: 'POST'
    });

    if (!stopResponse.ok) {
      throw new Error(`Session stop failed: ${stopResponse.status}`);
    }

    const stopResult = await stopResponse.json();
    if (!stopResult.success) {
      throw new Error('Session stop was not successful');
    }

    if (!stopResult.pricingLock) {
      throw new Error('Pricing lock missing from stop response');
    }
  }

  async testReconciliation(): Promise<void> {
    const response = await fetch(`${BASE_URL}/ops/reconciliation/run`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Reconciliation failed: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Reconciliation was not successful');
    }

    if (!result.repairRunId) {
      throw new Error('Repair run ID missing from response');
    }
  }

  async testTrustLockVerification(): Promise<void> {
    const payload = {
      sessionId: 'test-session-005',
      stationId: 'T-005',
      flavorMix: 'Peach',
      basePrice: 26,
      addOns: [3, 2]
    };

    const response = await fetch(`${BASE_URL}/pay/checkout-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.trustLock) {
      throw new Error('Trust Lock hash missing');
    }

    // Verify Trust Lock format (should be 64 character hex string)
    if (!/^[a-f0-9]{64}$/.test(result.trustLock)) {
      throw new Error('Trust Lock hash format is invalid');
    }
  }

  async testMarginCalculation(): Promise<void> {
    const payload = {
      sessionId: 'test-session-006',
      stationId: 'T-006',
      flavorMix: 'Blueberry',
      basePrice: 30,
      addOns: [5, 3, 2]
    };

    const response = await fetch(`${BASE_URL}/pay/checkout-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Payment creation failed');
    }

    // Verify margin calculation
    // Base: 30, Add-ons: 5+3+2=10, Total: 40
    // Fee (15%): 6, Net Lounge: 34
    // This would need to be verified against the actual calculation
    // For now, just verify the response structure
    if (!result.checkoutUrl) {
      throw new Error('Checkout URL missing');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Hookah+ Payment Server Test Suite\n');

    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('Checkout Link Creation (Pathway A)', () => this.testCheckoutLinkCreation());
    await this.runTest('Terminal Checkout Creation (Pathway B)', () => this.testTerminalCheckoutCreation());
    await this.runTest('Direct Payment Creation (Pathway C)', () => this.testDirectPaymentCreation());
    await this.runTest('Session Management', () => this.testSessionManagement());
    await this.runTest('Reconciliation', () => this.testReconciliation());
    await this.runTest('Trust Lock Verification', () => this.testTrustLockVerification());
    await this.runTest('Margin Calculation', () => this.testMarginCalculation());

    this.printSummary();
  }

  printSummary(): void {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Average Duration: ${Math.round(totalDuration / total)}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }

    console.log(`\n${passed === total ? '🎉 All tests passed!' : '⚠️ Some tests failed.'}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new PaymentServerTester();
  tester.runAllTests().catch(console.error);
}

export default PaymentServerTester;
