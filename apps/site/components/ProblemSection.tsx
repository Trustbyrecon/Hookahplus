'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6 text-center"
        >
          Most POS systems remember payments.
          <br />
          They forget people.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="prose prose-invert max-w-none"
        >
          <p className="text-lg md:text-xl text-zinc-300 mb-4 leading-relaxed">
            Your best regular walks in.
          </p>
          <p className="text-lg md:text-xl text-zinc-300 mb-4 leading-relaxed">
            The staff member who knows them isn't working.
          </p>
          <p className="text-lg md:text-xl text-zinc-300 mb-6 leading-relaxed">
            Their favorite flavor, seat, and vibe are gone.
          </p>

          <div className="bg-zinc-800/50 border-l-4 border-red-500/50 p-6 rounded-r-lg my-8">
            <p className="text-lg text-zinc-200 font-medium mb-2">
              Loyalty resets to zero — even though the relationship shouldn't.
            </p>
          </div>

          <p className="text-lg md:text-xl text-zinc-400 italic text-center mt-8">
            Hookah lounges don't lose customers because of product.
            <br />
            They lose them because <span className="text-red-400 font-semibold not-italic">memory breaks</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
