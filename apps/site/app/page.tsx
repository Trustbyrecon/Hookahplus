import React from 'react';
import { Card, Button, Badge, MetricCard, StatusIndicator, TrustLock } from '../components';
import { 
  Zap, 
  Shield, 
  CreditCard, 
  Brain, 
  Lock,
  ArrowRight,
  Star,
  Users,
  Clock,
  TrendingUp,
  Flame,
  BarChart3,
  Settings
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Hookah<span className="text-teal-400">+</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-zinc-300 max-w-3xl mx-auto">
              Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="https://guest.hookahplus.net">
                <Button 
                  size="lg" 
                  variant="primary" 
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-teal-500/25 transition-all transform hover:scale-105"
                >
                  🍃 Pre-Order Station
                </Button>
              </a>
              <a href="/demo-flow">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  See Demo
                </Button>
              </a>
              <a href="https://app.hookahplus.net">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-red-500 text-red-300 hover:bg-red-500/10"
                >
                  Staff Dashboard
                </Button>
              </a>
            </div>
            
            <div className="text-sm text-zinc-400 mb-4">
              QR scan → Menu browse → Flavor personalize → Start Fire Session
            </div>
            
            {/* Flow Status Indicators */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <StatusIndicator status="online" label="System" value="Online" />
              <StatusIndicator status="online" label="Agents" value="Active" />
              <StatusIndicator status="online" label="BOH/FOH" value="Ready" />
            </div>
            
            {/* Trust Lock Display */}
            <div className="flex justify-center mb-8">
              <TrustLock trustScore={0.87} status="active" version="TLH-v1" />
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Reflex Intelligence */}
      <div className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-300">Powered by Reflex Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">Aliethia Memory</h3>
              <p className="text-zinc-400">Learns your flavor preferences and suggests perfect pairings</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Trust Score: 0.87</span>
              </div>
            </div>
            
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">HiTrust Sentinel</h3>
              <p className="text-zinc-400">Cryptographic verification for every transaction</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Security Level: 100%</span>
              </div>
            </div>
            
            <div className="text-center p-6 bg-zinc-900 border border-teal-500 rounded-xl">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-3 text-teal-300">EP Payments</h3>
              <p className="text-zinc-400">Secure Stripe integration with real-time processing</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Processing Rate: 0.82</span>
              </div>
            </div>
          </div>
        </div>
        
      {/* Quick Access */}
      <div className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-300">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                name: 'Dashboard', 
                icon: '📊',
                href: 'https://app.hookahplus.net',
                description: '0 active'
              },
              { 
                name: 'Pre-Order', 
                icon: '📱',
                href: 'https://guest.hookahplus.net',
                description: 'QR Ready'
              },
              { 
                name: 'Fire Session', 
                icon: '🔥',
                href: 'https://app.hookahplus.net/fire-session-dashboard',
                description: '0 active'
              },
              { 
                name: 'Staff Mgmt', 
                icon: '⚙️',
                href: 'https://app.hookahplus.net/staff-panel',
                description: 'Staff-drive'
              },
              { 
                name: 'Staff Ops', 
                icon: '👥',
                href: 'https://app.hookahplus.net/staff',
                description: 'Live Data'
              },
              { 
                name: 'POS Waitlist', 
                icon: '📋',
                href: 'https://app.hookahplus.net/pos-waitlist',
                description: 'Analytics'
              },
              { 
                name: 'Campaigns', 
                icon: '🚀',
                href: 'https://app.hookahplus.net/start-preorders',
                description: 'Pre-Order'
              },
              { 
                name: 'Layout Preview', 
                icon: '🗺️',
                href: 'https://app.hookahplus.net/layout-preview',
                description: 'Interactive'
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex flex-col items-center p-4 bg-zinc-900 border border-teal-500 rounded-lg hover:bg-teal-900/20 transition-colors"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm">{item.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{item.description}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Reflex Agent Status Footer */}
      <div className="px-4 py-8 border-t border-teal-500 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-teal-200 mb-2">🌀 Reflex Agent Monitoring — Cycle 09 Consensus Achieved</p>
          <div className="flex justify-center gap-4 text-sm text-zinc-400">
            <span>Aliethia: 0.87 ✅</span>
            <span>EP: 0.82 ✅</span>
            <span>Session Agent: 0.90 ✅</span>
            <span>Demo Agent: 0.78 🚧</span>
          </div>
        </div>
      </div>
    </div>
  );
}