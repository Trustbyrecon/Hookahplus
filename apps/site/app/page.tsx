import React from 'react';
import Card from '@hookahplus/design-system/src/components/Card';
import Button from '@hookahplus/design-system/src/components/Button';
import Badge from '@hookahplus/design-system/src/components/Badge';
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
              <a href="https://guest.hookahplus.net">
                <Button 
                  size="lg" 
                  variant="primary" 
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                       className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
                >
                  Pre-Order Station
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
            
            {/* Flow Status Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">System Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">Agents Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">BOH/FOH Ready</span>
              </div>
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
            <h2 className="text-3xl font-bold mb-4 text-teal-400">Powered by Reflex Intelligence</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our AI agents work together to provide the ultimate hookah lounge experience
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">All agents operational</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="highlighted" className="text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-primary-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">Aliethia Memory</h3>
              <p className="text-zinc-300 mb-4">
                Learns your flavor preferences and suggests perfect pairings
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Active Learning</span>
              </div>
            </Card>
            
            <Card variant="highlighted" className="text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">Sentinel Trust</h3>
              <p className="text-zinc-300 mb-4">
                Cryptographic verification for every transaction
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Trust-Lock Active</span>
              </div>
            </Card>
            
            <Card variant="highlighted" className="text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-primary-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-300">EP Payments</h3>
              <p className="text-zinc-300 mb-4">
                Secure Stripe integration with real-time processing
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Payment Ready</span>
              </div>
            </Card>
          </div>
          </div>
        </div>
        
      {/* Quick Access */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Quick Access</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to manage your hookah lounge experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { 
                name: 'Dashboard', 
                icon: <TrendingUp className="w-6 h-6" />, 
                href: 'https://app.hookahplus.net',
                description: 'Operator Control',
                status: 'active',
                flow: 'staff'
              },
              { 
                name: 'Pre-Order', 
                icon: <Zap className="w-6 h-6" />, 
                href: 'https://guest.hookahplus.net',
                description: 'Customer Portal',
                status: 'active',
                flow: 'customer'
              },
              { 
                name: 'Checkout', 
                icon: <CreditCard className="w-6 h-6" />, 
                href: 'https://guest.hookahplus.net/checkout',
                description: 'Payment Flow',
                status: 'active',
                flow: 'customer'
              },
              { 
                name: 'Admin', 
                icon: <Shield className="w-6 h-6" />, 
                href: 'https://app.hookahplus.net/admin',
                description: 'System Control',
                status: 'active',
                flow: 'admin'
              },
              { 
                name: 'Staff Panel', 
                icon: <Users className="w-6 h-6" />, 
                href: 'https://app.hookahplus.net/staff-panel',
                description: 'BOH/FOH Management',
                status: 'active',
                flow: 'staff'
              },
              { 
                name: 'POS Waitlist', 
                icon: <Clock className="w-6 h-6" />, 
                href: 'https://app.hookahplus.net/pos',
                description: 'Queue Management',
                status: 'active',
                flow: 'staff'
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-primary-500/50 hover:bg-zinc-800 transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-primary-400 group-hover:text-primary-300 mb-2">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">
                  {item.name}
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                  {item.description}
                </span>
                <div className="mt-2 flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-zinc-500 capitalize">{item.flow}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-900 border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-zinc-400">
            <p className="mb-4 text-lg font-semibold text-white">Reflex Agent Monitoring — Cycle 09 Consensus Achieved</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Aliethia: 0.87</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>EP: 0.82</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Session Agent: 0.90</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Demo Agent: 0.78</span>
              </div>
            </div>
            <div className="flex justify-center space-x-8 text-xs text-zinc-500">
              <span>BOH: Ready</span>
              <span>FOH: Active</span>
              <span>Trust-Lock: Active</span>
              <span>System: Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}