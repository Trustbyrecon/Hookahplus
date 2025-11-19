'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, TrendingDown, Users, Clock } from 'lucide-react';
import { trackDemoRequest } from '../lib/ctaTracking';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Make every session smoother.
            <br />
            <span className="text-teal-400">Earn repeat visits automatically.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-8"
          >
            Hookah+ connects QR ordering, staff flow, and loyalty into one
            <span className="text-teal-400 font-semibold"> hospitality intelligence layer</span>
            —no rip-and-replace.
          </motion.p>

          {/* Quantifiable Benefit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-xl px-6 py-4 mb-8"
          >
            <TrendingDown className="w-6 h-6 text-teal-400" />
            <div className="text-left">
              <div className="text-2xl font-bold text-teal-400">Reduce Management Friction by 40%</div>
              <div className="text-sm text-zinc-400">Streamline staff, inventory, and table service into automated workflows</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
              onClick={() => {
                // Track CTA click
                trackDemoRequest('Hero', { action: 'navigate_to_onboarding' });
                
                // Navigate to onboarding page
                window.location.href = '/onboarding';
              }}
            >
              Book 15-min Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
              onClick={() => {
                // Navigate directly to Sessions page on site build
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                window.location.href = `${siteUrl}/sessions`;
              }}
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>No hardware required</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              <span>Works with your existing setup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>30-day pilot available</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

