'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
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
  Shield,
  Heart
} from 'lucide-react';

export default function CustomerMemoryPage() {
  const description = "Hookah+ Customer Memory system remembers people, not just points. It captures preferences, behavioral patterns, and staff notes to create lasting customer relationships that drive repeat visits.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/customer-memory`
    : "https://hookahplus.net/customer-memory";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Customer Memory"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Customer Memory
            </h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Key Message */}
            <Card className="p-6 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-500/30 mb-8">
              <p className="text-2xl font-semibold text-center">
                "Loyalty isn't points. It's remembering people."
              </p>
            </Card>

            {/* Key Features */}
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">What Customer Memory Includes</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Flavor Preferences:</strong> Favorite flavors, mix combinations, and flavor history
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Visit History:</strong> Complete session history with timing, spend, and preferences
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Staff Notes:</strong> Private notes about preferences, allergies, service context
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Behavioral Patterns:</strong> Preferred times, table preferences, group size patterns
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Network-Wide:</strong> Memory travels across all Hookah+ network locations
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Customer Memory Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">First Visit</h3>
                  <p className="text-zinc-400">Customer checks in. System creates profile and starts tracking preferences.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Preference Capture</h3>
                  <p className="text-zinc-400">System automatically tracks flavor choices, mix combinations, and session patterns.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Staff Notes</h3>
                  <p className="text-zinc-400">Staff adds private notes (e.g., "Prefers corner table", "Allergic to mint").</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Next Visit</h3>
                  <p className="text-zinc-400">When customer returns, staff instantly sees their profile, preferences, and notes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">5</div>
                <div>
                  <h3 className="font-semibold mb-1">Memory Grows</h3>
                  <p className="text-zinc-400">Each visit adds to the memory. Customer feels remembered and valued.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Why Customer Memory Matters</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Heart className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Customer Belonging</h3>
                <p className="text-zinc-400 text-sm">Customers feel remembered and valued, not like a transaction.</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Repeat Visits</h3>
                <p className="text-zinc-400 text-sm">Remembered customers return more often and spend more.</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Star className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Service Quality</h3>
                <p className="text-zinc-400 text-sm">Staff can provide personalized service based on customer history.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* C.L.A.R.K. System Link */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <h2 className="text-xl font-bold mb-4">Powered by C.L.A.R.K.</h2>
              <p className="text-zinc-300 mb-4">
                Customer Memory is powered by the <strong className="text-white">C.L.A.R.K. (Customer Loyalty And Relationship Knowledge) system</strong>, 
                which provides network-wide customer profiles that work across all Hookah+ locations.
              </p>
              <Link href="/clark-system">
                <Button variant="secondary" className="mt-4">
                  Learn about C.L.A.R.K. System <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Start Remembering Your Customers</h2>
              <p className="text-zinc-300 mb-8">
                See how Customer Memory can help you build lasting relationships that drive repeat visits.
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

