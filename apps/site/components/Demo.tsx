'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, QrCode, ShoppingCart, ChefHat, Timer, CreditCard, Database, ArrowRight } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function Demo() {
  const steps = [
    {
      number: 1,
      icon: <QrCode className="w-6 h-6 text-teal-400" />,
      title: 'Guest scans a QR',
      description: 'Session automatically created for a table or zone.',
    },
    {
      number: 2,
      icon: <ShoppingCart className="w-6 h-6 text-teal-400" />,
      title: 'Staff build the order',
      description: 'Bowl type, flavors, add-ons, notes — standardized and error-free.',
    },
    {
      number: 3,
      icon: <ChefHat className="w-6 h-6 text-teal-400" />,
      title: 'Prep bar works a clean queue',
      description: 'Orders move PENDING → READY → SERVED with timestamps.',
    },
    {
      number: 4,
      icon: <Timer className="w-6 h-6 text-teal-400" />,
      title: 'Timer starts on delivery',
      description: 'Extensions, refills, and service requests are tracked in real time.',
    },
    {
      number: 5,
      icon: <CreditCard className="w-6 h-6 text-teal-400" />,
      title: 'Checkout syncs to POS',
      description: 'Final session details, price, and metadata go straight to Square / Clover / Toast.',
    },
    {
      number: 6,
      icon: <Database className="w-6 h-6 text-teal-400" />,
      title: 'Session is saved',
      description: 'Time, mix, notes, preferences — all stored for loyalty and analytics.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Play className="w-6 h-6 text-teal-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Your nightly workflow — now with clarity
              </h2>
            </div>
          </motion.div>
        </div>

        {/* 6 Steps */}
        <div className="max-w-5xl mx-auto space-y-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-zinc-700 hover:border-teal-500/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-teal-400 font-bold text-lg">{step.number}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {step.icon}
                        <h3 className="text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        {step.description}
                      </p>
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
            className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
            onClick={() => {
              // Could link to a video demo or scroll to a demo section
              const element = document.getElementById('demo');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Watch the 60-second demo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

