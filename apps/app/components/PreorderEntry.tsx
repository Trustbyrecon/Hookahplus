"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Sparkles, AlertCircle, Clock, Flame } from 'lucide-react';
import FlavorWheelSelector from './FlavorWheelSelector';
import Card from './Card';
import Button from './Button';

export interface PreorderEntryProps {
  tableId?: string;
  loungeId?: string;
  className?: string;
}

const SAMPLE_ADDONS = [
  { id: 'extra-coals', name: 'Extra Coals', price: 5 },
  { id: 'premium-coals', name: 'Premium Coals', price: 10 },
  { id: 'flavor-boost', name: 'Flavor Boost', price: 5 },
];

const SESSION_DURATIONS = [
  { value: 30, label: '30 min', price: 15 },
  { value: 45, label: '45 min', price: 22.50 },
  { value: 60, label: '60 min', price: 30 },
  { value: 90, label: '90 min', price: 45 },
  { value: 120, label: '2 hours', price: 60 },
];

const PreorderEntry: React.FC<PreorderEntryProps> = ({
  tableId,
  loungeId = 'default-lounge',
  className,
}) => {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [pricingModel, setPricingModel] = useState<'flat' | 'time-based'>('flat');
  const [sessionDuration, setSessionDuration] = useState(60); // minutes
  const [flavorPrice, setFlavorPrice] = useState(0); // Total flavor price from wheel
  const [pricing, setPricing] = useState<{
    basePrice: number;
    flavorAddons: number;
    surgePricing: number;
    total: number;
    breakdown: {
      base: number;
      addons: number;
      surge: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate price when selection changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (selectedFlavorIds.length === 0) {
        setPricing(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const flavorNames = selectedFlavorIds; // FlavorWheelSelector uses IDs directly

        const response = await fetch('/api/preorder/calculate-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flavors: flavorNames,
            addOns: selectedAddOns,
            tableId,
            loungeId,
            pricingModel,
            sessionDuration: pricingModel === 'time-based' ? sessionDuration : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate price');
        }

        const result = await response.json();

        if (result.success) {
          setPricing(result.data);
        } else {
          throw new Error(result.error || 'Failed to calculate price');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error calculating price:', err);
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
  }, [selectedFlavorIds, selectedAddOns, tableId, loungeId, pricingModel, sessionDuration]);

  // Handle flavor selection from wheel
  const handleFlavorSelection = (flavors: string[], totalPrice: number) => {
    setSelectedFlavorIds(flavors);
    setFlavorPrice(totalPrice);
  };

  const handleCheckout = async () => {
    if (selectedFlavorIds.length === 0) {
      setError('Please select at least one flavor');
      return;
    }

    if (!pricing) {
      setError('Price calculation failed');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate add-ons total
      const addOnsTotal = selectedAddOns.reduce((sum, id) => {
        const addon = SAMPLE_ADDONS.find(a => a.id === id);
        return sum + (addon?.price || 0);
      }, 0);

      // Calculate final total including add-ons
      const finalTotal = pricing.total + addOnsTotal;

      // Create checkout session
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flavors: selectedFlavorIds,
          addOns: selectedAddOns,
          tableId,
          loungeId,
          total: finalTotal, // Include add-ons in total
          pricingModel,
          sessionDuration: pricingModel === 'time-based' ? sessionDuration : undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        const errorMsg = result.details || result.error || 'Failed to create checkout session';
        console.error('[PreorderEntry] Checkout API error:', result);
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || result.details || 'Invalid checkout response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(errorMessage);
      console.error('[PreorderEntry] Error creating checkout:', err);
      
      // Log full error details for debugging
      if (err instanceof Error && err.stack) {
        console.error('[PreorderEntry] Error stack:', err.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAddOn = (addOnId: string) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter((id) => id !== addOnId));
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-400" />
          Preorder Your Session
        </h2>

        {/* Session Pricing Model Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Pricing</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setPricingModel('flat')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                pricingModel === 'flat'
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5" />
                <span className="font-medium">Flat Rate</span>
              </div>
              <div className="text-sm text-zinc-400">$30.00 fixed</div>
            </button>
            
            <button
              onClick={() => setPricingModel('time-based')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                pricingModel === 'time-based'
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Time-Based</span>
              </div>
              <div className="text-sm text-zinc-400">$0.50/min</div>
            </button>
          </div>

          {/* Session Duration Selector (only for time-based) */}
          {pricingModel === 'time-based' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Session Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SESSION_DURATIONS.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSessionDuration(duration.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      sessionDuration === duration.value
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium">{duration.label}</div>
                    <div className="text-xs text-zinc-400">${duration.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flavor Wheel Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Select Flavors (Mint & Cool to Premium)
          </h3>
          <FlavorWheelSelector
            selectedFlavors={selectedFlavorIds}
            onSelectionChange={handleFlavorSelection}
            maxSelections={4}
            mode="customer"
          />
        </div>

        {/* Add-ons Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Add-ons (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_ADDONS.map((addon) => (
              <button
                key={addon.id}
                onClick={() => toggleAddOn(addon.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedAddOns.includes(addon.id)
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="text-white font-medium">{addon.name}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  ${addon.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        {pricing && (
          <Card className="p-6 mb-6 bg-zinc-800/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Price Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-zinc-300">
                <span>
                  {pricingModel === 'flat' ? 'Base Session (Flat):' : `Session (${sessionDuration} min):`}
                </span>
                <span>${pricing.breakdown.base.toFixed(2)}</span>
              </div>
              {pricing.breakdown.addons > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Flavors:</span>
                  <span>+${pricing.breakdown.addons.toFixed(2)}</span>
                </div>
              )}
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Add-ons:</span>
                  <span>
                    +${selectedAddOns.reduce((sum, id) => {
                      const addon = SAMPLE_ADDONS.find(a => a.id === id);
                      return sum + (addon?.price || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              )}
              {pricing.breakdown.surge > 0 && (
                <div className="flex justify-between text-yellow-400">
                  <span>Weekend Surge:</span>
                  <span>+${pricing.breakdown.surge.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-zinc-700 pt-2 mt-2">
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total:</span>
                  <span>
                    ${(pricing.total + selectedAddOns.reduce((sum, id) => {
                      const addon = SAMPLE_ADDONS.find(a => a.id === id);
                      return sum + (addon?.price || 0);
                    }, 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={selectedFlavorIds.length === 0 || loading || !pricing}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? 'Calculating...' : `Proceed to Checkout - $${pricing ? (pricing.total + selectedAddOns.reduce((sum, id) => {
            const addon = SAMPLE_ADDONS.find(a => a.id === id);
            return sum + (addon?.price || 0);
          }, 0)).toFixed(2) : '0.00'}`}
        </Button>
      </Card>
    </div>
  );
};

export default PreorderEntry;
