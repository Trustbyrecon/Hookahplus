'use client';

import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  Brain, Heart, Star, Zap, Coffee, Wind, Sparkles, 
  ArrowRight, CheckCircle, X, RotateCcw, Eye, EyeOff
} from 'lucide-react';

interface FlavorWheelProps {
  onFlavorSelect?: (flavor: string) => void;
  onClose?: () => void;
}

export default function FlavorWheel({ onFlavorSelect, onClose }: FlavorWheelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const flavorCategories = [
    {
      name: 'Fruity',
      colors: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
      flavors: [
        { name: 'Strawberry Kiwi', popularity: 23, description: 'Sweet and tangy tropical blend' },
        { name: 'Mango Tango', popularity: 19, description: 'Exotic mango with citrus notes' },
        { name: 'Peach Paradise', popularity: 15, description: 'Juicy peach with vanilla undertones' },
        { name: 'Watermelon Chill', popularity: 12, description: 'Refreshing summer favorite' },
        { name: 'Cherry Blossom', popularity: 10, description: 'Delicate floral cherry essence' },
        { name: 'Pineapple Express', popularity: 8, description: 'Tropical pineapple burst' },
        { name: 'Orange Cream', popularity: 7, description: 'Creamy orange dream' }
      ]
    },
    {
      name: 'Minty',
      colors: ['#4ECDC4', '#45B7D1', '#96CEB4'],
      flavors: [
        { name: 'Blue Mist + Mint', popularity: 17, description: 'Classic mint with blueberry' },
        { name: 'Grape Mint', popularity: 6, description: 'Purple grape with cool mint' },
        { name: 'Lemon Mint', popularity: 5, description: 'Citrus mint refreshment' },
        { name: 'Vanilla Mint', popularity: 4, description: 'Smooth vanilla mint blend' },
        { name: 'Mint Chocolate', popularity: 3, description: 'Rich chocolate with mint' }
      ]
    },
    {
      name: 'Creamy',
      colors: ['#FECA57', '#FF9FF3', '#54A0FF'],
      flavors: [
        { name: 'Double Apple', popularity: 14, description: 'Classic apple with cinnamon' },
        { name: 'Coconut Lime', popularity: 11, description: 'Tropical coconut lime twist' },
        { name: 'Ginger Peach', popularity: 9, description: 'Warm ginger with sweet peach' },
        { name: 'Rose Petal', popularity: 6, description: 'Elegant floral rose essence' },
        { name: 'Lavender Dreams', popularity: 5, description: 'Calming lavender relaxation' },
        { name: 'Honeydew Melon', popularity: 4, description: 'Sweet melon with honey' }
      ]
    }
  ];

  const popularCombinations = [
    { primary: 'Strawberry Kiwi', secondary: 'Mint', popularity: 85, description: 'Sweet meets cool' },
    { primary: 'Mango Tango', secondary: 'Coconut', popularity: 78, description: 'Tropical paradise' },
    { primary: 'Blue Mist', secondary: 'Mint', popularity: 92, description: 'Classic favorite' },
    { primary: 'Peach Paradise', secondary: 'Vanilla', popularity: 71, description: 'Creamy delight' }
  ];

  const handleFlavorSelect = (flavor: string) => {
    setSelectedFlavor(flavor);
    if (onFlavorSelect) {
      onFlavorSelect(flavor);
    }
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 20) return 'text-green-400';
    if (popularity >= 15) return 'text-blue-400';
    if (popularity >= 10) return 'text-yellow-400';
    return 'text-zinc-400';
  };

  const getPopularityIcon = (popularity: number) => {
    if (popularity >= 20) return '🔥';
    if (popularity >= 15) return '⭐';
    if (popularity >= 10) return '✨';
    return '💫';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-400" />
                Flavor Wheel Discovery
              </h1>
              <p className="text-zinc-400 mt-2">AI-powered flavor recommendations based on your preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowPreferences(!showPreferences)}
              >
                {showPreferences ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreferences ? 'Hide' : 'Show'} Preferences
              </Button>
              {onClose && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* AI Preferences Panel */}
        {showPreferences && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Your Flavor Profile
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">AI Learning Active</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Top Preferences</h4>
                <div className="space-y-1">
                  {['Strawberry Kiwi', 'Mango Tango', 'Blue Mist + Mint'].map((flavor, index) => (
                    <div key={flavor} className="flex justify-between text-sm">
                      <span>{flavor}</span>
                      <span className="text-zinc-400">{23 - index * 4}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Flavor Categories</h4>
                <div className="space-y-1">
                  {['Fruity', 'Minty', 'Creamy'].map((category, index) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="text-zinc-400">{45 - index * 10}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Trust Score</h4>
                <div className="text-2xl font-bold text-white mb-1">87%</div>
                <div className="text-xs text-zinc-400">Based on 12 sessions</div>
                <div className="mt-2 text-xs text-green-400">+5% this week</div>
              </div>
            </div>
          </div>
        )}

        {/* Flavor Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Flavor Adventure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flavorCategories.map((category, categoryIndex) => (
              <Card 
                key={category.name}
                className={`hover:border-teal-500/50 transition-all duration-200 cursor-pointer ${
                  selectedCategory === category.name ? 'border-teal-500 bg-teal-500/5' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
              >
                <div className="p-6 text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${category.colors[0]}, ${category.colors[1]})` 
                    }}
                  >
                    <span className="text-2xl">
                      {category.name === 'Fruity' ? '🍓' : category.name === 'Minty' ? '🌿' : '🥛'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    {category.flavors.length} flavors available
                  </p>
                  <div className="text-xs text-zinc-500">
                    {category.flavors.reduce((sum, f) => sum + f.popularity, 0)}% total preference
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Category Flavors */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">
                  {selectedCategory === 'Fruity' ? '🍓' : selectedCategory === 'Minty' ? '🌿' : '🥛'}
                </span>
                {selectedCategory} Flavors
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavorCategories.find(c => c.name === selectedCategory)?.flavors.map((flavor) => (
                <Card 
                  key={flavor.name}
                  className={`hover:border-teal-500/50 transition-all duration-200 cursor-pointer ${
                    selectedFlavor === flavor.name ? 'border-teal-500 bg-teal-500/5' : ''
                  }`}
                  onClick={() => handleFlavorSelect(flavor.name)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{flavor.name}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getPopularityIcon(flavor.popularity)}</span>
                        <span className={`text-sm font-medium ${getPopularityColor(flavor.popularity)}`}>
                          {flavor.popularity}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">{flavor.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-zinc-500">
                        {flavor.popularity >= 15 ? 'Popular Choice' : 
                         flavor.popularity >= 10 ? 'Trending' : 'Unique Blend'}
                      </div>
                      {selectedFlavor === flavor.name && (
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Popular Combinations */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-center">Popular Flavor Combinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCombinations.map((combo) => (
              <Card key={`${combo.primary}-${combo.secondary}`} className="hover:border-teal-500/50 transition-colors">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{combo.primary} + {combo.secondary}</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm font-medium text-green-400">{combo.popularity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{combo.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-zinc-500">Customer Favorite</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFlavorSelect(`${combo.primary} + ${combo.secondary}`)}
                    >
                      Try This Blend
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Flavor Summary */}
        {selectedFlavor && (
          <div className="bg-gradient-to-r from-teal-900/20 to-blue-900/20 border border-teal-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-teal-300 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Selected Flavor
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedFlavor(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-2">{selectedFlavor}</h4>
              <p className="text-zinc-400 mb-4">
                Great choice! This flavor is perfect for your taste profile.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="primary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    console.log(`Starting session with ${selectedFlavor}`);
                    alert(`Starting session with ${selectedFlavor} - Redirecting to session management`);
                  }}
                >
                  <Coffee className="w-4 h-4" />
                  Start Session
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    console.log(`Adding ${selectedFlavor} to favorites`);
                    alert(`${selectedFlavor} added to your favorites!`);
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
