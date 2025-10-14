'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Star, Plus, Minus, ShoppingCart, RotateCcw, CheckCircle } from 'lucide-react';

interface Flavor {
  id: string;
  name: string;
  category: string;
  popular: boolean;
  price: number;
  color: string;
}

interface MobileFlavorSelectorProps {
  flavors: Flavor[];
  selectedFlavors: string[];
  onFlavorToggle: (flavorId: string) => void;
  onClearAll: () => void;
  basePrice: number;
}

const FLAVOR_CATEGORIES = [
  { id: 'all', name: 'All', color: 'bg-zinc-600' },
  { id: 'fruity', name: 'Fruity', color: 'bg-pink-500' },
  { id: 'mint', name: 'Mint', color: 'bg-green-500' },
  { id: 'citrus', name: 'Citrus', color: 'bg-yellow-500' },
  { id: 'specialty', name: 'Specialty', color: 'bg-purple-500' },
];

export default function MobileFlavorSelector({ 
  flavors, 
  selectedFlavors, 
  onFlavorToggle, 
  onClearAll,
  basePrice 
}: MobileFlavorSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  const filteredFlavors = flavors.filter(flavor => 
    selectedCategory === 'all' || flavor.category.toLowerCase() === selectedCategory
  );

  const totalPrice = basePrice + selectedFlavors.reduce((total, flavorId) => {
    const flavor = flavors.find(f => f.id === flavorId);
    return total + (flavor?.price || 0);
  }, 0);

  const selectedFlavorObjects = selectedFlavors.map(id => flavors.find(f => f.id === id)).filter(Boolean) as Flavor[];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold">Choose Your Flavors</h3>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {selectedFlavors.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedFlavors.length}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FLAVOR_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? `${category.color} text-white`
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Flavor Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3">
        {filteredFlavors.map((flavor) => {
          const isSelected = selectedFlavors.includes(flavor.id);
          return (
            <motion.button
              key={flavor.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFlavorToggle(flavor.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-teal-400 bg-teal-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              {/* Popular Badge */}
              {flavor.popular && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  <Star className="w-3 h-3" />
                </div>
              )}

              {/* Flavor Color Indicator */}
              <div 
                className={`w-8 h-8 rounded-full mx-auto mb-2 ${flavor.color}`}
              />

              {/* Flavor Name */}
              <div className="text-sm font-medium text-center mb-1">
                {flavor.name}
              </div>

              {/* Price */}
              <div className="text-xs text-zinc-400 text-center">
                +${(flavor.price / 100).toFixed(2)}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-teal-500/20 rounded-xl"
                >
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Flavors Summary */}
      <AnimatePresence>
        {selectedFlavors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-800/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-300">
                Selected Flavors ({selectedFlavors.length})
              </h4>
              <button
                onClick={onClearAll}
                className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {selectedFlavorObjects.map((flavor) => (
                <div key={flavor.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${flavor.color}`} />
                    <span className="text-zinc-300">{flavor.name}</span>
                  </div>
                  <span className="text-teal-400 font-medium">
                    +${(flavor.price / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="border-t border-zinc-700 mt-3 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Total:</span>
                <span className="text-lg font-bold text-teal-400">
                  ${(totalPrice / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add to Cart
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          View Cart
        </motion.button>
      </div>
    </div>
  );
}

// Mock flavors data
export const MOCK_FLAVORS: Flavor[] = [
  { id: 'blue_mist', name: 'Blue Mist', category: 'fruity', popular: true, price: 200, color: 'bg-blue-400' },
  { id: 'double_apple', name: 'Double Apple', category: 'fruity', popular: true, price: 200, color: 'bg-green-400' },
  { id: 'mint_fresh', name: 'Mint Fresh', category: 'mint', popular: true, price: 200, color: 'bg-emerald-400' },
  { id: 'grape', name: 'Grape', category: 'fruity', popular: false, price: 200, color: 'bg-purple-400' },
  { id: 'strawberry', name: 'Strawberry', category: 'fruity', popular: false, price: 200, color: 'bg-pink-400' },
  { id: 'lemon', name: 'Lemon', category: 'citrus', popular: false, price: 200, color: 'bg-yellow-400' },
  { id: 'orange', name: 'Orange', category: 'citrus', popular: false, price: 200, color: 'bg-orange-400' },
  { id: 'watermelon', name: 'Watermelon', category: 'fruity', popular: false, price: 200, color: 'bg-red-400' },
  { id: 'strawberry_mojito', name: 'Strawberry Mojito', category: 'specialty', popular: true, price: 300, color: 'bg-rose-400' },
];
