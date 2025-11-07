'use client';

import React, { useEffect, useState } from 'react';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { CheckCircle, Mail, Calendar, ArrowRight, Shield } from 'lucide-react';

export default function PreOrderThankYouPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('session_id');
      setSessionId(id);
      if (id) {
        setEmail('your-email@example.com');
      }
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
        <Card className="p-8 bg-zinc-800/50 border-zinc-700 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Pre-Order is Secure</h2>
            <p className="text-zinc-400">
              {email ? `Confirmation sent to ${email}` : 'Check your email for confirmation details'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-lg">
              <Mail className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">What's Next?</h3>
                <p className="text-sm text-zinc-400">
                  You'll receive an email confirmation with your pre-order details. We'll notify you when Hookah+ launches and your subscription begins.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Launch Timeline</h3>
                <p className="text-sm text-zinc-400">
                  We're targeting a launch date in the coming weeks. As a pre-order customer, you'll be among the first to access Hookah+.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-zinc-900/50 rounded-lg">
              <Shield className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Test Mode</h3>
                <p className="text-sm text-zinc-400">
                  This pre-order was processed in test mode. No real charges were made. You'll be charged when Hookah+ officially launches.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              onClick={() => window.location.href = '/owners'}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Learn More About Hookah+
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 hover:border-teal-500"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-zinc-500">
          <p>Questions? Email us at <a href="mailto:support@hookahplus.net" className="text-teal-400 hover:text-teal-300">support@hookahplus.net</a></p>
        </div>
      </div>
    </div>
  );
}
