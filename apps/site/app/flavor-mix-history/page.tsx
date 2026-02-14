'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function FlavorMixHistoryPage() {
  const description = "Hookah+ Flavor Mix History tracks which flavor combinations guests order, identifies popular pairings, and learns upsell patterns. It helps lounges understand what drives repeat visits and increases average order value.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/flavor-mix-history`
    : "https://hookahplus.net/flavor-mix-history";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Hookah+ Flavor Mix History"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Citation Magnet Block */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hookah+ Flavor Mix History
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Key Facts */}
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">Key Facts</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Tracks:</strong> flavor combinations per session, guest preferences over time, upsell success rates
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Identifies:</strong> popular pairings, premium flavor trends, repeat customer patterns
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Outputs:</strong> mix analytics dashboard, guest preference profiles, upsell recommendations
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Privacy:</strong> guest data is anonymized in aggregate reports; individual preferences stored securely
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Track during session</h3>
                  <p className="text-zinc-400">Staff selects flavors and add-ons; system records combinations in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Build preference profiles</h3>
                  <p className="text-zinc-400">System learns individual guest preferences across visits (if guest opts in)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Analyze patterns</h3>
                  <p className="text-zinc-400">Dashboard shows popular combinations, upsell success rates, and revenue impact</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Recommend upsells</h3>
                  <p className="text-zinc-400">System suggests premium flavors based on what similar guests ordered</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes It Different */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What Makes It Different</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Sparkles className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">AI-Powered Recommendations</h3>
                <p className="text-zinc-400 text-sm">Learns from your lounge's patterns, not generic industry data</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Upsell Intelligence</h3>
                <p className="text-zinc-400 text-sm">Shows which premium flavors actually convert, not just what's popular</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Guest Continuity</h3>
                <p className="text-zinc-400 text-sm">Remembers repeat customers' preferences for personalized service</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Analytics Outputs */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Analytics & Outputs</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300 mb-4">
                Flavor Mix History provides actionable insights:
              </p>
              <ul className="space-y-2 text-zinc-300">
                <li>• Most popular flavor combinations (by session count and revenue)</li>
                <li>• Premium flavor upsell conversion rates</li>
                <li>• Guest preference trends over time</li>
                <li>• Seasonal pattern analysis</li>
                <li>• Staff performance on upsells</li>
                <li>• Revenue impact of flavor recommendations</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Setup Time */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Setup Time</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300">
                Included in <strong className="text-white">Pro and Trust+ plans</strong>. No additional setup required — 
                tracking begins automatically when you start using Hookah+ Session Timer POS.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Understand Your Flavor Data?</h2>
              <p className="text-zinc-300 mb-8">
                See how Flavor Mix History can help you increase upsells and guest satisfaction.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                15 min demo
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

