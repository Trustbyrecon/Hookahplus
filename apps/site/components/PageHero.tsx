'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, CheckCircle, Clock, Shield, TrendingUp, Zap } from 'lucide-react';

interface TrustIndicator {
  icon: React.ReactNode;
  text: string;
}

interface PageHeroProps {
  headline: string;
  subheadline: string;
  benefit?: {
    value: string;
    description: string;
    icon?: React.ReactNode;
  };
  primaryCTA?: {
    text: string;
    onClick: () => void;
    href?: string;
  };
  secondaryCTA?: {
    text: string;
    onClick: () => void;
    href?: string;
  };
  tertiaryCTA?: {
    text: string;
    onClick: () => void;
    href?: string;
  };
  trustIndicators?: TrustIndicator[];
  className?: string;
}

export default function PageHero({
  headline,
  subheadline,
  benefit,
  primaryCTA,
  secondaryCTA,
  tertiaryCTA,
  trustIndicators,
  className = ''
}: PageHeroProps) {
  return (
    <section className={`relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden border-b border-zinc-800 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-8"
          >
            {subheadline}
          </motion.p>

          {/* Quantifiable Benefit */}
          {benefit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-xl px-6 py-4 mb-8"
            >
              {benefit.icon || <TrendingUp className="w-6 h-6 text-teal-400" />}
              <div className="text-left">
                <div className="text-2xl font-bold text-teal-400">{benefit.value}</div>
                <div className="text-sm text-zinc-400">{benefit.description}</div>
              </div>
            </motion.div>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA || tertiaryCTA) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {primaryCTA && (
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
                  onClick={primaryCTA.onClick}
                  {...(primaryCTA.href ? { href: primaryCTA.href } : {})}
                >
                  {primaryCTA.text}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
                  onClick={secondaryCTA.onClick}
                  {...(secondaryCTA.href ? { href: secondaryCTA.href } : {})}
                >
                  {secondaryCTA.text}
                </Button>
              )}
              {tertiaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-500 hover:text-white transition-all"
                  onClick={tertiaryCTA.onClick}
                  {...(tertiaryCTA.href ? { href: tertiaryCTA.href } : {})}
                >
                  {tertiaryCTA.text}
                </Button>
              )}
            </motion.div>
          )}

          {/* Trust Indicators */}
          {trustIndicators && trustIndicators.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-zinc-400"
            >
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  {indicator.icon}
                  <span>{indicator.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

