'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, MixProfile } from '../../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { Palette, Star, Clock, Save, RotateCcw } from 'lucide-react';

interface FlavorComposerProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onMixUpdate: (mix: { flavors: string[]; notes?: string }) => void;
}

// Mock flavor data
const FLAVORS = [
  { id: 'blue_mist', name: 'Blue Mist', category: 'Fruity', popular: true, price: 3200 },
  { id: 'double_apple', name: 'Double Apple', category: 'Fruity', popular: true, price: 3000 },
  { id: 'mint_fresh', name: 'Mint Fresh', category: 'Mint', popular: true, price: 2900 },
  { id: 'grape', name: 'Grape', category: 'Fruity', popular: false, price: 2800 },
  { id: 'strawberry', name: 'Strawberry', category: 'Fruity', popular: false, price: 2700 },
  { id: 'lemon', name: 'Lemon', category: 'Citrus', popular: false, price: 2600 },
  { id: 'orange', name: 'Orange', category: 'Citrus', popular: false, price: 2500 },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruity', popular: false, price: 2400 },
  { id: 'strawberry_mojito', name: 'Strawberry Mojito', category: 'Specialty', popular: true, price: 800 },
];

const CATEGORIES = ['All', 'Fruity', 'Mint', 'Citrus', 'Specialty'];

export default function FlavorComposer({ guestProfile, flags, onMixUpdate }: FlavorComposerProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedMixes, setSavedMixes] = useState<MixProfile[]>([]);

  useEffect(() => {
    // Load saved mixes
    if (guestProfile.preferences?.savedMixes) {
      setSavedMixes(guestProfile.preferences.savedMixes);
    }
  }, [guestProfile]);

  const filteredFlavors = FLAVORS.filter(flavor => 
    selectedCategory === 'All' || flavor.category === selectedCategory
  );

  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors(prev => {
      const newSelection = prev.includes(flavorId)
        ? prev.filter(id => id !== flavorId)
        : [...prev, flavorId];
      
      // Update parent component
      onMixUpdate({ flavors: newSelection, notes });
      
      // Generate suggestions
      generateSuggestions(newSelection);
      
      return newSelection;
    });
  };

  const generateSuggestions = async (flavors: string[]) => {
    if (flavors.length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/guest/mix/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'temp_session', // In production, get from session context
          flavors,
          notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleSaveMix = async () => {
    if (selectedFlavors.length === 0) return;

    try {
      setIsSaving(true);
      const mixName = prompt('Enter a name for this mix:') || 'My Mix';
      
      const response = await fetch('/api/guest/mix/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'temp_session', // In production, get from session context
          flavors: selectedFlavors,
          notes,
          name: mixName
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to saved mixes
        const newMix: MixProfile = {
          mixId: data.mixId || `mix_${Date.now()}`,
          name: mixName,
          flavors: selectedFlavors,
          notes,
          createdAt: new Date().toISOString(),
          timesUsed: 1
        };
        
        setSavedMixes(prev => [newMix, ...prev]);
        
        // Log mix save event
        if (flags.ghostlog.lite) {
          const eventPayload = {
            guestId: guestProfile.guestId,
            mixId: newMix.mixId,
            mixName,
            flavors: selectedFlavors,
            timestamp: new Date().toISOString()
          };

          const ghostLogEntry = createGhostLogEntry('mix.saved', eventPayload);
          console.log('Mix save logged:', ghostLogEntry);
        }
      }
    } catch (error) {
      console.error('Failed to save mix:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadMix = (mix: MixProfile) => {
    setSelectedFlavors(mix.flavors);
    setNotes(mix.notes || '');
    onMixUpdate({ flavors: mix.flavors, notes: mix.notes });
    generateSuggestions(mix.flavors);
  };

  const handleReset = () => {
    setSelectedFlavors([]);
    setNotes('');
    setSuggestions([]);
    onMixUpdate({ flavors: [], notes: '' });
  };

  const getFlavorPrice = (flavorId: string) => {
    const flavor = FLAVORS.find(f => f.id === flavorId);
    return flavor ? (flavor.price / 100).toFixed(2) : '0.00';
  };

  const getTotalPrice = () => {
    if (selectedFlavors.length === 0) return 0;
    const prices = selectedFlavors.map(flavorId => {
      const flavor = FLAVORS.find(f => f.id === flavorId);
      return flavor ? flavor.price : 0;
    });
    return Math.max(...prices); // Base price is highest priced flavor
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Palette className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Flavor Composer</h2>
          <p className="text-sm text-zinc-400">Create your perfect mix</p>
        </div>
      </div>

      {/* Saved Mixes */}
      {savedMixes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Your Saved Mixes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedMixes.slice(0, 4).map((mix) => (
              <button
                key={mix.mixId}
                onClick={() => handleLoadMix(mix)}
                className="p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-left transition-colors"
              >
                <div className="text-sm font-medium text-white">{mix.name}</div>
                <div className="text-xs text-zinc-400">
                  {mix.flavors.length} flavor{mix.flavors.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Flavor Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {filteredFlavors.map((flavor) => (
          <button
            key={flavor.id}
            onClick={() => handleFlavorToggle(flavor.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedFlavors.includes(flavor.id)
                ? 'border-primary-500 bg-primary-500/20'
                : 'border-zinc-600 bg-zinc-700/50 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">{flavor.name}</span>
              {flavor.popular && (
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              )}
            </div>
            <div className="text-xs text-zinc-400">
              ${getFlavorPrice(flavor.id)}
            </div>
          </button>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Suggested Additions</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => {
              const flavor = FLAVORS.find(f => f.name === suggestion);
              if (!flavor) return null;
              
              return (
                <button
                  key={flavor.id}
                  onClick={() => handleFlavorToggle(flavor.id)}
                  className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                >
                  + {flavor.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Special Instructions
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            onMixUpdate({ flavors: selectedFlavors, notes: e.target.value });
          }}
          placeholder="Any special requests or notes for your mix..."
          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>

      {/* Price & Actions */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">
          Base Price: ${(getTotalPrice() / 100).toFixed(2)}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Reset
          </button>
          
          <button
            onClick={handleSaveMix}
            disabled={selectedFlavors.length === 0 || isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                Save Mix
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
