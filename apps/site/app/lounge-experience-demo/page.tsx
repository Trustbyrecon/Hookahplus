'use client';

import React, { useState } from 'react';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Flame, Brain, Heart, TrendingUp, Users, Clock, 
  Sparkles, Eye, Zap, Shield, ArrowRight, Play,
  QrCode, BarChart3, Settings, HelpCircle
} from 'lucide-react';

export default function LoungeExperienceDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'fire-session' | 'hookah-tracker' | 'intelligence'>('fire-session');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* MOAT Hero Section */}
      <div className="bg-gradient-to-r from-teal-900/20 via-blue-900/20 to-purple-900/20 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-teal-400" />
              <h1 className="text-5xl md:text-6xl font-bold">
                The Ritual of Flow,<br />
                <span className="text-teal-400">Made Measurable</span>
              </h1>
            </div>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto mb-8">
              Hookah+ transforms ordinary lounge sessions into <strong>living data loops</strong> of mood, 
              flavor, loyalty, and trust. Every session becomes a <strong>captured memory</strong> with 
              analytics and emotion stitched together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Emotional Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Memory Fuel</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Trust Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Predictive Insights</span>
              </div>
            </div>
          </div>

          {/* Demo Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={activeDemo === 'fire-session' ? 'primary' : 'outline'}
              onClick={() => setActiveDemo('fire-session')}
              className="flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              Fire Session Operations
            </Button>
            <Button
              variant={activeDemo === 'hookah-tracker' ? 'primary' : 'outline'}
              onClick={() => setActiveDemo('hookah-tracker')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Hookah Tracker
            </Button>
            <Button
              variant={activeDemo === 'intelligence' ? 'primary' : 'outline'}
              onClick={() => setActiveDemo('intelligence')}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Guest Intelligence
            </Button>
          </div>
        </div>
      </div>

      {/* MOAT Architecture Layers */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-teal-500/30">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-semibold mb-2">Experience Layer</h3>
              <p className="text-sm text-zinc-400">
                Intuitive session interface that staff and guests feel synced with
              </p>
            </div>
          </Card>
          
          <Card className="border-blue-500/30">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Trust Layer</h3>
              <p className="text-sm text-zinc-400">
                Reflex Logs capture customer patterns, ensuring continuity and care
              </p>
            </div>
          </Card>
          
          <Card className="border-purple-500/30">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Data Layer</h3>
              <p className="text-sm text-zinc-400">
                Session analytics turn ambient social data into predictive insights
              </p>
            </div>
          </Card>
          
          <Card className="border-green-500/30">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Loyalty Layer</h3>
              <p className="text-sm text-zinc-400">
                Theta+ SessionNotes tie emotional resonance and preference memory
              </p>
            </div>
          </Card>
        </div>

        {/* Active Demo Display */}
        <div className="mb-12">
          {activeDemo === 'fire-session' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">
                Fire Session Operations
              </h2>
              <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
                Real-time session monitoring where every transition becomes a captured moment in the ritual flow
              </p>
              <SimpleFSDDesign 
                sessions={[]}
                userRole="MANAGER"
                onSessionAction={(action, sessionId) => {
                  console.log(`Demo action: ${action} on ${sessionId}`);
                }}
              />
            </div>
          )}
          
          {activeDemo === 'hookah-tracker' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">
                Hookah Tracker
              </h2>
              <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
                The ritual journey from order to table - every step a memory in the making
              </p>
              <div className="max-w-2xl mx-auto bg-zinc-900/50 rounded-lg p-8 border border-zinc-700">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Hookah Tracker</h3>
                  <p className="text-zinc-400">
                    Track your hookah from order to table
                  </p>
                </div>
                
                {/* Simulated Tracker Steps */}
                <div className="space-y-4">
                  {[
                    { step: 'Order Received', status: 'completed', icon: <QrCode className="w-5 h-5" /> },
                    { step: 'Preparing Your Hookah', status: 'active', icon: <Users className="w-5 h-5" /> },
                    { step: 'Heating Up', status: 'pending', icon: <Flame className="w-5 h-5" /> },
                    { step: 'Ready for You!', status: 'pending', icon: <Clock className="w-5 h-5" /> },
                  ].map((trackerStep, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        trackerStep.status === 'completed' 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : trackerStep.status === 'active'
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-zinc-700 bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          trackerStep.status === 'completed' 
                            ? 'bg-green-500/20' 
                            : trackerStep.status === 'active'
                            ? 'bg-orange-500/20'
                            : 'bg-zinc-700'
                        }`}>
                          {trackerStep.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{trackerStep.step}</h4>
                          <p className="text-sm text-zinc-400">
                            {trackerStep.status === 'completed' ? 'Completed' : 
                             trackerStep.status === 'active' ? 'In progress...' : 
                             'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeDemo === 'intelligence' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">
                Guest Intelligence
              </h2>
              <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
                Memory fuel that transforms behavioral patterns into trust and loyalty loops
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-purple-500/30">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Trust Score</h3>
                    <div className="text-3xl font-bold text-purple-400 mb-2">87%</div>
                    <p className="text-sm text-zinc-400">Average across all guests</p>
                  </div>
                </Card>
                
                <Card className="border-teal-500/30">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Flavor Preferences</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mint Fresh</span>
                        <span className="text-zinc-400">34%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Strawberry Kiwi</span>
                        <span className="text-zinc-400">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Watermelon</span>
                        <span className="text-zinc-400">18%</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-green-500/30">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Loyalty Tiers</h3>
                    <div className="space-y-2 text-sm">
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
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* MOAT Narrative */}
        <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-12 border border-purple-500/30">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Memory = Identity = Trust
            </h2>
            <p className="text-xl text-zinc-300 mb-6">
              "Hookah+ is the <strong>ritual of connection, quantified.</strong>"
            </p>
            <p className="text-lg text-zinc-400 mb-8">
              The moat is not the product — it's the memory it protects. Our hospitality-grade 
              ritual intelligence platform ensures that every interaction becomes a captured moment 
              in the trust architecture, making loyalty loops structurally unavoidable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-4xl font-bold text-teal-400 mb-2">Memory</div>
                <p className="text-sm text-zinc-400">Every session becomes data</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">Identity</div>
                <p className="text-sm text-zinc-400">Customer patterns captured</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">Trust</div>
                <p className="text-sm text-zinc-400">Continuity and care ensured</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-xl p-12 border border-teal-500/30">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Protect Your Ritual?
          </h2>
          <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Experience Hookah+ in your lounge. Connect seamlessly with your existing payment system 
            and unlock the power of ritual intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/contact'}
              className="bg-gradient-to-r from-teal-500 to-cyan-500"
            >
              Request Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/sessions'}
            >
              Explore More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

