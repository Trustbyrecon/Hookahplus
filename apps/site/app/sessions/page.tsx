'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import PageHero from '../../components/PageHero';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { 
  Flame, Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, 
  ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, Package, Truck, Home, Coffee, 
  Timer, Zap as ZapIcon, DollarSign, X, RotateCcw, CreditCard as CreditCardIcon, Ban, 
  AlertTriangle, MoreVertical, Info, ArrowLeft, RefreshCw, Eye, EyeOff, Lock, Unlock, Map
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
      {/* Hero Section */}
      <PageHero
        headline="Monitor every session. Optimize every turn."
        subheadline="Real-time intelligence that reduces management friction by 40%"
        benefit={{
          value: "↑ 22% table turns, ↓ 35% order time",
          description: "AI-powered predictions and automated alerts keep operations flowing"
        }}
        primaryCTA={{
          text: "View Analytics Dashboard",
          onClick: () => {
            // Scroll to dashboard or navigate to analytics
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
              dashboard.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
        secondaryCTA={{
          text: "Export Report",
          onClick: () => {
            // Handle export
            console.log('Export report');
          }
        }}
        trustIndicators={[
          { icon: <Map className="w-4 h-4 text-teal-400" />, text: "Live heat maps" },
          { icon: <Brain className="w-4 h-4 text-teal-400" />, text: "AI-powered predictions" },
          { icon: <Zap className="w-4 h-4 text-teal-400" />, text: "Automated alerts" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8" id="dashboard">
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowIntelligence(!showIntelligence)}
          >
            <Brain className="w-4 h-4" />
            {showIntelligence ? 'Hide' : 'Show'} Intelligence
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/analytics'}
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </div>
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
