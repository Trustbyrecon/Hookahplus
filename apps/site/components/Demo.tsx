'use client';

import React from 'react';
import { Play, Clock } from 'lucide-react';
import ReflexFlowVisualization from './ReflexFlowVisualization';

export default function Demo() {
  return (
    <section id="demo" className="bg-black px-4 py-20 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Play className="w-6 h-6 text-teal-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">See Hookah+ in Action</h2>
          </div>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
            Experience the complete Reflex Ops flow: from QR scan to loyalty rewards. Watch how every session flows seamlessly through your operations.
          </p>
        </div>

        {/* Flow Visualization */}
        <div className="mb-12">
          <ReflexFlowVisualization />
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Quick Setup</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Get started in minutes. Works with your existing payment setup and requires no new hardware. 
                  The entire flow is automated—from the moment a customer scans the QR code to when they earn loyalty points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

