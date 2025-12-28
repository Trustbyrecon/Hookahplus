'use client';

import React from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Link from 'next/link';
import { 
  Heart, 
  CheckCircle, 
  Calendar,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function PreferencesPage() {
  const description = "Hookah+ Preference Tracking automatically captures and remembers customer flavor preferences, mix combinations, and device preferences. Build a complete preference profile that helps you serve customers better.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/preferences`
    : "https://hookahplus.net/preferences";

  return (
    <>
      <SoftwareApplicationSchema 
        name="Preference Tracking"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Preference Tracking</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>

            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-8">
              <h2 className="text-xl font-bold mb-4">What Gets Tracked</h2>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Flavor Preferences:</strong> Favorite flavors and flavor combinations</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Mix History:</strong> Saved flavor mixes and combinations</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Device Preferences:</strong> Preferred hookah devices and heat levels</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Time Patterns:</strong> Preferred visit times and days</div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div><strong className="text-white">Auto-Learning:</strong> System learns preferences automatically from orders</div>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How Preference Tracking Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Automatic Capture', desc: 'System tracks every flavor choice and mix combination' },
                { step: '2', title: 'Pattern Recognition', desc: 'Identifies favorite flavors and recurring combinations' },
                { step: '3', title: 'Profile Building', desc: 'Builds comprehensive preference profile over time' },
                { step: '4', title: 'Smart Suggestions', desc: 'Suggests flavors and mixes based on history' },
                { step: '5', title: 'Personalized Service', desc: 'Staff can see preferences instantly on check-in' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Heart className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Customer Delight</h3>
                <p className="text-zinc-400 text-sm">Customers feel remembered when you know their preferences</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Star className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Faster Service</h3>
                <p className="text-zinc-400 text-sm">Staff can suggest favorites without asking</p>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="font-semibold mb-2">Upsell Opportunities</h3>
                <p className="text-zinc-400 text-sm">Suggest complementary flavors based on history</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-zinc-800/50 border-zinc-700">
              <h2 className="text-xl font-bold mb-4">Part of Customer Memory</h2>
              <p className="text-zinc-300 mb-4">
                Preference Tracking is part of the <Link href="/customer-memory" className="text-teal-400 hover:underline">Customer Memory</Link> system, 
                powered by <Link href="/clark-system" className="text-teal-400 hover:underline">C.L.A.R.K.</Link>
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Track Preferences?</h2>
              <p className="text-zinc-300 mb-8">See how Preference Tracking can help you serve customers better.</p>
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

