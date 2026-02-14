'use client';

import React from 'react';
import Link from 'next/link';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FAQSchema } from '../../components/SchemaMarkup';
import { 
  CheckCircle, 
  X, 
  AlertCircle,
  Clock,
  Users,
  CreditCard,
  ArrowRight,
  Settings,
  BarChart3,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

export default function WorksWithSquarePage() {
  const faqs = [
    {
      question: "Do I need to replace Square?",
      answer: "No. Hookah+ works alongside Square. Square handles payments. Hookah+ handles operations—session timing, customer memory, and shift handoff."
    },
    {
      question: "How does integration work?",
      answer: "Simple API connection. Square processes payments. Hookah+ tracks sessions and remembers customers. Data syncs automatically."
    },
    {
      question: "What if I switch POS systems?",
      answer: "Hookah+ works with Square, Toast, Clover, and others. Your customer memory and session data stay with Hookah+."
    },
    {
      question: "How much does it cost?",
      answer: "Hookah+ pricing is separate from Square. You pay for both, but they solve different problems. See our pricing page for details."
    },
    {
      question: "Can I try it before committing?",
      answer: "Yes. Start a free trial. No credit card required. See how Hookah+ works with your existing Square setup."
    }
  ];

  const comparisonData = [
    { capability: 'Payments', square: '✅ Excellent', hookah: 'Uses Square' },
    { capability: 'Session Timing', square: '❌ Not available', hookah: '✅ Built-in' },
    { capability: 'Table Management', square: '❌ Not available', hookah: '✅ Real-time' },
    { capability: 'Customer Memory', square: '⚠️ Points only', hookah: '✅ Full profiles' },
    { capability: 'Flavor Preferences', square: '❌ Not available', hookah: '✅ Remembered' },
    { capability: 'Staff Notes', square: '❌ Not available', hookah: '✅ Full notes' },
    { capability: 'Shift Handoff', square: '⚠️ Basic reports', hookah: '✅ Full context' },
    { capability: 'Session Extensions', square: '❌ Not available', hookah: '✅ Built-in' },
    { capability: 'Peak Hour Tools', square: '❌ Not available', hookah: '✅ Dynamic pricing' },
    { capability: 'Analytics', square: '⚠️ Sales only', hookah: '✅ Operations + sales' },
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
              <span className="text-teal-400 font-medium">Square Integration</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Run Your Hookah Lounge Above Square
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Sessions, Memory, Loyalty
              </span>
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Square handles payments. Hookah+ handles everything else. We don't replace Square—we complete it.
            </p>

            <blockquote className="text-lg text-zinc-400 italic mb-8 border-l-4 border-teal-500 pl-4 max-w-2xl mx-auto text-left">
              "Square is excellent at payments. Hookah+ exists because payments don't run a lounge."
            </blockquote>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/onboarding'}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Start Free Trial
              </Button>
              <Link
                href="/integrations/square"
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-teal-500/50 text-white font-medium rounded-lg transition-all duration-300"
              >
                See Integration Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* The Truth About Square */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Square Is Great at Payments. Here's What It Doesn't Do.</h2>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              Square excels at payment processing, transaction records, basic inventory, and simple reporting. These are essential. But they're not enough to run a hookah lounge.
            </p>
            <p className="text-zinc-300 mb-8 leading-relaxed">
              Hookah lounges need session timing, customer memory, shift handoff, and table management—capabilities Square doesn't provide. This isn't a replacement for Square. It's a <strong className="text-white">completion</strong> of it.
            </p>
            <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-400 font-semibold text-lg">
                "Square owns transactions. Hookah+ owns sessions, memory, and loyalty."
              </p>
            </div>
            <div className="mt-6">
              <Link 
                href="/blog/square-great-payments-hookah-lounges-struggle"
                className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Read: Why Hookah Lounges Still Struggle After Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Square vs Hookah+: What Each Handles</h2>
            <Card className="p-0 overflow-hidden border-zinc-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Capability</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Square</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Hookah+</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {comparisonData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{row.capability}</td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{row.square}</td>
                        <td className="px-6 py-4 text-sm text-teal-400 font-medium">{row.hookah}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="mt-6 p-6 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-zinc-300 italic">
                "Square handles money. Hookah+ handles people, time, and memory."
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/blog/session-timing-runs-hookah-lounge"
                className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Read: Why Session Timing Runs a Lounge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/blog/loyalty-remembering-people-not-points"
                className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Read: Loyalty Is Remembering People</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* How They Work Together */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How Hookah+ Works With Square</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Customer arrives', desc: 'Hookah+ checks them in, loads profile (if returning), assigns table' },
                { step: 2, title: 'Session starts', desc: 'Hookah+ starts timer, tracks table, manages session state' },
                { step: 3, title: 'During session', desc: 'Staff adds notes, tracks refills, manages extensions' },
                { step: 4, title: 'Checkout', desc: 'Square processes payment, Hookah+ records session data, updates customer memory' },
                { step: 5, title: 'Next visit', desc: 'Hookah+ remembers preferences, Square processes payment again' },
              ].map((item) => (
                <Card key={item.step} className="p-6 bg-zinc-800/50 border-zinc-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-400 font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-zinc-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 p-6 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-400 font-semibold">
                "Square processes the payment. Hookah+ manages the experience."
              </p>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Core Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Clock className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Session Timing & Table Management</h3>
                <ul className="space-y-2 text-sm text-zinc-300 mb-4">
                  <li>• Real-time session timers</li>
                  <li>• Table status visibility</li>
                  <li>• Extension management</li>
                  <li>• Peak hour tools</li>
                  <li>• Dynamic pricing</li>
                </ul>
                <p className="text-xs text-zinc-400 italic mb-4">"Track time, not just transactions."</p>
                <Link href="/blog/session-timing-runs-hookah-lounge" className="text-teal-400 hover:text-teal-300 text-sm inline-flex items-center gap-1">
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>

              {/* Pillar 2 */}
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Users className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Remember People, Not Just Points</h3>
                <ul className="space-y-2 text-sm text-zinc-300 mb-4">
                  <li>• Customer profiles</li>
                  <li>• Flavor preferences</li>
                  <li>• Behavioral patterns</li>
                  <li>• Staff notes</li>
                  <li>• Cross-visit context</li>
                </ul>
                <p className="text-xs text-zinc-400 italic mb-4">"Loyalty isn't points. It's remembering people."</p>
                <Link href="/blog/loyalty-remembering-people-not-points" className="text-teal-400 hover:text-teal-300 text-sm inline-flex items-center gap-1">
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>

              {/* Pillar 3 */}
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <Settings className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Seamless Shift Handoff</h3>
                <ul className="space-y-2 text-sm text-zinc-300 mb-4">
                  <li>• Context preservation</li>
                  <li>• Staff notes</li>
                  <li>• Active session visibility</li>
                  <li>• Customer history access</li>
                </ul>
                <p className="text-xs text-zinc-400 italic mb-4">"Every shift starts with full context."</p>
                <Link href="/session-timer-pos" className="text-teal-400 hover:text-teal-300 text-sm inline-flex items-center gap-1">
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Integration Details */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How Integration Works</h2>
            <Card className="p-6 bg-zinc-800/50 border-zinc-700 mb-6">
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>No POS replacement required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Works alongside Square</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Data sync (transactions, customer IDs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>API integration (optional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Webhook support (optional)</span>
                </li>
              </ul>
            </Card>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold mb-4">Setup Process</h3>
              {[
                'Keep Square (no changes needed)',
                'Add Hookah+ (separate system)',
                'Connect accounts (one-time setup)',
                'Start using (immediate)'
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-teal-400 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-zinc-300">{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-6 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-zinc-300 italic">"No disruption. No replacement. Just completion."</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What You Get</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <h3 className="text-xl font-semibold mb-4 text-teal-400">Immediate Benefits</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>• Real-time session tracking</li>
                  <li>• Customer memory</li>
                  <li>• Shift handoff</li>
                  <li>• Table management</li>
                </ul>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <h3 className="text-xl font-semibold mb-4 text-teal-400">Long-Term Benefits</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>• Higher revenue per table</li>
                  <li>• Increased customer retention</li>
                  <li>• Reduced staff stress</li>
                  <li>• Data-driven decisions</li>
                </ul>
              </Card>
            </div>
            <div className="mt-6 p-6 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-400 font-semibold">"Square solved payments. Hookah+ solves operations."</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Common Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="p-6 bg-zinc-800/50 border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-zinc-300">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Complete Your Operations Stack?</h2>
            <p className="text-xl text-zinc-300 mb-8">
              Square handles payments. Hookah+ handles everything else.
            </p>
            <p className="text-zinc-400 mb-8 italic">
              "Square doesn't replace Hookah+. Hookah+ doesn't replace Square. They complete each other."
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/onboarding'}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Start Free Trial
              </Button>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-teal-500/50 text-white font-medium rounded-lg transition-all duration-300"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

