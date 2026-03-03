"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ProgressBar } from "./partners/ProgressBar";
import { currentTier, nextTierTarget, TIER_THRESHOLDS, getTierBenefits, TierKey } from "../lib/tiers";
import { Trophy, Star, Crown, Zap, Users, TrendingUp, DollarSign, Download, Share2, MessageCircle } from "lucide-react";

// Mock data - replace with real API calls
const mockPartnerData = {
  partnerId: "demo-partner",
  totalReferrals: 17,
  activeLounges: 12,
  referralsLast30d: 6,
  qualityScore: 12 / 17,
  estimatedEarnings: 1250.50,
  nextPayout: "2025-02-01"
};

export default function PartnershipTiers() {
  const [data, setData] = useState(mockPartnerData);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        referralsLast30d: prev.referralsLast30d + Math.floor(Math.random() * 2),
        totalReferrals: prev.totalReferrals + Math.floor(Math.random() * 2)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const total = data.totalReferrals;
  const active = data.activeLounges;
  const velocity30d = data.referralsLast30d;

  const tier = currentTier(total);
  const nextTarget = nextTierTarget(total);
  const toNext = nextTarget ? Math.max(0, nextTarget - total) : 0;
  const progressPct = nextTarget ? Math.round((total / nextTarget) * 100) : 100;

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const link = `https://hookahplus.net/partner/${data.partnerId}/ref/${Date.now()}`;
      setGeneratedLink(link);
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  const tierCards = [
    {
      tier: "bronze" as TierKey,
      icon: <Trophy className="w-8 h-8 text-amber-500" />,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      isCurrent: tier === "bronze",
      isUnlocked: true
    },
    {
      tier: "silver" as TierKey,
      icon: <Star className="w-8 h-8 text-gray-400" />,
      color: "from-gray-500/20 to-slate-500/20",
      borderColor: "border-gray-500/30",
      isCurrent: tier === "silver",
      isUnlocked: total >= 5
    },
    {
      tier: "gold" as TierKey,
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      color: "from-yellow-500/20 to-amber-500/20",
      borderColor: "border-yellow-500/30",
      isCurrent: tier === "gold",
      isUnlocked: total >= 15
    },
    {
      tier: "platinum" as TierKey,
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      isCurrent: tier === "platinum",
      isUnlocked: total >= 30
    }
  ];

  return (
    <section className="py-12 px-6 bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Progress */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Partnership Tiers</h2>
            <p className="text-neutral-400 mb-2">
              Your current tier: <span className="font-semibold capitalize text-green-400">{tier}</span>
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Referrals: <span className="font-mono text-white">{total}</span>
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Active Lounges: <span className="font-mono text-white">{active}</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                30-day: <span className="font-mono text-white">{velocity30d}</span>
              </span>
            </div>
          </div>
          <div className="w-full md:max-w-sm">
            <ProgressBar 
              value={progressPct} 
              label={nextTarget ? `Progress to next tier (${total}/${nextTarget})` : "Max tier reached"} 
            />
            {nextTarget && (
              <p className="text-xs text-neutral-400 mt-2">
                Only <span className="font-bold text-green-400">{toNext}</span> more to reach{" "}
                <span className="font-bold text-green-400 capitalize">{nextTarget === 15 ? 'Silver' : nextTarget === 30 ? 'Gold' : 'Platinum'}</span> tier.
              </p>
            )}
          </div>
        </header>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tierCards.map((card) => {
            const benefits = getTierBenefits(card.tier);
            const isLocked = !card.isUnlocked;
            
            return (
              <Card 
                key={card.tier}
                className={`relative overflow-hidden transition-all duration-300 ${
                  card.isCurrent 
                    ? 'ring-2 ring-green-500 scale-105' 
                    : isLocked 
                    ? 'opacity-50' 
                    : 'hover:scale-105'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
                <div className={`absolute inset-0 border ${card.borderColor}`} />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    {card.icon}
                    {card.isCurrent && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl capitalize">{card.tier}</CardTitle>
                  <p className="text-sm text-neutral-300">
                    {benefits.revShare}% revenue share
                  </p>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Key Features:</p>
                      <ul className="text-xs space-y-1">
                        {benefits.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-400 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Perks:</p>
                      <ul className="text-xs space-y-1">
                        {benefits.perks.map((perk, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Earnings Summary */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Estimated Earnings</h3>
                <p className="text-3xl font-bold text-green-400">
                  ${data.estimatedEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-400">
                  Next payout: {data.nextPayout}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <Button variant="outline" size="sm" className="border-green-500 text-green-400">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Link */}
        {generatedLink && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">Your Referral Link</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-neutral-800 p-2 rounded text-sm font-mono">
                  {generatedLink}
                </code>
                <Button onClick={handleCopyLink} size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <footer className="flex flex-wrap gap-3">
          <Button className="bg-green-500 hover:bg-green-600">
            Apply for Partnership
          </Button>
          <Button 
            variant="outline" 
            className="border-neutral-600"
            onClick={handleGenerateLink}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? "Generating..." : "Generate Referral Link"}
          </Button>
          <Button variant="outline" className="border-neutral-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline" className="border-neutral-600">
            <Download className="w-4 h-4 mr-2" />
            Download Co-Branded Kit
          </Button>
        </footer>
      </div>
    </section>
  );
}
