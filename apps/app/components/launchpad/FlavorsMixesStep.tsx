'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, DollarSign } from 'lucide-react';
import { FlavorsMixesData } from '../../types/launchpad';

interface FlavorsMixesStepProps {
  initialData?: FlavorsMixesData;
  onComplete: (data: FlavorsMixesData) => void;
  onBack?: () => void;
}

// Common flavor suggestions
const POPULAR_FLAVORS = [
  'Double Apple',
  'Mint',
  'Grape',
  'Watermelon',
  'Strawberry',
  'Blueberry',
  'Peach',
  'Orange',
  'Lemon',
  'Pineapple',
  'Mango',
  'Rose',
  'Vanilla',
  'Coconut',
  'Chocolate',
];

export function FlavorsMixesStep({ initialData, onComplete, onBack }: FlavorsMixesStepProps) {
  const [topFlavors, setTopFlavors] = useState<FlavorsMixesData['topFlavors']>(
    initialData?.topFlavors || []
  );
  const [commonMixes, setCommonMixes] = useState<string[]>(
    initialData?.commonMixes || []
  );
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorPremium, setNewFlavorPremium] = useState(false);
  const [newFlavorPrice, setNewFlavorPrice] = useState('');
  const [newMix, setNewMix] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredSuggestions = POPULAR_FLAVORS.filter(
    (flavor) =>
      flavor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !topFlavors.some((f) => f.name.toLowerCase() === flavor.toLowerCase())
  );

  const handleAddFlavor = (flavorName?: string, isPremium = false) => {
    const name = flavorName || newFlavorName.trim();
    if (!name) return;

    if (topFlavors.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ flavor: 'Flavor already added' });
      return;
    }

    const flavor: FlavorsMixesData['topFlavors'][0] = {
      name,
      premium: isPremium || newFlavorPremium,
      priceCents: isPremium && newFlavorPrice ? Math.round(parseFloat(newFlavorPrice) * 100) : undefined,
    };

    setTopFlavors([...topFlavors, flavor]);
    setNewFlavorName('');
    setNewFlavorPremium(false);
    setNewFlavorPrice('');
    setSearchQuery('');
    setErrors({});
  };

  const handleRemoveFlavor = (index: number) => {
    setTopFlavors(topFlavors.filter((_, i) => i !== index));
  };

  const handleTogglePremium = (index: number) => {
    const updated = [...topFlavors];
    updated[index].premium = !updated[index].premium;
    if (updated[index].premium && !updated[index].priceCents) {
      updated[index].priceCents = 300; // Default $3.00 for premium
    }
    setTopFlavors(updated);
  };

  const handleAddMix = () => {
    if (!newMix.trim()) return;
    if (commonMixes.includes(newMix.trim())) {
      setErrors({ mix: 'Mix already added' });
      return;
    }
    setCommonMixes([...commonMixes, newMix.trim()]);
    setNewMix('');
    setErrors({});
  };

  const handleRemoveMix = (index: number) => {
    setCommonMixes(commonMixes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (topFlavors.length < 3) {
      setErrors({ flavors: 'Please add at least 3 flavors' });
      return;
    }

    onComplete({
      topFlavors,
      commonMixes: commonMixes.length > 0 ? commonMixes : undefined,
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Flavors & Mixes</h2>
        <p className="text-zinc-400 text-sm">
          Memory starts here.
        </p>
        <p className="text-zinc-500 text-xs mt-1">
          Don't overthink this. You can refine it after day one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Flavors */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Top flavors * (Add your most ordered flavors. We'll sort by popularity automatically.)
          </label>

          {/* Flavor Input */}
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery || newFlavorName}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setNewFlavorName(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
                      e.preventDefault();
                      handleAddFlavor(filteredSuggestions[0], newFlavorPremium);
                    }
                  }}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Type to search or add custom flavor..."
                />
                {searchQuery && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.slice(0, 5).map((flavor) => (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => handleAddFlavor(flavor, newFlavorPremium)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors"
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                <input
                  type="checkbox"
                  checked={newFlavorPremium}
                  onChange={(e) => setNewFlavorPremium(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-zinc-300">Premium</span>
              </label>
              {newFlavorPremium && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFlavorPrice}
                    onChange={(e) => setNewFlavorPrice(e.target.value)}
                    className="w-24 pl-7 pr-3 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                    placeholder="3.00"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleAddFlavor()}
                className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flavor List */}
          {topFlavors.length > 0 && (
            <div className="space-y-2 mb-4">
              {topFlavors.map((flavor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-600 rounded-lg"
                >
                  <span className="flex-1 text-white">{flavor.name}</span>
                  {flavor.premium && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-teal-400" />
                      {flavor.priceCents && (
                        <span className="text-sm text-teal-400">
                          ${(flavor.priceCents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTogglePremium(index)}
                    className={`px-3 py-1 text-xs rounded ${
                      flavor.premium
                        ? 'bg-teal-600 text-white'
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {flavor.premium ? 'Premium' : 'Standard'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFlavor(index)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.flavors && (
            <p className="mt-1 text-sm text-red-400">{errors.flavors}</p>
          )}
          {errors.flavor && (
            <p className="mt-1 text-sm text-red-400">{errors.flavor}</p>
          )}
        </div>

        {/* Common Mixes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Common mixes (optional) (Staff can one-tap these during sessions.)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMix}
              onChange={(e) => setNewMix(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMix();
                }
              }}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="e.g., Double Apple + Mint"
            />
            <button
              type="button"
              onClick={handleAddMix}
              className="px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {commonMixes.length > 0 && (
            <div className="space-y-2">
              {commonMixes.map((mix, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-600 rounded-lg"
                >
                  <span className="text-white">{mix}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMix(index)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.mix && (
            <p className="mt-1 text-sm text-red-400">{errors.mix}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-zinc-700">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors"
          >
            Save flavors
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

