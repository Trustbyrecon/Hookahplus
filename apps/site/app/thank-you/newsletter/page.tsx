'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { CheckCircle, Mail, Download, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function ThankYouNewsletterPage() {
  useEffect(() => {
    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'newsletter_signup_completed', {
        event_category: 'conversion',
        event_label: 'newsletter_signup',
        value: 1
      });
    }

    // Track Meta Pixel conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Subscribe', {
        content_name: 'Newsletter Signup',
        content_category: 'Newsletter'
      });
    }

    // Track LinkedIn Insight Tag conversion
    if (typeof window !== 'undefined' && (window as any).lintrk) {
      (window as any).lintrk('track', { conversion_id: 'newsletter_signup' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="You're Subscribed!"
        subheadline="Thank you for joining our newsletter. Check your email to confirm your subscription and get your free resources."
        benefit={{
          value: "Free Resources",
          description: "Operations checklist and guides",
          icon: <Download className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
              <p className="text-zinc-300">
                We've sent you a confirmation email with your free resources. Please check your inbox (and spam folder) to confirm your subscription.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Check Your Email</p>
                <p className="text-sm text-zinc-400">You'll receive a confirmation email with your free resources shortly. Please check your inbox (and spam folder).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Get Your Free Resources</p>
                <p className="text-sm text-zinc-400">Download your operations checklist and other guides from the confirmation email.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Weekly Tips & Insights</p>
                <p className="text-sm text-zinc-400">You'll receive weekly emails with tips, industry insights, and exclusive updates.</p>
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
                link.href = '/case-study-hookahplus-transformation.pdf';
                link.download = 'hookahplus-case-study.pdf';
                link.click();
              }}
            >
              Download Case Study (PDF)
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

