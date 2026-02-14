'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Clock, Users, DollarSign, Eye, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function OperationalMirrorSection() {
  const operationalInsights = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Memory Breaks at Shift Change',
      pattern: 'Regular guest walks in. Staff who knows them isn\'t working. Favorite flavor, seat, and vibe are gone.',
      impact: 'Loyalty resets to zero — even though the relationship shouldn\'t.',
      color: 'from-red-500/20 to-red-900/20',
      borderColor: 'border-red-500/30'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Revenue Leakage from Lost Context',
      pattern: 'Premium add-ons missed because staff doesn\'t know guest preferences. Comped sessions because timing is unclear.',
      impact: 'Average lounge loses $200-400/week to context gaps.',
      color: 'from-orange-500/20 to-orange-900/20',
      borderColor: 'border-orange-500/30'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Session Timing Inconsistencies',
      pattern: 'Table turnover varies 20-40 minutes depending on who\'s working. No pattern recognition across shifts.',
      impact: 'Can\'t optimize floor plan or staffing without session memory.',
      color: 'from-yellow-500/20 to-yellow-900/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: 'Flavor Preferences Lost',
      pattern: 'Guest orders same mix 5 times. Next visit, staff suggests something different. Guest feels forgotten.',
      impact: 'Repeat visits decline when memory breaks.',
      color: 'from-purple-500/20 to-purple-900/20',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <section id="operational-mirror" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-6">
            <Eye className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 font-medium">Operational Mirror</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See Your Operation as It Really Is
          </h2>
          
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto mb-2">
            LaunchPad doesn't sell software. It shows you something about your operation you can't unsee.
          </p>
          
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            These patterns exist in every lounge. Most owners never see them until it's too late.
          </p>
          
          <p className="text-base text-zinc-500 max-w-xl mx-auto mt-2 italic">
            You are not being asked to buy software. You are being shown what's actually happening in your operation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {operationalInsights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`p-6 rounded-lg border ${insight.borderColor} bg-gradient-to-br ${insight.color} backdrop-blur-sm`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-red-400 flex-shrink-0 mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {insight.title}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-1">The Pattern:</p>
                      <p className="text-zinc-300 leading-relaxed">
                        {insight.pattern}
                      </p>
                    </div>
                    
                    <div className="bg-zinc-900/50 border-l-4 border-red-500/50 p-4 rounded-r">
                      <p className="text-sm font-medium text-zinc-400 mb-1">The Impact:</p>
                      <p className="text-red-300 font-semibold">
                        {insight.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">
            This Is What LaunchPad Shows You
          </h3>
          
          <p className="text-lg text-zinc-300 mb-4 max-w-3xl mx-auto">
            In 25-35 minutes, LaunchPad sets up your lounge and starts tracking these patterns. 
            Not to sell you software — to show you what's actually happening in your operation.
          </p>
          
          <p className="text-base text-zinc-400 mb-6 max-w-2xl mx-auto">
            Once you see these patterns, you can't unsee them. That's when memory-powered hospitality becomes inevitable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
              onClick={() => {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
                window.location.href = `${appUrl}/launchpad`;
              }}
            >
              See Your Operation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback to How It Works section
                  const howItWorks = document.querySelector('[id*="how"]');
                  if (howItWorks) {
                    howItWorks.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              How LaunchPad Works
            </Button>
          </div>
          
          <p className="text-sm text-zinc-400 mt-6">
            Free to complete. No credit card required. See your operation in 25-35 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
