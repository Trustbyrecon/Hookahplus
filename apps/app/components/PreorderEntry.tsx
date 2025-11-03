"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Sparkles, AlertCircle } from 'lucide-react';
import FlavorSelector, { Flavor } from '../customer/FlavorSelector';
import Card from './Card';
import Button from './Button';

export interface PreorderEntryProps {
  tableId?: string;
  loungeId?: string;
  className?: string;
}

// Sample flavors data - in production, this would come from API
const SAMPLE_FLAVORS: Flavor[] = [
  {
    id: 'blue-mist',
    name: 'Blue Mist',
    description: 'Cool and refreshing mint flavor',
    category: 'tobacco',
    intensity: 'light',
    price: 0,
    isPopular: true,
  },
  {
    id: 'double-apple',
    name: 'Double Apple',
    description: 'Classic apple with hint of anise',
    category: 'tobacco',
    intensity: 'medium',
    price: 0,
    isPopular: true,
  },
  {
    id: 'mint',
    name: 'Mint',
    description: 'Pure mint freshness',
    category: 'tobacco',
    intensity: 'light',
    price: 0,
    isPopular: true,
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    description: 'Sweet strawberry flavor',
    category: 'tobacco',
    intensity: 'medium',
    price: 0,
    isPopular: true,
  },
  {
    id: 'peach',
    name: 'Peach',
    description: 'Juicy peach flavor',
    category: 'tobacco',
    intensity: 'light',
    price: 0,
    isPopular: true,
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    description: 'Fresh watermelon',
    category: 'tobacco',
    intensity: 'light',
    price: 0,
    isPopular: true,
  },
];

const SAMPLE_ADDONS = [
  { id: 'extra-coals', name: 'Extra Coals', price: 5 },
  { id: 'premium-coals', name: 'Premium Coals', price: 10 },
  { id: 'flavor-boost', name: 'Flavor Boost', price: 5 },
];

const PreorderEntry: React.FC<PreorderEntryProps> = ({
  tableId,
  loungeId = 'default-lounge',
  className,
}) => {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
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

        const flavorNames = selectedFlavorIds.map(
          (id) => SAMPLE_FLAVORS.find((f) => f.id === id)?.name || id
        );

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
  }, [selectedFlavorIds, selectedAddOns, tableId, loungeId]);

  const handleCheckout = async () => {
    if (selectedFlavorIds.length === 0) {
      setError('Please select at least one flavor');
      return;
    }

    if (!pricing) {
      setError('Price calculation failed');
      return;
    }

    const flavorNames = selectedFlavorIds.map(
      (id) => SAMPLE_FLAVORS.find((f) => f.id === id)?.name || id
    );

    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flavors: flavorNames,
          addOns: selectedAddOns,
          tableId,
          loungeId,
          total: pricing.total,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create checkout session');
      }

      const result = await response.json();

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error('Invalid checkout response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      console.error('Error creating checkout:', err);
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

        {/* Flavor Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Select Flavors
          </h3>
          <FlavorSelector
            flavors={SAMPLE_FLAVORS}
            selectedFlavors={selectedFlavorIds}
            onSelectionChange={setSelectedFlavorIds}
            maxSelections={4}
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
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAddOns.includes(addon.id)
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="text-left">
                  <div className="text-white font-medium">{addon.name}</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    ${addon.price}
                  </div>
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
                <span>Base Price:</span>
                <span>${pricing.breakdown.base.toFixed(2)}</span>
              </div>
              {pricing.breakdown.addons > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Flavor Add-ons:</span>
                  <span>+${pricing.breakdown.addons.toFixed(2)}</span>
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
                  <span>${pricing.total.toFixed(2)}</span>
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
          {loading ? 'Calculating...' : `Proceed to Checkout - $${pricing?.total.toFixed(2) || '0.00'}`}
        </Button>
      </Card>
    </div>
  );
};

export default PreorderEntry;

