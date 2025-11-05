'use client';

import React from 'react';
import { Flame, Clock } from 'lucide-react';

interface SessionPricingProps {
  sessionType: 'flat' | 'time-based';
  onSessionTypeChange: (type: 'flat' | 'time-based') => void;
}

export default function SessionPricing({ sessionType, onSessionTypeChange }: SessionPricingProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Session Pricing</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Flat Fee Option */}
        <button
          onClick={() => onSessionTypeChange('flat')}
          className={`p-4 rounded-lg border-2 transition-all ${
            sessionType === 'flat'
              ? 'border-teal-400 bg-teal-500/10 text-white'
              : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className={`w-5 h-5 ${sessionType === 'flat' ? 'text-teal-400' : 'text-zinc-400'}`} />
            <span className="font-semibold">Flat Fee</span>
          </div>
          <div className={`text-sm ${sessionType === 'flat' ? 'text-zinc-300' : 'text-zinc-400'}`}>
            $30.00 fixed
          </div>
        </button>
        
        {/* Time-Based Option */}
        <button
          onClick={() => onSessionTypeChange('time-based')}
          className={`p-4 rounded-lg border-2 transition-all ${
            sessionType === 'time-based'
              ? 'border-teal-400 bg-teal-500/10 text-white'
              : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`w-5 h-5 ${sessionType === 'time-based' ? 'text-teal-400' : 'text-zinc-400'}`} />
            <span className="font-semibold">Time-Based</span>
          </div>
          <div className={`text-sm ${sessionType === 'time-based' ? 'text-zinc-300' : 'text-zinc-400'}`}>
            $0.50/min
          </div>
        </button>
      </div>

      {/* Description */}
      <div className="text-xs text-zinc-400">
        {sessionType === 'flat' 
          ? 'Fixed $30.00 + flavor add-ons'
          : 'Pay per minute used + flavor add-ons'}
      </div>
    </div>
  );
}

