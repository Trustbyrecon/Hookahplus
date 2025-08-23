'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sid');
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    // Track successful subscription
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('Subscription Success', { props: { sessionId, tier } });
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'subscription_started', { transaction_id: sessionId });
    }
  }, [sessionId, tier]);

  const getTierInfo = (tierName: string) => {
    switch (tierName) {
      case 'starter':
        return {
          name: 'Hookah+ Starter',
          features: [
            'Set up your first lounge location',
            'Configure session timers',
            'Set up QR payment codes',
            'Customize flavor mix logging',
            'Configure text message receipts'
          ],
          nextSteps: [
            'Complete your lounge profile',
            'Upload your menu and pricing',
            'Set up your first table',
            'Test the QR payment system',
            'Invite your staff members'
          ]
        };
      case 'pro':
        return {
          name: 'Hookah+ Pro',
          features: [
            'Configure up to 3 lounge locations',
            'Set up loyalty pricing tiers',
            'Customize analytics dashboard',
            'Configure premium flavor detection',
            'Set up YAML configuration files',
            'Enable Flavor AI Recommender'
          ],
          nextSteps: [
            'Configure multi-location settings',
            'Set up loyalty program rules',
            'Customize analytics widgets',
            'Train flavor detection models',
            'Configure AI recommendations',
            'Set up advanced reporting'
          ]
        };
      case 'trust_plus':
        return {
          name: 'Hookah+ Trust+',
          features: [
            'Configure up to 7 lounge locations',
            'Set up Reflex scoring system',
            'Configure SessionNotes memory',
            'Set up dynamic margin logic',
            'Enable priority support access',
            'Configure session replay heatmaps'
          ],
          nextSteps: [
            'Set up multi-location hierarchy',
            'Configure Reflex scoring rules',
            'Set up SessionNotes templates',
            'Configure margin optimization',
            'Schedule priority support call',
            'Set up heatmap analytics'
          ]
        };
      default:
        return {
          name: 'Hookah+',
          features: ['Welcome to Hookah+!'],
          nextSteps: ['Complete your setup']
        };
    }
  };

  const tierInfo = getTierInfo(tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to <span className="text-purple-400">Hookah+</span>!
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your subscription is now active. Let's get you set up and running with your new Hookah+ features.
            </p>
          </div>

          {/* Subscription Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Your {tierInfo.name} Plan
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {tierInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Next Steps</h3>
                <ul className="space-y-3">
                  {tierInfo.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <span className="w-6 h-6 bg-purple-500 text-white text-sm rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Link
              href="/dashboard"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 text-lg"
            >
              Go to Dashboard
            </Link>
            
            <div className="pt-4">
              <Link
                href="/onboarding"
                className="text-purple-400 hover:text-purple-300 underline text-lg"
              >
                Start Onboarding Guide
              </Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Need Help Getting Started?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Documentation</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Comprehensive guides and tutorials
                </p>
                <Link href="/docs" className="text-purple-400 hover:text-purple-300 underline text-sm">
                  View Docs
                </Link>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Help Center</h4>
                <p className="text-gray-300 text-sm mb-3">
                  FAQs and troubleshooting
                </p>
                <Link href="/help" className="text-purple-400 hover:text-purple-300 underline text-sm">
                  Get Help
                </Link>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Support</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Direct contact with our team
                </p>
                <a href="mailto:support@hookahplus.net" className="text-purple-400 hover:text-purple-300 underline text-sm">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
