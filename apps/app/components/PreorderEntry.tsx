'use client';

import React, { useState } from 'react';

interface Flavor {
  name: string;
  price: number;
}

const AVAILABLE_FLAVORS: Flavor[] = [
  { name: 'Mint', price: 0 },
  { name: 'Double Apple', price: 0 },
  { name: 'Grape', price: 0 },
  { name: 'Watermelon', price: 0 },
  { name: 'Peach', price: 5 },
  { name: 'Blueberry', price: 5 },
  { name: 'Strawberry', price: 5 },
  { name: 'Mango', price: 5 },
];

interface PreorderEntryProps {
  onCheckout: (data: { flavors: string[]; price: number; table?: string }) => void;
}

export default function PreorderEntry({ onCheckout }: PreorderEntryProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [table, setTable] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const toggleFlavor = (flavorName: string) => {
    setSelectedFlavors(prev => {
      if (prev.includes(flavorName)) {
        return prev.filter(f => f !== flavorName);
      } else {
        return [...prev, flavorName];
      }
    });
  };

  const calculatePrice = () => {
    const basePrice = 30; // Base session price
    const flavorAddons = selectedFlavors.reduce((sum, flavorName) => {
      const flavor = AVAILABLE_FLAVORS.find(f => f.name === flavorName);
      return sum + (flavor?.price || 0);
    }, 0);
    
    // Check for surge pricing (weekends)
    const isWeekend = new Date().getDay() >= 5;
    const surgeActive = isWeekend && selectedFlavors.length > 0;
    const surgePrice = surgeActive ? 3 : 0;

    return {
      base: basePrice,
      flavorAddons,
      surge: surgePrice,
      total: basePrice + flavorAddons + surgePrice
    };
  };

  const handleCheckout = async () => {
    if (selectedFlavors.length === 0) {
      alert('Please select at least one flavor');
      return;
    }

    setLoading(true);
    try {
      const price = calculatePrice();
      await onCheckout({
        flavors: selectedFlavors,
        price: price.total,
        table: table || undefined
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const price = calculatePrice();
  const isWeekend = new Date().getDay() >= 5;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Start Your Session</h1>
        <p className="text-gray-400">Select your flavors and proceed to checkout</p>
      </div>

      {/* Flavor Selection */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Select Flavors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AVAILABLE_FLAVORS.map((flavor) => {
            const isSelected = selectedFlavors.includes(flavor.name);
            return (
              <button
                key={flavor.name}
                type="button"
                onClick={() => toggleFlavor(flavor.name)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }
                `}
              >
                <div className="font-semibold">{flavor.name}</div>
                {flavor.price > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    +${flavor.price}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedFlavors.length === 0 && (
          <p className="text-sm text-yellow-400 mt-4">
            Please select at least one flavor to continue
          </p>
        )}
      </div>

      {/* Table Selection (Optional) */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <label className="block text-sm font-medium text-white mb-2">
          Table Number (Optional)
        </label>
        <input
          type="text"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          placeholder="e.g., A1, B2"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
        />
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Price Breakdown</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Base Session</span>
            <span className="text-white">${price.base.toFixed(2)}</span>
          </div>
          {price.flavorAddons > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Flavor Add-ons</span>
              <span className="text-white">${price.flavorAddons.toFixed(2)}</span>
            </div>
          )}
          {price.surge > 0 && (
            <div className="flex justify-between text-gray-300">
              <span className="text-yellow-400">
                ?? Weekend Surge
              </span>
              <span className="text-yellow-400 font-semibold">
                +${price.surge.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-lg font-bold text-green-400">
                ${price.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || selectedFlavors.length === 0}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all
          ${selectedFlavors.length === 0 || loading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
      >
        {loading ? 'Processing...' : `Proceed to Checkout - $${price.total.toFixed(2)}`}
      </button>

      {isWeekend && (
        <div className="text-center text-sm text-yellow-400">
          ?? Weekend surge pricing active (+$3)
        </div>
      )}
    </div>
  );
}
