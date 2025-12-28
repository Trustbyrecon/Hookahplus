'use client';

import React, { useState } from 'react';
import Button from './Button';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { trackCTA } from '../lib/ctaTracking';
import { getContentEngagementForSignup, clearContentEngagement } from '../lib/contentEngagement';

interface NewsletterSignupProps {
  variant?: 'default' | 'inline' | 'compact';
  title?: string;
  description?: string;
  showName?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export default function NewsletterSignup({
  variant = 'default',
  title,
  description,
  showName = false,
  onSuccess,
  className = ''
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const defaultTitle = variant === 'compact' 
    ? 'Get Weekly Tips' 
    : 'Stay Updated with Hookah+';
  
  const defaultDescription = variant === 'compact'
    ? 'Get the latest tips and insights delivered to your inbox.'
    : 'Join our newsletter to receive weekly tips, industry insights, and exclusive updates.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Get content engagement data before clearing
      const contentEngagement = getContentEngagementForSignup();

      // Submit to newsletter API (handles tracking, HID creation, and email sending)
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: showName && name ? name : undefined,
          contentEngagement: contentEngagement.pages.length > 0 ? contentEngagement : undefined
        }),
      });

      // Clear engagement data after successful signup
      if (response.ok) {
        clearContentEngagement();
      }

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setIsSubmitted(true);
      setEmail('');
      setName('');

      if (onSuccess) {
        onSuccess();
      } else if (variant !== 'compact') {
        // Redirect to thank you page for non-compact variants
        setTimeout(() => {
          window.location.href = '/thank-you/newsletter';
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting newsletter signup:', error);
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={className}>
        {isSubmitted ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Subscribed! Check your email.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500 text-sm"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 ${className}`}>
        {isSubmitted ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
            <p className="text-zinc-300">Check your email to confirm your subscription.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {title || defaultTitle}
              </h3>
              <p className="text-zinc-300 text-sm">
                {description || defaultDescription}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {showName && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                />
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-zinc-400">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-8 ${className}`}>
      {isSubmitted ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
          <p className="text-zinc-300 mb-6">
            Check your email to confirm your subscription and get your free resources.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
          >
            Subscribe Another Email
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {title || defaultTitle}
            </h3>
            <p className="text-zinc-300">
              {description || defaultDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {showName && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              Subscribe
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-zinc-400 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

