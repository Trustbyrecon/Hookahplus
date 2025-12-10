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
  AlertTriangle, MoreVertical, Info, ArrowLeft, RefreshCw, Eye, EyeOff, Lock, Unlock, Map,
  ChefHat, FileText
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

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8" id="dashboard">
        {/* Preview Section - What You'll Get */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">See What's Coming</h2>
          <p className="text-zinc-400 text-center mb-8 max-w-2xl mx-auto">
            Get a taste of the full Hookah+ experience. These previews show exactly what you'll get when you complete onboarding.
          </p>

          {/* Session Management Preview */}
          <Card className="bg-zinc-900/50 border-zinc-700 mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-orange-400" />
                <h3 className="text-2xl font-bold text-white">Session Management</h3>
              </div>
              <p className="text-zinc-400 mb-6">
                Real-time session management with AI-powered insights. Track every session from prep to delivery.
              </p>
              
              {/* Session Management Interface Preview */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Back of House Operations</h4>
                    <p className="text-sm text-zinc-400">Manage active hookah sessions</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
                      + Create Test Paid Session
                    </button>
                    <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                      + New Session
                    </button>
                  </div>
                </div>
                
                {/* Tabs Preview */}
                <div className="flex gap-2 mb-6">
                  <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-sm">
                    OVERVIEW
                  </button>
                  <button className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg text-sm font-medium">
                    BOH
                  </button>
                  <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-sm">
                    FOH
                  </button>
                  <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-sm flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    EDGE CASES
                  </button>
                </div>

                {/* Session Details Card */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Home className="w-6 h-6 text-zinc-400" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold text-white">table-96</span>
                        </div>
                        <p className="text-sm text-zinc-400">Test Customer 31</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded text-xs">
                        Staff Hold
                      </span>
                      <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded text-xs">
                        BOH
                      </span>
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">
                        75
                      </div>
                      <button className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs">
                        Reflex
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Customer:</span>
                      <span className="text-white ml-2">Test Customer 31</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Flavor Mix:</span>
                      <span className="text-white ml-2">Mint + Grape</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Table:</span>
                      <span className="text-white ml-2">table-96</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Amount:</span>
                      <span className="text-green-400 ml-2">$30.00</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Current State:</p>
                        <p className="text-sm text-white">Session on hold, awaiting staff action.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Session Notes:</p>
                        <p className="text-sm text-white">Action PAUSE_SESSION executed by MANAGER.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Next Step:</p>
                        <p className="text-sm text-white">BOH claims preparation: begins bowl packing and flavor mixing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      <Zap className="w-4 h-4" />
                      Claim Prep
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Ready
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4" />
                      Light Session
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs">
                      RESUME SESSION
                    </button>
                    <button className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded text-xs">
                      REQUEST REFILL
                    </button>
                    <button className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded text-xs">
                      COMPLETE REFILL
                    </button>
                    <button className="px-3 py-1.5 bg-zinc-700 border border-zinc-600 text-zinc-300 rounded text-xs">
                      CLOSE SESSION
                    </button>
                    <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs">
                      RESOLVE HOLD
                    </button>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Intelligence
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Guest Intelligence Dashboard Preview */}
          <Card className="bg-zinc-900/50 border-zinc-700 mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Guest Intelligence Dashboard</h3>
              </div>
              <p className="text-zinc-400 mb-6">
                AI-powered insights into guest preferences, behavior patterns, and personalized recommendations.
              </p>
              
              {/* Preview Mockup */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Session: demo-session-1</h4>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-1">Trust Score</p>
                      <p className="text-xl font-bold text-purple-400">94%</p>
                      <p className="text-xs text-zinc-500">Excellent</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-1">Loyalty Tier</p>
                      <p className="text-xl font-bold text-green-400">Gold</p>
                      <p className="text-xs text-zinc-500">3x/month</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-1">Avg. Spend</p>
                      <p className="text-xl font-bold text-blue-400">$45.00</p>
                      <p className="text-xs text-zinc-500">Per session</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-1">Preferred Time</p>
                      <p className="text-xl font-bold text-orange-400">Evening</p>
                      <p className="text-xs text-zinc-500">7-10 PM</p>
                    </div>
                  </div>

                  {/* Flavor Preferences */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Flavor Preferences
                    </h5>
                    <div className="space-y-2">
                      {[
                        { name: 'Blue Mist', percentage: 32 },
                        { name: 'Strawberry', percentage: 28 },
                        { name: 'Mango', percentage: 24 },
                        { name: 'Mint', percentage: 16 },
                      ].map((flavor, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-1 bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-teal-400 h-2 rounded-full" 
                              style={{ width: `${flavor.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-300 w-20 text-right">{flavor.name}</span>
                          <span className="text-xs text-zinc-500 w-12">{flavor.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      AI Recommendations
                    </h5>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>Suggest Blue Mist + Mint combo (favorite)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>Offer loyalty upgrade at 95% trust score</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>Prime time: 7-10 PM</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Demo Mode Notice */}
        <div className="mb-8 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium mb-1">Try the Full Experience</p>
              <p className="text-sm text-zinc-400 mb-4">
                Create a demo session below to experience the complete workflow. See how sessions flow from creation to completion, and how guest intelligence helps you deliver personalized service.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/flavor-demo'}
                className="mt-2"
              >
                Try Flavor Demo with Live Tracker
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Create Session Demo Card */}
        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 mb-6">
              <Flame className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Create Your First Session</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Experience how easy it is to manage sessions with Hookah+. Fill out the form below to see the workflow in action.
            </p>
            
            <SimpleFSDDesign 
              sessions={[]}
              userRole="MANAGER"
              onSessionAction={(action, sessionId) => {
                console.log(`Session action: ${action} on ${sessionId}`);
              }}
              isDemoMode={true}
              showOnlyCreateButton={true}
              className="w-full"
            />
          </div>
        </Card>
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
