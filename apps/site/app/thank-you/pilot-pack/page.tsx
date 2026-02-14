'use client';

import React from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import PageHero from '../../../components/PageHero';
import { CheckCircle, Calendar, Download, ArrowRight, Mail, Phone } from 'lucide-react';

export default function ThankYouPilotPackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Thank You for Your Interest!"
        subheadline="Your Pilot Pack request has been received. Our team will contact you within 24 hours to set up your 60-day pilot."
      />

      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="bg-green-500/10 border-green-500/30 mb-8">
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Request Received</h2>
            <p className="text-zinc-300 mb-6">
              We've received your World Shisha 2026 Pilot Pack request. Our team will review your 
              information and contact you within 24 hours to schedule your setup.
            </p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6">
              <Calendar className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Next Steps</h3>
              <ul className="space-y-2 text-zinc-300 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Our team will contact you within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Schedule a 15-minute setup call</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Configure your lounge in Hookah+</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Start your 60-day pilot</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-700">
            <div className="p-6">
              <Download className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">While You Wait</h3>
              <p className="text-zinc-300 text-sm mb-4">
                Download the Smart Lounge Playbook 2026 to learn more about how Hookah+ helps 
                lounges increase revenue and reduce management friction.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/world-shisha-2026/brief'}
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Playbook
              </Button>
            </div>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-700">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Questions?</h3>
            <p className="text-zinc-300 mb-4">
              If you have any questions about your Pilot Pack or need immediate assistance, 
              please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:hookahplusconnector@gmail.com"
                className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
              >
                <Mail className="w-5 h-5" />
                hookahplusconnector@gmail.com
              </a>
              <a
                href="/contact"
                className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
              >
                <Phone className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

