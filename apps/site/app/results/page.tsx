'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '../../components/PageHero';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  TrendingUp,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

export default function ResultsPage() {
  const metrics = [
    {
      label: 'Avg order time',
      value: '↓ 35%',
      description: 'Faster service delivery',
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      color: 'text-green-400'
    },
    {
      label: 'Repeat rate',
      value: '↑ 28%',
      description: 'More returning guests',
      icon: <Users className="w-6 h-6 text-teal-400" />,
      color: 'text-teal-400'
    },
    {
      label: 'Turns/night',
      value: '↑ 22%',
      description: 'Higher table utilization',
      icon: <TrendingUp className="w-6 h-6 text-teal-400" />,
      color: 'text-blue-400'
    },
    {
      label: 'Revenue per table',
      value: '↑ 18%',
      description: 'Better session management',
      icon: <DollarSign className="w-6 h-6 text-teal-400" />,
      color: 'text-green-400'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Results that Lounge Owners See"
        subheadline="Real metrics from real lounges using Hookah+ to run smoother nights and increase revenue."
        primaryCTA={{
          text: 'View Case Study',
          onClick: () => window.location.href = '/results/case-study',
        }}
        secondaryCTA={{
          text: 'Open ROI Calculator',
          onClick: () => window.location.href = '/#roi-calculator',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Metrics Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Measurable Improvements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center border-zinc-700 hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex justify-center mb-4">
                      {metric.icon}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div className="text-lg font-semibold text-white mb-1">{metric.label}</div>
                    <div className="text-sm text-zinc-400">{metric.description}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What Changes */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            What changes when Hookah+ is running your sessions
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Faster service flow',
                'Higher guest satisfaction',
                'Clear session control',
                'Accurate timing & pricing',
                'Repeat visits increase',
                'Staff accountability improves',
                'Management clarity across the entire night',
              ].map((result, index) => (
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
        </section>

        {/* Links to Resources */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/results/case-study'}>
              <div className="p-8">
                <FileText className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Case Study
                </h3>
                <p className="text-zinc-300 mb-6">
                  Read the full story of how Hookah+ transformed operations at a real lounge, including before/after metrics and owner testimonials.
                </p>
                <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400">
                  Read Case Study
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
            <Card className="border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/#roi-calculator'}>
              <div className="p-8">
                <TrendingUp className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  ROI Calculator
                </h3>
                <p className="text-zinc-300 mb-6">
                  Calculate your potential revenue lift and operational improvements with Hookah+. Input your lounge's metrics and see the impact.
                </p>
                <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400">
                  Open Calculator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Social Validation */}
        <section className="mb-16">
          <Card className="border-zinc-700">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Why lounges trust Hookah+
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div>
                  <CheckCircle className="w-6 h-6 text-teal-400 mx-auto mb-3" />
                  <p className="text-zinc-300">Built specifically for hookah lounges</p>
                </div>
                <div>
                  <CheckCircle className="w-6 h-6 text-teal-400 mx-auto mb-3" />
                  <p className="text-zinc-300">Works with your existing POS</p>
                </div>
                <div>
                  <CheckCircle className="w-6 h-6 text-teal-400 mx-auto mb-3" />
                  <p className="text-zinc-300">Designed to reduce chaos and unlock repeat revenue</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4"
            onClick={() => window.location.href = '/onboarding'}
          >
            Book 15-min Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </div>
    </div>
  );
}

