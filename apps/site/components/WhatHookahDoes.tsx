'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function WhatHookahDoes() {
  const pillars = [
    {
      icon: <Clock className="w-8 h-8 text-teal-400" />,
      title: 'Session Time Intelligence',
      description: 'Track every minute of every session. Stop losing revenue to forgotten timers, disputes, and chaotic handoffs. Clear timestamps for every action.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-teal-400" />,
      title: 'Flavor Mix Memory',
      description: 'Store house mixes, guest favorites, and staff suggestions. "Same as last time" becomes one tap instead of a guessing game.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-teal-400" />,
      title: 'Table & Zone Performance',
      description: 'See which tables drive the most revenue, where service is slow, and how staff performance shifts across the night.',
    },
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
            What Hookah+ improves inside your lounge
          </motion.h2>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-teal-500/50 transition-colors">
                <div className="p-6">
                  <div className="mb-4">{pillar.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    {pillar.description}
                  </p>
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
            onClick={() => window.location.href = '/docs'}
          >
            Explore the full feature set
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

