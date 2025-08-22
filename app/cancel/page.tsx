'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CancelPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sid');

  useEffect(() => {
    // Track cancelled checkout
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('Checkout Cancelled', { props: { sessionId } });
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'checkout_cancelled', { transaction_id: sessionId });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Payment Cancelled
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {sessionId && (
            <div className="bg-white/20 rounded-lg p-4 mb-8">
              <p className="text-gray-300 text-sm">
                Session ID: <span className="font-mono text-purple-300">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <Link
              href="/signup"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </Link>
            
            <div className="pt-4">
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Return Home
              </Link>
            </div>
          </div>

          <div className="bg-white/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">
              Need Help?
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              If you're experiencing issues with the checkout process, our support team is here to help.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@hookahplus.net"
                className="block text-purple-400 hover:text-purple-300 underline"
              >
                support@hookahplus.net
              </a>
              <p className="text-gray-400 text-xs">
                We typically respond within 2 hours during business hours.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Having technical issues? Check our{' '}
              <Link href="/help" className="text-purple-400 hover:text-purple-300 underline">
                help center
              </Link>{' '}
              for common solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
