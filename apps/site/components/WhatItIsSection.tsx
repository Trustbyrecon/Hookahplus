'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function WhatItIsSection() {
  const whatItIs = [
    'Session and table management',
    'Flavor mix memory',
    'Staff notes and shift handoff',
    'Loyalty profiles (behavior-based, not just points)',
    'POS-friendly integrations'
  ];

  const whatItIsNot = [
    'A payment processor',
    'A generic restaurant POS',
    'A punch-card loyalty app'
  ];

  return (
    <section id="what-it-is" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6 text-center"
        >
          What is Hookah+?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-zinc-300 mb-12 text-center leading-relaxed"
        >
          Hookah+ is <strong className="text-white">session-based hookah lounge management software</strong> that adds{' '}
          <strong className="text-white">guest memory and loyalty</strong> on top of existing POS systems like Square, Clover, and Toast.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* What it is */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              What it is:
            </h3>
            <ul className="space-y-3">
              {whatItIs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* What it is not */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
              <XCircle className="w-6 h-6" />
              What it is not:
            </h3>
            <ul className="space-y-3">
              {whatItIsNot.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-zinc-300">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
