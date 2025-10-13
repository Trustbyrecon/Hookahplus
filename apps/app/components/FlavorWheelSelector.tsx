"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wand2, Sparkles, FlaskConical, ListFilter, CircleDot, ChevronRight, RotateCcw, X } from 'lucide-react';

// Staff-optimized flavor categories with pricing
const FLAVOR_CATEGORIES = [
  { 
    id: "mint", 
    label: "Mint & Cool", 
    hue: 176,
    basePrice: 2.00,
    items: [
      { id: "mint", label: "Classic Mint", price: 2.00 },
      { id: "ice-mint", label: "Ice Mint", price: 2.50 },
      { id: "spearmint", label: "Spearmint", price: 2.00 },
      { id: "menthol", label: "Menthol Burst", price: 2.50 },
    ],
  },
  { 
    id: "fruit", 
    label: "Fruity", 
    hue: 18,
    basePrice: 2.00,
    items: [
      { id: "mango", label: "Mango", price: 2.00 },
      { id: "peach", label: "Peach", price: 2.00 },
      { id: "watermelon", label: "Watermelon", price: 2.50 },
      { id: "grape", label: "Grape", price: 2.00 },
      { id: "berry", label: "Mixed Berry", price: 2.50 },
    ],
  },
  { 
    id: "citrus", 
    label: "Citrus", 
    hue: 48,
    basePrice: 2.00,
    items: [
      { id: "lemon", label: "Lemon", price: 2.00 },
      { id: "orange", label: "Orange", price: 2.00 },
      { id: "lime", label: "Lime", price: 2.00 },
      { id: "tangerine", label: "Tangerine", price: 2.50 },
    ],
  },
  { 
    id: "dessert", 
    label: "Dessert", 
    hue: 300,
    basePrice: 2.50,
    items: [
      { id: "vanilla", label: "Vanilla", price: 2.50 },
      { id: "caramel", label: "Caramel", price: 2.50 },
      { id: "chocolate", label: "Chocolate", price: 3.00 },
      { id: "cookie", label: "Cookie Dough", price: 3.00 },
    ],
  },
  { 
    id: "spice", 
    label: "Spice & Bold", 
    hue: 12,
    basePrice: 2.00,
    items: [
      { id: "double-apple", label: "Double Apple", price: 2.00 },
      { id: "cinnamon", label: "Cinnamon", price: 2.50 },
      { id: "cardamom", label: "Cardamom", price: 2.50 },
      { id: "anise", label: "Anise", price: 2.00 },
    ],
  },
  { 
    id: "floral", 
    label: "Floral", 
    hue: 272,
    basePrice: 2.50,
    items: [
      { id: "rose", label: "Rose", price: 2.50 },
      { id: "jasmine", label: "Jasmine", price: 2.50 },
      { id: "lavender", label: "Lavender", price: 3.00 },
    ],
  },
];

// Staff-recommended combinations for quick selection
const STAFF_PRESETS = [
  { 
    id: "cool-sweet", 
    name: "Cool & Sweet", 
    flavors: ["mint", "watermelon"], 
    description: "Perfect balance for new customers",
    price: 4.50
  },
  { 
    id: "citrus-fresh", 
    name: "Citrus Fresh", 
    flavors: ["lemon", "lime", "mint"], 
    description: "Refreshing and energizing",
    price: 6.00
  },
  { 
    id: "dessert-indulgence", 
    name: "Dessert Indulgence", 
    flavors: ["vanilla", "caramel", "chocolate"], 
    description: "Premium dessert experience",
    price: 8.00
  },
  { 
    id: "exotic-spice", 
    name: "Exotic Spice", 
    flavors: ["double-apple", "cinnamon", "cardamom"], 
    description: "Traditional Middle Eastern blend",
    price: 7.00
  },
];

interface FlavorWheelSelectorProps {
  selectedFlavors?: string[];
  onSelectionChange: (flavors: string[], totalPrice: number) => void;
  maxSelections?: number;
  mode?: 'staff' | 'customer';
  className?: string;
}

export default function FlavorWheelSelector({
  selectedFlavors = [],
  onSelectionChange,
  maxSelections = 3,
  mode = 'staff',
  className = ''
}: FlavorWheelSelectorProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedFlavors);
  const [showPresets, setShowPresets] = useState(true);

  // Calculate total price for selected flavors
  const totalPrice = useMemo(() => {
    return selected.reduce((total, flavorId) => {
      for (const category of FLAVOR_CATEGORIES) {
        const flavor = category.items.find(item => item.id === flavorId);
        if (flavor) {
          return total + flavor.price;
        }
      }
      return total;
    }, 0);
  }, [selected]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return FLAVOR_CATEGORIES;
    return FLAVOR_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((c) => c.items.length);
  }, [query]);

  // Handle flavor selection
  const toggleFlavor = (flavorId: string) => {
    const newSelected = selected.includes(flavorId) 
      ? selected.filter(id => id !== flavorId)
      : selected.length < maxSelections 
        ? [...selected, flavorId]
        : selected;
    
    setSelected(newSelected);
    onSelectionChange(newSelected, calculatePrice(newSelected));
  };

  // Handle preset selection
  const selectPreset = (preset: typeof STAFF_PRESETS[0]) => {
    setSelected(preset.flavors);
    onSelectionChange(preset.flavors, preset.price);
    setShowPresets(false);
  };

  // Calculate price for flavor array
  const calculatePrice = (flavors: string[]) => {
    return flavors.reduce((total, flavorId) => {
      for (const category of FLAVOR_CATEGORIES) {
        const flavor = category.items.find(item => item.id === flavorId);
        if (flavor) {
          return total + flavor.price;
        }
      }
      return total;
    }, 0);
  };

  // Clear all selections
  const clearAll = () => {
    setSelected([]);
    onSelectionChange([], 0);
  };

  // Get flavor label by ID
  const getFlavorLabel = (id: string) => {
    for (const c of FLAVOR_CATEGORIES) {
      const f = c.items.find((x) => x.id === id);
      if (f) return f.label;
    }
    return id;
  };

  // Get flavor price by ID
  const getFlavorPrice = (id: string) => {
    for (const c of FLAVOR_CATEGORIES) {
      const f = c.items.find((x) => x.id === id);
      if (f) return f.price;
    }
    return 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Staff Presets - Quick Selection */}
      {mode === 'staff' && showPresets && (
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Quick Presets</h4>
            <button
              onClick={() => setShowPresets(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STAFF_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectPreset(preset);
                }}
                className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-left transition-colors"
              >
                <div className="text-sm font-medium text-white">{preset.name}</div>
                <div className="text-xs text-zinc-400 mb-1">{preset.description}</div>
                <div className="text-xs text-green-400 font-semibold">${preset.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flavors..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {mode === 'staff' && !showPresets && (
          <button
            onClick={() => setShowPresets(true)}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
          >
            Presets
          </button>
        )}
      </div>

      {/* Selected Flavors Display */}
      {selected.length > 0 && (
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Selected Flavors:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-400">
                Total: ${totalPrice.toFixed(2)}
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((flavorId) => (
              <span
                key={flavorId}
                className="text-xs px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300"
              >
                {getFlavorLabel(flavorId)} ${getFlavorPrice(flavorId).toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flavor Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredCategories.map((category) => (
          <div key={category.id} className="p-3 bg-zinc-800 rounded-lg">
            <div 
              className="text-xs mb-2 text-zinc-300 font-medium"
              style={{ color: `hsl(${category.hue} 80% 70%)` }}
            >
              {category.label}
            </div>
            <div className="space-y-1">
              {category.items.map((flavor) => (
                <button
                  key={flavor.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFlavor(flavor.id);
                  }}
                  disabled={!selected.includes(flavor.id) && selected.length >= maxSelections}
                  className={`w-full text-left text-xs px-2 py-1 rounded border transition-colors ${
                    selected.includes(flavor.id)
                      ? 'bg-teal-500/20 border-teal-500/30 text-teal-300'
                      : selected.length >= maxSelections
                        ? 'bg-zinc-700 border-zinc-600 text-zinc-500 cursor-not-allowed'
                        : 'bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{flavor.label}</span>
                    <span className="text-green-400">${flavor.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Limit Warning */}
      {selected.length >= maxSelections && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="text-xs text-yellow-300 text-center">
            Maximum {maxSelections} flavors selected. Remove a flavor to add another.
          </div>
        </div>
      )}
    </div>
  );
}
