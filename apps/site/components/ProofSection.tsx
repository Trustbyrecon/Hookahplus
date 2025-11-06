'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';
import { TrendingDown, TrendingUp, Clock, Shield, ArrowRight, FileText } from 'lucide-react';

const metrics = [
  {
    label: 'Avg order time',
    value: '↓ 35%',
    description: 'Faster service delivery',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-green-400'
  },
  {
    label: 'Repeat rate',
    value: '↑ 28%',
    description: 'More returning guests',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-teal-400'
  },
  {
    label: 'Turns/night',
    value: '↑ 22%',
    description: 'Higher table utilization',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-blue-400'
  }
];

export default function ProofSection() {
  return (
    <section className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        {/* Metrics Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Real Results from Real Lounges
          </h2>
          <p className="text-zinc-400 text-center mb-8 max-w-2xl mx-auto">
            See how Hookah+ transforms operations and drives measurable improvements
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card
                key={index}
                className="border border-zinc-700 bg-zinc-900/50 text-center p-6 hover:border-teal-500/50 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-800 mb-4 ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className={`text-3xl font-bold mb-2 ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-white mb-1">{metric.label}</div>
                <div className="text-sm text-zinc-400">{metric.description}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Case Study Teaser */}
        <Card className="border border-teal-500/30 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-teal-400" />
                <h3 className="text-2xl font-bold text-white">Case Study: Before vs After</h3>
              </div>
              <p className="text-zinc-300 mb-4">
                See how one independent lounge increased table turnover by 22%, boosted repeat visits by 28%, 
                and improved revenue per occupied hour by 18% in the first month.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <span>22% increase in table turns per night</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <span>28% boost in repeat guest visits</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <span>18% improvement in revenue per occupied hour</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                onClick={() => window.location.href = '/contact'}
              >
                Request Full Case Study
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400 mb-2">40%</div>
                <div className="text-lg text-white mb-4">Reduction in Management Friction</div>
                <p className="text-sm text-zinc-400">
                  From manual coordination to automated workflows—see the transformation in action.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <Shield className="w-6 h-6 text-teal-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Trust-Lock Verified</div>
              <div className="text-xs text-zinc-400">Flow consistency & session integrity</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">✓</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Secure Payments</div>
              <div className="text-xs text-zinc-400">Major-provider-compatible</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <Clock className="w-6 h-6 text-teal-400" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white">30-Day Pilot</div>
              <div className="text-xs text-zinc-400">Try risk-free, cancel anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

