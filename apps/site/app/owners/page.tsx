'use client';

import React, { useState } from 'react';
import PageHero from '../../components/PageHero';
import ROICalculatorShareable from '../../components/ROICalculatorShareable';
import PreOrderModal from '../../components/PreOrderModal';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Play, CheckCircle, Shield, Clock, Zap, ArrowRight, Mail, Phone, Building2 } from 'lucide-react';
import { trackFounderSignup } from '../../lib/ctaTracking';
import { trackOnboardingSignupConversion } from '../../lib/conversionTracking';

export default function OwnersPage() {
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'trust'>('pro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track founder signup CTA
      await trackFounderSignup(formData, {
        page: '/owners',
        component: 'FounderSignupForm',
        source: 'owners_page'
      });

      // Track conversion
      trackOnboardingSignupConversion({
        email: formData.email,
        name: formData.name,
        source: 'owners_page',
        type: 'founder_signup'
      });

      // Submit to onboarding API
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_demo',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            loungeName: formData.businessName,
            location: formData.location,
            source: 'owners_page',
            type: 'founder_signup'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
      
      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/thank-you/onboarding?source=owners';
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePreOrderClick = (tier: 'starter' | 'pro' | 'trust') => {
    setSelectedTier(tier);
    setShowPreOrderModal(true);
  };

  const guarantees = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Pays for itself in week one',
      description: 'Or we pause billing until it does'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Live in 72 hours',
      description: 'Installation SLA - we guarantee quick setup'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Core plan included',
      description: 'Plus flavor upsell tracking and basic analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Built for Independent Operators"
        subheadline="Hookah+ pays for itself in week one, or we pause billing. Live in 72 hours. Core plan + flavor upsell tracking included."
        benefit={{
          value: '72-Hour SLA',
          description: 'From signup to live operations',
          icon: <Clock className="w-5 h-5 text-teal-400" />
        }}
        primaryCTA={{
          text: 'Pre-Order Now',
          onClick: () => handlePreOrderClick('pro')
        }}
        secondaryCTA={{
          text: 'Calculate Your ROI',
          onClick: () => {
            document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        trustIndicators={[
          { icon: <CheckCircle className="w-4 h-4" />, text: 'Money-back guarantee' },
          { icon: <Shield className="w-4 h-4" />, text: 'Secure payments' },
          { icon: <Clock className="w-4 h-4" />, text: '72-hour setup' }
        ]}
      />

      {/* Video Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">See Hookah+ in Action</h2>
            <p className="text-zinc-400 text-lg">
              Watch how operators streamline operations, boost revenue, and reduce management friction
            </p>
          </div>
          
          <div className="relative aspect-video bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-xl overflow-hidden border border-teal-500/30">
            {!videoPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setVideoPlaying(true)}
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-zinc-300 font-medium">Click to play 30-second demo</p>
                  <p className="text-zinc-500 text-sm mt-2">Hookah+ Platform Overview</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Demo Video</h3>
                  <p className="text-zinc-400 mb-4">
                    Video placeholder - Replace with actual 30-second demo video URL
                  </p>
                  <p className="text-sm text-zinc-500">
                    Add video URL: <code className="bg-zinc-800 px-2 py-1 rounded">/api/video/demo</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Guarantee</h2>
            <p className="text-zinc-400 text-lg">We stand behind our platform with concrete promises</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {guarantees.map((guarantee, index) => (
              <Card key={index} className="p-6 bg-zinc-800/50 border-zinc-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                    {guarantee.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{guarantee.title}</h3>
                    <p className="text-zinc-400 text-sm">{guarantee.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story / About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800 bg-zinc-950/60">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-sm font-semibold tracking-wide text-teal-400 uppercase flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Why I&apos;m Building Hookah+</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Less performing, more conducting
          </h2>
          <div className="space-y-4 text-zinc-300 text-base leading-relaxed">
            <p>
              I&apos;ve always been more drawn to conducting than performing. As a kid in church,
              I wasn&apos;t dreaming about holding the mic—I wanted to be the one guiding the choir,
              watching the whole room, and bringing every voice into the same rhythm. That instinct
              followed me into tech, where I moved into agile coaching and product work, helping
              teams, projects, and portfolios move in sync instead of fighting complexity.
            </p>
            <p>
              Hookah+ is a direct extension of that lens. I see a hookah lounge as a live experience
              to be conducted: staff, sessions, flavors, pricing, and loyalty all working together
              as one coherent flow. I&apos;m building tools that make that visible and manageable in
              real time, so owners get clarity, staff get support, and guests feel the difference.
            </p>
            <p>
              At the core, my work lives where experience, operations, and intelligence meet.
              Whether it&apos;s a busy lounge floor or a digital dashboard, my role is the same as
              it was in that church pew: see the whole, protect the flow, and help every part play
              its role in harmony.
            </p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi-calculator" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ROICalculatorShareable />
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-zinc-800/50 border-zinc-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
              <p className="text-zinc-400">
                Be among the first independent operators to transform your lounge with Hookah+
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Thank you!</h3>
                <p className="text-zinc-400">We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      placeholder="The Oasis Lounge"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    placeholder="City, State"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 text-lg font-semibold"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                </Button>

                <p className="text-xs text-zinc-500 text-center mt-4">
                  By submitting, you agree to receive updates about Hookah+. We respect your privacy.
                </p>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* Pre-Order CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Lounge?</h2>
            <p className="text-zinc-300 mb-8 text-lg">
              Pre-order Hookah+ today and secure your spot. Choose your plan:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Button
                variant="outline"
                className="border-zinc-700 hover:border-teal-500"
                onClick={() => handlePreOrderClick('starter')}
              >
                Starter $79/mo
              </Button>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                onClick={() => handlePreOrderClick('pro')}
              >
                Pro $249/mo
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 hover:border-teal-500"
                onClick={() => handlePreOrderClick('trust')}
              >
                Trust+ $499/mo
              </Button>
            </div>

            <p className="text-sm text-zinc-400">
              Test mode enabled - no real charges. You'll be charged when Hookah+ launches.
            </p>
          </Card>
        </div>
      </section>

      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        tier={selectedTier}
        onSuccess={() => {
          setShowPreOrderModal(false);
          window.location.href = '/thank-you/preorder';
        }}
      />
    </div>
  );
}

