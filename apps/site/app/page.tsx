'use client';

// Site build deployment trigger - updated for proper Vercel alignment
// Build timestamp: 2025-10-16T17:20:00Z
// Campaign Pre-Orders deployment trigger - 2025-10-16T19:15:00Z
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
  ArrowRight,
  Play,
  CheckCircle,
  Heart,
  Star,
  Gift,
  QrCode,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const metrics = [
    {
      title: 'Active Sessions',
      value: '18',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Projected Revenue',
      value: '$12,340',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Reflex Score',
      value: '92%',
      icon: <Star className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: 'Trust Aligned',
      changeType: 'positive' as const
    },
    {
      title: 'System Health',
      value: 'EXCELLENT',
      icon: <Heart className="w-6 h-6" />,
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
      status: '18 active',
      step: 1,
      state: 'active'
    },
    {
      title: 'Sessions',
      description: 'Fire Session Management',
      icon: <Flame className="w-5 h-5" />,
      href: '/sessions',
      status: '18 active',
      step: 2,
      state: 'active'
    },
    {
      title: 'Operations',
      description: 'Workflow Management',
      icon: <UserCheck className="w-5 h-5" />,
      href: '/staff-ops',
      status: 'Live Data',
      step: 3,
      state: 'completed'
    },
    {
      title: 'Team Control',
      description: 'Operations Control',
      icon: <Settings className="w-5 h-5" />,
      href: '/staff',
      status: 'Real-time',
      step: 4,
      state: 'pending'
    },
    {
      title: 'Admin',
      description: 'System Management',
      icon: <Shield className="w-5 h-5" />,
      href: '/admin/sync',
      status: 'Monitoring',
      step: 5,
      state: 'pending'
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
                Light the Flame. Feel the Flow.
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
            Hospitality-grade ritual intelligence platform — transforming sessions into captured memories with analytics and emotion stitched together
          </p>
          
        </div>

        {/* Quick Access - MOAT Modules */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-4">
            Quick Access
          </h3>
          <p className="text-center text-zinc-400 mb-8 max-w-2xl mx-auto">
            Everything you need to manage your hookah lounge — hospitality-grade ritual intelligence platform
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {[
              { title: 'Dashboard', icon: <BarChart3 className="w-5 h-5" />, href: '/sessions', color: 'teal' },
              { title: 'QR Pathway', icon: <QrCode className="w-5 h-5" />, href: '/pre-order', color: 'blue' },
              { title: 'Fire Session', icon: <Flame className="w-5 h-5" />, href: '/fire-session-dashboard', color: 'orange' },
              { title: 'Hookah Tracker', icon: <Clock className="w-5 h-5" />, href: '/lounge-experience-demo', color: 'purple' },
              { title: 'Staff Ops', icon: <Users className="w-5 h-5" />, href: '/staff-ops', color: 'indigo' },
              { title: 'Guest Intelligence', icon: <Brain className="w-5 h-5" />, href: '/sessions', color: 'green' },
              { title: 'Waitlist', icon: <Clock className="w-5 h-5" />, href: '/pos-waitlist', color: 'yellow' },
              { title: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, href: '/analytics', color: 'emerald' },
              { title: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/admin', color: 'gray' },
              { title: 'Help Center', icon: <HelpCircle className="w-5 h-5" />, href: '/support', color: 'pink' },
            ].map((module, index) => (
              <Card 
                key={index}
                className={`hover:border-${module.color}-500/50 transition-all cursor-pointer group`}
                onClick={() => window.location.href = module.href}
              >
                <div className="p-6 text-center">
                  <div className={`w-12 h-12 bg-${module.color}-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-${module.color}-500/30 transition-colors`}>
                    <div className={`text-${module.color}-400`}>
                      {module.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm">{module.title}</h4>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise CTA Section */}
        <div className="mb-12">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="primary" 
                size="lg" 
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/lounge-experience-demo'}
              >
                <Play className="w-5 h-5" />
                Lounge Experience Demo
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 py-3"
                onClick={() => window.location.href = '/flavor-demo'}
              >
                Guest Experience
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 py-3 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400"
                onClick={() => window.location.href = '/contact'}
              >
                <Gift className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* Operational Flow - Enhanced with Visual Clarity */}
        <div className="mb-12">
          {/* Step-by-Step Workflow Cards */}
          <h3 className="text-2xl font-bold text-center mb-8">
            Operational Workflow
          </h3>
          <p className="text-center text-zinc-400 text-lg mb-8">
            Streamlined process from dashboard to admin management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {operationalFlow.map((action, index) => (
              <Card key={index} className={`hover:border-teal-500/50 transition-colors relative ${
                action.state === 'active' ? 'border-green-500/50 bg-green-500/5' :
                action.state === 'completed' ? 'border-teal-500/50 bg-teal-500/5' :
                'border-zinc-700'
              }`}>
                <div className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                    action.state === 'active' ? 'bg-green-500/20' :
                    action.state === 'completed' ? 'bg-teal-500/20' :
                    'bg-zinc-500/20'
                  }`}>
                    <div className={`${
                      action.state === 'active' ? 'text-green-400' :
                      action.state === 'completed' ? 'text-teal-400' :
                      'text-zinc-400'
                    }`}>
                      {action.state === 'completed' ? <CheckCircle className="w-5 h-5" /> : action.icon}
                    </div>
                  </div>
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    action.state === 'active' ? 'bg-green-500 text-white animate-pulse' :
                    action.state === 'completed' ? 'bg-teal-500 text-white' :
                    'bg-zinc-500 text-zinc-300'
                  }`}>
                    {action.state === 'completed' ? <CheckCircle className="w-3 h-3" /> : action.step}
                  </div>
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-xs text-zinc-400 mb-2">{action.description}</p>
                  <div className={`text-xs ${
                    action.state === 'active' ? 'text-green-400' :
                    action.state === 'completed' ? 'text-teal-400' :
                    'text-zinc-400'
                  }`}>{action.status}</div>
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

        {/* Powered by Integration Strip */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-zinc-300 mb-4">Smart Payment Architecture</h3>
            <p className="text-sm text-zinc-400 mb-4 max-w-2xl mx-auto">
              Hookah+ connects seamlessly with your existing payment system, abstracting payment complexity 
              while focusing on experience flow and trust capture.
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-sm font-medium">Secure Payments</div>
              <div className="text-sm font-medium">Real-time Processing</div>
              <div className="text-sm font-medium">Integrated Workflow</div>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Powered by H+ Labs
          </h3>
        </div>
      </div>
    </div>
  );
}