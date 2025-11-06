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
