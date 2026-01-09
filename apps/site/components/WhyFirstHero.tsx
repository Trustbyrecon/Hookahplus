'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, Clock, Users, CheckCircle } from 'lucide-react';
import { trackDemoRequest } from '../lib/ctaTracking';

export default function WhyFirstHero() {
  return (
    <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* H1 - WHY */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Great hospitality is built on memory, not transactions.
          </motion.h1>

          {/* Sub-headline - FAST BRIDGE TO WHAT */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-xl md:text-2xl text-zinc-300 max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            Hookah+ is session-based hookah lounge management software that remembers guests, tracks sessions, and powers loyalty above Square, Clover, and Toast.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
              onClick={() => {
                trackDemoRequest('Hero', { action: 'navigate_to_onboarding' });
                window.location.href = '/onboarding';
              }}
            >
              See How Memory-Powered Hospitality Works
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
              onClick={() => {
                const element = document.getElementById('what-it-is');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Built for Hookah Lounges
            </Button>
          </motion.div>

          {/* Trust Signal Bar - SCAN-FRIENDLY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm md:text-base text-zinc-400 border-t border-zinc-800 pt-8"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Works with Square · Clover · Toast</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              <span>Built for Hookah Lounges</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Session-Based · Loyalty & Memory · Staff-Friendly</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
