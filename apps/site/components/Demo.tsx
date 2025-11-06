'use client';

import React from 'react';
import ImageCarousel from './ImageCarousel';
import { Play, Calendar, Clock } from 'lucide-react';

// Demo images data - replace with actual image URLs when available
const demoImages = [
  {
    src: '/images/hero-staff-tablet.jpg',
    alt: 'Staff member using Hookah+ tablet',
    title: 'Take Control of Your Lounge',
    description: 'Monitor every session in real-time with intelligent management tools'
  },
  {
    src: '/images/dashboard-performance.jpg',
    alt: 'Performance dashboard showing growth',
    title: 'Maximize Lounge Performance',
    description: 'Analyze session data to optimize table turnover and increase daily revenue'
  },
  {
    src: '/images/operational-flow.jpg',
    alt: 'Operational flow dashboard',
    title: 'Operational Flow, Simplified',
    description: 'Monitor every session in real-time, reducing management friction by 40%'
  },
  {
    src: '/images/before-after.jpg',
    alt: 'Before and after transformation',
    title: 'Reduce Management Friction by 40%',
    description: 'Streamline staff, inventory, and table service into automated, data-driven workflows'
  },
  {
    src: '/images/staff-coordination.jpg',
    alt: 'Staff coordination interface',
    title: 'Coordinate Staff Seamlessly',
    description: 'Assign tasks instantly and track completion—no more missed service calls'
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

