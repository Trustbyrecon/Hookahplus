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
                href="/dashboard"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🚀 Live Dashboard
              </Link>
              <Link
                href="/"
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                🏠 Back to Home
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

        {/* Enhanced Features */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Enhanced Features & Technology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="text-lg font-semibold text-white mb-2">QR Code Ordering</h4>
              <p className="text-zinc-400 text-sm">Customers scan QR codes to access digital menus and place orders</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="text-lg font-semibold text-white mb-2">AI Flavor Recommendations</h4>
              <p className="text-zinc-400 text-sm">Smart suggestions based on customer preferences and popular combinations</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">💳</div>
              <h4 className="text-lg font-semibold text-white mb-2">Contactless Payments</h4>
              <p className="text-zinc-400 text-sm">Secure Stripe integration for seamless transactions</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h4>
              <p className="text-zinc-400 text-sm">Live dashboard for staff and management monitoring</p>
            </div>
          </div>
        </div>

        {/* Customer Journey */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-300 mb-6">Customer Journey Experience</h3>
          <div className="space-y-4">
            {[
              { step: 1, icon: '🚪', title: 'Arrival', desc: 'Welcome and seating assignment' },
              { step: 2, icon: '📱', title: 'QR Scan', desc: 'Access digital menu and ordering system' },
              { step: 3, icon: '🍃', title: 'Flavor Selection', desc: 'AI-powered recommendations and customization' },
              { step: 4, icon: '💳', title: 'Payment', desc: 'Secure contactless transaction' },
              { step: 5, icon: '⏱️', title: 'Preparation', desc: 'Real-time order tracking and updates' },
              { step: 6, icon: '🎉', title: 'Delivery', desc: 'Fresh hookah setup and service' }
            ].map((step) => (
              <div key={step.step} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {step.step}
                </div>
                <div className="text-3xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-white">{step.title}</div>
                  <div className="text-zinc-400">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-900 to-blue-900 border border-teal-500 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-teal-200 mb-4">Ready to Experience Hookah+?</h2>
          <p className="text-teal-100 text-lg mb-6">
            See the system in action with live data and real-time updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors transform hover:scale-105"
            >
              🚀 Launch Dashboard
            </Link>
            <Link
              href="/pre-order"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors transform hover:scale-105"
            >
              📱 Try Pre-Order
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
