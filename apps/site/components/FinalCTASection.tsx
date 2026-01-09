'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight } from 'lucide-react';
import { trackDemoRequest } from '../lib/ctaTracking';

export default function FinalCTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Your lounge already has great guests.
          <br />
          Hookah+ helps you remember them.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
            onClick={() => {
              trackDemoRequest('FinalCTA', { action: 'navigate_to_onboarding' });
              window.location.href = '/onboarding';
            }}
          >
            See Hookah+ in Action
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
