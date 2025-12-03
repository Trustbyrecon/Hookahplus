'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import PageHero from '../../components/PageHero';
import ROICalculator from '../../components/ROICalculator';
import { 
  CheckCircle, 
  X, 
  Zap, 
  Crown, 
  Shield, 
  BarChart3,
  Users,
  Settings,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  DollarSign,
  Info
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [hoveredAddon, setHoveredAddon] = useState<number | null>(null);

  const subscriptionTiers = [
    {
      name: 'Starter',
      price: {
        monthly: 79,
        annual: 790
      },
      description: 'Perfect for mobile hookah operators and small lounges',
      icon: <Zap className="w-6 h-6" />,
      color: 'teal',
      autoUpgradeTrigger: '> 150 active sessions per month OR > 1 lounge/pop-up location activated',
      nextTier: 'Pro ($249)',
      upgradeNote: 'Keeps operations seamless; user notified with 3-day grace period',
      features: [
        'Up to 150 sessions/month',
        '1 lounge or pop-up location',
        'Perfect for mobile operators',
        'Basic session management',
        'QR code generation',
        'Email support',
        'Mobile dashboard access',
        'Basic analytics'
      ],
      limitations: [
        'No advanced AI features',
        'Limited customization',
        'No priority support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: {
        monthly: 249,
        annual: 2490
      },
      description: 'For growing lounges that need advanced features',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'blue',
      autoUpgradeTrigger: '> 3 lounges or > 600 sessions per month',
      nextTier: 'Trust+ ($499)',
      upgradeNote: 'Adds loyalty scoring + staff memory',
      features: [
        'Up to 600 sessions/month',
        'Up to 3 lounges',
        'Advanced session management',
        'AI-powered flavor recommendations',
        'Loyalty scoring system',
        'Staff memory & tracking',
        'Priority email support',
        'Custom branding',
        'Advanced analytics & reporting',
        'Staff management tools',
        'Real-time notifications'
      ],
      limitations: [
        'No white-label option',
        'Standard API access'
      ],
      popular: true
    },
    {
      name: 'Trust+',
      price: {
        monthly: 499,
        annual: 4990
      },
      description: 'For large operations requiring custom solutions',
      icon: <Crown className="w-6 h-6" />,
      color: 'purple',
      autoUpgradeTrigger: '> 7 lounges or > 1,200 sessions per month',
      nextTier: 'Enterprise+ (Custom)',
      upgradeNote: 'Switches to multi-location cloud scaling + custom support',
      features: [
        'Unlimited sessions',
        'Up to 7 lounges',
        'Everything in Pro',
        'Multi-location cloud scaling',
        'Custom support channels',
        'Advanced API access',
        'Multi-location management',
        'Custom reporting & dashboards',
        'Dedicated account manager',
        'SLA guarantee'
      ],
      limitations: [],
      popular: false
    }
  ];

  const addOns = [
    {
      name: 'Flavor Intelligence',
      price: {
        monthly: 29,
        annual: 290
      },
      description: 'AI-powered flavor preference learning and recommendations',
      icon: <Sparkles className="w-5 h-5" />,
      highValueFeature: 'Guest preference tracking',
      hoverText: 'Track individual guest preferences across sessions to personalize recommendations and increase repeat visits. Understand which flavor combinations drive loyalty.',
      features: [
        'Guest preference tracking',
        'Smart flavor pairings',
        'Personalized recommendations',
        'Trend analysis'
      ]
    },
    {
      name: 'Advanced Analytics',
      price: {
        monthly: 49,
        annual: 490
      },
      description: 'Deep dive into performance metrics and insights',
      icon: <TrendingUp className="w-5 h-5" />,
      highValueFeature: 'Revenue forecasting',
      hoverText: 'Predict future revenue trends based on historical data and seasonal patterns. Make data-driven decisions about staffing, inventory, and pricing strategies.',
      features: [
        'Revenue forecasting',
        'Customer behavior analysis',
        'Peak hour optimization',
        'Custom reports'
      ]
    },
    {
      name: 'Staff Performance Suite',
      price: {
        monthly: 39,
        annual: 390
      },
      description: 'Comprehensive staff management and performance tracking',
      icon: <Users className="w-5 h-5" />,
      highValueFeature: 'Task assignment & tracking',
      hoverText: 'Automatically assign tasks to staff based on workload and expertise. Track completion rates and identify bottlenecks in real-time for optimal efficiency.',
      features: [
        'Performance dashboards',
        'Task assignment & tracking',
        'Schedule optimization',
        'Staff analytics'
      ]
    },
    {
      name: 'Custom Integrations',
      price: {
        monthly: 99,
        annual: 990
      },
      description: 'Seamless integration with your existing POS and systems',
      icon: <Settings className="w-5 h-5" />,
      highValueFeature: 'POS system integration',
      hoverText: 'Connect Hookah+ directly to your existing payment system for seamless transaction flow and unified reporting. Works with major payment providers.',
      features: [
        'POS system integration',
        'Accounting software sync',
        'Custom API development',
        'Dedicated integration support'
      ]
    },
    {
      name: 'Priority Support',
      price: {
        monthly: 79,
        annual: 790
      },
      description: 'Fast-track support with guaranteed response times',
      icon: <Shield className="w-5 h-5" />,
      highValueFeature: '2-hour response guarantee',
      hoverText: 'Get urgent issues resolved within 2 hours with dedicated phone support and priority bug fixes. Minimize downtime and keep operations running smoothly.',
      features: [
        '2-hour response guarantee',
        'Phone support access',
        'Dedicated support channel',
        'Priority bug fixes'
      ]
    }
  ];

  const getPrice = (prices: { monthly: number; annual: number }) => {
    return billingCycle === 'monthly' ? prices.monthly : prices.annual;
  };

  const getSavings = (monthlyPrice: number) => {
    return Math.round((monthlyPrice * 12 - monthlyPrice * 10) / (monthlyPrice * 12) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Simple pricing that grows with you"
        subheadline="Auto-upgrade when you're ready, 3-day grace notice"
        benefit={{
          value: "No long-term contracts, cancel anytime",
          description: "Pricing adapts automatically based on usage — Reflex Upgrade"
        }}
        trustIndicators={[
          { icon: <CheckCircle className="w-4 h-4 text-teal-400" />, text: "Cancel anytime" },
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "3-day grace period" },
          { icon: <TrendingUp className="w-4 h-4 text-teal-400" />, text: "Auto-upgrade when ready" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Simplified Billing Cycle Toggle - less prominent */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              billingCycle === 'annual'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
              Save 17%
            </span>
          </button>
        </div>

        {/* ROI Calculator Section */}
        <ROICalculator />

        {/* How It Works - Adaptive Learning Phase */}
        <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            How It Works (Adaptive Learning Flow)
          </h2>
          
          <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-zinc-300 mb-4">
              Hookah+ starts learning your lounge rhythm in just 3 days — but every lounge has its own pulse. 
              The system keeps observing your busiest and slowest days over a few weeks. Within a month, it knows 
              your true flow — how guests arrive, order, and linger — and starts refining prices, loyalty perks, 
              and staff timing automatically.
            </p>
            <p className="text-zinc-300 font-semibold text-center mt-4">
              Think of it as training your digital manager to read your vibe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-teal-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold mb-2">Phase 1: Quick Calibration</h3>
              <p className="text-xs text-zinc-400">3 days initial onboarding — quick insights, visible impact</p>
            </div>
            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold mb-2">Phase 2: Auto-Expansion</h3>
              <p className="text-xs text-zinc-400">Expands to 2 weeks if daily variance exceeds ±15%</p>
            </div>
            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold mb-2">Phase 3: Trust Stabilization</h3>
              <p className="text-xs text-zinc-400">Full 30-day reflection once stable trust feedback cycles detected</p>
            </div>
          </div>
        </div>

        {/* Simplified Subscription Tiers - reduced cognitive load */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {subscriptionTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${
                  tier.popular
                    ? 'border-2 border-blue-500 bg-blue-500/5'
                    : 'border border-zinc-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className={`w-12 h-12 bg-${tier.color}-500/20 rounded-lg flex items-center justify-center mb-4 text-${tier.color}-400`}>
                    {tier.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{tier.description}</p>
                  
                  {/* Simplified Auto-Upgrade Info - collapsed by default */}
                  <details className="mb-4">
                    <summary className="text-xs text-teal-400 cursor-pointer hover:text-teal-300 mb-2">
                      Auto-upgrade info
                    </summary>
                    <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 text-xs">
                      <div className="text-zinc-300 mb-1">{tier.autoUpgradeTrigger}</div>
                      <div className="text-zinc-400 mt-1">
                        <span className="font-medium">Next:</span> {tier.nextTier}
                      </div>
                    </div>
                  </details>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${getPrice(tier.price)}</span>
                    <span className="text-zinc-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-green-400 mt-1">
                        Save ${tier.price.monthly * 12 - tier.price.annual}/year
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant={tier.popular ? 'primary' : 'outline'}
                    className="w-full mb-6"
                    onClick={() => window.location.href = '/onboarding'}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  {/* Simplified features list - show top 5, rest in details */}
                  <div className="space-y-2">
                    {tier.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-zinc-300">{feature}</span>
                      </div>
                    ))}
                    {tier.features.length > 5 && (
                      <details className="mt-2">
                        <summary className="text-xs text-teal-400 cursor-pointer hover:text-teal-300">
                          +{tier.features.length - 5} more features
                        </summary>
                        <div className="mt-2 space-y-1">
                          {tier.features.slice(5).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-zinc-400">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {tier.limitations.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-zinc-500 cursor-pointer">
                          Limitations
                        </summary>
                        <div className="mt-2 space-y-1">
                          {tier.limitations.map((limitation, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <X className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-zinc-500">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Simplified Add-ons - collapsed by default to reduce cognitive load */}
        <div className="mb-16">
          <details className="max-w-4xl mx-auto">
            <summary className="text-2xl font-bold text-center mb-8 cursor-pointer hover:text-teal-400 transition-colors">
              Optional Add-ons
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {addOns.map((addon, index) => (
              <Card 
                key={index} 
                className="border border-zinc-700 hover:border-teal-500/50 transition-colors relative"
                onMouseEnter={() => setHoveredAddon(index)}
                onMouseLeave={() => setHoveredAddon(null)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
                      {addon.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{addon.name}</h3>
                      <div className="text-sm">
                        <span className="font-bold">${getPrice(addon.price)}</span>
                        <span className="text-zinc-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-4">{addon.description}</p>
                  
                  {/* High Value Feature Highlight */}
                  {hoveredAddon === index && (
                    <div className="mb-4 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-teal-400 mb-1">
                            High Value: {addon.highValueFeature}
                          </div>
                          <div className="text-xs text-zinc-300">
                            {addon.hoverText}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {addon.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className={`text-xs ${feature === addon.highValueFeature ? 'text-teal-400 font-semibold' : 'text-zinc-300'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Add to Plan
                  </Button>
                </div>
              </Card>
            ))}
            </div>
          </details>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-zinc-900/50 rounded-xl p-8 border border-teal-500/20">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
            Start with a free trial, no credit card required. See how Hookah+ can transform your lounge operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/onboarding'}
            >
              Start Operator Onboarding
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

