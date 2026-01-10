'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Start a Session',
      description: 'Track tables, time, and party flow — not just checkout.'
    },
    {
      number: '2',
      title: 'Capture Memory During the Experience',
      description: 'Flavor mixes, preferences, staff notes, VIP signals.'
    },
    {
      number: '3',
      title: 'Shift Handoff Without Loss',
      description: 'Next staff sees context instantly.'
    },
    {
      number: '4',
      title: 'Loyalty That Feels Personal',
      description: 'Guests are remembered — even when staff changes.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          How Hookah+ Works
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold text-xl flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-zinc-300">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
