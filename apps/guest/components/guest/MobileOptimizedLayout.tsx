'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileOptimizedLayout({ children, className = '' }: MobileOptimizedLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white ${className}`}>
      {/* Mobile-optimized container */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Mobile header with safe area */}
        <div className="pt-safe-top pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-lg font-bold text-white">HOOKAH+</span>
            </div>
            <div className="text-xs text-zinc-400">
              Guest Portal
            </div>
          </div>
        </div>

        {/* Main content with mobile-optimized spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {children}
        </motion.div>

        {/* Mobile bottom safe area */}
        <div className="pb-safe-bottom"></div>
      </div>
    </div>
  );
}
