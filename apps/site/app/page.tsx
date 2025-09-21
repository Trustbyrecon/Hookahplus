import React from 'react';
import { Card } from '@hookahplus/design-system/src/components/Card';
import { Button } from '@hookahplus/design-system/src/components/Button';
import { Badge } from '@hookahplus/design-system/src/components/Badge';
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
  TrendingUp
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(16,185,129,0.25),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">
              Hookah<span className="text-primary-300">+</span>
            </h1>
            <p className="text-xl mb-8 text-zinc-300 max-w-3xl mx-auto">
              Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                variant="primary" 
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600"
              >
                Pre-Order Station
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
              >
                See Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-red-500 text-red-300 hover:bg-red-500/10"
              >
                Campaign Pre-Orders
              </Button>
            </div>
            
            <div className="text-sm text-zinc-400 mb-4">
              QR scan - Menu browse - Flavor personalize - Start Fire Session
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4 text-orange-400" />
              <Badge variant="outline" className="text-orange-400 border-orange-500">
                Trust-Lock: TLH-v1::active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Reflex Intelligence */}
      <div className="py-16 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powered by Reflex Intelligence</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our AI agents work together to provide the ultimate hookah lounge experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="highlighted" className="text-center">
              <div className="mb-4">
                <Brain className="w-12 h-12 text-primary-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">Aliethia Memory</h3>
              <p className="text-zinc-300">
                Learns your flavor preferences and suggests perfect pairings
              </p>
            </Card>
            
            <Card variant="highlighted" className="text-center">
              <div className="mb-4">
                <Shield className="w-12 h-12 text-primary-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">Sentinel Trust</h3>
              <p className="text-zinc-300">
                Cryptographic verification for every transaction
              </p>
            </Card>
            
            <Card variant="highlighted" className="text-center">
              <div className="mb-4">
                <CreditCard className="w-12 h-12 text-primary-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">EP Payments</h3>
              <p className="text-zinc-300">
                Secure Stripe integration with real-time processing
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Access</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to manage your hookah lounge experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Dashboard', icon: <TrendingUp className="w-6 h-6" />, href: 'https://app.hookahplus.net' },
              { name: 'Pre-Order', icon: <Zap className="w-6 h-6" />, href: 'https://guest.hookahplus.net' },
              { name: 'Checkout', icon: <CreditCard className="w-6 h-6" />, href: 'https://guest.hookahplus.net/checkout' },
              { name: 'Admin', icon: <Shield className="w-6 h-6" />, href: 'https://app.hookahplus.net/admin' },
              { name: 'Staff Panel', icon: <Users className="w-6 h-6" />, href: 'https://app.hookahplus.net/staff-panel' },
              { name: 'POS Waitlist', icon: <Clock className="w-6 h-6" />, href: 'https://app.hookahplus.net/pos' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-primary-500/50 hover:bg-zinc-800 transition-all duration-200"
              >
                <div className="text-primary-400 group-hover:text-primary-300 mb-2">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-zinc-400">
            <p className="mb-2">Reflex Agent Monitoring — Cycle 09 Consensus Achieved</p>
            <div className="flex justify-center space-x-6 text-sm">
              <span>Aliethia: 0.87</span>
              <span>EP: 0.82</span>
              <span>Session Agent: 0.90</span>
              <span>Demo Agent: 0.78</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}