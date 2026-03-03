'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { CheckCircle, Mail, Settings, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function ThankYouOnboardingPage() {
  useEffect(() => {
    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'onboarding_signup_completed', {
        event_category: 'conversion',
        event_label: 'onboarding_signup',
        value: 1
      });
    }

    // Track Meta Pixel conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'CompleteRegistration', {
        content_name: 'Onboarding Signup',
        content_category: 'Onboarding'
      });
    }

    // Track LinkedIn Insight Tag conversion
    if (typeof window !== 'undefined' && (window as any).lintrk) {
      (window as any).lintrk('track', { conversion_id: 'onboarding_signup' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Welcome to Hookah+!"
        subheadline="Your onboarding information has been received. We'll review your details and get you set up with your 30-day pilot."
        benefit={{
          value: "30-Day Pilot",
          description: "Full access, no commitment",
          icon: <Settings className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What Happens Next?</h3>
              <p className="text-zinc-300">
                Our team will review your onboarding information and contact you within 24 hours to begin your pilot setup.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Check Your Email</p>
                <p className="text-sm text-zinc-400">We've sent a confirmation email with your next steps.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Account Setup</p>
                <p className="text-sm text-zinc-400">We'll help you configure your lounge layout and preferences.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Start Your Pilot</p>
                <p className="text-sm text-zinc-400">Begin using Hookah+ with full access to all features.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <FileText className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Setup Guide</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Learn how to configure your lounge layout and get started quickly.
            </p>
            <Link href="/docs">
              <Button variant="outline">
                View Documentation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Calculate Your ROI</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Estimate your potential revenue increase with our ROI calculator.
            </p>
            <Link href="/#roi-calculator">
              <Button variant="outline">
                Try ROI Calculator
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/lounge-layout">
            <Button variant="primary" className="bg-teal-600 hover:bg-teal-700">
              Set Up Lounge Layout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

