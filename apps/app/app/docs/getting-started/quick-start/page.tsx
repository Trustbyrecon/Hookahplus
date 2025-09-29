"use client";

import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Play, 
  Settings, 
  Users, 
  Zap,
  Clock,
  Shield,
  BarChart3,
  Flame,
  ChefHat,
  UserCheck,
  Building2,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import GlobalNavigation from '../../../../components/GlobalNavigation';

export default function QuickStartGuide() {
  const steps = [
    {
      id: 1,
      title: 'Set Up Your Account',
      description: 'Create your admin account and configure basic settings',
      icon: <Settings className="w-6 h-6" />,
      details: [
        'Navigate to Admin Control Center',
        'Configure your business information',
        'Set up payment processing (Stripe)',
        'Add your first staff members'
      ],
      estimatedTime: '5 minutes'
    },
    {
      id: 2,
      title: 'Add Staff Members',
      description: 'Create accounts for your BOH, FOH, and management team',
      icon: <Users className="w-6 h-6" />,
      details: [
        'Go to Admin → User Management',
        'Add staff with appropriate roles',
        'Set up role-based permissions',
        'Send invitation emails'
      ],
      estimatedTime: '10 minutes'
    },
    {
      id: 3,
      title: 'Configure Your First Session',
      description: 'Set up your hookah session workflow and pricing',
      icon: <Flame className="w-6 h-6" />,
      details: [
        'Access Fire Session Dashboard',
        'Configure session types and pricing',
        'Set up flavor options',
        'Test the complete workflow'
      ],
      estimatedTime: '15 minutes'
    },
    {
      id: 4,
      title: 'Test Payment Processing',
      description: 'Verify Stripe integration with test payments',
      icon: <Shield className="w-6 h-6" />,
      details: [
        'Go to Pre-order page',
        'Use $1 test session feature',
        'Verify payment processing',
        'Check session creation flow'
      ],
      estimatedTime: '5 minutes'
    },
    {
      id: 5,
      title: 'Train Your Staff',
      description: 'Get your team familiar with their roles and workflows',
      icon: <UserCheck className="w-6 h-6" />,
      details: [
        'Show BOH staff the preparation workflow',
        'Train FOH on customer service features',
        'Demonstrate manager oversight tools',
        'Practice with test sessions'
      ],
      estimatedTime: '30 minutes'
    },
    {
      id: 6,
      title: 'Go Live',
      description: 'Start serving customers with your new POS system',
      icon: <Zap className="w-6 h-6" />,
      details: [
        'Switch from test mode to live mode',
        'Begin taking real customer orders',
        'Monitor session management',
        'Use analytics to track performance'
      ],
      estimatedTime: 'Immediate'
    }
  ];

  const features = [
    {
      title: 'Real-time Session Management',
      description: 'Track hookah sessions from preparation to completion',
      icon: <Flame className="w-5 h-5" />
    },
    {
      title: 'Role-based Access Control',
      description: 'BOH, FOH, Manager, and Admin roles with appropriate permissions',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Integrated Payment Processing',
      description: 'Stripe integration for seamless payment handling',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Live Analytics Dashboard',
      description: 'Real-time insights into your business performance',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      title: 'Staff Operations Management',
      description: 'Task management and staff coordination tools',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      title: 'Customer Support System',
      description: 'Built-in support and documentation for your team',
      icon: <Target className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/docs" className="inline-flex items-center text-zinc-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Quick Start Guide</h1>
              <p className="text-zinc-400">Get up and running with HookahPLUS in 5 minutes</p>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-300">Ready to Start?</span>
            </div>
            <p className="text-sm text-green-200">
              This guide will walk you through setting up HookahPLUS for your hookah lounge. 
              Follow these steps in order for the best experience.
            </p>
          </div>
        </div>

        {/* Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-green-400">
                    {feature.icon}
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                </div>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6">Setup Steps</h2>
          {steps.map((step, index) => (
            <div key={step.id} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>{step.estimatedTime}</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 mb-4">{step.description}</p>
                  
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-zinc-300">{detail}</span>
                      </div>
                    ))}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <div className="flex items-center text-sm text-zinc-500">
                        <span>Next: {steps[index + 1].title}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-lg font-semibold mb-4">Ready to Get Started?</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin">
              <Button className="bg-green-500 hover:bg-green-600">
                <Settings className="w-4 h-4 mr-2" />
                Go to Admin Center
              </Button>
            </Link>
            <Link href="/fire-session-dashboard">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <Flame className="w-4 h-4 mr-2" />
                View Fire Sessions
              </Button>
            </Link>
            <Link href="/docs/getting-started/first-session">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <Play className="w-4 h-4 mr-2" />
                Next: First Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-300 mb-2">Need Help?</h4>
              <p className="text-sm text-yellow-200 mb-3">
                If you encounter any issues during setup, check our troubleshooting guide or contact support.
              </p>
              <div className="flex space-x-3">
                <Link href="/support">
                  <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-500/30">
                    Get Support
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-500/30">
                    View All Docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
