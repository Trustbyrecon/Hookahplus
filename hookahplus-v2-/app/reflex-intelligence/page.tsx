"use client";
import { useState } from 'react';

type FeatureCard = 'alethia' | 'sentinel' | 'ep-payments';

export default function ReflexIntelligencePage() {
  const [activeCard, setActiveCard] = useState<FeatureCard>('alethia');

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Reflex Intelligence</h1>
          <p className="text-zinc-400 text-xl">Enterprise-grade technology layer for serious business operations</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Alethia Memory Card */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeCard === 'alethia' 
                ? 'bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-purple-500'
            } rounded-xl p-6`}
            onClick={() => setActiveCard('alethia')}
          >
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-white mb-2">Alethia Memory</h3>
            <p className="text-zinc-300 text-sm">
              AI-powered learning and recall system for customer preferences
            </p>
          </div>

          {/* Sentinel Trust Card */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeCard === 'sentinel' 
                ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-blue-500'
            } rounded-xl p-6`}
            onClick={() => setActiveCard('sentinel')}
          >
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Sentinel Trust</h3>
            <p className="text-zinc-300 text-sm">
              Crypto-secure transaction verification and fraud protection
            </p>
          </div>

          {/* EP Payments Card */}
          <div 
            className={`cursor-pointer transition-all duration-300 ${
              activeCard === 'ep-payments' 
                ? 'bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 scale-105' 
                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-green-500'
            } rounded-xl p-6`}
            onClick={() => setActiveCard('ep-payments')}
          >
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">EP Payments</h3>
            <p className="text-zinc-300 text-sm">
              Stripe real-time secure integration with instant processing
            </p>
          </div>
        </div>

        {/* Detailed Feature View */}
        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          {/* Alethia Memory Details */}
          {activeCard === 'alethia' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-3xl font-bold text-purple-400 mb-2">Alethia Memory</h2>
                <p className="text-zinc-400 text-lg">Intelligent Customer Preference Learning</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">1</div>
                      <div>
                        <div className="text-white font-medium">Pattern Recognition</div>
                        <div className="text-zinc-400 text-sm">AI analyzes customer behavior and flavor choices</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">2</div>
                      <div>
                        <div className="text-white font-medium">Preference Learning</div>
                        <div className="text-zinc-400 text-sm">Builds personalized customer profiles over time</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">3</div>
                      <div>
                        <div className="text-white font-medium">Smart Recommendations</div>
                        <div className="text-zinc-400 text-sm">Suggests perfect flavor combinations for returning customers</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Business Impact</h3>
                  <div className="space-y-4">
                    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
                      <div className="text-purple-300 font-semibold">Customer Retention</div>
                      <div className="text-purple-200 text-sm">Personalized experiences increase loyalty by 40%</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
                      <div className="text-purple-300 font-semibold">Upselling</div>
                      <div className="text-purple-200 text-sm">AI recommendations boost average order value by 25%</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
                      <div className="text-purple-300 font-semibold">Data Insights</div>
                      <div className="text-purple-200 text-sm">Deep understanding of customer preferences and trends</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Example Customer Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-400">Favorite Flavors</div>
                    <div className="text-white">Double Apple, Mint, Rose</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Session Duration</div>
                    <div className="text-white">90-120 minutes</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Visit Frequency</div>
                    <div className="text-white">2-3 times per week</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sentinel Trust Details */}
          {activeCard === 'sentinel' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🛡️</div>
                <h2 className="text-3xl font-bold text-blue-400 mb-2">Sentinel Trust</h2>
                <p className="text-zinc-400 text-lg">Enterprise-Grade Security & Fraud Protection</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Security Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">🔒</div>
                      <div>
                        <div className="text-white font-medium">End-to-End Encryption</div>
                        <div className="text-zinc-400 text-sm">256-bit AES encryption for all data transmission</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">🔐</div>
                      <div>
                        <div className="text-white font-medium">Multi-Factor Authentication</div>
                        <div className="text-zinc-400 text-sm">Biometric, SMS, and hardware key support</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">⚡</div>
                      <div>
                        <div className="text-white font-medium">Real-Time Fraud Detection</div>
                        <div className="text-zinc-400 text-sm">AI-powered anomaly detection and blocking</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Trust Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                      <div className="text-blue-300 font-semibold">PCI DSS Compliance</div>
                      <div className="text-blue-200 text-sm">Full compliance with payment industry security standards</div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                      <div className="text-blue-300 font-semibold">Fraud Protection</div>
                      <div className="text-blue-200 text-sm">99.9% fraud detection rate with zero false positives</div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                      <div className="text-blue-300 font-semibold">Audit Trail</div>
                      <div className="text-blue-200 text-sm">Complete transaction history and security logs</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Security Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl text-green-400 mb-1">✅</div>
                    <div className="text-zinc-400">Status</div>
                    <div className="text-white font-medium">Secure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-blue-400 mb-1">🔒</div>
                    <div className="text-zinc-400">Encryption</div>
                    <div className="text-white font-medium">256-bit AES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-purple-400 mb-1">🛡️</div>
                    <div className="text-zinc-400">Threats</div>
                    <div className="text-white font-medium">0 Blocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400 mb-1">📊</div>
                    <div className="text-zinc-400">Uptime</div>
                    <div className="text-white font-medium">99.99%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EP Payments Details */}
          {activeCard === 'ep-payments' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">💳</div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">EP Payments</h2>
                <p className="text-zinc-400 text-lg">Seamless Stripe Integration with Real-Time Processing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Payment Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">💳</div>
                      <div>
                        <div className="text-white font-medium">Multiple Payment Methods</div>
                        <div className="text-zinc-400 text-sm">Credit cards, digital wallets, and crypto support</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">⚡</div>
                      <div>
                        <div className="text-white font-medium">Instant Processing</div>
                        <div className="text-zinc-400 text-sm">Real-time payment confirmation and settlement</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">🌍</div>
                      <div>
                        <div className="text-white font-medium">Global Support</div>
                        <div className="text-zinc-400 text-sm">135+ currencies and 200+ countries supported</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Business Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                      <div className="text-green-300 font-semibold">Faster Checkout</div>
                      <div className="text-green-200 text-sm">Reduce cart abandonment by 60% with one-click payments</div>
                    </div>
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                      <div className="text-green-300 font-semibold">Lower Fees</div>
                      <div className="text-green-200 text-sm">Competitive rates starting at 2.9% + 30¢ per transaction</div>
                    </div>
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                      <div className="text-green-300 font-semibold">Automated Reconciliation</div>
                      <div className="text-green-200 text-sm">Real-time accounting and financial reporting</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Transaction Analytics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl text-green-400 mb-2">$2,847</div>
                    <div className="text-zinc-400 text-sm">Today's Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl text-blue-400 mb-2">47</div>
                    <div className="text-zinc-400 text-sm">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl text-purple-400 mb-2">98.7%</div>
                    <div className="text-zinc-400 text-sm">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-900 to-blue-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Upgrade Your Lounge Technology?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Experience enterprise-grade security and AI-powered intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo-flow"
              className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🎯 Try Interactive Demo
            </a>
            <a
              href="/sessions"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🚀 Launch Live System
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
