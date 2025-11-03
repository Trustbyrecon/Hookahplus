'use client';

import React from 'react';
import PreorderEntry from '../../components/PreorderEntry';

export default function PreorderPage() {
  const handleCheckout = async (data: { flavors: string[]; price: number; table?: string }) => {
    try {
      // Call Vercel API route to create Stripe checkout session
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flavorMix: data.flavors,
          basePrice: Math.round(data.price * 100), // Convert to cents
          addOns: [],
          notes: data.table ? `Table: ${data.table}` : '',
          ref: `table_${data.table || 'unassigned'}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <PreorderEntry onCheckout={handleCheckout} />
      </div>
    </main>
  );
}
