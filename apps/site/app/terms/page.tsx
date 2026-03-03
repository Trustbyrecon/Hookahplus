'use client';

import React from 'react';
import PageHero from '../../components/PageHero';
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Terms of Service"
        subheadline="Please read these terms carefully before using our services."
        benefit={{
          value: "Clear Terms",
          description: "Transparent and fair service agreement",
          icon: <Scale className="w-5 h-5 text-teal-400" />
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-teal-400" />
                Acceptance of Terms
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                By accessing and using Hookah+ services, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-teal-400" />
                Use License
              </h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Permission is granted to temporarily use Hookah+ services for personal or commercial use. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without written consent</li>
                <li>Attempt to reverse engineer any software contained in the service</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-teal-400" />
                Disclaimer
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                The materials on Hookah+ are provided on an 'as is' basis. Hookah+ makes no warranties, 
                expressed or implied, and hereby disclaims and negates all other warranties including, 
                without limitation, implied warranties or conditions of merchantability, fitness for a 
                particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitations</h2>
              <p className="text-zinc-300 leading-relaxed">
                In no event shall Hookah+ or its suppliers be liable for any damages (including, without 
                limitation, damages for loss of data or profit, or due to business interruption) arising 
                out of the use or inability to use the materials on Hookah+, even if Hookah+ or a Hookah+ 
                authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Revisions</h2>
              <p className="text-zinc-300 leading-relaxed">
                Hookah+ may revise these terms of service at any time without notice. By using this service 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@hookahplus.net" className="text-teal-400 hover:text-teal-300">
                  legal@hookahplus.net
                </a>
              </p>
            </section>

            <section>
              <p className="text-sm text-zinc-400">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

