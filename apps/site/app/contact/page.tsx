'use client';

import React, { useState } from 'react';
import { trackContactFormConversion } from '../../lib/conversionTracking';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Building,
  Users,
  CreditCard,
  Calendar,
  MessageSquare,
  Star,
  Zap,
  Info
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one social media link
    if (!formData.instagramUrl && !formData.facebookUrl && !formData.websiteUrl) {
      alert('Please provide at least one social media link (Instagram, Facebook, or Website).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_demo',
          data: {
            instagramUrl: formData.instagramUrl,
            facebookUrl: formData.facebookUrl,
            websiteUrl: formData.websiteUrl,
            businessName: 'From Social Media', // Will be extracted from social media
            source: 'website'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit request' }));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const result = await response.json();
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Track conversion
      trackContactFormConversion({
        email: formData.instagramUrl || formData.facebookUrl || formData.websiteUrl,
        name: 'Social Media Lead'
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ instagramUrl: '', facebookUrl: '', websiteUrl: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      alert(`Failed to submit request: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const pricingModels = [
    {
      id: 'time-based',
      name: 'Time-Based Pricing',
      description: 'Pay per minute of session time',
      features: ['Flexible pricing', 'Real-time tracking', 'Automatic billing'],
      recommended: true
    },
    {
      id: 'flat-rate',
      name: 'Flat Rate Pricing',
      description: 'Fixed price per session',
      features: ['Simple pricing', 'Predictable costs', 'Easy management'],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Get Your Demo Link
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            Share your social media links and we'll create a personalized demo for your lounge. We'll extract information from your Instagram, Facebook, or website to customize your experience.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
                <p className="text-zinc-300 mb-2">
                  We've received your social media links and will create a personalized demo for you.
                </p>
                <p className="text-zinc-400 text-sm">
                  Our team will review your information and send you a test link within 24-48 hours.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Share Your Social Media</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                      placeholder="https://instagram.com/yourlounge"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                      placeholder="https://facebook.com/yourlounge"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                      placeholder="https://yourlounge.com"
                    />
                  </div>

                  <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-zinc-300">
                        <p className="font-medium text-white mb-1">What happens next?</p>
                        <ul className="space-y-1 text-zinc-400">
                          <li>• We'll extract business information from your social media</li>
                          <li>• Create a personalized demo link for your lounge</li>
                          <li>• Send you the test link via Instagram DM or email</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-zinc-600 disabled:to-zinc-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating your demo...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Get My Demo Link</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
