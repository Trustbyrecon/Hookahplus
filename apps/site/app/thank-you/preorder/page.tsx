'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { CheckCircle, Mail, Calendar, ArrowRight, Shield } from 'lucide-react';

export default function PreOrderThankYouPage() {
  useEffect(() => {
    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'preorder_completed', {
        event_category: 'conversion',
        event_label: 'preorder',
        value: 1
      });
    }

    // Track Meta Pixel conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Pre-Order',
        content_category: 'Pre-Order'
      });
    }

    // Track LinkedIn Insight Tag conversion
    if (typeof window !== 'undefined' && (window as any).lintrk) {
      (window as any).lintrk('track', { conversion_id: 'preorder' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Pre-Order Confirmed!"
        subheadline="Thank you for securing your spot. We'll notify you when Hookah+ launches."
        benefit={{
          value: 'Test Mode',
          description: 'No real charges - you'll be charged when we launch',
          icon: <Shield className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Your Pre-Order is Secure</h3>
              <p className="text-zinc-300">
                Check your email for confirmation details.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">What's Next?</p>
                <p className="text-sm text-zinc-400">You'll receive an email confirmation with your pre-order details. We'll notify you when Hookah+ launches and your subscription begins.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Launch Timeline</p>
                <p className="text-sm text-zinc-400">We're targeting a launch date in the coming weeks. As a pre-order customer, you'll be among the first to access Hookah+.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Test Mode</p>
                <p className="text-sm text-zinc-400">This pre-order was processed in test mode. No real charges were made. You'll be charged when Hookah+ officially launches.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/owners">
            <Button variant="primary" className="bg-teal-600 hover:bg-teal-700">
              Learn More About Hookah+
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-zinc-500 mt-4">
          <p>Questions? Email us at <a href="mailto:support@hookahplus.net" className="text-teal-400 hover:text-teal-300">support@hookahplus.net</a></p>
        </div>
      </div>
    </div>
  );
}
