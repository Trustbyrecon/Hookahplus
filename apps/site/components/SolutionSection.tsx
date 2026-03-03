'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SolutionSection() {
  const features = [
    'Tracks sessions, not just transactions',
    'Remembers flavor mixes, seats, and visit patterns',
    'Captures staff notes without slowing service',
    'Preserves context across shift changes',
    'Works above your POS, not against it'
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-center"
        >
          Hookah+ restores memory to the lounge experience.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
              className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-teal-500/50 transition-colors"
            >
              <CheckCircle className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
              <span className="text-lg text-zinc-300">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
