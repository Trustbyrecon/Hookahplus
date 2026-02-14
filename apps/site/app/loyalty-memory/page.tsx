'use client';

import React from 'react';
import Script from 'next/script';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FAQSchema } from '../../components/SchemaMarkup';
import { 
  CheckCircle, 
  Users, 
  Heart,
  ArrowRight,
  Brain,
  Clock,
  Star,
  X
} from 'lucide-react';

export default function LoyaltyMemoryPage() {
  const faqs = [
    {
      question: "How is Hookah+ loyalty different from points?",
      answer: "Hookah+ loyalty is based on behavior, preferences, and history — not just spend. We remember flavor mixes, visit patterns, seat preferences, and staff notes to create emotional loyalty, not transactional points."
    },
    {
      question: "How does Hookah+ remember guests?",
      answer: "Hookah+ builds guest profiles from session data, flavor preferences, visit patterns, and staff notes. This memory persists across visits and staff changes, so every interaction feels personal."
    },
    {
      question: "What happens when staff changes?",
      answer: "Guest memory is preserved in Hookah+. New staff members see flavor preferences, visit history, and VIP signals instantly — so the relationship continues even when faces change."
    },
    {
      question: "Is guest data private?",
      answer: "Yes. Guest memory profiles are stored securely and only accessible to authorized staff. Customer-facing receipts never show staff notes or internal preferences."
    },
    {
      question: "Can I import existing customer data?",
      answer: "Yes. Hookah+ can import customer data from your POS system during setup. We'll help you migrate existing guest information to build memory from day one."
    }
  ];

  const memoryFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Flavor Memory",
      description: "Remembers favorite flavor mixes, combinations, and preferences across visits."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Visit Patterns",
      description: "Tracks frequency, timing, and party size to anticipate needs."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Guest Profiles",
      description: "Builds rich profiles from behavior, not just transactions."
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "VIP Signals",
      description: "Identifies regulars and high-value guests automatically."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emotional Loyalty",
      description: "Creates connection through memory, not just points."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Staff Notes",
      description: "Private notes that persist across shifts and staff changes."
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
              <Heart className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 font-medium">Loyalty & Memory</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Loyalty is remembering people, not just points.
            </h1>
            
            <p className="text-xl text-zinc-300 mb-4 max-w-2xl mx-auto">
              Great hospitality is built on memory, not transactions. Hookah+ remembers flavor mixes, visit patterns, and preferences — so every guest feels known, even when staff changes.
            </p>
            
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              Your lounge already has great guests. Hookah+ helps you remember them.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Problem with Points-Based Loyalty</h2>
            <div className="space-y-4 text-zinc-300">
              <p className="text-lg">
                Most loyalty programs track spend, not relationships. They remember transactions, not people.
              </p>
              <p className="text-lg">
                Your best regular walks in. The staff member who knows them isn't working. Their favorite flavor, seat, and vibe are gone.
              </p>
              <div className="bg-zinc-800/50 border-l-4 border-red-500/50 p-6 rounded-r-lg my-6">
                <p className="text-lg text-zinc-200 font-medium">
                  Loyalty resets to zero — even though the relationship shouldn't.
                </p>
              </div>
              <p className="text-lg">
                Hookah lounges don't lose customers because of product. They lose them because <span className="text-red-400 font-semibold">memory breaks</span>.
              </p>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How Hookah+ Restores Memory</h2>
            <p className="text-xl text-zinc-300 mb-8">
              Hookah+ loyalty is based on behavior, preferences, and history — not just spend. We remember what matters:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {memoryFeatures.map((feature, idx) => (
                <Card key={idx} className="p-6 bg-zinc-800/50 border-zinc-700 hover:border-teal-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-teal-400 flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                      <p className="text-zinc-300">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How Memory Works</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Capture During Experience</h3>
                  <p className="text-zinc-400">Flavor mixes, preferences, staff notes, VIP signals — all captured naturally during the session.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Build Guest Profiles</h3>
                  <p className="text-zinc-400">Hookah+ automatically builds rich profiles from behavior, not just transactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Preserve Across Shifts</h3>
                  <p className="text-zinc-400">Memory persists across staff changes, so every interaction feels personal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Create Emotional Loyalty</h3>
                  <p className="text-zinc-400">Guests are remembered — even when staff changes. That's emotional loyalty, not transactional points.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Points vs Memory</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-zinc-800/50 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-zinc-900/50">
                    <th className="px-6 py-4 text-left text-zinc-300 font-semibold border-b border-zinc-700">Capability</th>
                    <th className="px-6 py-4 text-center text-zinc-300 font-semibold border-b border-zinc-700">Points-Based</th>
                    <th className="px-6 py-4 text-center text-zinc-300 font-semibold border-b border-zinc-700">Hookah+ Memory</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-700/50">
                    <td className="px-6 py-4 text-zinc-300 font-medium">Tracks spend</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="px-6 py-4 text-zinc-300 font-medium">Remembers preferences</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="px-6 py-4 text-zinc-300 font-medium">Preserves across staff</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-zinc-700/50">
                    <td className="px-6 py-4 text-zinc-300 font-medium">Emotional connection</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-teal-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
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
              <h2 className="text-3xl font-bold mb-4">Your lounge already has great guests.</h2>
              <p className="text-xl text-zinc-300 mb-2">Hookah+ helps you remember them.</p>
              <p className="text-zinc-400 mb-8">
                See how memory-powered hospitality works.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/onboarding'}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  See Hookah+ in Action
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/integrations/square'}
                  className="border-zinc-700 hover:border-teal-500"
                >
                  Learn About Integrations
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
