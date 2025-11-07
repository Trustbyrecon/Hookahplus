'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { CheckCircle, Mail, MessageSquare, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function ThankYouContactPage() {
  useEffect(() => {
    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'contact_form_submitted', {
        event_category: 'conversion',
        event_label: 'contact_form',
        value: 1
      });
    }

    // Track Meta Pixel conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Contact', {
        content_name: 'Contact Form',
        content_category: 'Contact'
      });
    }

    // Track LinkedIn Insight Tag conversion
    if (typeof window !== 'undefined' && (window as any).lintrk) {
      (window as any).lintrk('track', { conversion_id: 'contact_form' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Message Received!"
        subheadline="Thank you for reaching out. We've received your message and will respond within 24 hours."
        benefit={{
          value: "24 Hours",
          description: "Response time guarantee",
          icon: <MessageSquare className="w-5 h-5 text-teal-400" />
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
                Our team will review your message and get back to you as soon as possible, typically within 24 hours.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Check Your Email</p>
                <p className="text-sm text-zinc-400">We've sent a confirmation email acknowledging your message.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">We'll Respond Soon</p>
                <p className="text-sm text-zinc-400">Our team will review your inquiry and provide a detailed response.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Explore Resources</p>
                <p className="text-sm text-zinc-400">While you wait, check out our case studies and ROI calculator.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <FileText className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Download Case Study</h3>
            <p className="text-sm text-zinc-400 mb-4">
              See how The Oasis Lounge increased revenue by 22% with Hookah+.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/case-study-hookahplus-transformation.md';
                link.download = 'hookahplus-case-study.md';
                link.click();
              }}
            >
              Download Case Study
            </Button>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Calculate Your ROI</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Use our ROI calculator to estimate your potential revenue increase.
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
          <Link href="/">
            <Button variant="primary" className="bg-teal-600 hover:bg-teal-700">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

