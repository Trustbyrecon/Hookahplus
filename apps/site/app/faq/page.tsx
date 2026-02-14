'use client';

import React, { useState } from 'react';
import { SoftwareApplicationSchema } from '../../components/SchemaMarkup';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FAQSchema } from '../../components/SchemaMarkup';
import { 
  HelpCircle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';

export default function FAQPage() {
  const description = "Frequently asked questions about Hookah+ operations software. Learn about features, pricing, integrations, and how Hookah+ works with your POS system.";
  const url = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/faq`
    : "https://hookahplus.net/faq";

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Do I need to replace my POS system?",
      answer: "No. Hookah+ works alongside your existing POS system (Square, Toast, Clover, etc.). We handle operations—session timing, customer memory, and shift handoff—while your POS handles payments. We complete your operations stack, we don't replace it."
    },
    {
      question: "How does integration work?",
      answer: "Simple API connection. Your POS processes payments. Hookah+ tracks sessions and remembers customers. Data syncs automatically. No disruption to your current workflow."
    },
    {
      question: "What if I switch POS systems?",
      answer: "Hookah+ works with Square, Toast, Clover, and others. Your customer memory and session data stay with Hookah+. Switch POS systems without losing your operational data."
    },
    {
      question: "How much does it cost?",
      answer: "Hookah+ pricing is separate from your POS. We offer plans based on your lounge size and needs. See our pricing page for details."
    },
    {
      question: "Can I try it before committing?",
      answer: "Yes. Start a free trial. No credit card required. See how Hookah+ works with your lounge operations."
    },
    {
      question: "What features are included?",
      answer: "Session timing, table management, customer memory (C.L.A.R.K. system), staff notes, shift handoff, and analytics. Features vary by plan."
    },
    {
      question: "Does it work offline?",
      answer: "Yes. Hookah+ has offline capabilities. Session data syncs when connection is restored. Your operations continue even during internet outages."
    },
    {
      question: "How long does setup take?",
      answer: "Setup is quick. Connect your POS (one-time setup), configure your lounge layout, and you're ready. Most lounges are operational within a day."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use industry-standard encryption and security practices. Customer data is encrypted at rest and in transit. We're compliant with data protection regulations."
    },
    {
      question: "Do you offer support?",
      answer: "Yes. We offer email support, documentation, and onboarding assistance. Premium plans include priority support."
    }
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      <SoftwareApplicationSchema 
        name="FAQ"
        description={description}
        url={url}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">{description}</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="p-6 bg-zinc-800/50 border-zinc-700 cursor-pointer hover:border-teal-500/50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        {faq.question}
                      </h3>
                      {openIndex === index && (
                        <p className="text-zinc-300 mt-3 pl-7">{faq.answer}</p>
                      )}
                    </div>
                    <button className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-teal-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-8 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-500/30">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-zinc-300 mb-8">Get in touch and we'll help you find the answers.</p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/contact'}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  Contact Us
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open('https://ig.me/m/hookahplusnet', '_blank')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Demo
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}

