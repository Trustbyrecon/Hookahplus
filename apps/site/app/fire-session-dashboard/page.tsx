'use client';

import React, { useState } from 'react';
import Button from '../../components/Button';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { 
  Flame, Brain, Play, X
} from 'lucide-react';

// Force dynamic rendering to bypass caching
export const dynamic = 'force-dynamic';

export default function FireSessionDashboardPage() {
  const [showIntelligence, setShowIntelligence] = useState(false);
  
  // Force re-render to bypass caching
  const version = Date.now();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Enhanced Fire Session Management</h1>
              <p className="text-zinc-400 mt-2">Advanced session controls with workflow management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="primary" 
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400 hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-400 transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  console.log('Starting new session');
                  const confirmed = window.confirm('Ready to start a new hookah session? This will create a new session in the current dashboard.');
                  if (confirmed) {
                    // Dispatch event to open create session modal
                    window.dispatchEvent(new CustomEvent('openCreateSessionModal'));
                  }
                }}
              >
                <Play className="w-4 h-4" />
                Start New Session
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowIntelligence(!showIntelligence)}
              >
                <Brain className="w-4 h-4" />
                {showIntelligence ? 'Hide' : 'Show'} Intelligence
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Intelligence Panel */}
        {showIntelligence && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Guest Intelligence Dashboard
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowIntelligence(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Trust Score</h4>
                <div className="text-2xl font-bold text-white">94%</div>
                <div className="text-xs text-zinc-400">Average across all guests</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Flavor Preferences</h4>
                <div className="text-sm text-white">
                  <div className="flex justify-between">
                    <span>Blue Mist</span>
                    <span className="text-zinc-400">32%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strawberry</span>
                    <span className="text-zinc-400">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mango</span>
                    <span className="text-zinc-400">24%</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Loyalty Tiers</h4>
                <div className="text-sm text-white">
                  <div className="flex justify-between">
                    <span>VIP</span>
                    <span className="text-zinc-400">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular</span>
                    <span className="text-zinc-400">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New</span>
                    <span className="text-zinc-400">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Fire Session Dashboard - Version 2.0 */}
        <div key={`enhanced-dashboard-${version}`}>
          <SimpleFSDDesign 
            sessions={[]} // Let the component generate its own demo data
            userRole="MANAGER"
            onSessionAction={(action, sessionId) => {
              console.log(`Session action: ${action} on ${sessionId}`);
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
