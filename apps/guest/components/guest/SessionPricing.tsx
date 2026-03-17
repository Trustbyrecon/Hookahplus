'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface SessionPricingProps {
  sessionType: 'flat' | 'time-based';
  onSessionTypeChange: (type: 'flat' | 'time-based') => void;
  loungeId?: string;
  /** Base flat fee in cents (e.g. 6000 = $60). CODIGO uses $60. */
  flatFeeCents?: number;
}

export default function SessionPricing({ sessionType, onSessionTypeChange, loungeId, flatFeeCents = 3000 }: SessionPricingProps) {
  const isCodigo = loungeId === 'CODIGO';
  const flatFee = flatFeeCents / 100;
  const flatLabel = `$${flatFee.toFixed(2)} fixed`;

  // Time-based option removed per CODIGO demo UX
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Session Pricing</h2>
      
      <div className="p-4 rounded-lg border-2 border-teal-400 bg-teal-500/10">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-teal-400" />
          <span className="font-semibold text-white">Flat Fee</span>
        </div>
        <div className="text-sm text-zinc-300">{flatLabel}</div>
      </div>

      {/* Description */}
      <div className="text-xs text-zinc-400 mt-3">
        {isCodigo ? `Fixed $${flatFee.toFixed(2)} includes flavors` : `Fixed $${flatFee.toFixed(2)} + flavor add-ons`}
      </div>
    </div>
  );
}

