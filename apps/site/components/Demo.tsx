'use client';

import React from 'react';
import ImageCarousel from './ImageCarousel';
import { Play, Calendar, Clock } from 'lucide-react';
import { trackContactForm } from '../lib/ctaTracking';

// Demo images data - 60-second demo carousel
const demoImages = [
  {
    src: '/images/demo/automate-operations.jpg',
    alt: 'Automate Operations - Streamline inventory, re-fills, and table service',
    title: 'AUTOMATE OPERATIONS',
    description: 'Streamline complex inventory, re-fills, and table service into intuitive, data-driven workflows'
  },
  {
    src: '/images/demo/operational-flow-simplified.jpg',
    alt: 'Operational Flow Simplified - Monitor sessions in real-time',
    title: 'OPERATIONAL FLOW, SIMPLIFIED',
    description: 'Monitor every session in real-time, reducing management friction by 40%'
  },
  {
    src: '/images/demo/maximize-lounge-performance.jpg',
    alt: 'Maximize Lounge Performance - Analyze session data',
    title: 'MAXIMIZE LOUNGE PERFORMANCE',
    description: 'Analyze session data to optimize table turnover and increase daily revenue'
  },
  {
    src: '/images/demo/master-lounge-operations.jpg',
    alt: 'Master Lounge Operations - Real-time data insights',
    title: 'MASTER LOUNGE OPERATIONS',
    description: 'Unlock real-time data insights to optimize your staff and sessions with Hookah+'
  },
  {
    src: '/images/demo/boost-profitability.jpg',
    alt: 'Boost Profitability - Pricing and session duration decisions',
    title: 'STEP 3: BOOST PROFITABILITY',
    description: 'Make smarter pricing and session duration decisions based on real-time business performance metrics'
  },
  {
    src: '/images/demo/coordinate-staff-seamlessly.jpg',
    alt: 'Coordinate Staff Seamlessly - Assign tasks instantly',
    title: 'COORDINATE STAFF SEAMLESSLY',
    description: 'Assign tasks instantly and track completion—no more missed service calls'
  },
  {
    src: '/images/demo/take-control-lounge.jpg',
    alt: 'Take Control of Your Lounge - Intelligent management tools',
    title: 'TAKE CONTROL OF YOUR LOUNGE',
    description: 'Move beyond guesswork: intelligent tools for modern hookah lounge management'
  },
  {
    src: '/images/demo/reduce-management-friction.jpg',
    alt: 'Reduce Management Friction by 40% - Before and After',
    title: 'Reduce Management Friction by 40%',
    description: 'Streamline staff, inventory, and table service into automated, data-driven workflows'
  }
];

export default function Demo() {
  return (
    <section id="demo" className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left Side - Demo Carousel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-6 h-6 text-teal-400" />
              <h2 className="text-3xl font-bold text-white">Watch the 60-sec demo</h2>
            </div>
            <p className="text-zinc-400 mb-6">
              See QR → mix → pay → confirm in action. No new hardware. No rip-and-replace.
            </p>
            
            {/* Image Carousel */}
            <ImageCarousel images={demoImages} autoPlay={true} interval={5000} />

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Quick Setup</h4>
                  <p className="text-xs text-zinc-400">
                    Get started in minutes. Works with your existing payment setup and requires no new hardware.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Calendly Embed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-semibold text-white">Book a 15-minute walkthrough</h3>
            </div>
            <p className="text-zinc-400 mb-6">
              We'll map your flow and show quick wins. See how Hookah+ can transform your operations.
            </p>
            
            {/* Calendly Embed */}
            <div className="h-[700px] rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
              {/* Placeholder - Replace with actual Calendly embed */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                <div className="text-center p-8">
                  <Calendar className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">Schedule Your Demo</h4>
                  <p className="text-zinc-400 mb-6">
                    Calendly integration coming soon. For now, please contact us through the contact form.
                  </p>
                  <a
                    href="/contact"
                    onClick={() => trackContactForm(undefined, { component: 'Demo', action: 'contact_form_fallback' })}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Contact Us
                    <Calendar className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              {/* Uncomment when Calendly URL is available */}
              {/* <iframe
                src="https://calendly.com/your-hplus-demo/15min"
                className="w-full h-full"
                title="Hookah+ Demo Booking"
                frameBorder="0"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

