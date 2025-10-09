import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusIndicator from '../components/design-system/components/StatusIndicator';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  Settings,
  UserCheck,
  Brain,
  Shield,
  CreditCard,
  ArrowRight,
  Play
} from 'lucide-react';

export default function Home() {
  const metrics = [
    {
      title: 'Total Sessions',
      value: '0',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Revenue',
      value: '$0',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'System Health',
      value: 'EXCELLENT',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '0%',
      changeType: 'neutral' as const
    }
  ];

  const operationalFlow = [
    {
      title: 'Dashboard',
      description: 'Live Operations',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/dashboard',
      status: '0 active',
      step: 1
    },
    {
      title: 'Sessions',
      description: 'Fire Session Management',
      icon: <Flame className="w-5 h-5" />,
      href: '/sessions',
      status: '0 active',
      step: 2
    },
    {
      title: 'Staff Ops',
      description: 'Workflow Management',
      icon: <UserCheck className="w-5 h-5" />,
      href: '/staff-ops',
      status: 'Live Data',
      step: 3
    },
    {
      title: 'Staff Panel',
      description: 'Operations Control',
      icon: <Settings className="w-5 h-5" />,
      href: '/staff',
      status: 'Real-time',
      step: 4
    },
    {
      title: 'Admin',
      description: 'System Management',
      icon: <Shield className="w-5 h-5" />,
      href: '/admin/sync',
      status: 'Monitoring',
      step: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Hookah<span className="text-teal-400">+</span>
              </h1>
              <p className="text-zinc-400 mt-1">
                Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator status="online" label="System" value="Online" />
              <StatusIndicator status="online" label="Agents" value="Active" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Hookah+ Operations Center
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
            Real-time lounge management with AI-powered personalization and secure transactions
          </p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${metric.bgColor} mb-3`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-400 mb-1">{metric.value}</div>
                <div className="text-sm text-zinc-400">{metric.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Flow */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Operational Workflow
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            Streamlined process from dashboard to admin management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {operationalFlow.map((action, index) => (
              <Card key={index} className="hover:border-teal-500/50 transition-colors relative">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <div className="text-teal-400">
                      {action.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {action.step}
                  </div>
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-xs text-zinc-400 mb-2">{action.description}</p>
                  <div className="text-xs text-teal-400">{action.status}</div>
                </div>
                {index < operationalFlow.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Campaign Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Campaign Management
          </h3>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                See Demo
              </Button>
              <Button variant="outline" size="lg">
                Campaign Pre-Orders
              </Button>
              <Button variant="outline" size="lg">
                Live Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* AI Intelligence */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Powered by Reflex Intelligence
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            AI agents working in perfect harmony
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Aliethia Memory</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Learns flavor preferences and suggests perfect pairings
                </p>
                <div className="text-sm text-teal-400 font-semibold">Active Sessions: 0</div>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">HiTrust Sentinel</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Cryptographic verification for every transaction
                </p>
                <div className="text-sm text-teal-400 font-semibold">Verification: 100% ✅</div>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">EP Payments</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Secure Stripe integration with real-time processing
                </p>
                <div className="text-sm text-teal-400 font-semibold">Revenue: $0</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
}