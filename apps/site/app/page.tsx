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
  CreditCard,
  ArrowRight,
  Play,
  CheckCircle,
  Zap,
  Activity,
  Heart,
  Star,
  Gift
} from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';

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
            Enterprise-grade lounge management with AI-powered personalization and secure transactions
          </p>
          
          {/* Key Metrics - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {metrics.filter(metric => metric.title !== 'System Health').map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${metric.bgColor} mb-3`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-400 mb-1">{metric.value}</div>
                <div className="text-sm text-zinc-400">{metric.title}</div>
                <div className="text-xs text-zinc-500 mt-1">{metric.change}</div>
              </div>
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
                onClick={() => window.location.href = '/sessions'}
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
          {/* Hero Section: Master Lounge Operations */}
          <div className="relative mb-12 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-teal-500/20">
            <div className="relative h-[400px]">
              <ImageWithFallback
                src="/images/operational-workflow/master-lounge-operations.jpg"
                alt="Master Lounge Operations - Real-time data insights for staff and session optimization"
                fill
                className="object-cover opacity-40"
                priority
                fallbackText="Master Lounge Operations Hero Image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-4">
                  MASTER LOUNGE OPERATIONS
                </h3>
                <p className="text-xl text-zinc-300 max-w-2xl mb-6">
                  Unlock real-time data insights to optimize your staff and sessions with Hookah+
                </p>
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => window.location.href = '/contact'}
                >
                  GET THE DEMO
                </Button>
              </div>
            </div>
          </div>

          {/* Take Control Section */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-teal-500/20">
              <ImageWithFallback
                src="/images/operational-workflow/take-control-lounge.jpg"
                alt="Take control of your lounge with intelligent tools"
                fill
                className="object-cover"
                fallbackText="Staff using tablet in modern lounge"
              />
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-4">TAKE CONTROL OF YOUR LOUNGE</h4>
              <p className="text-lg text-zinc-400 mb-6">
                Move beyond guesswork: intelligent tools for modern hookah lounge management.
              </p>
              <p className="text-zinc-500">
                Empower your staff with real-time tablet access to manage orders, track sessions, 
                and deliver exceptional service seamlessly.
              </p>
            </div>
          </div>

          {/* Automated Operations Flow */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-4">AUTOMATE OPERATIONS</h3>
            <p className="text-center text-zinc-400 text-lg mb-8">
              Streamline complex inventory, re-fills, and table service into intuitive, data-driven workflows
            </p>
            
            <div className="relative mb-8 rounded-xl overflow-hidden border border-teal-500/20 bg-zinc-900/50 p-8">
              <div className="relative h-[500px]">
                <ImageWithFallback
                  src="/images/operational-workflow/automate-operations.jpg"
                  alt="Automate operations workflow from session start to inventory updated"
                  fill
                  className="object-contain"
                  fallbackText="Workflow: Session Start → Inventory Updated"
                />
              </div>
            </div>
          </div>

          {/* Operational Flow Simplified */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-3xl font-bold mb-4">
                OPERATIONAL<br />FLOW,<br />SIMPLIFIED.
              </h4>
              <p className="text-xl text-zinc-300 mb-4">
                Monitor every session in real-time, reducing management friction by <span className="text-teal-400 font-bold">40%</span>.
              </p>
              <p className="text-zinc-500">
                Access comprehensive dashboards that put all your operational data at your fingertips, 
                enabling instant decision-making and proactive management.
              </p>
            </div>
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-teal-500/20">
              <ImageWithFallback
                src="/images/operational-workflow/operational-flow-simplified.jpg"
                alt="Operational flow simplified dashboard interface"
                fill
                className="object-contain bg-zinc-900"
                fallbackText="Hookah+ Dashboard Interface"
              />
            </div>
          </div>

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

          {/* Maximize Performance Section */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-teal-500/20">
              <ImageWithFallback
                src="/images/operational-workflow/maximize-performance.jpg"
                alt="Maximize lounge performance with data analytics"
                fill
                className="object-contain bg-zinc-900"
                fallbackText="Performance Analytics Dashboard"
              />
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-4">MAXIMIZE LOUNGE PERFORMANCE</h4>
              <p className="text-lg text-zinc-400 mb-6">
                Analyze session data to optimize table turnover and increase daily revenue.
              </p>
              <p className="text-zinc-500 mb-4">
                Real-time analytics dashboards track key performance metrics, helping you identify 
                optimization opportunities and drive revenue growth.
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Table turnover optimization</li>
                <li>Revenue trend analysis</li>
                <li>Session duration insights</li>
                <li>Peak hour identification</li>
              </ul>
            </div>
          </div>

          {/* Boost Profitability Section */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-3xl font-bold mb-4">STEP 3: BOOST PROFITABILITY</h4>
              <p className="text-lg text-zinc-400 mb-6">
                Make smarter pricing and session duration decisions based on real-time business performance metrics.
              </p>
              <p className="text-zinc-500">
                Leverage data-driven insights to optimize pricing strategies, manage session durations, 
                and maximize profitability without compromising customer experience.
              </p>
            </div>
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-teal-500/20">
              <ImageWithFallback
                src="/images/operational-workflow/boost-profitability.jpg"
                alt="Boost profitability with data-driven pricing decisions"
                fill
                className="object-cover"
                fallbackText="Pricing & Profitability Dashboard"
              />
            </div>
          </div>

          {/* Coordinate Staff Seamlessly Section */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-[500px] rounded-xl overflow-hidden border border-teal-500/20">
              <ImageWithFallback
                src="/images/operational-workflow/coordinate-staff.jpg"
                alt="Coordinate staff seamlessly with task management"
                fill
                className="object-cover"
                fallbackText="Staff Coordination Interface"
              />
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-4">COORDINATE STAFF SEAMLESSLY</h4>
              <p className="text-lg text-zinc-400 mb-6">
                Assign tasks instantly and track completion—no more missed service calls.
              </p>
              <p className="text-zinc-500 mb-4">
                Real-time task management ensures your team stays synchronized, reduces service gaps, 
                and maintains consistent quality across all customer interactions.
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Instant task assignment</li>
                <li>Real-time completion tracking</li>
                <li>Staff workload balancing</li>
                <li>Service call notifications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Powered by Integration Strip */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-zinc-300 mb-4">Powered by Enterprise Integrations</h3>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-sm font-medium">Stripe</div>
              <div className="text-sm font-medium">Square</div>
              <div className="text-sm font-medium">Toast</div>
              <div className="text-sm font-medium">Clover</div>
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
                <div className="text-sm text-teal-400 font-semibold mb-2">Learning guest preferences: 3 insights today</div>
                <div className="text-xs text-zinc-500">Active Sessions: 18</div>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="relative">
                    <Brain className="w-6 h-6 text-green-400" />
                    <Shield className="w-4 h-4 text-emerald-300 absolute -bottom-1 -right-1" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">HiTrust Flavor Intelligence</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Your preferences are remembered and protected with AI-powered flavor learning
                </p>
                <div className="text-sm text-teal-400 font-semibold mb-2">🍓 Strawberry Kiwi: 23% preference</div>
                <div className="text-xs text-zinc-500">Flavor Wheel: Active • Trust Score: 87%</div>
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
                <div className="text-sm text-teal-400 font-semibold mb-2">Processed $1,220 in past 24h</div>
                <div className="text-xs text-zinc-500">Revenue: $12,340</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}