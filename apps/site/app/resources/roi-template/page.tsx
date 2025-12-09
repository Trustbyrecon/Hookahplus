'use client';

import React, { useState } from 'react';
import PageHero from '../../../components/PageHero';
import Button from '../../../components/Button';
import { Download, CheckCircle, Calculator, Mail } from 'lucide-react';
import { trackLeadMagnetDownloadConversion } from '../../../lib/conversionTracking';

export default function ROITemplatePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Prefer deployed API; fall back to current origin in the browser
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL 
        || process.env.NEXT_PUBLIC_API_URL
        || (typeof window !== 'undefined' ? window.location.origin : '');
      const response = await fetch(`${apiUrl}/api/lead-magnets/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          leadMagnetId: 'roi-template',
          metadata: {
            page: window.location.pathname,
            component: 'ROITemplatePage'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track download');
      }

      const result = await response.json();
      
      // Track conversion
      trackLeadMagnetDownloadConversion('roi-template', {
        email,
        name: name || undefined
      });
      
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = 'roi-calculator-template.xlsx';
      link.click();

      setIsDownloaded(true);

      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/thank-you/newsletter?source=lead-magnet&magnet=roi-template';
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
        headline="ROI Calculator Template"
        subheadline="Calculate your potential return on investment with Hookah+ using our comprehensive Excel template."
        benefit={{
          value: "18% Improvement",
          description: "In revenue per occupied hour",
          icon: <Calculator className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {isDownloaded ? (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Download Started!</h3>
            <p className="text-zinc-300 mb-4">
              Your ROI calculator template is downloading. Check your downloads folder.
            </p>
            <p className="text-sm text-zinc-400">Redirecting...</p>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8">
            <div className="text-center mb-8">
              <Download className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Get Your Free ROI Calculator Template
              </h2>
              <p className="text-zinc-300 mb-6">
                Use this Excel template to calculate your potential ROI with Hookah+, including revenue increases, cost savings, and payback period.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Template Includes:</h3>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Revenue uplift calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Cost savings analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Payback period calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>ROI projections by tier</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Customizable inputs for your lounge</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleDownload} className="space-y-4">
              <div>
                <label htmlFor="roi-name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  id="roi-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="roi-email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  id="roi-email"
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
                Download Free Template
                <Download className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

