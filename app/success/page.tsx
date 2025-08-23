'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sid');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Track successful checkout
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('Checkout Success', { props: { sessionId } });
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', { transaction_id: sessionId });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase. Your order has been confirmed and you'll receive a receipt via email shortly.
          </p>

          {sessionId && (
            <div className="bg-white/20 rounded-lg p-4 mb-8">
              <p className="text-gray-300 text-sm">
                Session ID: <span className="font-mono text-purple-300">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Return Home
            </Link>
            
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-gray-400 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@hookahplus.net" className="text-purple-400 hover:text-purple-300">
                support@hookahplus.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
