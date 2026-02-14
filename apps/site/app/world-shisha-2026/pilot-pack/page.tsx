'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import PageHero from '../../../components/PageHero';
import { 
  CheckCircle, ArrowRight, Building2, Mail, Phone, MapPin, 
  CreditCard, Users, Calendar, Zap, Check
} from 'lucide-react';
import { trackOnboardingSignupConversion } from '../../../lib/conversionTracking';
import { trackCTA } from '../../../lib/ctaTracking';
import { trackConversion } from '../../../lib/conversionTracking';

export default function WorldShishaPilotPackPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    country: '',
    currentPOS: '',
    numberOfLocations: '1',
    howDidYouHear: '',
    referralCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track page view
  useEffect(() => {
    trackConversion({
      eventName: 'world_shisha_2026_pilot_pack_view',
      eventCategory: 'campaign',
      eventLabel: 'pilot_pack_signup',
      metadata: { campaign: 'world_shisha_2026' }
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.businessName || !formData.ownerName) {
      alert('Please fill in all required fields (Business Name, Owner Name, and Email).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Track conversion
      trackOnboardingSignupConversion({
        campaign: 'world_shisha_2026',
        exhibitor: formData.howDidYouHear || undefined,
        referralCode: formData.referralCode || undefined,
        type: 'pilot_pack'
      });

      // Track CTA
      trackCTA({
        ctaSource: 'website',
        ctaType: 'onboarding_signup',
        component: 'WorldShishaPilotPack',
        campaignId: 'world_shisha_2026',
        data: {
          name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName
        },
        metadata: {
          exhibitor: formData.howDidYouHear || undefined,
          referralCode: formData.referralCode || undefined,
          numberOfLocations: formData.numberOfLocations,
          currentPOS: formData.currentPOS || undefined
        }
      });

      // Submit to API
      const response = await fetch('/api/world-shisha-2026/pilot-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          campaign: 'world_shisha_2026'
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setSubmitted(true);
        trackConversion({
          eventName: 'world_shisha_2026_pilot_pack_signup',
          eventCategory: 'conversion',
          eventLabel: 'pilot_pack_signup',
          metadata: { 
            campaign: 'world_shisha_2026',
            exhibitor: formData.howDidYouHear || undefined
          }
        });
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          window.location.href = '/thank-you/pilot-pack?campaign=world_shisha_2026';
        }, 2000);
      } else {
        throw new Error(responseData.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting pilot pack signup:', error);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get exhibitor options from URL params or default list
  const exhibitorOptions = [
    'Direct referral',
    'World Shisha 2026 website',
    'Social media',
    'Email marketing',
    'Other exhibitor booth',
    'Friend/colleague',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="World Shisha 2026 Pilot Pack"
        subheadline="Get a 60-day pilot to experience Hookah+ in your lounge. Exclusive offer for World Shisha 2026 attendees."
        benefit={{
          value: "60-Day Pilot",
          description: "Full access to session tracking, flavor analytics, loyalty, and QR setup"
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {submitted ? (
          <Card className="bg-green-500/10 border-green-500/30">
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
              <p className="text-zinc-300 mb-6">
                Your Pilot Pack request has been submitted. Our team will contact you within 24 hours 
                to set up your 60-day pilot.
              </p>
              <p className="text-sm text-zinc-400">Redirecting to next steps...</p>
            </div>
          </Card>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">What's Included in Your Pilot Pack</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">1 Lounge Location Setup</h3>
                      <p className="text-sm text-zinc-400">Full configuration for your venue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Session Tracking + Analytics</h3>
                      <p className="text-sm text-zinc-400">Real-time session and flavor analytics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Basic Loyalty Tracking</h3>
                      <p className="text-sm text-zinc-400">Customer retention and loyalty metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">QR Code Setup</h3>
                      <p className="text-sm text-zinc-400">Custom QR codes and integration</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Your lounge name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Your country"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Current POS System (if any)
                    </label>
                    <select
                      name="currentPOS"
                      value={formData.currentPOS}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">Select POS system</option>
                      <option value="square">Square</option>
                      <option value="clover">Clover</option>
                      <option value="toast">Toast</option>
                      <option value="other">Other</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Number of Locations
                    </label>
                    <select
                      name="numberOfLocations"
                      value={formData.numberOfLocations}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="1">1 location</option>
                      <option value="2-5">2-5 locations</option>
                      <option value="6-10">6-10 locations</option>
                      <option value="10+">10+ locations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select source</option>
                    {exhibitorOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Referral Code (if applicable)
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Enter referral code"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full"
                  leftIcon={<Zap className="w-5 h-5" />}
                >
                  {isSubmitting ? 'Submitting...' : 'Get Your Pilot Pack'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

