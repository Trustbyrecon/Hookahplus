"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wand2, Sparkles, FlaskConical, ListFilter, CircleDot, ChevronRight, RotateCcw, X, TrendingUp } from 'lucide-react';

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
  { 
    id: "premium", 
    label: "Premium", 
    hue: 320,
    basePrice: 4.00,
    items: [
      { id: "vodka-infused", label: "Vodka-Infused", price: 4.00 },
      { id: "whiskey-barrel", label: "Whiskey Barrel", price: 4.00 },
      { id: "boutique-import", label: "Boutique Import", price: 4.50 },
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
  customFlavors?: string[]; // For demo mode: flavors from uploaded menu
  customPresets?: Array<{ id: string; name: string; flavors: string[]; description?: string }>; // LaunchPad common mixes
  isDemoMode?: boolean; // If true, flavors are free
  sortByPopularity?: boolean; // Sort flavors by popularity (default: true)
  loungeId?: string; // Optional lounge ID for popularity calculation
}

export default function FlavorWheelSelector({
  selectedFlavors = [],
  onSelectionChange,
  maxSelections = 4,
  mode = 'staff',
  className = '',
  customFlavors = [],
  customPresets = [],
  isDemoMode = false,
  sortByPopularity = true,
  loungeId
}: FlavorWheelSelectorProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedFlavors);
  // Merge custom presets with default presets
  const allPresets = useMemo(() => {
    const custom = customPresets.map(p => ({
      id: p.id,
      name: p.name,
      flavors: p.flavors,
      description: p.description || `LaunchPad preset: ${p.name}`,
      price: p.flavors.length * (isDemoMode ? 0 : 2.00) // Calculate price
    }));
    return [...custom, ...STAFF_PRESETS];
  }, [customPresets, isDemoMode]);
  const [showPresets, setShowPresets] = useState(customFlavors && customFlavors.length > 0 ? false : true); // Hide presets if using custom flavors
  const [popularityData, setPopularityData] = useState<Map<string, number>>(new Map());
  const [loadingPopularity, setLoadingPopularity] = useState(false);

  // Fetch popularity data
  useEffect(() => {
    if (!sortByPopularity || customFlavors.length > 0) return; // Skip for custom flavors

    async function fetchPopularity() {
      setLoadingPopularity(true);
      try {
        const period = '30d';
        const url = `/api/flavors/popular?period=${period}${loungeId ? `&loungeId=${loungeId}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (res.ok && data.popularity) {
          const popularityMap = new Map<string, number>();
          data.popularity.forEach((item: { flavorId: string; count: number }) => {
            popularityMap.set(item.flavorId, item.count);
          });
          setPopularityData(popularityMap);
        }
      } catch (error) {
        console.warn('Failed to fetch flavor popularity:', error);
      } finally {
        setLoadingPopularity(false);
      }
    }

    fetchPopularity();
  }, [sortByPopularity, loungeId, customFlavors.length]);

  // Build available flavors: use customFlavors if provided (demo mode), otherwise use FLAVOR_CATEGORIES
  const availableFlavors = useMemo(() => {
    if (customFlavors && customFlavors.length > 0) {
      // Convert custom flavor names to flavor items (free in demo mode)
      return customFlavors.map((flavorName, idx) => ({
        id: `custom-${idx}`,
        label: flavorName,
        price: isDemoMode ? 0 : 2.00, // Free in demo mode
        category: 'custom'
      }));
    }
    // Flatten FLAVOR_CATEGORIES into a single array
    return FLAVOR_CATEGORIES.flatMap(cat => cat.items);
  }, [customFlavors, isDemoMode]);

  // Calculate total price for selected flavors
  const totalPrice = useMemo(() => {
    if (isDemoMode) {
      // In demo mode, flavors are free
      return 0;
    }
    return selected.reduce((total, flavorId) => {
      // Check custom flavors first
      if (flavorId.startsWith('custom-')) {
        const idx = parseInt(flavorId.replace('custom-', ''));
        if (customFlavors && customFlavors[idx]) {
          return total + (isDemoMode ? 0 : 2.00); // Free in demo, $2 otherwise
        }
      }
      // Then check standard categories
      for (const category of FLAVOR_CATEGORIES) {
        const flavor = category.items.find(item => item.id === flavorId);
        if (flavor) {
          return total + flavor.price;
        }
      }
      return total;
    }, 0);
  }, [selected, isDemoMode, customFlavors]);

  // Filter and sort categories based on search and popularity
  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase();
    if (customFlavors && customFlavors.length > 0) {
      // In demo mode with custom flavors, show a single "Menu Flavors" category
      const filteredCustom = customFlavors.filter(f => f.toLowerCase().includes(q));
      if (filteredCustom.length > 0) {
        return [{
          id: 'custom',
          label: 'Menu Flavors',
          hue: 200,
          basePrice: isDemoMode ? 0 : 2.00,
          items: filteredCustom.map((flavorName, idx) => ({
            id: `custom-${idx}`,
            label: flavorName,
            price: isDemoMode ? 0 : 2.00
          }))
        }];
      }
      return [];
    }
    
    let categories = FLAVOR_CATEGORIES;
    
    // Apply search filter
    if (q) {
      categories = categories.map((c) => ({
        ...c,
        items: c.items.filter((i) => i.label.toLowerCase().includes(q)),
      })).filter((c) => c.items.length);
    }
    
    // Apply popularity sorting within each category
    if (sortByPopularity && popularityData.size > 0) {
      categories = categories.map((c) => ({
        ...c,
        items: [...c.items].sort((a, b) => {
          const aPopularity = popularityData.get(a.id) || 0;
          const bPopularity = popularityData.get(b.id) || 0;
          return bPopularity - aPopularity; // Most popular first
        }),
      }));
    }
    
    return categories;
  }, [query, customFlavors, isDemoMode, sortByPopularity, popularityData]);

  // Handle flavor selection
  const toggleFlavor = (flavorId: string) => {
    try {
      const newSelected = selected.includes(flavorId) 
        ? selected.filter(id => id !== flavorId)
        : selected.length < maxSelections 
          ? [...selected, flavorId]
          : selected;
      
      setSelected(newSelected);
      onSelectionChange(newSelected, calculatePrice(newSelected));
    } catch (error) {
      console.error('Error in toggleFlavor:', error);
    }
  };

  // Handle preset selection
  const selectPreset = (preset: typeof allPresets[0]) => {
    try {
      // Convert flavor names to IDs for LaunchPad presets
      const flavorIds: string[] = [];
      for (const flavorName of preset.flavors) {
        // Try to find in custom flavors first
        if (customFlavors && customFlavors.length > 0) {
          const idx = customFlavors.findIndex(f => f.toLowerCase() === flavorName.toLowerCase());
          if (idx >= 0) {
            flavorIds.push(`custom-${idx}`);
            continue;
          }
        }
        // Try to find in standard categories
        let found = false;
        for (const category of FLAVOR_CATEGORIES) {
          const flavor = category.items.find(item => 
            item.label.toLowerCase() === flavorName.toLowerCase() ||
            item.id.toLowerCase() === flavorName.toLowerCase()
          );
          if (flavor) {
            flavorIds.push(flavor.id);
            found = true;
            break;
          }
        }
        // If not found and it's already an ID, use as-is
        if (!found && !flavorName.includes('-')) {
          flavorIds.push(flavorName);
        }
      }
      
      if (flavorIds.length > 0 && flavorIds.length <= maxSelections) {
        setSelected(flavorIds);
        // Calculate price inline (same logic as calculatePrice function)
        const totalPrice = isDemoMode ? 0 : flavorIds.reduce((total, flavorId) => {
          if (flavorId.startsWith('custom-')) {
            const idx = parseInt(flavorId.replace('custom-', ''));
            if (customFlavors && customFlavors[idx]) {
              return total + 2.00;
            }
          }
          for (const category of FLAVOR_CATEGORIES) {
            const flavor = category.items.find(item => item.id === flavorId);
            if (flavor) {
              return total + flavor.price;
            }
          }
          return total;
        }, 0);
        onSelectionChange(flavorIds, totalPrice);
        setShowPresets(false);
      }
    } catch (error) {
      console.error('Error in selectPreset:', error);
    }
  };

  // Calculate price for flavor array
  const calculatePrice = (flavors: string[]) => {
    if (isDemoMode) {
      // In demo mode, flavors are free
      return 0;
    }
    return flavors.reduce((total, flavorId) => {
      // Check custom flavors first
      const customFlavor = availableFlavors.find(f => f.id === flavorId);
      if (customFlavor) {
        return total + customFlavor.price;
      }
      // Then check standard categories
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
    // Check custom flavors first
    if (id.startsWith('custom-')) {
      const idx = parseInt(id.replace('custom-', ''));
      if (customFlavors && customFlavors[idx]) {
        return customFlavors[idx];
      }
    }
    // Then check standard categories
    for (const c of FLAVOR_CATEGORIES) {
      const f = c.items.find((x) => x.id === id);
      if (f) return f.label;
    }
    return id;
  };

  // Get flavor price by ID
  const getFlavorPrice = (id: string) => {
    if (isDemoMode) {
      // In demo mode, all flavors are free
      return 0;
    }
    // Check custom flavors first
    if (id.startsWith('custom-')) {
      const idx = parseInt(id.replace('custom-', ''));
      if (customFlavors && customFlavors[idx]) {
        return 2.00; // Default price for custom flavors (non-demo)
      }
    }
    // Then check standard categories
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
            {allPresets.map((preset) => (
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
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="truncate">{flavor.label}</span>
                      {sortByPopularity && popularityData.get(flavor.id) && popularityData.get(flavor.id)! > 0 && (
                        <span className="flex items-center gap-0.5 text-yellow-400 flex-shrink-0" title={`Used ${popularityData.get(flavor.id)} times`}>
                          <TrendingUp className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="text-green-400 flex-shrink-0">${flavor.price.toFixed(2)}</span>
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
