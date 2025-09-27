import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StatusIndicator from '../components/design-system/components/StatusIndicator';
import TrustLock from '../components/design-system/components/TrustLock';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Brain,
  Shield,
  CreditCard
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

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Live Operations',
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'primary' as const,
      href: '/dashboard',
      status: '0 active'
    },
    {
      title: 'Pre-Order',
      description: 'Customer Interface',
      icon: <Users className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/preorder',
      status: 'QR Ready'
    },
    {
      title: 'Fire Session',
      description: 'Live Sessions',
      icon: <Flame className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/sessions',
      status: '0 active'
    },
    {
      title: 'Staff Mgmt',
      description: 'Operations',
      icon: <Settings className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/staff',
      status: 'Real-time'
    },
    {
      title: 'Staff Ops',
      description: 'Workflow',
      icon: <UserCheck className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/staff-ops',
      status: 'Live Data'
    },
    {
      title: 'POS Waitlist',
      description: 'B2B Pipeline',
      icon: <Clock className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/waitlist',
      status: 'Analytics'
    },
    {
      title: 'Campaigns',
      description: 'Pre-Orders',
      icon: <Plus className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/campaigns',
      status: 'Live'
    },
    {
      title: 'Layout Preview',
      description: 'Visual Map',
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/layout-preview',
      status: 'Interactive'
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
        {/* Trust Lock Display */}
        <div className="mb-8 flex justify-center">
          <TrustLock trustScore={0.87} status="active" version="TLH-v1" size="lg" />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            North Star • Real-time Operations
          </h2>
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
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg">
              🔄 Refresh
            </Button>
            <Button variant="outline" size="lg">
              ▶️ Auto-refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            # Hookah+
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.
          </p>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 font-medium">HiTrust: TLH-v1::active</span>
            </div>
            <div className="text-sm text-zinc-400">
              0.87 Trust Score
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Cryptographic verification • Real-time monitoring • Secure transactions
            </div>
          </div>

          <div className="text-center mb-8">
            <h4 className="text-lg font-semibold mb-2">🍃 Pre-Order Station</h4>
            <p className="text-zinc-400 text-sm mb-4">
              QR scan → Menu browse → Flavor personalize → Start Fire Session
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary">
                🎬 See Demo
              </Button>
              <Button variant="outline">
                🚀 Campaign Pre-Orders
              </Button>
              <Button variant="outline">
                📊 Live Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Powered by Reflex Intelligence */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            ## Powered by Reflex Intelligence
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            Real-time AI agents working in perfect harmony
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">### Aliethia Memory</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Learns your flavor preferences and suggests perfect pairings
                </p>
                <div className="text-sm">
                  <div className="text-teal-400 font-semibold">Trust Score: 0.87 ✅</div>
                  <div className="text-zinc-400">Active Sessions: 0</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">### HiTrust Sentinel</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Cryptographic verification for every transaction
                </p>
                <div className="text-sm">
                  <div className="text-teal-400 font-semibold">Security Level: TLH-v1::active</div>
                  <div className="text-zinc-400">Verification: 100% ✅</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold mb-2">### EP Payments</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Secure Stripe integration with real-time processing
                </p>
                <div className="text-sm">
                  <div className="text-teal-400 font-semibold">Processing Rate: 0.82 ✅</div>
                  <div className="text-zinc-400">Revenue: $0</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            ## Quick Access
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            Navigate to any operational area with live data integration
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:border-teal-500/50 transition-colors">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <div className="text-teal-400">
                      {action.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-xs text-zinc-400 mb-2">{action.description}</p>
                  <div className="text-xs text-teal-400">{action.status}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}