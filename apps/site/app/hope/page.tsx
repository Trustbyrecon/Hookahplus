'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Mail, CheckCircle, Building2, Users, TrendingUp } from 'lucide-react';

export default function HopePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/hope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setError('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Hookah+
          </h1>
          
          {/* One sentence: what Hookah+ is */}
          <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Hookah+ is a complete operations platform that helps hookah lounges and hospitality businesses streamline service, increase revenue, and delight customers through QR-based ordering and smart session management.
          </p>
        </div>

        {/* How Hookah+ Aligns & Supports Small Business */}
        <Card className="mb-12 bg-zinc-800/50 border-zinc-700">
          <h2 className="text-2xl font-bold mb-6 text-center">How Hookah+ Aligns & Supports Small Business</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Increase Revenue Without Hiring More Staff</h3>
                <p className="text-zinc-400">
                  QR-based ordering lets customers order refills and extras directly, reducing wait times and increasing table turnover by up to 30%—all without adding to your payroll.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Professional Operations on Any Budget</h3>
                <p className="text-zinc-400">
                  Get enterprise-level tools—session tracking, payment processing, analytics, and customer management—at a fraction of the cost of traditional POS systems, designed specifically for the hookah lounge model.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Build Stronger Customer Relationships</h3>
                <p className="text-zinc-400">
                  Track customer preferences, manage loyalty programs, and provide seamless service that keeps guests coming back—helping you compete with larger chains while maintaining your authentic, community-focused brand.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Email CTA Section */}
        <Card className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-zinc-300">
                We'll send you information about how Hookah+ supports small businesses shortly.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Are you connected to hospitality or small business owners?
              </h2>
              <p className="text-zinc-300 mb-8 text-lg">
                Drop your email – I'll share how Hookah+ aligns with and supports small businesses.
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    loading={isSubmitting}
                    leftIcon={<Mail className="w-5 h-5" />}
                    className="whitespace-nowrap"
                  >
                    {isSubmitting ? 'Sending...' : 'Get Info'}
                  </Button>
                </div>
                {error && (
                  <p className="mt-4 text-red-400 text-sm">{error}</p>
                )}
              </form>
            </div>
          )}
        </Card>

        {/* Footer Note */}
        <div className="mt-12 text-center text-zinc-500 text-sm">
          <p>Questions? Reach out at{' '}
            <a href="mailto:hookahplusconnector@gmail.com" className="text-teal-400 hover:text-teal-300">
              hookahplusconnector@gmail.com
            </a>
            {' '}or{' '}
            <a href="mailto:clark.dwayne@gmail.com" className="text-teal-400 hover:text-teal-300">
              clark.dwayne@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

