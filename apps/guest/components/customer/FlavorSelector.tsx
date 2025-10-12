"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Plus, Minus, Star, Heart } from 'lucide-react';
import FlavorMixSelector from './FlavorMixSelector';

export interface Flavor {
  id: string;
  name: string;
  description: string;
  category: 'tobacco' | 'herbal' | 'mixed';
  intensity: 'light' | 'medium' | 'strong';
  price: number;
  image?: string;
  isPopular?: boolean;
  isFavorite?: boolean;
}

export interface FlavorSelectorProps {
  flavors: Flavor[];
  selectedFlavors: string[];
  onSelectionChange: (flavorIds: string[]) => void;
  maxSelections?: number;
  className?: string;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({
  flavors,
  selectedFlavors,
  onSelectionChange,
  maxSelections = 3,
  className
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [useEnhancedSelector, setUseEnhancedSelector] = useState(true);

  // Calculate total price when flavors change
  useEffect(() => {
    const total = selectedFlavors.reduce((sum, flavorId) => {
      const flavor = flavors.find(f => f.id === flavorId);
      return sum + (flavor?.price || 0);
    }, 0);
    setTotalPrice(total);
  }, [selectedFlavors, flavors]);

  // Convert flavors to FlavorMixSelector format
  const convertedFlavors = flavors.map(flavor => ({
    id: flavor.id,
    name: flavor.name,
    description: flavor.description,
    category: flavor.category,
    intensity: flavor.intensity,
    price: flavor.price,
    image: flavor.image,
    isPopular: flavor.isPopular,
    isFavorite: flavor.isFavorite
  }));

  if (useEnhancedSelector) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Enhanced Flavor Mix Selector */}
        <FlavorMixSelector
          flavors={convertedFlavors}
          selectedFlavors={selectedFlavors}
          onSelectionChange={onSelectionChange}
          maxSelections={maxSelections}
          onPriceUpdate={setTotalPrice}
        />

        {/* Price Summary */}
        {totalPrice > 0 && (
          <Card className="bg-teal-500/10 border-teal-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-teal-400" />
                <span className="text-teal-300 font-medium">Flavor Mix Total</span>
              </div>
              <div className="text-xl font-bold text-teal-300">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
            <div className="text-sm text-teal-400 mt-1">
              {selectedFlavors.length} flavor{selectedFlavors.length !== 1 ? 's' : ''} selected
            </div>
          </Card>
        )}

        {/* Toggle Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setUseEnhancedSelector(!useEnhancedSelector)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            {useEnhancedSelector ? 'Switch to Grid View' : 'Switch to Wheel View'}
          </button>
        </div>
      </div>
    );
  }

  // Original grid-based selector as fallback
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Flavors' },
    { id: 'tobacco', name: 'Tobacco' },
    { id: 'herbal', name: 'Herbal' },
    { id: 'mixed', name: 'Mixed' }
  ];

  const intensityColors = {
    light: 'bg-green-500',
    medium: 'bg-yellow-500',
    strong: 'bg-red-500'
  };

  const filteredFlavors = flavors.filter(flavor => {
    const matchesSearch = flavor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flavor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || flavor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFlavorToggle = (flavorId: string) => {
    if (selectedFlavors.includes(flavorId)) {
      onSelectionChange(selectedFlavors.filter(id => id !== flavorId));
    } else if (selectedFlavors.length < maxSelections) {
      onSelectionChange([...selectedFlavors, flavorId]);
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'Light';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return intensity;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search flavors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500 transition-colors"
        />

        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {selectedFlavors.length} of {maxSelections} selected
        </span>
        {selectedFlavors.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Flavor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlavors.map(flavor => {
          const isSelected = selectedFlavors.includes(flavor.id);
          const canSelect = !isSelected && selectedFlavors.length < maxSelections;

          return (
            <Card
              key={flavor.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-lg',
                isSelected 
                  ? 'border-teal-500 bg-teal-500/10' 
                  : canSelect 
                  ? 'hover:border-teal-500/50' 
                  : 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => canSelect && handleFlavorToggle(flavor.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white">{flavor.name}</h3>
                  {flavor.isPopular && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                  {flavor.isFavorite && (
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    intensityColors[flavor.intensity]
                  )} />
                  <span className="text-xs text-zinc-400">
                    {getIntensityLabel(flavor.intensity)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-3">{flavor.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-teal-400">
                  ${flavor.price.toFixed(2)}
                </span>
                
                {isSelected ? (
                  <div className="flex items-center space-x-1 text-teal-400">
                    <Minus className="w-4 h-4" />
                    <span className="text-sm">Selected</span>
                  </div>
                ) : canSelect ? (
                  <div className="flex items-center space-x-1 text-zinc-400">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">Max reached</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredFlavors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-zinc-400">No flavors found matching your search.</p>
        </div>
      )}

      {/* Toggle Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setUseEnhancedSelector(!useEnhancedSelector)}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {useEnhancedSelector ? 'Switch to Grid View' : 'Switch to Wheel View'}
        </button>
      </div>
    </div>
  );
};

export default FlavorSelector;