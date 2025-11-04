'use client';

import React from 'react';
import { X, Brain, TrendingUp, Star, Users, Clock, Flame, Heart, Shield, Zap } from 'lucide-react';
import Card from './Card';

interface GuestIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export default function GuestIntelligenceModal({ isOpen, onClose, sessionId = 'demo-session-001' }: GuestIntelligenceModalProps) {
  if (!isOpen) return null;

  const intelligenceData = {
    sessionId,
    trustScore: 94,
    flavorPreferences: [
      { name: 'Blue Mist', percentage: 32 },
      { name: 'Strawberry', percentage: 28 },
      { name: 'Mango', percentage: 24 },
      { name: 'Mint', percentage: 16 },
    ],
    loyaltyTier: 'Gold',
    visitFrequency: '3x/month',
    averageSpend: '$45.00',
    preferredTime: 'Evening (7-10 PM)',
    sessionHistory: [
      { date: '2024-11-01', duration: '45 min', rating: 5, flavors: ['Blue Mist', 'Mint'] },
      { date: '2024-10-28', duration: '60 min', rating: 5, flavors: ['Strawberry', 'Mango'] },
      { date: '2024-10-20', duration: '45 min', rating: 4, flavors: ['Blue Mist'] },
    ],
    behaviorPatterns: {
      arrivalTime: 'Consistent (within 15 min window)',
      groupSize: '2-3 people',
      sessionExtension: '30% rate',
      refillRequests: 'Average 1 per session',
    },
    recommendations: [
      'Suggest Blue Mist + Mint combo (favorite)',
      'Offer loyalty upgrade at 95% trust score',
      'Prime time: 7-10 PM',
      'Group bookings: Recommend table for 3',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Guest Intelligence Dashboard</h2>
              <p className="text-zinc-400 text-sm">Session: {sessionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-300">Trust Score</h3>
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{intelligenceData.trustScore}%</div>
                <div className="text-xs text-zinc-400">Excellent</div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-green-300">Loyalty Tier</h3>
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{intelligenceData.loyaltyTier}</div>
                <div className="text-xs text-zinc-400">{intelligenceData.visitFrequency}</div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-300">Avg. Spend</h3>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{intelligenceData.averageSpend}</div>
                <div className="text-xs text-zinc-400">Per session</div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-orange-300">Preferred Time</h3>
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-lg font-bold text-white mb-1">{intelligenceData.preferredTime}</div>
                <div className="text-xs text-zinc-400">Peak hours</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Flavor Preferences */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Flavor Preferences
                </h3>
                <div className="space-y-3">
                  {intelligenceData.flavorPreferences.map((flavor, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-300">{flavor.name}</span>
                        <span className="text-teal-400 font-semibold">{flavor.percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${flavor.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Session History */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {intelligenceData.sessionHistory.map((session, index) => (
                    <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-medium">{session.date}</div>
                          <div className="text-xs text-zinc-400">{session.duration}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(session.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {session.flavors.map((flavor, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded"
                          >
                            {flavor}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Behavior Patterns & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Behavior Patterns
                </h3>
                <div className="space-y-3">
                  {Object.entries(intelligenceData.behaviorPatterns).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded">
                      <span className="text-zinc-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  AI Recommendations
                </h3>
                <div className="space-y-2">
                  {intelligenceData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-zinc-800/50 rounded">
                      <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

