'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function ComparisonSection() {
  const capabilities = [
    { feature: 'Payments', traditional: true, hookahPlus: 'Uses POS' },
    { feature: 'Session tracking', traditional: false, hookahPlus: true },
    { feature: 'Flavor memory', traditional: false, hookahPlus: true },
    { feature: 'Staff notes', traditional: false, hookahPlus: true },
    { feature: 'Shift handoff', traditional: false, hookahPlus: true },
    { feature: 'Emotional loyalty', traditional: false, hookahPlus: true }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          Hookah+ vs Traditional POS
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse bg-zinc-800/50 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="px-6 py-4 text-left text-zinc-300 font-semibold border-b border-zinc-700">Capability</th>
                <th className="px-6 py-4 text-center text-zinc-300 font-semibold border-b border-zinc-700">Traditional POS</th>
                <th className="px-6 py-4 text-center text-zinc-300 font-semibold border-b border-zinc-700">Hookah+</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap, idx) => (
                <tr key={idx} className="border-b border-zinc-700/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-300 font-medium">{cap.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {cap.traditional === true ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : cap.traditional === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-zinc-400">{cap.traditional}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cap.hookahPlus === true ? (
                      <Check className="w-5 h-5 text-teal-400 mx-auto" />
                    ) : typeof cap.hookahPlus === 'string' ? (
                      <span className="text-teal-400 font-medium">{cap.hookahPlus}</span>
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
