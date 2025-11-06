'use client';

import React from 'react';
import Card from './Card';
import { QrCode, ChefHat, Truck, CreditCard, Heart, ArrowRight } from 'lucide-react';

const flowSteps = [
  {
    title: 'QR Order',
    description: 'Guests scan, pick mix, start session',
    icon: <QrCode className="w-6 h-6" />,
    color: 'teal'
  },
  {
    title: 'Prep → FOH',
    description: 'Back-of-house signals, staff handoff prompts',
    icon: <ChefHat className="w-6 h-6" />,
    color: 'orange'
  },
  {
    title: 'Delivery',
    description: 'Tray confirm, heat state, seat/zone pin',
    icon: <Truck className="w-6 h-6" />,
    color: 'blue'
  },
  {
    title: 'Checkout',
    description: 'Fast pay; major-provider-compatible',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'green'
  },
  {
    title: 'Loyalty',
    description: 'Behavioral Memory triggers return intent',
    icon: <Heart className="w-6 h-6" />,
    color: 'purple'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How it Works <span className="text-teal-400">(night after night)</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            This is the flow your guests and staff feel every night—now measured and optimized.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          {flowSteps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border border-zinc-700 bg-zinc-900/50 hover:border-teal-500/50 transition-all p-6 text-center h-full">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                  step.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                  step.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                  step.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  step.color === 'green' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </Card>
              {index < flowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                  <ArrowRight className="w-6 h-6 text-teal-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-zinc-400 mb-6">
            No new hardware required. Works seamlessly with your existing payment setup.
          </p>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const demoSection = document.getElementById('demo');
              if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            See it in action
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

