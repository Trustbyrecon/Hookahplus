'use client';

import { useState } from 'react';
import { Button } from './Button';
import { CheckCircle, XCircle, Loader2, Zap, ExternalLink } from 'lucide-react';

interface NewSmokeTestProps {
  className?: string;
}

export function NewSmokeTest({ className }: NewSmokeTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleSmokeTest = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');
    setPaymentData(null);

    try {
      console.log('🚀 Starting new $1 smoke test...');
      
      const response = await fetch('/api/payments/live-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartTotal: 0,
          itemsCount: 0
        }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.ok) {
        setStatus('success');
        setMessage('✅ $1 Smoke Test Successful!');
        setPaymentData({
          intentId: data.intentId,
          amount: data.amount,
          currency: data.currency,
          stripeUrl: data.stripeUrl
        });
      } else {
        setStatus('error');
        setMessage(`❌ Test failed: ${data.error}`);
        console.error('❌ Test failed:', data);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Network error: ${error.message}`);
      console.error('❌ Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Zap className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">$1 Smoke Test</h3>
          <p className="text-sm text-gray-300">RWO: Order Management Integration</p>
        </div>
      </div>

      {/* Test Details */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-gray-300">Using Stripe sandbox test card</span>
        </div>
        <div className="bg-gray-700 rounded px-3 py-2 font-mono text-sm text-gray-300">
          pm_card_visa
        </div>
        <div className="text-xs text-gray-400">
          Automatic payment processing - no card input required
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleSmokeTest}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing $1 Test...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Run $1 Smoke Test
          </>
        )}
      </Button>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          status === 'success' 
            ? 'bg-green-900/20 border-green-500/30 text-green-300' 
            : 'bg-red-900/20 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'success' && <CheckCircle className="w-5 h-5" />}
            {status === 'error' && <XCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Success Details */}
      {paymentData && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Payment Details</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Intent:</span>
              <span className="text-white font-mono">{paymentData.intentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white">${(paymentData.amount / 100).toFixed(2)} {paymentData.currency.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-semibold">Succeeded</span>
            </div>
          </div>

          {paymentData.stripeUrl && (
            <Button
              onClick={() => window.open(paymentData.stripeUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Stripe Dashboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
