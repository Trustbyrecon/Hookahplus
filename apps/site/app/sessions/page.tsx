'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function SessionsPageContent() {
  const searchParams = useSearchParams();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const createdSessionId = searchParams?.get('sessionId');
  const isCreated = searchParams?.get('created') === 'true';
  
  // Show success message if session was just created
  useEffect(() => {
    if (isCreated && createdSessionId) {
      setShowSuccessMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [isCreated, createdSessionId]);
  
  // Use mock data (SimpleFSDDesign will fetch real data from app build API)
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
        {/* Success Message */}
        {showSuccessMessage && createdSessionId && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Session Created Successfully!</p>
                <p className="text-sm text-zinc-300">Session ID: {createdSessionId.substring(0, 8)}...</p>
                <p className="text-xs text-zinc-400 mt-1">Your session has been created and is now visible in the dashboard below.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Enhanced Fire Session Dashboard */}
        <SimpleFSDDesign 
          sessions={[]} // Component will fetch real sessions from app build API
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

export default function SessionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading sessions...</p>
        </div>
      </div>
    }>
      <SessionsPageContent />
    </Suspense>
  );
}
