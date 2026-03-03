'use client';

import React from 'react';
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
    onClick?: () => void;
    href?: string;
  };
  secondaryCTA?: {
    text: string;
    onClick?: () => void;
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
  trustIndicators,
  className = ''
}: PageHeroProps) {
  return (
    <section className={`relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden border-b border-zinc-800 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="mt-2 text-base md:text-lg text-zinc-300 max-w-3xl mx-auto mb-6">
            {subheadline}
          </p>

          {/* Quantifiable Benefit */}
          {benefit && (
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-xl px-6 py-3 mb-6">
              {benefit.icon || <TrendingUp className="w-5 h-5 text-teal-400" />}
              <div className="text-left">
                <div className="text-xl font-bold text-teal-400">{benefit.value}</div>
                <div className="text-xs text-zinc-400">{benefit.description}</div>
              </div>
            </div>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {primaryCTA && (
                primaryCTA.href ? (
                  <a
                    href={primaryCTA.href}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg shadow-teal-500/20 transform hover:scale-105 transition-all duration-200"
                  >
                    {primaryCTA.text}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 text-base font-semibold shadow-lg shadow-teal-500/20"
                    onClick={primaryCTA.onClick}
                  >
                    {primaryCTA.text}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )
              )}
              {secondaryCTA && (
                secondaryCTA.href ? (
                  <a
                    href={secondaryCTA.href}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
                  >
                    {secondaryCTA.text}
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    className="px-6 py-3 text-base border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 transition-all"
                    onClick={secondaryCTA.onClick}
                  >
                    {secondaryCTA.text}
                  </Button>
                )
              )}
            </div>
          )}

          {/* Trust Indicators */}
          {trustIndicators && trustIndicators.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-zinc-400">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  {indicator.icon}
                  <span>{indicator.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

