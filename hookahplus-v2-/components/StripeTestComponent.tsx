"use client";
import { useState } from 'react';

export default function StripeTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testMode, setTestMode] = useState<'test' | 'live'>('test');

  const runStripeTest = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test Stripe connection
      const response = await fetch('/api/stripe-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: testMode,
          action: 'test_connection'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ ${testMode.toUpperCase()} mode test passed: ${result.message}`);
      } else {
        setTestResult(`❌ ${testMode.toUpperCase()} mode test failed: ${result.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCheckoutFlow = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test checkout flow
      const response = await fetch('/api/stripe-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: testMode,
          action: 'test_checkout',
          amount: 1000, // $10.00
          currency: 'usd'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ ${testMode.toUpperCase()} checkout test passed: ${result.message}`);
      } else {
        setTestResult(`❌ ${testMode.toUpperCase()} checkout test failed: ${result.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Checkout test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test webhook endpoint
      const response = await fetch('/api/stripe-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: testMode,
          action: 'test_webhook'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ ${testMode.toUpperCase()} webhook test passed: ${result.message}`);
      } else {
        setTestResult(`❌ ${testMode.toUpperCase()} webhook test failed: ${result.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Webhook test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
      <h3 className="text-xl font-bold text-white mb-4">EP Agent - Stripe Integration Test</h3>
      
      {/* Test Mode Selector */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">Test Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="testMode"
              value="test"
              checked={testMode === 'test'}
              onChange={(e) => setTestMode(e.target.value as 'test' | 'live')}
              className="text-teal-500"
            />
            <span className="text-zinc-300">Test Mode (Safe)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="testMode"
              value="live"
              checked={testMode === 'live'}
              onChange={(e) => setTestMode(e.target.value as 'test' | 'live')}
              className="text-red-500"
            />
            <span className="text-red-400">Live Mode (Real Money)</span>
          </label>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runStripeTest}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔌 Test Connection
        </button>
        
        <button
          onClick={testCheckoutFlow}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          💳 Test Checkout
        </button>
        
        <button
          onClick={testWebhook}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔔 Test Webhook
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="bg-zinc-700 rounded-lg p-4">
          <div className="text-white font-medium mb-2">Test Results:</div>
          <div className="text-sm">{testResult}</div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl mb-1">🔌</div>
          <div className="text-zinc-400">Connection</div>
          <div className="text-green-400">Ready</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">💳</div>
          <div className="text-zinc-400">Checkout</div>
          <div className="text-green-400">Ready</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🔔</div>
          <div className="text-zinc-400">Webhooks</div>
          <div className="text-green-400">Ready</div>
        </div>
      </div>

      {/* Warning for Live Mode */}
      {testMode === 'live' && (
        <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400 font-semibold mb-2">⚠️ Live Mode Warning</div>
          <div className="text-red-200 text-sm">
            You are testing in LIVE mode. Real money will be charged. 
            Only use this for final verification before launch.
          </div>
        </div>
      )}
    </div>
  );
}
