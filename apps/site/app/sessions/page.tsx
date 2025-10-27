'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { 
  Flame, Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, 
  ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, Package, Truck, Home, Coffee, 
  Timer, Zap as ZapIcon, DollarSign, X, RotateCcw, CreditCard as CreditCardIcon, Ban, 
  AlertTriangle, MoreVertical, Info, ArrowLeft, RefreshCw, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { 
  mockSiteData, getActiveSessions, getBohSessions, getFohSessions, getEdgeCaseSessions,
  formatDuration, formatCurrency, getStatusColor, getStageIcon
} from '../../lib/mockData';

export default function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  
  // Use mock data
  const sessions = mockSiteData.sessions;
  const activeSessions = getActiveSessions();
  const bohSessions = getBohSessions();
  const fohSessions = getFohSessions();
  const edgeCaseSessions = getEdgeCaseSessions();


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🔥 Fire Session Operations</h1>
              <p className="text-zinc-400 mt-2">Real-time session monitoring and control center - SITE BUILD</p>
            </div>
            <div className="flex items-center space-x-4">
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
                <div className="text-2xl font-bold text-white">{mockSiteData.trustMetrics.averageTrustScore}%</div>
                <div className="text-xs text-zinc-400">Average across all guests</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Flavor Preferences</h4>
                <div className="text-sm text-white">
                  {Object.entries(mockSiteData.trustMetrics.flavorPreferences)
                    .slice(0, 3)
                    .map(([flavor, count]) => (
                      <div key={flavor} className="flex justify-between">
                        <span>{flavor}</span>
                        <span className="text-zinc-400">{count}%</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Loyalty Tiers</h4>
                <div className="text-sm text-white">
                  {Object.entries(mockSiteData.trustMetrics.loyaltyTiers)
                    .map(([tier, count]) => (
                      <div key={tier} className="flex justify-between">
                        <span className="capitalize">{tier}</span>
                        <span className="text-zinc-400">{count}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Fire Session Dashboard */}
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
  );
}
