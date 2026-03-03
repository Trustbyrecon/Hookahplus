'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const order = searchParams.get('order');
    if (order) {
      setOrderId(order);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-zinc-300 mb-6">
          Your payment was cancelled. Order ID: {orderId || 'N/A'}
        </p>
        <div className="space-y-4">
          <Link
            href="/checkout"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-block border border-zinc-600 text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors ml-4"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancel() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>}>
      <CheckoutCancelContent />
    </Suspense>
  );
}
