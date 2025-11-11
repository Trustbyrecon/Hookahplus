'use client';

import React, { useState } from 'react';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { Download, CheckCircle, FileText, Mail } from 'lucide-react';
import { trackLeadMagnetDownloadConversion } from '../../../lib/conversionTracking';

export default function OperationsChecklistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/lead-magnets/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          leadMagnetId: 'operations-checklist',
          metadata: {
            page: window.location.pathname,
            component: 'OperationsChecklistPage'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track download');
      }

      const result = await response.json();
      
      // Track conversion
      trackLeadMagnetDownloadConversion('operations-checklist', {
        email,
        name: name || undefined
      });
      
      // Trigger download - use direct PDF link
      const link = document.createElement('a');
      link.href = '/lead-magnets/hookah-lounge-operations-checklist.pdf';
      link.download = 'hookah-lounge-operations-checklist.pdf';
      link.click();

      setIsDownloaded(true);

      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/thank-you/newsletter?source=lead-magnet&magnet=operations-checklist';
      }, 2000);
    } catch (error) {
      console.error('Error downloading lead magnet:', error);
      setIsSubmitting(false);
      alert('Failed to download. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Free Operations Checklist"
        subheadline="Download our comprehensive Hookah Lounge Operations Checklist to optimize your workflow and reduce management friction."
        benefit={{
          value: "40% Reduction",
          description: "In management friction",
          icon: <FileText className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {isDownloaded ? (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Download Started!</h3>
            <p className="text-zinc-300 mb-4">
              Your checklist is downloading. Check your downloads folder.
            </p>
            <p className="text-sm text-zinc-400">Redirecting...</p>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
            <div className="text-center mb-8">
              <Download className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Get Your Free Operations Checklist
              </h2>
              <p className="text-zinc-300 mb-6">
                This comprehensive checklist covers everything you need to streamline your hookah lounge operations, from session management to staff coordination.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">What's Inside:</h3>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Session management best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Staff workflow optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Inventory management tips</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Customer experience enhancement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Revenue optimization strategies</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleDownload} className="space-y-4">
              <div>
                <label htmlFor="checklist-name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  id="checklist-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="checklist-email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  id="checklist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-zinc-400 mt-2">
                  We'll send you the download link and occasional tips. Unsubscribe anytime.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                Download Free Checklist
                <Download className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

