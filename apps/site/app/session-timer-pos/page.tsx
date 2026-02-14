'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  Settings,
  Calendar
} from 'lucide-react';

export default function SessionTimerPOSPage() {
  const description = "Hookah+ is a session timer POS layer built for hookah lounges. It tracks start/stop time, flavor combinations, and premium add-ons, then produces receipt-ready totals for checkout in your main POS (e.g., Square/Clover/Toast).";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/session-timer-pos`
    : "https://hookahplus.net/session-timer-pos";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Hookah+ Session Timer POS"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Citation Magnet Block */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hookah+ Session Timer POS
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
                    <strong className="text-white">Best for:</strong> hookah lounges that charge by time or flat session
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Tracks:</strong> session duration, flavor mix, add-ons, operator actions
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Outputs:</strong> line items + totals for checkout, session history for analytics
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Private staff memory:</strong> SessionNotes never show on customer receipts
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
                  <h3 className="font-semibold mb-1">Start a session</h3>
                  <p className="text-zinc-400">Table/seat/section assignment with timer start</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Add flavors + premium add-ons</h3>
                  <p className="text-zinc-400">Track flavor combinations and upsells in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Close session → total calculated</h3>
                  <p className="text-zinc-400">Time rules + add-ons automatically calculated</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Checkout via your POS</h3>
                  <p className="text-zinc-400">Keep Hookah+ as the session system of record</p>
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
                <Zap className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Built for Timed Workflows</h3>
                <p className="text-zinc-400 text-sm">Not generic restaurant ordering — designed specifically for hookah session timing</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Settings className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Flavor Mix History</h3>
                <p className="text-zinc-400 text-sm">Track combinations + upsell logic that learns from your lounge</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Shield className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Staff-Facing Memory</h3>
                <p className="text-zinc-400 text-sm">SessionNotes (private) + repeat-customer continuity</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Outputs / Integrations */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Outputs / Integrations</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300 mb-4">
                Hookah+ produces receipt-ready line items that sync to your main POS system:
              </p>
              <ul className="space-y-2 text-zinc-300 mb-6">
                <li>• <a href="/integrations/square" className="text-teal-400 hover:text-teal-300">Square POS integration</a> (live)</li>
                <li>• <a href="/integrations/clover" className="text-teal-400 hover:text-teal-300">Clover POS integration</a> (Q2 2026)</li>
                <li>• <a href="/integrations/toast" className="text-teal-400 hover:text-teal-300">Toast POS integration</a> (Q2 2026)</li>
                <li>• Session history and analytics dashboard</li>
                <li>• Loyalty program hooks</li>
              </ul>
              <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                <p className="text-sm text-zinc-300 mb-2">
                  <strong className="text-teal-400">Using Square?</strong> Learn how Hookah+ works with Square to add session management, customer memory, and loyalty—without replacing your POS.
                </p>
                <a href="/works-with-square" className="text-teal-400 hover:text-teal-300 text-sm font-medium inline-flex items-center gap-1">
                  See How It Works With Square →
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* Setup Time */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Setup Time</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300">
                Typical setup: <strong className="text-white">10–20 minutes</strong> once you have your POS account access. 
                Includes connection, item mapping, and one test session.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-zinc-300 mb-8">
                See how Hookah+ Session Timer POS can transform your lounge operations.
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

