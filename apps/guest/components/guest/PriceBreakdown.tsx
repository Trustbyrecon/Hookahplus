'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, PriceQuoteResponse } from '@guest-types';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { DollarSign, Tag, CreditCard, Clock, AlertCircle } from 'lucide-react';

interface PriceBreakdownProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onPriceUpdate: () => void;
  selectedFlavors?: string[];
  specialInstructions?: string;
  loungeId?: string;
  tableId?: string;
  zone?: string;
  sessionType?: 'flat' | 'time-based';
  onCheckoutSuccess?: (sessionId: string) => void;
  campaignId?: string; // Campaign ID from QR code or URL parameter
}

export default function PriceBreakdown({ 
  guestProfile, 
  flags, 
  onPriceUpdate,
  selectedFlavors = [],
  specialInstructions = '',
  loungeId = 'default-lounge',
  tableId,
  zone,
  sessionType = 'flat',
  onCheckoutSuccess,
  campaignId
}: PriceBreakdownProps) {
  const [priceData, setPriceData] = useState<PriceQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'cash' | 'points'>('card');

  useEffect(() => {
    // Load price quote when flavors change
    if (selectedFlavors.length > 0) {
      createSessionAndLoadPrice();
    } else {
      setPriceData(null);
      setCurrentSessionId(null);
    }
  }, [selectedFlavors, specialInstructions]);

  const createSessionAndLoadPrice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, create a session with selected flavors
      const createResponse = await fetch('/api/guest/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: guestProfile.guestId,
          loungeId,
          flavors: selectedFlavors,
          specialInstructions,
          tableId,
          zone,
          sessionType // Include session type
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const createData = await createResponse.json();
      const sessionId = createData.sessionId;
      setCurrentSessionId(sessionId);

      // Then get price quote
      const quoteResponse = await fetch('/api/guest/price/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          promoCode: promoCode || undefined
        })
      });

      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.json();
        throw new Error(errorData.error || 'Failed to get price quote');
      }

      const quoteData = await quoteResponse.json();
      setPriceData(quoteData);
      onPriceUpdate();

    } catch (err) {
      console.error('Session/price error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session or get price');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPriceQuote = async () => {
    if (!currentSessionId) {
      await createSessionAndLoadPrice();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/guest/price/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          promoCode: promoCode || undefined,
          campaignId: campaignId || undefined
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
    if (!currentSessionId) {
      setError('Please select flavors first');
      return;
    }

    if (!priceData) {
      setError('Price data not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/guest/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          method: selectedPaymentMethod, // Use selected payment method
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
          sessionId: currentSessionId,
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

      // Call success callback
      if (onCheckoutSuccess) {
        onCheckoutSuccess(currentSessionId);
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
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

  if (!priceData && !isLoading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Your Order</h2>
          <p className="text-sm text-zinc-400 mb-4">Select flavors to see pricing and checkout</p>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return null; // Still loading or no data
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">Your Order</h2>
          <p className="text-sm text-zinc-400">Review your order and proceed to checkout</p>
        </div>
      </div>

      {/* Selected Items Summary */}
      {selectedFlavors.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-700/50 rounded-lg border border-zinc-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Selected Flavors</h3>
            <span className="text-xs text-zinc-400">{selectedFlavors.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedFlavors.map((flavor, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary-500/20 text-primary-400 text-sm rounded-full border border-primary-500/30 font-medium"
              >
                {flavor}
              </span>
            ))}
          </div>
          {specialInstructions && (
            <div className="mt-3 pt-3 border-t border-zinc-600">
              <span className="text-xs text-zinc-400 block mb-1">Special Instructions:</span>
              <p className="text-sm text-zinc-300">{specialInstructions}</p>
            </div>
          )}
        </div>
      )}

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
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Price Breakdown</h3>
        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex justify-between items-center py-2 border-b border-zinc-700">
            <span className="text-sm text-zinc-300">Base Price</span>
            <span className="text-sm text-white font-medium">{formatPrice(priceData.base)}</span>
          </div>

          {/* Add-ons */}
          {priceData.addons > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-700">
              <span className="text-sm text-zinc-300">Add-ons</span>
              <span className="text-sm text-white font-medium">{formatPrice(priceData.addons)}</span>
            </div>
          )}

          {/* Campaign Discount */}
          {priceData.campaign && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-700">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-teal-400">Campaign Discount</span>
              </div>
              <span className="text-sm text-teal-400 font-medium">
                -{formatPrice(priceData.campaign.discount)}
              </span>
            </div>
          )}

          {/* Promo Discount (only if no campaign) */}
          {priceData.promo && !priceData.campaign && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-700">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Discount ({priceData.promo.code})</span>
              </div>
              <span className="text-sm text-green-400 font-medium">
                -{formatPrice(priceData.promo.discount)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-4 mt-4 bg-gradient-to-r from-zinc-700/50 to-zinc-800/50 rounded-lg px-4 border border-zinc-600">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-teal-400">{formatPrice(priceData.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Select Payment Method</h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setSelectedPaymentMethod('card')}
            className={`p-4 rounded-lg text-center transition-all ${
              selectedPaymentMethod === 'card'
                ? 'bg-teal-600 border-2 border-teal-400 shadow-lg shadow-teal-500/20'
                : 'bg-zinc-700 hover:bg-zinc-600 border-2 border-transparent hover:border-zinc-500'
            }`}
          >
            <CreditCard className={`w-5 h-5 mx-auto mb-2 ${selectedPaymentMethod === 'card' ? 'text-white' : 'text-zinc-300'}`} />
            <div className={`text-xs font-medium ${selectedPaymentMethod === 'card' ? 'text-white' : 'text-zinc-300'}`}>Card</div>
          </button>
          <button 
            onClick={() => setSelectedPaymentMethod('cash')}
            className={`p-4 rounded-lg text-center transition-all ${
              selectedPaymentMethod === 'cash'
                ? 'bg-teal-600 border-2 border-teal-400 shadow-lg shadow-teal-500/20'
                : 'bg-zinc-700 hover:bg-zinc-600 border-2 border-transparent hover:border-zinc-500'
            }`}
          >
            <DollarSign className={`w-5 h-5 mx-auto mb-2 ${selectedPaymentMethod === 'cash' ? 'text-white' : 'text-zinc-300'}`} />
            <div className={`text-xs font-medium ${selectedPaymentMethod === 'cash' ? 'text-white' : 'text-zinc-300'}`}>Cash</div>
          </button>
          <button 
            onClick={() => setSelectedPaymentMethod('points')}
            className={`p-4 rounded-lg text-center transition-all ${
              selectedPaymentMethod === 'points'
                ? 'bg-teal-600 border-2 border-teal-400 shadow-lg shadow-teal-500/20'
                : 'bg-zinc-700 hover:bg-zinc-600 border-2 border-transparent hover:border-zinc-500'
            }`}
          >
            <Clock className={`w-5 h-5 mx-auto mb-2 ${selectedPaymentMethod === 'points' ? 'text-white' : 'text-zinc-300'}`} />
            <div className={`text-xs font-medium ${selectedPaymentMethod === 'points' ? 'text-white' : 'text-zinc-300'}`}>Points</div>
          </button>
        </div>
      </div>

      {/* Checkout Button - Professional Green */}
      <button
        onClick={handleCheckout}
        disabled={isLoading || !selectedFlavors.length}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-700 hover:via-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Complete Order • {formatPrice(priceData.total)}</span>
          </>
        )}
      </button>
      
      {!selectedFlavors.length && (
        <p className="text-xs text-zinc-400 text-center mt-2">
          Please select flavors to proceed
        </p>
      )}

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
