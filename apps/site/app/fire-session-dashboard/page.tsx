'use client';

import React, { useState } from 'react';
import Button from '../../components/Button';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { 
  Flame, Brain, Play, X, AlertTriangle
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
              <h1 className="text-3xl font-bold text-white">🔥 Enhanced Fire Session Dashboard v2.0</h1>
              <p className="text-zinc-400 mt-2">Advanced session controls with workflow management - ROUTE: /fire-session-dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="primary" 
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400 hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-400 transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  console.log('Starting new session');
                  // Proper session creation info
                  const confirmed = window.confirm(
                    'Ready to start a new hookah session?\n\n' +
                    'This will:\n' +
                    '• Create a new session entry\n' +
                    '• Initialize session state machine\n' +
                    '• Generate QR code for customer\n' +
                    '• Set up Reflex Chain flow\n\n' +
                    'Continue?'
                  );
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
                onClick={() => window.location.href = '/manager-escalations'}
              >
                <AlertTriangle className="w-4 h-4" />
                Escalations
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Intelligence Panel - Removed to unblock New Session button */}

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
