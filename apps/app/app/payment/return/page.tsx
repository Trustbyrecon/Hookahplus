"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unknown'>('loading');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [stripeUrl, setStripeUrl] = useState<string>('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const amountParam = searchParams.get('amount');
    const stripeUrlParam = searchParams.get('stripe_url');
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    console.log('Payment return page params:', {
      sessionId,
      amountParam,
      stripeUrlParam,
      paymentIntent,
      paymentIntentClientSecret
    });

    if (sessionId || paymentIntent) {
      setPaymentIntentId(sessionId || paymentIntent || '');
      setStatus('success');
    } else if (amountParam) {
      setAmount(parseInt(amountParam));
      setStatus('success');
    } else {
      setStatus('unknown');
    }

    if (stripeUrlParam) {
      setStripeUrl(decodeURIComponent(stripeUrlParam));
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'loading':
        return <Clock className="w-16 h-16 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'error':
        return 'Payment Failed';
      case 'loading':
        return 'Processing Payment...';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Your $1 test payment has been processed successfully.';
      case 'error':
        return 'There was an issue processing your payment. Please try again.';
      case 'loading':
        return 'Please wait while we process your payment...';
      default:
        return 'Unable to determine payment status.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">
          {getStatusMessage()}
        </h1>
        
        <p className="text-zinc-400 mb-6">
          {getStatusDescription()}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            {paymentIntentId && (
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <p className="text-sm text-zinc-300 mb-1">Payment Intent ID:</p>
                <p className="text-xs text-zinc-400 font-mono break-all">
                  {paymentIntentId}
                </p>
              </div>
            )}

            {amount > 0 && (
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <p className="text-sm text-zinc-300 mb-1">Amount:</p>
                <p className="text-lg font-semibold text-green-400">
                  ${(amount / 100).toFixed(2)}
                </p>
              </div>
            )}

            {stripeUrl && (
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View in Stripe Dashboard</span>
              </a>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <a
            href="/fire-session-dashboard"
            className="block w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            Return to Dashboard
          </a>
          
          <a
            href="/"
            className="block w-full bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          <p>This is a test payment for Hookah+ smoke testing.</p>
          <p>No actual charges will be made to your account.</p>
        </div>
      </div>
    </div>
  );
}
