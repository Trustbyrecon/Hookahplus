'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
=======
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with environment variable
>>>>>>> stripe-integration-clean
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface Product {
  name: string;
  priceId: string;
  amount: number;
  currency: string;
}

interface StripeCheckoutProps {
  products?: Product[];
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
}

export default function StripeCheckout({ 
  products = [], 
  onSuccess, 
  onCancel 
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default products if none provided
  const defaultProducts: Product[] = [
    {
      name: "Hookah Session",
<<<<<<< HEAD
      priceId: "price_placeholder", // Replace with actual price ID after seeding
=======
      priceId: "price_1RyCtSDuKNq0KFAAihtnSInq", // Real Stripe Price ID
>>>>>>> stripe-integration-clean
      amount: 15.00,
      currency: "usd"
    },
    {
      name: "Flavor Add-On",
<<<<<<< HEAD
      priceId: "price_placeholder", // Replace with actual price ID after seeding
=======
      priceId: "price_1RyCtTDuKNq0KFAAP6sAbA2z", // Real Stripe Price ID
>>>>>>> stripe-integration-clean
      amount: 2.00,
      currency: "usd"
    }
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineItems: displayProducts.map(product => ({
            price: product.priceId,
            quantity: 1,
          })),
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
      
      {/* Product List */}
      <div className="space-y-4 mb-6">
        {displayProducts.map((product, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">Price ID: {product.priceId}</p>
            </div>
            <span className="font-semibold text-gray-900">
              ${product.amount.toFixed(2)} {product.currency.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-xl font-bold text-gray-900">
            ${displayProducts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-700">
        <p className="font-medium mb-2">⚠️ Important:</p>
        <p>Before testing, make sure to:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Run <code className="bg-blue-100 px-1 rounded">npm run seed:stripe</code></li>
          <li>Update the price IDs in this component</li>
          <li>Set up your .env.local with Stripe keys</li>
        </ol>
      </div>
    </div>
  );
}
