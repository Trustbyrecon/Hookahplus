'use client';

import React, { useState } from 'react';
import PageHero from '../../components/PageHero';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Clock, 
  Sparkles, 
  Users, 
  BarChart3, 
  Zap, 
  Target,
  Shield,
  Globe,
  Settings,
  ArrowRight,
  CheckCircle,
  Building,
  Flame,
  FileText,
  Eye,
  EyeOff,
  QrCode,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';

export default function DocsPage() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Hookah+ Product Overview & Integration Docs"
        subheadline="Built for owners, staff, and networks. A software layer that sits on top of your existing POS and workflow, focusing on session time, flavor mixes, and table performance."
        primaryCTA={{
          text: "Book 15-min Demo",
          onClick: () => window.location.href = '/onboarding'
        }}
        secondaryCTA={{
          text: "← Back to Homepage",
          onClick: () => window.location.href = '/'
        }}
        trustIndicators={[
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "Session tracking" },
          { icon: <Sparkles className="w-4 h-4 text-teal-400" />, text: "Flavor intelligence" },
          { icon: <BarChart3 className="w-4 h-4 text-teal-400" />, text: "Performance insights" }
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* What Hookah+ Is */}
        <section className="mb-16">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-teal-400" />
              What Hookah+ Is
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-4">
              Hookah+ is a software layer that sits on top of a lounge's existing POS and workflow. It focuses on session time, flavor mixes, and table performance so owners can increase revenue per seat and staff can run smoother nights.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <Clock className="w-6 h-6 text-teal-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">Session Time</h3>
                <p className="text-sm text-zinc-400">Track and optimize every session</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <Sparkles className="w-6 h-6 text-teal-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">Flavor Mixes</h3>
                <p className="text-sm text-zinc-400">Remember and recommend favorites</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <BarChart3 className="w-6 h-6 text-teal-400 mb-2" />
                <h3 className="font-semibold text-white mb-2">Table Performance</h3>
                <p className="text-sm text-zinc-400">Identify top performers and opportunities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Problems We Solve */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8 text-teal-400" />
            1. Core Problems We Solve
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Untracked Session Time</h3>
                    <p className="text-zinc-300">
                      Timers are manual or inconsistent, which leads to revenue loss and disputes.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Flavor Mix Chaos</h3>
                    <p className="text-zinc-300">
                      Staff forget which mix was served, guests can't easily reorder "the same as last time."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Operational Blind Spots</h3>
                    <p className="text-zinc-300">
                      Managers don't see which tables, zones, or staff are performing best, or where service is slow.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Settings className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Fragmented Tools</h3>
                    <p className="text-zinc-300">
                      POS does payments, but not session timing, hookah-specific notes, or coal / refill tracking.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Main Features */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <Flame className="w-8 h-8 text-teal-400" />
            2. Main Features
          </h2>
          <div className="space-y-4">
            {/* Feature A: Session Tracking & Timers */}
            <Card className="border border-zinc-700">
              <button
                onClick={() => setExpandedFeature(expandedFeature === 'session-tracking' ? null : 'session-tracking')}
                className="w-full text-left"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">A. Session Tracking & Timers</h3>
                        <p className="text-zinc-300">
                          Start/stop timers per table or zone with automatic pricing based on base session price, time used, and premium flavors/add-ons.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-zinc-400 transition-transform ${expandedFeature === 'session-tracking' ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>
              {expandedFeature === 'session-tracking' && (
                <div className="px-6 pb-6 border-t border-zinc-700">
                  <div className="pt-6 space-y-4">
                    <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Key Capabilities:</h4>
                      <ul className="space-y-2 text-zinc-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Start/stop timers per table or zone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Automatic pricing based on base session price</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Time-based extensions and extra rounds</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Premium flavors / add-ons pricing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Alerts for staff when a session is close to ending or has gone overtime</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Feature B: Flavor Mix & Order Builder */}
            <Card className="border border-zinc-700">
              <button
                onClick={() => setExpandedFeature(expandedFeature === 'flavor-mix' ? null : 'flavor-mix')}
                className="w-full text-left"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">B. Flavor Mix & Order Builder</h3>
                        <p className="text-zinc-300">
                          Structured flavor mix builder with saved house mixes and customer favorites. Every order is stored with flavors, base, add-ons, seat/zone, and staff member.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-zinc-400 transition-transform ${expandedFeature === 'flavor-mix' ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>
              {expandedFeature === 'flavor-mix' && (
                <div className="px-6 pb-6 border-t border-zinc-700">
                  <div className="pt-6 space-y-4">
                    <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Key Capabilities:</h4>
                      <ul className="space-y-2 text-zinc-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Structured flavor mix builder (single or multi-flavor)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Save "house mixes" and "customer favorites"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Every order stored with: flavors, base, add-ons, seat/zone, staff member who assembled it</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Feature C: Staff-facing Session Notes */}
            <Card className="border border-zinc-700">
              <button
                onClick={() => setExpandedFeature(expandedFeature === 'session-notes' ? null : 'session-notes')}
                className="w-full text-left"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <EyeOff className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">C. Staff-facing Session Notes (Private Memory)</h3>
                        <p className="text-zinc-300">
                          Internal notes per session and per guest profile. Not visible to guests, but staff see it next time the guest returns.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-zinc-400 transition-transform ${expandedFeature === 'session-notes' ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>
              {expandedFeature === 'session-notes' && (
                <div className="px-6 pb-6 border-t border-zinc-700">
                  <div className="pt-6 space-y-4">
                    <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Key Capabilities:</h4>
                      <ul className="space-y-2 text-zinc-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Internal notes per session and per guest profile</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Track: what they liked / disliked, heat preference, bowl type, service issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Not visible to guests, but staff see it next time the guest returns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Helps turn one-time visitors into loyal regulars</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Feature D: Coal / Service Workflow */}
            <Card className="border border-zinc-700">
              <button
                onClick={() => setExpandedFeature(expandedFeature === 'coal-workflow' ? null : 'coal-workflow')}
                className="w-full text-left"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <Flame className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">D. Coal / Service Workflow</h3>
                        <p className="text-zinc-300">
                          One-tap events for coal refills, changes, and hookah adjustments. Prep bar and floor staff see the queue and who needs attention next.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-zinc-400 transition-transform ${expandedFeature === 'coal-workflow' ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>
              {expandedFeature === 'coal-workflow' && (
                <div className="px-6 pb-6 border-t border-zinc-700">
                  <div className="pt-6 space-y-4">
                    <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Key Capabilities:</h4>
                      <ul className="space-y-2 text-zinc-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>One-tap events: "Coal refill requested", "Coal changed", "Hookah adjustment" (harsh / weak / flavor change)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span>Prep bar and floor staff see the queue and who needs attention next</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Integrations and Market Focus */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <Globe className="w-8 h-8 text-teal-400" />
            3. Integrations and Market Focus
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-zinc-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-400" />
                  Current Focus
                </h3>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Primary market:</strong> US hookah lounges (independent and small chains)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Payments / POS:</strong> Using integrations with systems like Stripe and POS providers (Square, Clover, Toast) as our first wave</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-400" />
                  Design for Global Markets
                </h3>
                <p className="text-zinc-300 mb-4">
                  Hookah+ is built as:
                </p>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Multi-lounge, multi-currency</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Config-driven</strong> (pricing rules, session duration, taxes, tips)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Payment-agnostic</strong> – can connect to different payment providers by country</span>
                  </li>
                </ul>
                <p className="text-zinc-400 text-sm mt-4 italic">
                  Our goal: adapt easily to local regulations and local payment rails in markets like Europe, MENA, CIS, etc.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Example Night Flow */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <Clock className="w-8 h-8 text-teal-400" />
            4. Example Night Flow
          </h2>
          <Card className="border border-zinc-700">
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Guest arrives or scans a QR code</h4>
                    <p className="text-zinc-300">Session is created for a specific table/zone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Staff build a hookah order</h4>
                    <p className="text-zinc-300">Bowl type, flavors, add-ons, special requests.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Hookah is prepared at the bar</h4>
                    <p className="text-zinc-300">Status moves from PENDING → READY → SERVED.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Timer starts</h4>
                    <p className="text-zinc-300">When hookah is delivered and assembled at the table.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Staff handle service events</h4>
                    <p className="text-zinc-300">Refills, extensions, flavor changes with one tap, all tracked.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">At checkout</h4>
                    <p className="text-zinc-300">Hookah+ sends the final amount and item breakdown to the lounge's POS/payment system.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    7
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Session data stored</h4>
                    <p className="text-zinc-300">Time, mix, notes stored for analytics and loyalty.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Why It Matters */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-teal-400" />
            5. Why It Matters for Lounge Owners and Networks
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">For Owners</h3>
                </div>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Better control over session timing and revenue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Clear stats: revenue per table / zone / staff / flavor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Insight into which mixes and promotions actually work</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">For Staff</h3>
                </div>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Less manual tracking and fewer disputes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Clear queue of who needs coal, refills, or support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>Simple interface instead of juggling timers and memory</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="border border-zinc-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <LinkIcon className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">For Networks / Partners</h3>
                </div>
                <p className="text-zinc-300 mb-3">
                  Potential to connect search + discovery with pre-booked sessions:
                </p>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>A guest finds a lounge on your platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>They pre-book or pre-order a session via Hookah+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>The lounge gets a higher-quality, better-tracked visit</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* Optional: Pilot & Collaboration */}
        <section className="mb-16">
          <Card className="border border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Pilot & Collaboration</h2>
              <p className="text-zinc-300 mb-6">
                If this seems relevant for your events or partner lounges, we'd love to explore a pilot with a few of your locations so we can adapt Hookah+ to your region's needs as well.
              </p>
              <p className="text-zinc-300 mb-6">
                We're especially interested in how we could connect discovery platforms with Hookah+ pre-orders and session tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/contact'}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/docs/technical'}
                  className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                >
                  View Technical Docs
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
