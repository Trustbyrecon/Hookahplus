'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Brain, 
  CheckCircle, 
  ArrowRight,
  Users,
  Lock,
  Star,
  Calendar,
  Database,
  Network,
  Shield
} from 'lucide-react';

export default function ClarkSystemPage() {
  const description = "C.L.A.R.K. (Customer Loyalty And Relationship Knowledge) is Hookah+'s customer memory system that remembers people, not just points. It captures preferences, behavioral patterns, and staff notes to create a complete customer profile that travels across your network.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/clark-system`
    : "https://hookahplus.net/clark-system";

  return (
    <>
      <SoftwareApplicationSchema 
        name="C.L.A.R.K. System"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              C.L.A.R.K. System
            </h1>
            <p className="text-xl text-zinc-300 mb-4">
              Customer Loyalty And Relationship Knowledge
            </p>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Key Facts */}
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">What C.L.A.R.K. Does</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Customer Profiles:</strong> Complete customer identity with preferences, history, and behavioral patterns
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Network-Wide Memory:</strong> Customer profiles travel across all Hookah+ network locations
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Preference Tracking:</strong> Flavor preferences, device preferences, and mix history
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Staff Notes:</strong> Private staff-facing notes that never appear on receipts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Badge System:</strong> Network-wide and lounge-specific badges for customer achievements
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How C.L.A.R.K. Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Customer Check-In</h3>
                  <p className="text-zinc-400">When a customer arrives, staff scans QR code or enters phone number. C.L.A.R.K. instantly loads their profile.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Profile Display</h3>
                  <p className="text-zinc-400">Staff sees customer's preferences, last visit, favorite flavors, and any staff notes from previous visits.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Session Tracking</h3>
                  <p className="text-zinc-400">During the session, C.L.A.R.K. tracks flavor choices, duration, and behavioral patterns.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Memory Update</h3>
                  <p className="text-zinc-400">After session, preferences are updated, badges are evaluated, and notes are saved for next visit.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">5</div>
                <div>
                  <h3 className="font-semibold mb-1">Network Sync</h3>
                  <p className="text-zinc-400">Profile data syncs across the Hookah+ network, so customer is remembered at any location.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C.L.A.R.K. Components */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">C.L.A.R.K. Components</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Brain className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Customer Profiles</h3>
                <p className="text-zinc-400 text-sm mb-3">Complete customer identity with network-wide HID (Hookah+ ID) that works across all locations.</p>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Portable customer ID</li>
                  <li>• Cross-lounge memory</li>
                  <li>• Privacy-first design</li>
                </ul>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Database className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Preference Tracking</h3>
                <p className="text-zinc-400 text-sm mb-3">Tracks flavor preferences, mix history, and device preferences automatically.</p>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Flavor history</li>
                  <li>• Mix combinations</li>
                  <li>• Device preferences</li>
                </ul>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Lock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Staff Notes</h3>
                <p className="text-zinc-400 text-sm mb-3">Private staff-facing notes that help remember customer preferences and service context.</p>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Lounge-only notes</li>
                  <li>• Network-shareable notes</li>
                  <li>• Never on receipts</li>
                </ul>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Network className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Badge System</h3>
                <p className="text-zinc-400 text-sm mb-3">Network-wide and lounge-specific badges that customers earn across the Hookah+ network.</p>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Explorer badge (3+ locations)</li>
                  <li>• Mix Master badge</li>
                  <li>• Loyalist badge</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Network-Wide Memory */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Network-Wide Memory</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-300 mb-4">
                C.L.A.R.K. uses the <strong className="text-white">Hookah+ Network Identity Layer</strong> to create portable customer profiles that work across all Hookah+ locations, regardless of POS system.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-teal-400">
                    <Shield className="w-5 h-5" />
                    POS Agnostic
                  </h3>
                  <p className="text-zinc-400 text-sm">Works with Square, Toast, Clover, and any POS system. Customer memory lives above the POS.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-teal-400">
                    <Network className="w-5 h-5" />
                    Cross-Lounge
                  </h3>
                  <p className="text-zinc-400 text-sm">Customer visits Lounge A, then Lounge B. Staff at Lounge B sees their preferences instantly.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Privacy & Consent */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Privacy & Consent</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300">Shadow Profile</h3>
                  <p className="text-zinc-400 text-sm">Default state. Profile exists but customer hasn't claimed it yet.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300">Claimed Profile</h3>
                  <p className="text-zinc-400 text-sm">Customer verified their identity. Profile is active.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300">Network Shared</h3>
                  <p className="text-zinc-400 text-sm">Customer explicitly opted in to network-wide sharing.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Remember Your Customers?</h2>
              <p className="text-zinc-300 mb-8">
                See how C.L.A.R.K. can help you build lasting customer relationships through memory, not just points.
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

