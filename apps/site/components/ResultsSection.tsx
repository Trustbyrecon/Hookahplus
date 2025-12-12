'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function ResultsSection() {
  const results = [
    'Faster service flow',
    'Higher guest satisfaction',
    'Clear session control',
    'Accurate timing & pricing',
    'Repeat visits increase',
    'Staff accountability improves',
    'Management clarity across the entire night',
  ];

  return (
    <section className="bg-zinc-900/50 px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            What changes when Hookah+ is running your sessions
          </motion.h2>
        </div>

        {/* Results Grid */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-zinc-300">{result}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4"
            onClick={() => window.location.href = '/results/case-study'}
          >
            View Case Study
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
            onClick={() => {
              const element = document.getElementById('roi-calculator');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Open ROI Calculator
          </Button>
        </div>
      </div>
    </section>
  );
}

