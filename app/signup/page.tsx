'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    id: 'starter',
    name: 'Hookah+ Starter',
    price: '$99',
    period: '/month',
    description: '1 lounge | Timer, QR payments, basic flavor mix log, text receipts. QR Bill Pay included.',
    features: [
      '1 lounge location',
      'Session timer & management',
      'QR code payments',
      'Basic flavor mix logging',
      'Text message receipts',
      'QR Bill Pay included'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Hookah+ Pro',
    price: '$249',
    period: '/month',
    description: 'Up to 3 lounges | Loyalty pricing, analytics dashboard, premium flavor detection, YAML config. Includes Flavor AI Recommender.',
    features: [
      'Up to 3 lounge locations',
      'Loyalty pricing system',
      'Analytics dashboard',
      'Premium flavor detection',
      'YAML configuration',
      'Flavor AI Recommender',
      'QR Bill Pay included'
    ],
    popular: true
  },
  {
    id: 'trust_plus',
    name: 'Hookah+ Trust+',
    price: '$499',
    period: '/month',
    description: 'Up to 7 lounges | Reflex scoring, SessionNotes memory, dynamic margin logic, priority support. Includes Flavor AI + Session Replay Heatmap.',
    features: [
      'Up to 7 lounge locations',
      'Reflex scoring system',
      'SessionNotes memory',
      'Dynamic margin logic',
      'Priority support',
      'Flavor AI Recommender',
      'Session Replay Heatmap',
      'QR Bill Pay included'
    ],
    popular: false
  }
];

export default function SignupPage() {
  const [selectedTier, setSelectedTier] = useState('pro');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Track signup attempt
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('Signup Started', { props: { tier: selectedTier } });
      }
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sign_up', { method: selectedTier });
      }

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const { url } = await response.json();
      
      // Track successful signup
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('Signup Success', { props: { tier: selectedTier } });
      }
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sign_up_success', { method: selectedTier });
      }

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      console.error('Signup error:', err);
      
      // Track signup error
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('Signup Error', { props: { tier: selectedTier, error: err.message } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Choose Your <span className="text-purple-400">Hookah+</span> Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your hookah lounge with AI-powered management, analytics, and customer insights.
              Start with what you need, scale as you grow.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  tier.popular 
                    ? 'border-purple-400 shadow-2xl shadow-purple-500/25' 
                    : 'border-white/20 hover:border-purple-300/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-purple-400">{tier.price}</span>
                    <span className="text-gray-400 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-300 mt-3 text-sm">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    selectedTier === tier.id
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Signup Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Complete Your Signup
            </h2>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? 'Creating Subscription...' : `Start ${tiers.find(t => t.id === selectedTier)?.name}`}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Need a custom plan for 8+ lounges?{' '}
                <a href="/contact" className="text-purple-400 hover:text-purple-300 underline">
                  Contact us for Enterprise pricing
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
