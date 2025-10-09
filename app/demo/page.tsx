"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DemoSession {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  status: string;
  tableType: string;
  position: { x: number; y: number };
}

export default function DemoPage() {
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading demo data
    setTimeout(() => {
      setSessions([
        {
          id: 'demo_001',
          tableId: 'BAR-01',
          customerName: 'Mike Johnson',
          flavor: 'Grape + Mint',
          status: 'active',
          tableType: 'high_boy',
          position: { x: 50, y: 100 }
        },
        {
          id: 'demo_002',
          tableId: 'T-001',
          customerName: 'Sarah Chen',
          flavor: 'Strawberry + Vanilla',
          status: 'active',
          tableType: 'table',
          position: { x: 100, y: 200 }
        },
        {
          id: 'demo_003',
          tableId: 'B-001',
          customerName: 'Carlos Martinez',
          flavor: 'Coconut + Pineapple',
          status: 'needs_refill',
          tableType: '2x_booth',
          position: { x: 700, y: 150 }
        },
        {
          id: 'demo_004',
          tableId: 'C-001',
          customerName: 'Jasmine Williams',
          flavor: 'Rose + Cardamom',
          status: 'active',
          tableType: '8x_sectional',
          position: { x: 200, y: 350 }
        },
        {
          id: 'demo_005',
          tableId: 'W-001',
          customerName: 'Emma Thompson',
          flavor: 'Lavender + Honey',
          status: 'active',
          tableType: 'table',
          position: { x: 50, y: 250 }
        }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-xl text-zinc-400">Loading Lounge Experience...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌿</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-teal-400">HOOKAH+</h1>
                <h2 className="text-xl text-zinc-300">Lounge Experience Demo</h2>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href="/sessions"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🚀 Live Sessions
              </Link>
              <Link
                href="/connector-partnership-analytics"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                📊 Connector Partnership Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Lounge Atmosphere */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 border border-amber-500 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-amber-200 mb-4">Industrial-Chic Lounge Atmosphere</h2>
          <p className="text-amber-100 text-lg mb-6">
            Experience the modern hookah lounge with exposed beams, track lighting, and polished concrete floors
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-amber-100">
            <div>
              <div className="text-4xl mb-2">🏗️</div>
              <div className="font-semibold">Exposed Architecture</div>
              <div className="text-sm opacity-80">Industrial beams and ductwork</div>
            </div>
            <div>
              <div className="text-4xl mb-2">💡</div>
              <div className="font-semibold">Track Lighting</div>
              <div className="text-sm opacity-80">Focused illumination system</div>
            </div>
            <div>
              <div className="text-4xl mb-2">🪟</div>
              <div className="font-semibold">Natural Light</div>
              <div className="text-sm opacity-80">Large windows for ambiance</div>
            </div>
          </div>
        </div>

        {/* Seating Layout */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Seating Layout & Table Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">🍺</div>
              <h4 className="text-lg font-semibold text-white mb-2">Bar High Boy Tables</h4>
              <p className="text-zinc-400 text-sm">Perfect for quick sessions and socializing at the bar</p>
              <div className="text-xs text-teal-400 mt-2">Capacity: 2 people</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">🪑</div>
              <h4 className="text-lg font-semibold text-white mb-2">Standard Tables</h4>
              <p className="text-zinc-400 text-sm">Classic seating for groups of 4, ideal for main dining area</p>
              <div className="text-xs text-teal-400 mt-2">Capacity: 4 people</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">🛋️</div>
              <h4 className="text-lg font-semibold text-white mb-2">Booths & Sectionals</h4>
              <p className="text-zinc-400 text-sm">Comfortable seating for intimate groups and larger parties</p>
              <div className="text-xs text-teal-400 mt-2">Capacity: 2-8 people</div>
            </div>
          </div>
        </div>

        {/* Live Sessions Preview */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Live Sessions Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-zinc-800 rounded-lg p-4 border-l-4 border-teal-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white">{session.tableId}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'active' ? 'bg-green-600 text-white' :
                    session.status === 'needs_refill' ? 'bg-yellow-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {session.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-zinc-300 text-sm mb-1">
                  Customer: {session.customerName}
                </div>
                <div className="text-zinc-300 text-sm mb-1">
                  Flavor: {session.flavor}
                </div>
                <div className="text-zinc-400 text-xs">
                  Type: {session.tableType.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Workflow Walkthrough */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Operational Workflow - Interactive Walkthrough</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: "📊", 
                title: "Dashboard", 
                desc: "Real-time lounge overview with live metrics",
                color: "from-blue-500 to-indigo-500",
                status: "active"
              },
              { 
                icon: "🍃", 
                title: "Sessions", 
                desc: "Active hookah sessions and customer management",
                color: "from-orange-500 to-red-500",
                status: "active"
              },
              { 
                icon: "👥", 
                title: "Staff Ops", 
                desc: "FOH/BOH coordination and workflow management",
                color: "from-green-500 to-emerald-500",
                status: "active"
              },
              { 
                icon: "⚙️", 
                title: "Admin", 
                desc: "System configuration and analytics dashboard",
                color: "from-purple-500 to-violet-500",
                status: "active"
              }
            ].map((step, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`bg-gradient-to-br ${step.color} p-0.5 rounded-xl`}>
                  <div className="bg-zinc-800 rounded-xl p-4 h-full card-hover">
                    <div className="text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          ✓ {step.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <div className="text-center">
              <div className="text-teal-300 font-bold mb-2 text-lg">🎯 SaaS Flow Complete!</div>
              <div className="text-sm text-teal-200 leading-relaxed">
                This interactive workflow demonstrates the complete operational flow from dashboard monitoring to admin management.
              </div>
            </div>
          </div>
        </div>

        {/* 1-Min Demo Reel Section */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">1-Min Demo Reel</h3>
          <div className="relative aspect-video bg-zinc-800 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">🎬</div>
                <div className="text-xl text-zinc-300 mb-2">Demo Video Loading...</div>
                <div className="text-sm text-zinc-400 mb-4">Experience the complete Hookah+ workflow in 60 seconds</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
              title="Hookah+ 1-Min Demo Reel"
              className="w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-500"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              ▶️ Play Demo
            </button>
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              📝 View Transcript
            </button>
          </div>
        </div>

        {/* Reflex Potential ROI */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-purple-300 mb-4">Your Reflex Potential</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">+127%</div>
              <div className="text-sm text-purple-200">Revenue Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">-43%</div>
              <div className="text-sm text-purple-200">Operational Costs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">+89%</div>
              <div className="text-sm text-purple-200">Customer Satisfaction</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-purple-200 mb-4">
              Based on data from similar lounges using Hookah+ platform
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/pre-order" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Request Operator Access
              </Link>
              <Link href="/demo" className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Explore Public Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Features */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Enhanced Lounge Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🌐 ScreenCoder Integration</h4>
                <p className="text-zinc-400 text-sm">
                  Visual lounge layout with real-time table status, customer information, and interactive navigation
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">👥 Customer Profiles</h4>
                <p className="text-zinc-400 text-sm">
                  Network ecosystem with customer preferences, session history, and cross-location tracking
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🔥 Smart Session Management</h4>
                <p className="text-zinc-400 text-sm">
                  Intelligent refill system with auto-timers, pause functionality, and flavor tracking
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🚀 Connector Partnership Program</h4>
                <p className="text-zinc-400 text-sm">
                  Lounge Owner Intent Communication for rapid expansion and network effects
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-900 to-blue-900 border border-teal-500 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience the Future?</h2>
          <p className="text-teal-100 text-lg mb-6">
            Join the Hookah+ revolution and transform your lounge operations
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sessions"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
            >
              🚀 Launch Live Sessions
            </Link>
            <Link
              href="/connector-partnership-analytics"
              className="bg-blue-600 hover:bg-blue-700 text-xl font-bold transition-colors"
            >
              📊 View Analytics
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
