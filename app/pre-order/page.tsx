// app/pre-order/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

export default function CampaignPreOrders() {
  useReflexAgent("CampaignPreOrders");
  const [reflexScore, setReflexScore] = useState(0);
  const [selectedTier, setSelectedTier] = useState("");

  useEffect(() => {
    // Simulate Reflex Pre-Commit Score tracking
    const interval = setInterval(() => {
      setReflexScore(prev => Math.min(prev + Math.random() * 0.1, 1.0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pricingTiers = [
    {
      name: "Starter",
      icon: "🍃",
      price: "$199",
      period: "/month",
      features: ["Basic QR System", "Mobile Ordering", "Stripe Integration", "Email Support"],
      color: "from-green-500 to-emerald-500",
      popular: false
    },
    {
      name: "Pro",
      icon: "👑",
      price: "$399",
      period: "/month",
      features: ["Advanced Analytics", "AI Recommendations", "Staff Dashboard", "Priority Support"],
      color: "from-amber-500 to-orange-500",
      popular: true
    },
    {
      name: "Trust+",
      icon: "🏛️",
      price: "$799",
      period: "/month",
      features: ["Enterprise Features", "Custom Integrations", "Dedicated Support", "White-label Options"],
      color: "from-purple-500 to-violet-500",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌿</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-teal-400">HOOKAH+</h1>
                <h2 className="text-xl text-zinc-300">Campaign Pre-Orders</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Reflex Pre-Commit Score</div>
              <div className="text-2xl font-bold text-purple-400">{reflexScore.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Join the First 100 Lounges Banner */}
        <div className="bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-500 rounded-xl p-8 text-center">
          <h2 className="text-4xl font-bold text-amber-200 mb-4">Join the First 100 Lounges</h2>
          <p className="text-amber-100 text-lg mb-6">
            Be among the pioneering lounges transforming the industry with AI-powered session management
          </p>
          <div className="flex items-center justify-center gap-8 text-amber-200">
            <div className="text-center">
              <div className="text-3xl font-bold">73</div>
              <div className="text-sm">Spots Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">27</div>
              <div className="text-sm">Early Adopters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">$0</div>
              <div className="text-sm">Setup Fee</div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div key={index} className={`relative ${tier.popular ? 'scale-105' : ''}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-amber-950 px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className={`bg-gradient-to-br ${tier.color} p-0.5 rounded-2xl`}>
                <div className="bg-zinc-900 rounded-2xl p-8 h-full">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="text-4xl font-bold text-white mb-1">
                      {tier.price}
                      <span className="text-lg text-zinc-400">{tier.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-zinc-300">
                        <span className="text-green-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedTier(tier.name)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      tier.popular
                        ? 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                        : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    }`}
                  >
                    {selectedTier === tier.name ? 'Selected ✓' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stripe Checkout Simulation */}
        {selectedTier && (
          <div className="bg-zinc-900 border border-teal-500 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-teal-300 mb-6">Stripe Checkout Simulation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Plan:</span>
                    <span className="text-white">{selectedTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Setup Fee:</span>
                    <span className="text-green-400">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">First Month:</span>
                    <span className="text-white">
                      {pricingTiers.find(t => t.name === selectedTier)?.price}
                    </span>
                  </div>
                  <div className="border-t border-zinc-700 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-teal-400">
                        {pricingTiers.find(t => t.name === selectedTier)?.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Add Flavor Mix Metadata</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Lounge Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your lounge name"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Preferred Flavors</label>
                    <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-teal-500 focus:outline-none">
                      <option>Select your signature flavors</option>
                      <option>Mint + Grape</option>
                      <option>Strawberry + Vanilla</option>
                      <option>Double Apple + Mint</option>
                      <option>Rose + Cardamom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-400">🔒</span>
                <span className="text-sm text-zinc-400">Refundable until launch</span>
              </div>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                Complete Pre-Order
              </button>
            </div>
          </div>
        )}

        {/* Trust Mechanics */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-teal-300 mb-4">Trust Mechanics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-zinc-300">Stripe-powered secure payments</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-zinc-300">Refundable until official launch</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-zinc-300">Early access to new features</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-purple-400">🌀</span>
                <span className="text-zinc-300">Reflex tracking enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">📊</span>
                <span className="text-zinc-300">Real-time analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400">🎯</span>
                <span className="text-zinc-300">Priority customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reflex Flow Tracking */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">Reflex Flow Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{reflexScore.toFixed(2)}</div>
              <div className="text-sm text-purple-200">Pre-Commit Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">Trust+</div>
              <div className="text-sm text-purple-200">Trust Graph Status</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">Active</div>
              <div className="text-sm text-purple-200">Reflex Monitoring</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-purple-200">
              All interactions are tracked to build your Reflex Pre-Commit Score and Trust Graph
            </div>
          </div>
        </div>

        {/* Reflex Agent Monitoring */}
        <div className="border border-teal-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
          <p className="text-teal-200">🌀 Reflex Agent Monitoring — Pre-Order Campaign Active</p>
          <p className="text-zinc-400 text-sm mt-2">
            EP: Payment pipeline ready | Sentinel: Trust validation active | Navigator: UX flow optimized | 
            Reflex: Pre-Commit tracking enabled
          </p>
        </div>
      </div>
    </div>
  );
}
