'use client';

import { useEffect, useState } from 'react';

interface Reward {
  name: string;
  cost: number;
}

const defaultRewards: Reward[] = [
  { name: 'Free Refill', cost: 50 },
  { name: 'Flavor Mix Unlock', cost: 100 },
  { name: 'Queue Skip', cost: 200 },
];

export default function LoyaltyWallet() {
  const [mounted, setMounted] = useState(false);
  const [points] = useState(120);
  const [streak] = useState(3);
  const multiplier = 1 + streak * 0.1;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const nextReward = defaultRewards.find((r) => r.cost > points);

  return (
    <div className="bg-deepMoss text-goldLumen p-4 rounded shadow font-sans w-full max-w-md">
      <div className="mb-2 font-bold">Loyalty Balance: {points} pts</div>
      <div className="mb-4 text-sm">Trust Streak Multiplier: x{multiplier.toFixed(1)}</div>
      <div className="mb-4 flex space-x-2 overflow-x-auto">
        {defaultRewards.map((r) => (
          <div
            key={r.name}
            className="min-w-[100px] p-2 bg-charcoal rounded text-center"
          >
            <div className="text-sm">{r.name}</div>
            <div className="text-xs">{r.cost} pts</div>
          </div>
        ))}
      </div>
      {nextReward && nextReward.cost - points <= 10 && (
        <div className="text-ember text-sm">
          Only {nextReward.cost - points} pts until {nextReward.name}!
        </div>
      )}
    </div>
  );
}

