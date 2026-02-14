'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';
import { Zap, BarChart3, Crown, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { trackOnboardingSignup } from '../lib/ctaTracking';

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
    blurb: '≤3 venues • agent-ready reservations • full dashboard',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'blue',
    popular: true,
    features: ['Up to 600 sessions/month', 'AI-powered recommendations', 'Loyalty scoring']
  },
  {
    name: 'Trust+',
    price: '$499/mo',
    blurb: '≤7 venues • Multi-location • Advanced API',
    icon: <Crown className="w-6 h-6" />,
    color: 'purple',
    features: ['Unlimited sessions', 'Multi-location management', 'Advanced API access']
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
        <div className="text-center mb-12" id="pricing">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple pricing for serious lounges
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-2">
            Starter, Pro, and Lounge Network options — built for any volume of sessions.
          </p>
          <p className="text-sm text-teal-400/90 max-w-xl mx-auto mb-4">
            Plus 0.7% on hookah GMV when you run payments through Hookah+ (Stripe). We grow with your volume.
          </p>
        </div>

        {/* Simplified 3-tier layout - reduced cognitive load */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          {tiers.slice(0, 3).map((tier) => (
            <Card
              key={tier.name}
              className={`relative border-2 transition-all ${
                tier.popular
                  ? 'border-teal-500 bg-teal-500/5'
                  : 'border-zinc-700 bg-zinc-900/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  tier.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                  tier.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                <div className="text-2xl font-bold text-teal-400 mb-2">{tier.price}</div>
                <p className="text-xs text-zinc-400 mb-4">{tier.blurb}</p>
                <ul className="space-y-1.5 mb-6">
                  {tier.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Enterprise tier - separate, less prominent */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="border border-zinc-700 bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{tiers[3].name}</div>
                  <div className="text-xs text-zinc-400">{tiers[3].blurb}</div>
                </div>
              </div>
              <a 
                href="/pricing" 
                className="text-xs text-teal-400 hover:text-teal-300 underline"
              >
                Learn more
              </a>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
            onClick={() => window.location.href = '/pricing'}
          >
            See Pricing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

