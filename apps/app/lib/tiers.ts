export type TierKey = "bronze" | "silver" | "gold" | "platinum";

export const TIER_THRESHOLDS: Record<TierKey, number> = {
  bronze: 5,
  silver: 15,
  gold: 30,
  platinum: 50,
};

export function currentTier(totalReferrals: number): TierKey {
  if (totalReferrals >= 50) return "platinum";
  if (totalReferrals >= 30) return "gold";
  if (totalReferrals >= 15) return "silver";
  return "bronze";
}

export function nextTierTarget(totalReferrals: number) {
  const thresholds = [5, 15, 30, 50];
  for (const t of thresholds) if (totalReferrals < t) return t;
  return null; // already max tier
}

export function getTierBenefits(tier: TierKey) {
  const benefits = {
    bronze: {
      revShare: 3,
      perks: ["Basic referral tracking", "Email support"],
      features: ["Referral links", "Basic analytics"]
    },
    silver: {
      revShare: 4,
      perks: ["Priority support", "Co-branded materials", "Monthly reports"],
      features: ["Advanced analytics", "Custom referral codes", "Payout dashboard"]
    },
    gold: {
      revShare: 5,
      perks: ["Dedicated account manager", "White-label kit", "API access"],
      features: ["Real-time tracking", "Custom integrations", "Advanced reporting"]
    },
    platinum: {
      revShare: 6,
      perks: ["VIP support", "Exclusive events", "Revenue sharing bonus"],
      features: ["Full API access", "Custom development", "Priority feature requests"]
    }
  };
  
  return benefits[tier];
}
