'use client';

import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: 'starter' | 'pro' | 'trust';
  onSuccess?: () => void;
}

export default function PreOrderModal({ isOpen, onClose, tier = 'pro', onSuccess }: PreOrderModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierPricing = {
    starter: { price: 79, name: 'Starter' },
    pro: { price: 249, name: 'Pro' },
    trust: { price: 499, name: 'Trust+' }
  };

  const selectedTier = tierPricing[tier];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/checkout/preorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          tier,
          amount: selectedTier.price * 100, // Convert to cents
          metadata: {
            preorder: 'true',
            tier: tier,
            source: 'owners_page'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Pre-order error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="relative max-w-md w-full mx-4 bg-zinc-900 border-zinc-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          disabled={isProcessing}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pre-Order Hookah+</h2>
              <p className="text-sm text-zinc-400">Secure your {selectedTier.name} plan</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Plan</p>
                <p className="text-lg font-semibold text-white">{selectedTier.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">Monthly</p>
                <p className="text-2xl font-bold text-teal-400">${selectedTier.price}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                placeholder="John Doe"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                placeholder="john@example.com"
                required
                disabled={isProcessing}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-zinc-800/50 rounded-lg">
              <Shield className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400">
                <p className="font-medium text-zinc-300 mb-1">Secure Payment</p>
                <p>Your payment is processed securely through Stripe. This is a pre-order - you'll be charged when Hookah+ launches.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Test mode enabled - no real charges</span>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                disabled={isProcessing || !email || !name}
                loading={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pre-Order $${selectedTier.price}/mo`}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

