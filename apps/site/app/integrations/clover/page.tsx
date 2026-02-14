'use client';

import React from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { FAQSchema } from '../../../components/SchemaMarkup';
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap, 
  ArrowRight,
  CreditCard,
  Settings,
  Lock,
  Calendar
} from 'lucide-react';

export default function CloverIntegrationPage() {
  const faqs = [
    {
      question: "Does Hookah+ replace Clover POS?",
      answer: "No. Hookah+ runs the hookah session timer, flavors, and lounge workflow. Clover stays your card-present POS. Hookah+ syncs key session and order details to Clover."
    },
    {
      question: "What syncs to Clover?",
      answer: "Session total, flavor add-ons, optional notes, timestamps, and receipt-ready line items."
    },
    {
      question: "When will Clover integration be available?",
      answer: "Clover integration is planned for Q2 2026. Join the waitlist to be notified when it launches."
    },
    {
      question: "Can staff start and stop timers from a phone?",
      answer: "Yes, Hookah+ supports mobile-friendly operator controls."
    },
    {
      question: "Will customer-facing receipts show staff SessionNotes?",
      answer: "No. SessionNotes are private, staff-facing only and never appear on customer receipts."
    }
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-6">
              <CreditCard className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 font-medium">Clover Integration</span>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Coming Q2 2026</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hookah+ for Clover POS
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Run timed hookah sessions, flavor add-ons, and QR checkout, while Clover stays your POS.
            </p>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Who It's For</h2>
            <p className="text-zinc-300 mb-4">
              Hookah lounges, hookah bars, cafes that sell hookah by session, teams needing staff workflow and time tracking.
            </p>
          </div>
        </section>

        {/* What Hookah+ Adds */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What Hookah+ Adds</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <Clock className="w-5 h-5" />, text: "Session timer with start/stop/pause" },
                { icon: <Zap className="w-5 h-5" />, text: "Flavor mix history and tracking" },
                { icon: <Settings className="w-5 h-5" />, text: "Premium add-on detection" },
                { icon: <CreditCard className="w-5 h-5" />, text: "QR pre-order and bill pay" },
                { icon: <Shield className="w-5 h-5" />, text: "Staff SessionNotes (private)" },
                { icon: <CheckCircle className="w-5 h-5" />, text: "Loyalty hooks and tracking" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="text-teal-400 mt-0.5">{feature.icon}</div>
                  <span className="text-zinc-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">How the Integration Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Connect Clover</h3>
                  <p className="text-zinc-400">Authorize Hookah+ to access your Clover account (one-time setup)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Map Items</h3>
                  <p className="text-zinc-400">Map Hookah+ session products and add-ons to Clover catalog items</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Start Sessions</h3>
                  <p className="text-zinc-400">Staff start sessions in Hookah+, timer tracks duration and add-ons</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Push Totals</h3>
                  <p className="text-zinc-400">When session closes, Hookah+ pushes receipt-ready totals to Clover for checkout</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Syncs */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">What Syncs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-green-500/10 border-green-500/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Syncs to Clover
                </h3>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li>• Session total and add-on line items</li>
                  <li>• Session timestamps and metadata</li>
                  <li>• Customer-facing receipt description (controlled)</li>
                </ul>
              </Card>
              
              <Card className="p-6 bg-red-500/10 border-red-500/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Never Syncs
                </h3>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li>• Staff SessionNotes (private)</li>
                  <li>• Internal trust/ops logs</li>
                  <li>• Customer personal data beyond transaction</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="p-6 bg-zinc-800/50 border-zinc-700">
                  <h3 className="font-semibold text-teal-400 mb-2">{faq.question}</h3>
                  <p className="text-zinc-300">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Join the Clover Integration Waitlist</h2>
              <p className="text-zinc-300 mb-8">
                Be notified when Clover integration launches in Q2 2024.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/pos-waitlist'}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  Join Waitlist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                  className="border-zinc-700 hover:border-teal-500"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  15 min demo
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

