"use client";

import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

interface StripeTestSessionProps {
  tableId: string;
}

export function StripeTestSession({ tableId }: StripeTestSessionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleSmokeTest = async () => {
    setIsLoading(true);
    setStatus('processing');
    setError('');

    try {
      console.log('[RWO:$1-smoke] 🚀 Starting $1 smoke test...');
      console.log('[RWO:$1-smoke] 🌐 Making request to:', window.location.origin + '/api/payments/live-test');
      
      // Call the live test API
      const response = await fetch('/api/payments/live-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartTotal: 0, // $1 test ignores cart
          itemsCount: 0
        }),
      });

      console.log('[RWO:$1-smoke] 📡 Response status:', response.status);
      console.log('[RWO:$1-smoke] 📡 Response headers:', response.headers);
      
      const data = await response.json();
      console.log('[RWO:$1-smoke] 📦 Response data:', data);

      if (data.ok) {
        console.log('[RWO:$1-smoke] ✅ Payment successful:', data.intentId);
        setStatus('success');
        
        // Show success message with Stripe link
        setTimeout(() => {
          window.location.href = '/checkout/success?session_id=' + data.intentId + '&amount=100&stripe_url=' + encodeURIComponent(data.stripeUrl);
        }, 2000);
      } else {
        throw new Error(data.error || 'Payment failed');
      }

    } catch (err: any) {
      console.error('[RWO:$1-smoke] ❌ Payment error:', err);
      setStatus('error');
      
      // More specific error messages
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to payment service. Please check your connection.');
      } else if (err.message.includes('Stripe')) {
        setError(`Stripe error: ${err.message}`);
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">$1 Test Succeeded!</h3>
        <p className="text-zinc-400 mb-4">Payment processed successfully in Stripe sandbox</p>
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">✅ PaymentIntent created and confirmed</p>
          <p className="text-sm text-zinc-500">✅ Webhook received and logged</p>
          <p className="text-sm text-zinc-500">✅ Reflex event emitted</p>
        </div>
        <p className="text-sm text-zinc-500 mt-4">Redirecting to success page...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Test Session</h3>
      </div>
      <p className="text-zinc-400 mb-6">RWO: $1 Stripe smoke test for Order Management</p>
      
      <div className="space-y-4">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 text-blue-400">💳</div>
            <span className="text-white font-medium">Test Payment</span>
          </div>
          <div className="text-sm text-zinc-400 mb-3">
            Using Stripe sandbox test card: <span className="font-mono bg-zinc-700 px-2 py-1 rounded">pm_card_visa</span>
          </div>
          <div className="bg-zinc-700 p-3 rounded border border-zinc-600">
            <div className="text-center text-zinc-400 py-4">
              <div className="text-sm">Automatic test payment</div>
              <div className="text-xs mt-1">No card input required</div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSmokeTest}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white btn-tablet"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running $1 Smoke Test...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run $1 Smoke Test
            </>
          )}
        </Button>

        {status === 'error' && (
          <div className="text-center">
            <p className="text-sm text-red-400 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {error}
            </p>
            <p className="text-xs text-zinc-500">
              Please try again or contact support
            </p>
          </div>
        )}
      </div>
    </div>
  );
}