'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQSchema } from './SchemaMarkup';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: 'Is Hookah+ a POS system?',
      answer: 'No. Hookah+ works above your existing POS and adds session tracking, memory, and loyalty.'
    },
    {
      question: 'Does Hookah+ work with Square or Clover?',
      answer: 'Yes. Hookah+ integrates with Square, Clover, and Toast.'
    },
    {
      question: 'Is Hookah+ only for hookah lounges?',
      answer: 'Yes. It's built specifically for hookah culture and session-based hospitality.'
    },
    {
      question: 'How is loyalty different from points?',
      answer: 'Hookah+ loyalty is based on behavior, preferences, and history — not just spend.'
    },
    {
      question: 'How does Hookah+ remember guests?',
      answer: 'Hookah+ builds guest profiles from session data, flavor preferences, visit patterns, and staff notes. This memory persists across visits and staff changes.'
    },
    {
      question: 'What happens to my POS data?',
      answer: 'Your POS data stays in your POS system. Hookah+ syncs session totals and line items for checkout, but never replaces your payment processing.'
    }
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-800/70 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  {openIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === idx && (
                  <div className="px-6 py-4 border-t border-zinc-700/50">
                    <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
