'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  TrendingUp,
  Smartphone,
  Building2,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function POSWaitlistPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    currentPOS: '',
    businessType: 'hookah_lounge',
    estimatedRevenue: '',
    painPoints: [] as string[],
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const painPointOptions = [
    'High transaction fees',
    'Slow order processing',
    'No inventory management',
    'Poor customer support',
    'Limited customization',
    'Outdated interface',
    'Integration difficulties',
    'Reporting limitations'
  ];

  const businessTypes = [
    { value: 'hookah_lounge', label: 'Hookah Lounge' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'bar', label: 'Bar' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePainPointToggle = (point: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(point)
        ? prev.painPoints.filter(p => p !== point)
        : [...prev.painPoints, point]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/pos-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'public_landing',
          selectedTier: 'pos_integration',
          interest: 'pos_integration',
          timestamp: Date.now(),
          contactType: 'waitlist_signup',
          data: formData
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          businessName: '',
          ownerName: '',
          email: '',
          phone: '',
          location: '',
          currentPOS: '',
          businessType: 'hookah_lounge',
          estimatedRevenue: '',
          painPoints: [],
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('POS waitlist signup failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">POS Integration Waitlist</h1>
              <p className="text-zinc-400 mt-2">Join the future of hookah lounge operations</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="w-4 h-4" />
              <span>Phase 3 Launch</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 font-medium">Coming Soon</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Seamless POS Integration
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              for Hookah Lounges
            </span>
          </h2>
          
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            Connect your existing POS system with Hookah+ for unified operations, 
            real-time analytics, and streamlined workflows. Be among the first to experience 
            the future of hookah lounge management.
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <CreditCard className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unified Payments</h3>
              <p className="text-zinc-400">Seamlessly integrate with Square, Clover, Toast, and Stripe</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-zinc-400">Get instant insights into revenue, sessions, and operations</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
              <Shield className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-zinc-400">Bank-grade security with PCI compliance and data protection</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Join the Waitlist</h3>
            
            {submitStatus === 'success' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Successfully added to waitlist!</span>
                </div>
                <p className="text-green-300 text-sm mt-2">
                  Our sales team will contact you within 24 hours to discuss your POS integration needs.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Submission failed</span>
                </div>
                <p className="text-red-300 text-sm mt-2">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Your lounge name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="owner@business.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="City, State"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Current POS System
                  </label>
                  <select
                    value={formData.currentPOS}
                    onChange={(e) => handleInputChange('currentPOS', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select your current POS</option>
                    <option value="square">Square</option>
                    <option value="clover">Clover</option>
                    <option value="toast">Toast</option>
                    <option value="stripe">Stripe</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Estimated Annual Revenue
                </label>
                <select
                  value={formData.estimatedRevenue}
                  onChange={(e) => handleInputChange('estimatedRevenue', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Select revenue range</option>
                  <option value="under_100k">Under $100K</option>
                  <option value="100k_250k">$100K - $250K</option>
                  <option value="250k_500k">$250K - $500K</option>
                  <option value="500k_1m">$500K - $1M</option>
                  <option value="over_1m">Over $1M</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Current Pain Points (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {painPointOptions.map(point => (
                    <label key={point} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.painPoints.includes(point)}
                        onChange={() => handlePainPointToggle(point)}
                        className="w-4 h-4 text-teal-600 bg-zinc-900 border-zinc-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-zinc-300">{point}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Additional Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining Waitlist...
                  </>
                ) : (
                  <>
                    Join POS Integration Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Benefits & Timeline */}
          <div className="space-y-8">
            {/* What You Get */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">What You Get</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Priority Access</h4>
                    <p className="text-zinc-400 text-sm">Be first in line when POS integration launches</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Dedicated Support</h4>
                    <p className="text-zinc-400 text-sm">Personal onboarding and migration assistance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Early Bird Pricing</h4>
                    <p className="text-zinc-400 text-sm">Exclusive discounts for waitlist members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Beta Testing</h4>
                    <p className="text-zinc-400 text-sm">Help shape the product with early access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Launch Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Phase 1: Square Integration</h4>
                    <p className="text-zinc-400 text-sm">Q1 2024 - Square POS integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Phase 2: Clover Integration</h4>
                    <p className="text-zinc-400 text-sm">Q2 2024 - Clover POS integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Phase 3: Full Launch</h4>
                    <p className="text-zinc-400 text-sm">Q3 2024 - All POS systems supported</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Questions?</h3>
              <p className="text-zinc-300 mb-4">
                Our team is here to help you understand how POS integration can transform your hookah lounge operations.
              </p>
              <div className="flex items-center gap-2 text-teal-400">
                <Mail className="w-4 h-4" />
                <span>pos-integration@hookahplus.net</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
