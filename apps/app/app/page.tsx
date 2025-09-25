import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MetricCard from '../components/dashboard/MetricCard';
import { StatusIndicator } from '../components/StatusIndicator';
import { TrustLock } from '../components/TrustLock';
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

export default function Dashboard() {
  const metrics = [
    {
      title: 'Total Sessions',
      value: '1',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'BOH Active',
      value: '1',
      icon: <ChefHat className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'FOH Active',
      value: '0',
      icon: <Users className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '-2%',
      changeType: 'negative' as const
    },
    {
      title: 'Edge Cases',
      value: '0',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      change: '0%',
      changeType: 'neutral' as const
    }
  ];

  const quickActions = [
    {
      title: 'Create Session',
      description: 'Start a new fire session',
      icon: <Plus className="w-5 h-5" />,
      variant: 'primary' as const,
      href: '/sessions'
    },
    {
      title: 'View All Sessions',
      description: 'Manage existing sessions',
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/sessions'
    },
    {
      title: 'Admin',
      description: 'System administration',
      icon: <Settings className="w-5 h-5" />,
      variant: 'outline' as const,
      href: '/admin'
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
                Hookah<span className="text-teal-400">+</span> Dashboard
              </h1>
              <p className="text-zinc-400 mt-1">
                Complete BOH/FOH workflow management with edge case handling
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <StatusIndicator status="idle" label="Flow Status" value="Normal" />
              <StatusIndicator status="online" label="Live Sessions" value="0" />
              <StatusIndicator status="online" label="Revenue" value="$0" />
              <StatusIndicator status="online" label="System Health" value="EXCELLENT" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Trust Lock Display */}
        <div className="mb-8 flex justify-center">
          <TrustLock trustScore={0.87} status="active" version="TLH-v1" size="lg" />
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              bgColor={metric.bgColor}
              change={metric.change}
              changeType={metric.changeType}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} hover className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.variant === 'primary' ? 'bg-primary-500/20' : 'bg-zinc-800'}`}>
                    <div className={action.variant === 'primary' ? 'text-primary-400' : 'text-zinc-400'}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-zinc-400 text-sm">{action.description}</p>
                  </div>
                  <Button
                    variant={action.variant}
                    size="sm"
                    rightIcon={<span>→</span>}
                  >
                    Go
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-zinc-800 p-1 rounded-lg w-fit">
            {[
              { label: 'Overview', count: 1, active: true },
              { label: 'BOH', count: 1, active: false },
              { label: 'FOH', count: 0, active: false },
              { label: 'Edge Cases', count: 0, active: false }
            ].map((tab, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab.active
                    ? 'bg-primary-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Table T-001</div>
                    <div className="text-sm text-zinc-400">Anonymous - Custom Mix</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-blue-600 text-xs">NEW</Badge>
                    <div className="text-sm font-semibold mt-1">$30.00</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Database</span>
                  <Badge variant="success" className="text-xs">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Stripe API</span>
                  <Badge variant="success" className="text-xs">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Supabase</span>
                  <Badge variant="success" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Reflex Agents</span>
                  <Badge variant="success" className="text-xs">Running</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}