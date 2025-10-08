'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, PriceQuoteResponse } from '../../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { DollarSign, Tag, CreditCard, Clock, AlertCircle } from 'lucide-react';

interface PriceBreakdownProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onPriceUpdate: () => void;
}

export default function PriceBreakdown({ guestProfile, flags, onPriceUpdate }: PriceBreakdownProps) {
  const [priceData, setPriceData] = useState<PriceQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial price quote
    loadPriceQuote();
  }, []);

  const loadPriceQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/guest/price/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'temp_session', // In production, get from session context
          promoCode: promoCode || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get price quote');
      }

      const data = await response.json();
      setPriceData(data);
      onPriceUpdate();

    } catch (err) {
      console.error('Price quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get price quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) return;

    try {
      setPromoError(null);
      await loadPriceQuote();
    } catch (err) {
      setPromoError('Invalid promo code');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/guest/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'temp_session', // In production, get from session context
          method: 'card', // In production, let user choose
          promoCode: promoCode || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await response.json();
      
      // Log checkout completion event
      if (flags.ghostlog.lite) {
        const eventPayload = {
          sessionId: 'temp_session',
          guestId: guestProfile.guestId,
          total: priceData?.total || 0,
          method: 'card',
          pointsEarned: data.pointsEarned,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('checkout.completed', eventPayload);
        console.log('Checkout completed logged:', ghostLogEntry);
      }

      // Show success message
      alert(`Checkout successful! Receipt: ${data.receiptId}\nPoints earned: ${data.pointsEarned}`);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Price Breakdown</h2>
            <p className="text-sm text-zinc-400">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Price Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={loadPriceQuote}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Price Data</h2>
          <p className="text-sm text-zinc-400 mb-4">Select flavors to see pricing</p>
          <button
            onClick={loadPriceQuote}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Price Breakdown</h2>
          <p className="text-sm text-zinc-400">Review your order and checkout</p>
        </div>
      </div>

      {/* Promo Code */}
      {flags.pricing.promos && (
        <div className="mb-6">
          <form onSubmit={handlePromoCodeSubmit} className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {promoError && (
                <p className="text-xs text-red-400 mt-1">{promoError}</p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </form>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        {/* Base Price */}
        <div className="flex justify-between items-center py-2 border-b border-zinc-700">
          <span className="text-zinc-300">Base Price</span>
          <span className="text-white font-medium">{formatPrice(priceData.base)}</span>
        </div>

        {/* Add-ons */}
        {priceData.addons > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-zinc-700">
            <span className="text-zinc-300">Add-ons</span>
            <span className="text-white font-medium">{formatPrice(priceData.addons)}</span>
          </div>
        )}

        {/* Promo Discount */}
        {priceData.promo && (
          <div className="flex justify-between items-center py-2 border-b border-zinc-700">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Discount ({priceData.promo.code})</span>
            </div>
            <span className="text-green-400 font-medium">
              -{formatPrice(priceData.promo.discount)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-3 bg-zinc-700/50 rounded-lg px-4">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-white">{formatPrice(priceData.total)}</span>
        </div>
      </div>

      {/* Item Breakdown */}
      {priceData.breakdown && priceData.breakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Item Details</h3>
          <div className="space-y-2">
            {priceData.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm text-zinc-300">{item.item}</span>
                <span className={`text-sm font-medium ${item.price < 0 ? 'text-green-400' : 'text-white'}`}>
                  {item.price < 0 ? '-' : ''}{formatPrice(Math.abs(item.price))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Payment Method</h3>
        <div className="grid grid-cols-3 gap-2">
          <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-center transition-colors">
            <CreditCard className="w-5 h-5 text-white mx-auto mb-1" />
            <div className="text-xs text-zinc-300">Card</div>
          </button>
          <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-center transition-colors">
            <DollarSign className="w-5 h-5 text-white mx-auto mb-1" />
            <div className="text-xs text-zinc-300">Cash</div>
          </button>
          <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-center transition-colors">
            <Clock className="w-5 h-5 text-white mx-auto mb-1" />
            <div className="text-xs text-zinc-300">Points</div>
          </button>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <CreditCard className="w-5 h-5" />
        <span>Checkout {formatPrice(priceData.total)}</span>
      </button>

      {/* Trust Indicators */}
      {flags.ghostlog.lite && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">
              Secure payment • Trust Lock verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
