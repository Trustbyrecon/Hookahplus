'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function ProblemsWeSolve() {
  const problems = [
    {
      problem: 'Untracked session time',
      solution: 'timers reset, guests dispute, staff guess',
    },
    {
      problem: 'Flavor mix chaos',
      solution: 'nobody remembers the perfect combo',
    },
    {
      problem: 'Operational blind spots',
      solution: 'no clarity on table/zone/staff performance',
    },
    {
      problem: 'Fragmented tools',
      solution: 'POS handles payments but nothing about sessions',
    },
    {
      problem: 'Slow service loops',
      solution: 'manual prep queues, unclear handoffs',
    },
    {
      problem: 'No session memory',
      solution: 'no loyalty, no personalization, no repeat lift',
    },
  ];

  return (
    <section className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
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
            If you run a hookah lounge, you've seen these issues:
          </motion.h2>
        </div>

        {/* Problems List */}
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-zinc-700 hover:border-red-500/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-white font-semibold text-lg">
                        {item.problem}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-zinc-400">
                        {item.solution}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400"
            onClick={() => {
              // Scroll to "How It Works" section or go to docs
              const element = document.getElementById('how-it-works');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/docs';
              }
            }}
          >
            How Hookah+ fixes each challenge
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

