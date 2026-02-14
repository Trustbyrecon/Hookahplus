'use client';

import React from 'react';
import Card from './Card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';

const dataFlowSteps = [
  {
    step: 1,
    title: 'Real-Time Data Capture',
    description: 'Every interaction, order, and movement is captured automatically',
    icon: <Activity className="w-6 h-6" />,
    color: 'teal',
    metrics: ['Session start/end times', 'Flavor preferences', 'Table utilization', 'Staff response times'],
    outcome: 'Complete operational visibility'
  },
  {
    step: 2,
    title: 'Pattern Recognition',
    description: 'AI identifies trends in guest behavior and operational flow',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'purple',
    metrics: ['Peak hour patterns', 'Popular flavor combinations', 'Customer retention signals', 'Staff efficiency gaps'],
    outcome: 'Actionable insights emerge'
  },
  {
    step: 3,
    title: 'Opportunity Detection',
    description: 'System flags optimization opportunities in real-time',
    icon: <Target className="w-6 h-6" />,
    color: 'orange',
    metrics: ['Upsell opportunities', 'Table turnover optimization', 'Staff allocation needs', 'Pricing adjustments'],
    outcome: 'Revenue opportunities identified'
  },
  {
    step: 4,
    title: 'Automated Optimization',
    description: 'System automatically adjusts operations to maximize efficiency',
    icon: <Zap className="w-6 h-6" />,
    color: 'blue',
    metrics: ['Dynamic pricing suggestions', 'Staff task routing', 'Inventory alerts', 'Loyalty triggers'],
    outcome: 'Operations self-optimize'
  },
  {
    step: 5,
    title: 'Performance Tracking',
    description: 'Measure impact and refine strategies continuously',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'green',
    metrics: ['Revenue per session', 'Customer lifetime value', 'Staff productivity', 'ROI metrics'],
    outcome: 'Continuous improvement cycle'
  }
];

const optimizationExamples = [
  {
    category: 'Revenue Optimization',
    icon: <DollarSign className="w-5 h-5" />,
    examples: [
      'Identify peak hours for dynamic pricing',
      'Suggest upsell opportunities based on guest history',
      'Optimize table turnover for maximum revenue',
      'Track which flavors drive highest margins'
    ]
  },
  {
    category: 'Operational Efficiency',
    icon: <Clock className="w-5 h-5" />,
    examples: [
      'Predict prep time based on current load',
      'Route staff tasks for optimal coverage',
      'Alert on inventory needs before stockout',
      'Optimize delivery routes and timing'
    ]
  },
  {
    category: 'Guest Experience',
    icon: <Users className="w-5 h-5" />,
    examples: [
      'Personalize recommendations from past visits',
      'Reduce wait times through predictive staffing',
      'Trigger loyalty rewards at optimal moments',
      'Remember guest preferences automatically'
    ]
  }
];

export default function DataOptimization() {
  return (
    <section id="data-optimization" className="bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Data Captures → Renders → <span className="text-teal-400">Optimizes</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Every interaction becomes data. Every data point becomes an opportunity. 
            Your lounge operations get smarter, night after night.
          </p>
        </div>

        {/* Data Flow Steps */}
        <div className="mb-16">
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {dataFlowSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border border-zinc-700 bg-zinc-900/50 hover:border-teal-500/50 transition-all p-6 h-full">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      step.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                      step.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      step.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                      step.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="text-2xl font-bold text-zinc-600">{step.step}</div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{step.description}</p>

                  {/* Metrics */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-zinc-500 mb-2">CAPTURES:</div>
                    <ul className="space-y-1">
                      {step.metrics.map((metric, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outcome */}
                  <div className="pt-4 border-t border-zinc-800">
                    <div className="text-xs font-semibold text-teal-400">
                      → {step.outcome}
                    </div>
                  </div>
                </Card>

                {/* Arrow between steps */}
                {index < dataFlowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 z-10">
                    <ArrowRight className="w-5 h-5 text-teal-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Examples */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            Real Optimization Opportunities
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {optimizationExamples.map((example, index) => (
              <Card 
                key={index}
                className="border border-zinc-700 bg-zinc-900/50 hover:border-teal-500/50 transition-all p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
                    {example.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-white">{example.category}</h4>
                </div>
                <ul className="space-y-2">
                  {example.examples.map((item, idx) => (
                    <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-zinc-400 mb-6">
            See how your data transforms into actionable insights
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            View Pricing & Plans
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

