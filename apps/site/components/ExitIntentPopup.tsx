'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, Download, CheckCircle } from 'lucide-react';
import { trackCTA } from '../lib/ctaTracking';

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export default function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this popup
    const dismissed = localStorage.getItem('exitIntentDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Track mouse movement
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving the top of the viewport
      if (e.clientY <= 0 && !isVisible && !isSubmitted) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, isSubmitted]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('exitIntentDismissed', Date.now().toString());
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Track CTA event
      await trackCTA({
        ctaSource: 'website',
        ctaType: 'newsletter_signup',
        data: {
          email,
          name: name || undefined
        },
        metadata: {
          source: 'exit_intent_popup',
          leadMagnet: 'operations_checklist'
        },
        component: 'ExitIntentPopup'
      });

      setIsSubmitted(true);
      
      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/thank-you/newsletter?source=exit-intent';
      }, 2000);
    } catch (error) {
      console.error('Error submitting exit intent form:', error);
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl w-full max-w-md border border-zinc-700 relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-zinc-300 mb-4">
              Your free checklist is on its way. Check your email!
            </p>
            <p className="text-sm text-zinc-400">Redirecting...</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-6">
              <Download className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Wait! Get Your Free Checklist
              </h2>
              <p className="text-zinc-300">
                Download our <strong className="text-teal-400">Hookah Lounge Operations Checklist</strong> and optimize your workflow today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="exit-name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  id="exit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="exit-email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  id="exit-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                  placeholder="your@email.com"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                Get Free Checklist
                <Download className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-zinc-400 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

