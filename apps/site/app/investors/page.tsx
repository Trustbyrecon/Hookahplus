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
  AlertTriangle,
  CheckCircle,
  QrCode,
  ShoppingCart,
  ChefHat,
  Timer,
  CreditCard,
  Database,
  Users,
  Building,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Globe,
  ArrowRight,
  Mail,
  Calendar,
  FileText,
  Shield,
  Link as LinkIcon
} from 'lucide-react';

export default function InvestorsPage() {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-red-400" />,
      text: 'Session time is mostly untracked — timers are manual, inconsistent, often forgotten.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-red-400" />,
      text: 'Flavor mixes live in staff memory, not in systems.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-red-400" />,
      text: 'No clean view of table or zone performance.'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-red-400" />,
      text: 'POS systems only see "a bill," not the session that produced it.'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      text: 'Owners fly blind on the biggest drivers of loyalty and margin.'
    },
  ];

  const capabilities = [
    {
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      text: 'Complete session time tracking'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-400" />,
      text: 'Flavor mix memory customized per guest'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-teal-400" />,
      text: 'Table & zone performance analytics'
    },
    {
      icon: <Users className="w-6 h-6 text-teal-400" />,
      text: 'Standardized staff flow from prep → deliver → checkout'
    },
    {
      icon: <LinkIcon className="w-6 h-6 text-teal-400" />,
      text: 'POS sync (Square, Clover, Toast) with no hardware changes'
    },
  ];

  const workflowSteps = [
    {
      icon: <QrCode className="w-6 h-6 text-teal-400" />,
      title: 'QR Scan',
      description: 'Guest scans table QR → new session starts.'
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-teal-400" />,
      title: 'Order Build',
      description: 'Staff select bowl type, flavor mixes, add-ons, and notes.'
    },
    {
      icon: <ChefHat className="w-6 h-6 text-teal-400" />,
      title: 'Prep Queue',
      description: 'Orders move through PENDING → READY → SERVED with timestamps.'
    },
    {
      icon: <Timer className="w-6 h-6 text-teal-400" />,
      title: 'Session Timer',
      description: 'Timer activates on delivery; extensions and requests tracked in real time.'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-teal-400" />,
      title: 'Checkout Sync',
      description: 'Final bill and session metadata sync with the existing POS.'
    },
    {
      icon: <Database className="w-6 h-6 text-teal-400" />,
      title: 'Session Memory',
      description: 'Time, mix, notes, and staff actions stored for analytics and loyalty.'
    },
  ];

  const idealPartners = [
    'Urban lounges with 10–40 tables',
    'Using Square / Clover / Toast',
    'Heavy weekend traffic and flavor-heavy menus',
    'Struggling with time tracking, table ops, or staff coordination'
  ];

  const advantages = [
    {
      number: '1',
      title: 'Session-First Architecture',
      description: 'Time, flavor, table, staff — the primitives of hookah operations.'
    },
    {
      number: '2',
      title: 'Deep Vertical Focus',
      description: 'Built specifically for hookah lounges, not repurposed restaurant tools.'
    },
    {
      number: '3',
      title: 'POS-Adjacent, Not POS-Competing',
      description: 'We complement Square, Clover, and Toast instead of replacing them.'
    },
    {
      number: '4',
      title: 'Session Memory as a Moat',
      description: 'The longer Hookah+ runs in a lounge, the more valuable and irreplaceable it becomes.'
    },
  ];

  const roadmapLanes = [
    {
      title: 'Product Evolution',
      items: [
        'Full analytics suite (tables, zones, staff)',
        'Lounge layout + zone heatmaps',
        'Loyalty and personalized mix recommendations',
        'Automated session risk alerts'
      ]
    },
    {
      title: 'GTM & Scale',
      items: [
        'Anchor 3–5 flagship lounges',
        'Expand across major metro areas',
        'Co-market with POS partners'
      ]
    },
    {
      title: 'Platform Vision',
      items: [
        'Open API for chains and groups',
        'Standardized session data layer for the industry',
        'Predictive insights for staffing, inventory, and repeat behavior'
      ]
    },
  ];

  const useOfFunds = [
    { label: 'Product & engineering', percentage: '50%' },
    { label: 'Lounge onboarding & GTM', percentage: '30%' },
    { label: 'Infrastructure & operations', percentage: '20%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Hookah+ — The Session-First Operating Layer for Hookah Lounges"
        subheadline="Turning chaotic nights into trackable, repeatable revenue. We sit on top of a lounge's POS to track session time, flavor mixes, and table performance — unlocking clarity for owners and consistency for staff."
        primaryCTA={{
          text: 'Book a founder call',
          onClick: () => window.location.href = '/onboarding',
        }}
        secondaryCTA={{
          text: 'Request full deck',
          onClick: () => window.location.href = 'mailto:founder@hookahplus.net?subject=Investor Deck Request',
        }}
        trustIndicators={[
          { icon: <Users className="w-4 h-4 text-teal-400" />, text: 'Founder: Dwayne Clark' },
          { icon: <Zap className="w-4 h-4 text-teal-400" />, text: 'Stage: MVP live, pilot lounges in motion' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* 1. The Problem */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-red-500/30 bg-red-500/5">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  The Problem
                </h2>
                <p className="text-xl text-zinc-300 mb-6">
                  Hookah lounges run on sessions, not transactions — but every system they use is built for transactions.
                </p>
                <p className="text-lg text-zinc-400 mb-6">
                  Operators deal with daily pain points:
                </p>
                <ul className="space-y-4 mb-6">
                  {problems.map((problem, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{problem.icon}</div>
                      <span className="text-zinc-300 text-lg">{problem.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-red-500/30">
                  <p className="text-xl font-semibold text-white">
                    Result: High-volume lounges operate in chaos, leaving money on the table every night.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 2. Our Solution */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-teal-500/30 bg-teal-500/5">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Our Solution: The Session-First Layer
                </h2>
                <p className="text-xl text-zinc-300 mb-6 leading-relaxed">
                  Hookah+ is software that sits on top of the lounge's existing POS and workflow.
                  We transform every hookah session — from QR scan to checkout — into structured data.
                </p>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Core capabilities:</h3>
                  <ul className="space-y-3">
                    {capabilities.map((cap, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {cap.icon}
                        <span className="text-zinc-300">{cap.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-teal-500/30">
                  <p className="text-lg font-semibold text-teal-400">
                    No rip-and-replace required. Hookah+ works with what lounges already have.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 3. How Hookah+ Works */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            How Hookah+ Works (Night After Night)
          </h2>
          <p className="text-xl text-zinc-400 text-center mb-12 max-w-3xl mx-auto">
            A clean operating flow for staff & owners:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-zinc-700 hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-zinc-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xl font-semibold text-teal-400">
            Every session becomes actionable intelligence.
          </p>
        </section>

        {/* 4. Customer Focus */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-zinc-700">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Customer Focus
                </h2>
                <p className="text-xl text-zinc-300 mb-6">
                  We serve high-volume hookah lounges first.
                </p>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Our ideal partners:</h3>
                  <ul className="space-y-3">
                    {idealPartners.map((partner, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{partner}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-zinc-700">
                  <p className="text-lg text-zinc-300">
                    This segment feels the pain most acutely — and sees impact immediately.
                  </p>
                  <p className="text-sm text-zinc-400 mt-2 italic">
                    Secondary paths: multi-location groups, franchisors, and POS partners.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 5. Market Opportunity */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-zinc-700">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Market Opportunity
                </h2>
                <div className="space-y-4 text-zinc-300 mb-6">
                  <p className="text-lg">
                    Hookah lounges represent a strong, underserved vertical within hospitality:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>Thousands of lounges across the U.S., Europe, and MENA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>Most using general-purpose POS tools that don't match session-based operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-400 mt-1">•</span>
                      <span>High session frequency and long dwell times create prime conditions for optimization</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-zinc-700">
                  <p className="text-xl font-semibold text-white">
                    We're building the default operating layer for a niche that has never had purpose-built software.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 6. Traction & Early Signals */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-teal-500/30 bg-teal-500/5">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Traction & Early Signals
                </h2>
                <p className="text-lg text-zinc-300 mb-6">
                  Hookah+ is live and evolving with real operators.
                </p>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Early traction indicators:</h3>
                  <ul className="space-y-2 text-zinc-300 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Pilot lounges actively onboarding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Sessions tracked and staff flow validated</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Strong operator feedback</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <p className="text-zinc-300 italic mb-2">"We finally stopped arguing about timers."</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <p className="text-zinc-300 italic mb-2">"Staff love seeing the queue — no more guessing."</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <p className="text-zinc-300 italic mb-2">"Checkout disputes dropped immediately."</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-teal-500/30 mt-6">
                  <p className="text-lg text-zinc-300">
                    Our product improves every week through direct feedback loops with real lounges.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 7. Business Model */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-zinc-700">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Business Model
                </h2>
                <p className="text-lg text-zinc-300 mb-6">
                  We monetize through a hybrid SaaS model:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Monthly subscription per lounge</span>
                      <span className="text-zinc-400"> (Starter, Pro, Network tiers)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Session-based add-ons</span>
                      <span className="text-zinc-400"> for advanced features</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Building className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Multi-location and franchisor pricing</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <LinkIcon className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Future integrations</span>
                      <span className="text-zinc-400"> for POS partners and hospitality networks</span>
                    </div>
                  </li>
                </ul>
                <div className="pt-4 border-t border-zinc-700">
                  <p className="text-xl font-semibold text-white">
                    Revenue scales with sessions — not just locations.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 8. Competitive Advantages */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Competitive Advantages
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-teal-400">{advantage.number}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {advantage.title}
                      </h3>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xl font-semibold text-teal-400">
            The longer Hookah+ runs in a lounge, the smarter and stickier it becomes.
          </p>
        </section>

        {/* 9. Roadmap */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-zinc-700">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                  Roadmap
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {roadmapLanes.map((lane, index) => (
                    <div key={index} className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-700">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        {lane.title}
                      </h3>
                      <ul className="space-y-2">
                        {lane.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                            <span className="text-zinc-300 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 10. Team */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-zinc-700">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Team
                </h2>
                <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                  Hookah+ is founded by <strong className="text-white">Dwayne Clark</strong>, with a focus on applying structured operational intelligence to an underserved, complex hospitality vertical.
                </p>
                <div className="pt-4 border-t border-zinc-700">
                  <p className="text-xl font-semibold text-white mb-2">Our belief:</p>
                  <p className="text-lg text-zinc-300 italic">
                    The unglamorous parts of a hookah lounge — timing, prep flow, mix memory — are the ones that drive repeat visits and revenue. Mastering them creates an unfair advantage.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 11. Current Raise */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-teal-500/30 bg-teal-500/5">
              <div className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Current Raise
                </h2>
                <p className="text-lg text-zinc-300 mb-6">
                  We are raising funding to:
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Expand engineering and product velocity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Deepen POS integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Onboard the first 50–100 lounges</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">Build scalable onboarding & support systems</span>
                  </li>
                </ul>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Use of funds breakdown:</h3>
                  <div className="space-y-3">
                    {useOfFunds.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <span className="text-zinc-300">{item.label}</span>
                        <span className="text-teal-400 font-semibold">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-teal-500/30">
                  <p className="text-lg text-zinc-300 mb-6">
                    If you're interested in participating or want a deeper conversation:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      onClick={() => window.location.href = '/onboarding'}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book a founder call
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400"
                      onClick={() => window.location.href = 'mailto:founder@hookahplus.net?subject=Investor Deck Request'}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact founder@hookahplus.net
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Footer CTA Section */}
        <section className="mb-16">
          <Card className="border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
            <div className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Let's define the operating layer of the hookah industry.
              </h2>
              <p className="text-xl text-zinc-300 mb-8">
                Hookah+ is building the first system of record for session-based lounges.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4"
                  onClick={() => window.location.href = '/onboarding'}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a founder call
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
                  onClick={() => window.location.href = 'mailto:founder@hookahplus.net?subject=Investor Deck Request'}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Request the full investor deck
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 px-8 py-4"
                  onClick={() => window.location.href = '/docs'}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  See the Hookah+ product overview
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

