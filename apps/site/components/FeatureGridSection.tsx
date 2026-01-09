'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureGridSection() {
  const features = [
    'Session timing & table flow',
    'Flavor mix tracking',
    'Guest memory profiles',
    'Staff-only notes',
    'Shift handoff context',
    'Loyalty scoring',
    'Multi-location support',
    'Square / Clover / Toast integrations'
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          Core Features
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-teal-500/50 transition-colors text-center"
            >
              <span className="text-zinc-300">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
