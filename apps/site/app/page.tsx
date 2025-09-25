import React from 'react';
import { Card, Button, Badge, MetricCard, StatusIndicator, TrustLock } from '../components/design-system';
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
                  className="px-8 py-4 text-lg"
                >
                  Pre-Order Station
                </Button>
              </a>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <StatusIndicator 
                status="online" 
                label="System" 
                value="Online" 
                description="All systems operational"
              />
              <StatusIndicator 
                status="online" 
                label="Agents" 
                value="Active" 
                description="AI agents running"
              />
              <StatusIndicator 
                status="online" 
                label="BOH/FOH" 
                value="Ready" 
                description="Backend & frontend ready"
              />
            </div>

            {/* Trust Lock */}
            <div className="flex justify-center mb-8">
              <TrustLock 
                trustScore={0.95}
                status="active"
                version="TLH-v1"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Reflex Intelligence */}
      <div className="py-16 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Powered by Reflex Intelligence
            </h2>
            <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
              Advanced AI agents working together to deliver personalized experiences and seamless operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="highlighted" className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-teal-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Aliethia Memory</h3>
              </div>
              <p className="text-zinc-300 mb-4">
                Behavioral memory system that learns and adapts to customer preferences, creating personalized experiences.
              </p>
              <div className="flex items-center text-sm text-teal-400">
                <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                Active Learning
              </div>
            </Card>

            <Card variant="highlighted" className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-teal-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">HiTrust Sentinel</h3>
              </div>
              <p className="text-zinc-300 mb-4">
                Security and trust monitoring system ensuring safe transactions and data protection.
              </p>
              <div className="flex items-center text-sm text-teal-400">
                <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                Trust Score: 0.95
              </div>
            </Card>

            <Card variant="highlighted" className="p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-8 h-8 text-teal-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">EP Payments</h3>
              </div>
              <p className="text-zinc-300 mb-4">
                Intelligent payment processing with fraud detection and seamless checkout experiences.
              </p>
              <div className="flex items-center text-sm text-teal-400">
                <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                Secure Processing
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Quick Access
            </h2>
            <p className="text-xl text-zinc-300">
              Direct access to all Hookah+ applications and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                name: "Staff Dashboard",
                href: "https://app.hookahplus.net",
                description: "Manage sessions, staff, and operations"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                name: "Pre-Order Station",
                href: "https://guest.hookahplus.net",
                description: "Customer ordering and session management"
              },
              {
                icon: <Settings className="w-8 h-8" />,
                name: "Admin Panel",
                href: "https://admin.hookahplus.net",
                description: "System administration and configuration"
              }
            ].map((item, index) => (
              <Card key={index} variant="outlined" className="p-6 hover:border-teal-500/50 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="text-teal-400 mr-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                </div>
                <p className="text-zinc-300 mb-4">{item.description}</p>
                <a 
                  href={item.href}
                  className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Access <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Card>
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