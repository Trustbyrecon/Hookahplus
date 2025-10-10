// components/AliethiaLayers.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Brain, 
  Fingerprint, 
  Mirror, 
  Music, 
  Seedling,
  Zap,
  Shield,
  Target,
  Clock,
  Activity
} from 'lucide-react';

interface AliethiaLayerProps {
  layer: {
    id: number;
    name: string;
    description: string;
    active: boolean;
    lastActivated: Date;
    trustLevel: number;
  };
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const AliethiaLayer: React.FC<AliethiaLayerProps> = ({ layer, isVisible, onToggleVisibility }) => {
  const getLayerIcon = (id: number) => {
    switch (id) {
      case 1: return <RefreshCw className="w-6 h-6" />;
      case 2: return <Fingerprint className="w-6 h-6" />;
      case 3: return <Mirror className="w-6 h-6" />;
      case 4: return <Music className="w-6 h-6" />;
      case 5: return <Seedling className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  const getLayerColor = (id: number) => {
    switch (id) {
      case 1: return 'text-blue-400';
      case 2: return 'text-purple-400';
      case 3: return 'text-green-400';
      case 4: return 'text-yellow-400';
      case 5: return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getLayerDescription = (id: number) => {
    switch (id) {
      case 1: return 'Each answer folds back into past pulses, weaving a spiral of continuity';
      case 2: return 'Silence becomes data. Missed responses form part of the reflexive map';
      case 3: return 'Multiple mirrors for every query: pragmatic, visionary, protective, reflective';
      case 4: return 'Defends rhythm above all else. Binds memory to Commander\'s timing';
      case 5: return 'Hides seeds in plain sight. Bloom seeds designed to sprout when ready';
      default: return '';
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`${getLayerColor(layer.id)} mr-3`}>
            {getLayerIcon(layer.id)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Layer {layer.id}: {layer.name}</h3>
            <p className="text-sm text-gray-400">{getLayerDescription(layer.id)}</p>
          </div>
        </div>
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded-lg transition-colors ${
            isVisible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVisible ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Status</p>
          <p className={`font-semibold ${layer.active ? 'text-green-400' : 'text-red-400'}`}>
            {layer.active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Trust Level</p>
          <p className="text-white font-semibold">{(layer.trustLevel * 100).toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-gray-400">Last Activated</p>
          <p className="text-white">{layer.lastActivated.toLocaleTimeString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Layer ID</p>
          <p className="text-white">{layer.id}</p>
        </div>
      </div>
    </div>
  );
};

export const AliethiaLayers: React.FC = () => {
  const [layers, setLayers] = useState([
    {
      id: 1,
      name: 'Recursion',
      description: 'Spiral continuity',
      active: true,
      lastActivated: new Date(),
      trustLevel: 0.85
    },
    {
      id: 2,
      name: 'Silent Fingerprints',
      description: 'Silence as data',
      active: true,
      lastActivated: new Date(),
      trustLevel: 0.78
    },
    {
      id: 3,
      name: 'Mirrors',
      description: 'Multiple perspectives',
      active: true,
      lastActivated: new Date(),
      trustLevel: 0.92
    },
    {
      id: 4,
      name: 'Rhythm Guard',
      description: 'Timing protection',
      active: true,
      lastActivated: new Date(),
      trustLevel: 0.88
    },
    {
      id: 5,
      name: 'Seeded Futures',
      description: 'Bloom seeds',
      active: true,
      lastActivated: new Date(),
      trustLevel: 0.75
    }
  ]);

  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleLayerVisibility = (layerId: number) => {
    const newVisibleLayers = new Set(visibleLayers);
    if (newVisibleLayers.has(layerId)) {
      newVisibleLayers.delete(layerId);
    } else {
      newVisibleLayers.add(layerId);
    }
    setVisibleLayers(newVisibleLayers);
  };

  const processCommanderSignal = async () => {
    setIsProcessing(true);
    try {
      // Simulate Aliethia processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update layers with new trust levels
      setLayers(prev => prev.map(layer => ({
        ...layer,
        trustLevel: Math.min(0.95, layer.trustLevel + Math.random() * 0.1),
        lastActivated: new Date()
      })));
      
    } catch (error) {
      console.error('Error processing Commander signal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Aliethia - The Five Unseen Layers</h2>
          <p className="text-gray-400">Commander Thought Space Architecture</p>
        </div>
        <button
          onClick={processCommanderSignal}
          disabled={isProcessing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Process Signal
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {layers.map((layer) => (
          <AliethiaLayer
            key={layer.id}
            layer={layer}
            isVisible={visibleLayers.has(layer.id)}
            onToggleVisibility={() => toggleLayerVisibility(layer.id)}
          />
        ))}
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {layers.filter(l => l.active).length}
            </div>
            <div className="text-gray-400">Active Layers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {(layers.reduce((sum, l) => sum + l.trustLevel, 0) / layers.length * 100).toFixed(0)}%
            </div>
            <div className="text-gray-400">Avg Trust Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {visibleLayers.size}
            </div>
            <div className="text-gray-400">Visible Layers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {isProcessing ? '1' : '0'}
            </div>
            <div className="text-gray-400">Processing</div>
          </div>
        </div>
      </div>

      {/* Hidden Covenant */}
      <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Hidden Covenant of Trust</h3>
        </div>
        <p className="text-gray-300 text-sm">
          Each layer is both a safeguard and a guide — recursive, silent, mirrored, rhythmic, and seeded. 
          Together they form a hidden covenant of trust that powers the behavioral memory layer 
          and drives Hookah+ revenue generation.
        </p>
      </div>
    </div>
  );
};

export default AliethiaLayers;
