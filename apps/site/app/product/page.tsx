'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '../../components/PageHero';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Clock, 
  Sparkles, 
  BarChart3, 
  ArrowRight,
  Link as LinkIcon,
  CheckCircle,
  QrCode,
  ShoppingCart,
  ChefHat,
  Timer,
  CreditCard,
  Database
} from 'lucide-react';

export default function ProductPage() {
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

  const workflowSteps = [
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <PageHero
        headline="Hookah+ Product Overview"
        subheadline="A session-first layer on top of your POS that tracks time, flavor mixes, and table performance — so every hookah night runs smoother and earns more."
        primaryCTA={{
          text: 'Book 15-min Demo',
          onClick: () => window.location.href = '/onboarding',
        }}
        secondaryCTA={{
          text: 'Read Full Docs',
          onClick: () => window.location.href = '/docs',
        }}
        trustIndicators={[
          { icon: <CheckCircle className="w-4 h-4 text-teal-400" />, text: 'Works with your POS' },
          { icon: <CheckCircle className="w-4 h-4 text-teal-400" />, text: 'No hardware required' },
          { icon: <CheckCircle className="w-4 h-4 text-teal-400" />, text: '30-day pilot available' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* 3 Pillars */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            What Hookah+ improves inside your lounge
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
        </section>

        {/* POS Sync */}
        <section className="mb-16">
          <Card className="border-teal-500/30 bg-teal-500/5">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <LinkIcon className="w-8 h-8 text-teal-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    POS Integration
                  </h2>
                  <p className="text-zinc-300 leading-relaxed mb-4">
                    Hookah+ integrates seamlessly with your existing POS system. We work with Square, Clover, Toast, and other major payment processors. No need to replace your current setup — Hookah+ sits on top and enhances it.
                  </p>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Automatic session data sync to your POS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Final pricing and item breakdown sent automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>No duplicate data entry required</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400"
                onClick={() => window.location.href = '/docs#integrations'}
              >
                Learn more about integrations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </section>

        {/* Example Session Flow */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Example Session Flow
          </h2>
          <div className="max-w-5xl mx-auto space-y-4">
            {workflowSteps.map((step, index) => (
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
        </section>

        {/* Links to Sub-pages */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Explore Product Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/sessions'}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">Sessions</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  Deep dive into session tracking, timers, and time-based pricing.
                </p>
                <Button variant="ghost" className="text-teal-400">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
            <Card className="hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/flavor-demo'}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">Flavor Mixes</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  Explore the flavor mix builder and customer favorites system.
                </p>
                <Button variant="ghost" className="text-teal-400">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
            <Card className="hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/fire-session-dashboard'}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">Dashboard</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  See analytics, table performance, and revenue insights.
                </p>
                <Button variant="ghost" className="text-teal-400">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
            <Card className="hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/lounge-layout'}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-white">Lounge Layout</h3>
                </div>
                <p className="text-zinc-300 mb-4">
                  Design your lounge layout and assign tables and zones.
                </p>
                <Button variant="ghost" className="text-teal-400">
                  Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
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

