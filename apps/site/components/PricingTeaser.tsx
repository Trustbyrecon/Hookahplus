'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';
import { Zap, BarChart3, Crown, Building2, ArrowRight, CheckCircle } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$79/mo',
    blurb: '1 venue • sessions + basic analytics',
    icon: <Zap className="w-6 h-6" />,
    color: 'teal',
    features: ['Up to 150 sessions/month', 'Basic analytics', 'QR code generation']
  },
  {
    name: 'Pro',
    price: '$249/mo',
    blurb: '≤3 venues • loyalty pricing • full dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'blue',
    popular: true,
    features: ['Up to 600 sessions/month', 'AI-powered recommendations', 'Loyalty scoring']
  },
  {
    name: 'Trust+',
    price: '$499/mo',
    blurb: '≤7 venues • Reflex scoring • SessionNotes',
    icon: <Crown className="w-6 h-6" />,
    color: 'purple',
    features: ['Up to 1,200 sessions/month', 'Reflex scoring', 'Advanced analytics']
  },
  {
    name: 'Enterprise+',
    price: 'Custom',
    blurb: '8+ venues • API/SDK • white-label',
    icon: <Building2 className="w-6 h-6" />,
    color: 'amber',
    features: ['Unlimited sessions', 'Custom integrations', 'Dedicated support']
  }
];

export default function PricingTeaser() {
  return (
    <section className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, grows when you do
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-2">
            Usage-based auto-upgrade with a grace notice. Works with your existing payment setup.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg mt-4">
            <CheckCircle className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-teal-400">No long-term contracts • Cancel anytime</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative border-2 transition-all ${
                tier.popular
                  ? 'border-teal-500 bg-teal-500/5 scale-105'
                  : 'border-zinc-700 bg-zinc-900/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  tier.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                  tier.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  tier.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-teal-400 mb-2">{tier.price}</div>
                <p className="text-sm text-zinc-400 mb-4">{tier.blurb}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20"
            onClick={() => {
              const demoSection = document.getElementById('demo');
              if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Start 30-day Pilot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-zinc-400 mt-4">
            <a href="/pricing" className="text-teal-400 hover:text-teal-300 underline">
              View full pricing details
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

