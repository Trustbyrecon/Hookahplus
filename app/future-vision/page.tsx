"use client";
import { useState } from 'react';

type MockupScreen = 'flavor-history' | 'session-assistant' | 'loyalty-rewards';

export default function FutureVisionPage() {
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('flavor-history');

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-purple-400 mb-2">Future Vision</h1>
          <p className="text-zinc-400 text-xl">Customer retention and AI-powered experiences</p>
        </div>
      </div>

      {/* Screen Selector */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveScreen('flavor-history')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeScreen === 'flavor-history'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🍃 Flavor History
          </button>
          <button
            onClick={() => setActiveScreen('session-assistant')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeScreen === 'session-assistant'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🤖 Session Assistant
          </button>
          <button
            onClick={() => setActiveScreen('loyalty-rewards')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeScreen === 'loyalty-rewards'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            🎁 Loyalty Rewards
          </button>
        </div>

        {/* Mockup Display */}
        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          {/* Flavor History Mockup */}
          {activeScreen === 'flavor-history' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-purple-400 mb-2">Flavor History</h2>
                <p className="text-zinc-400">Last 3 favorite mixes and personalized recommendations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Profile */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">Alex Rodriguez</div>
                      <div className="text-purple-300 text-sm">Premium Member</div>
                      <div className="text-zinc-400 text-xs">Member since March 2024</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Total Sessions</span>
                      <span className="text-white font-bold">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Favorite Flavor</span>
                      <span className="text-purple-300 font-medium">Double Apple + Mint</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Avg Session Time</span>
                      <span className="text-white font-bold">95 min</span>
                    </div>
                  </div>
                </div>

                {/* Recent Flavor Mixes */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Recent Favorites</h3>
                  <div className="space-y-3">
                    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-3">
                      <div className="text-purple-300 font-medium">Double Apple + Mint</div>
                      <div className="text-zinc-400 text-sm">Last ordered: 2 days ago</div>
                      <div className="text-purple-200 text-xs">Ordered 12 times</div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
                      <div className="text-blue-300 font-medium">Strawberry + Rose</div>
                      <div className="text-zinc-400 text-sm">Last ordered: 1 week ago</div>
                      <div className="text-blue-200 text-xs">Ordered 8 times</div>
                    </div>
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
                      <div className="text-green-300 font-medium">Grape + Lavender</div>
                      <div className="text-zinc-400 text-sm">Last ordered: 2 weeks ago</div>
                      <div className="text-green-200 text-xs">Ordered 5 times</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">🤖 AI Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🍃</div>
                    <div className="text-purple-300 font-medium">Try Next</div>
                    <div className="text-white">Peach + Cardamom</div>
                    <div className="text-zinc-400 text-xs">Based on your preferences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔥</div>
                    <div className="text-orange-300 font-medium">Trending</div>
                    <div className="text-white">Coconut + Pineapple</div>
                    <div className="text-zinc-400 text-xs">Popular this month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-yellow-300 font-medium">Premium</div>
                    <div className="text-white">Lavender + Honey</div>
                    <div className="text-zinc-400 text-xs">Exclusive blend</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Assistant Mockup */}
          {activeScreen === 'session-assistant' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-400 mb-2">AI Session Assistant</h2>
                <p className="text-zinc-400">Intelligent recommendations for your next session</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Session */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Current Session</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                      <div className="text-blue-300 font-medium mb-2">Session #47</div>
                      <div className="text-white">Double Apple + Mint</div>
                      <div className="text-zinc-400 text-sm">Started 45 minutes ago</div>
                      <div className="text-green-400 text-sm">Status: Active</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-zinc-300 text-sm">Session Timer</div>
                      <div className="text-2xl font-bold text-white">45:23</div>
                      <div className="text-zinc-400 text-xs">Average session: 95 minutes</div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">🤖 AI Suggestions</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500 rounded-lg p-4">
                      <div className="text-blue-300 font-medium mb-2">Flavor Enhancement</div>
                      <div className="text-white">Add Rose for complexity</div>
                      <div className="text-zinc-400 text-sm">Based on your taste profile</div>
                      <div className="text-blue-200 text-xs">+$2.00</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500 rounded-lg p-4">
                      <div className="text-green-300 font-medium mb-2">Timing Alert</div>
                      <div className="text-white">Consider refill in 15 min</div>
                      <div className="text-zinc-400 text-sm">Optimal flavor intensity</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500 rounded-lg p-4">
                      <div className="text-purple-300 font-medium mb-2">Next Session</div>
                      <div className="text-white">Try Peach + Cardamom</div>
                      <div className="text-zinc-400 text-sm">Perfect palate transition</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Analytics */}
              <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">📊 Session Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl text-blue-400 mb-1">95</div>
                    <div className="text-zinc-400 text-sm">Avg Minutes</div>
                  </div>
                  <div>
                    <div className="text-2xl text-green-400 mb-1">2.3</div>
                    <div className="text-zinc-400 text-sm">Avg Flavors</div>
                  </div>
                  <div>
                    <div className="text-2xl text-purple-400 mb-1">$18.50</div>
                    <div className="text-zinc-400 text-sm">Avg Spend</div>
                  </div>
                  <div>
                    <div className="text-2xl text-yellow-400 mb-1">4.8</div>
                    <div className="text-zinc-400 text-sm">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Rewards Mockup */}
          {activeScreen === 'loyalty-rewards' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-400 mb-2">Loyalty Rewards</h2>
                <p className="text-zinc-400">Earn points and unlock exclusive benefits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Points Summary */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-2">🎁</div>
                    <div className="text-2xl font-bold text-green-400">2,847 Points</div>
                    <div className="text-zinc-400">Gold Member</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Next Tier</span>
                      <span className="text-yellow-300 font-medium">Platinum</span>
                    </div>
                    <div className="w-full bg-zinc-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <div className="text-zinc-400 text-sm">1,153 points to Platinum</div>
                    
                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Points Earned Today</span>
                        <span className="text-green-400">+45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-300">This Month</span>
                        <span className="text-blue-400">+312</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Rewards */}
                <div className="bg-zinc-700 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Available Rewards</h3>
                  <div className="space-y-3">
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-green-300 font-medium">Free Flavor Add-on</div>
                          <div className="text-zinc-400 text-sm">Any flavor of your choice</div>
                        </div>
                        <div className="text-green-400 font-bold">500 pts</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-blue-300 font-medium">50% Off Next Session</div>
                          <div className="text-zinc-400 text-sm">Valid for 30 days</div>
                        </div>
                        <div className="text-blue-400 font-bold">1,000 pts</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-purple-300 font-medium">Premium Blend Access</div>
                          <div className="text-zinc-400 text-sm">Exclusive flavor combinations</div>
                        </div>
                        <div className="text-purple-400 font-bold">2,000 pts</div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3 opacity-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-yellow-300 font-medium">VIP Lounge Access</div>
                          <div className="text-zinc-400 text-sm">Private seating area</div>
                        </div>
                        <div className="text-yellow-400 font-bold">5,000 pts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-green-400">✅</div>
                      <div>
                        <div className="text-white">Session completed</div>
                        <div className="text-zinc-400 text-sm">Double Apple + Mint</div>
                      </div>
                    </div>
                    <div className="text-green-400">+45 pts</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">🎁</div>
                      <div>
                        <div className="text-white">Reward redeemed</div>
                        <div className="text-zinc-400 text-sm">Free flavor add-on</div>
                      </div>
                    </div>
                    <div className="text-red-400">-500 pts</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-purple-400">⭐</div>
                      <div>
                        <div className="text-white">5-star rating</div>
                        <div className="text-zinc-400 text-sm">Bonus points for feedback</div>
                      </div>
                    </div>
                    <div className="text-purple-400">+25 pts</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Build Customer Loyalty?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Transform your lounge with AI-powered personalization and retention features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/owner-cta"
              className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🚀 Get Started
            </a>
            <a
              href="/demo-flow"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🎯 Try Demo
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
