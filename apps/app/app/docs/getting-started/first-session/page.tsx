"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Play, 
  Pause, 
  Clock, 
  Users,
  ChefHat,
  UserCheck,
  Flame,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Target,
  Shield,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import GlobalNavigation from '../../../../components/GlobalNavigation';

export default function FirstSessionGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  const workflowSteps = [
    {
      id: 'prep',
      title: 'BOH Preparation',
      description: 'Back of House staff prepares the hookah session',
      icon: <ChefHat className="w-6 h-6" />,
      details: [
        'Receive order from customer or FOH',
        'Select hookah equipment and flavors',
        'Prepare the hookah setup',
        'Update session status to "Ready for Delivery"'
      ],
      role: 'BOH',
      duration: '5-10 minutes'
    },
    {
      id: 'delivery',
      title: 'FOH Delivery',
      description: 'Front of House staff delivers to customer',
      icon: <UserCheck className="w-6 h-6" />,
      details: [
        'Pick up prepared hookah from BOH',
        'Deliver to customer table',
        'Set up hookah for customer',
        'Update session status to "Active"'
      ],
      role: 'FOH',
      duration: '2-3 minutes'
    },
    {
      id: 'active',
      title: 'Active Session',
      description: 'Customer enjoys their hookah session',
      icon: <Flame className="w-6 h-6" />,
      details: [
        'Monitor session duration',
        'Check on customer satisfaction',
        'Handle any requests or issues',
        'Prepare for session completion'
      ],
      role: 'FOH',
      duration: '30-60 minutes'
    },
    {
      id: 'completion',
      title: 'Session Completion',
      description: 'Clean up and finalize the session',
      icon: <CheckCircle className="w-6 h-6" />,
      details: [
        'Collect payment if not pre-paid',
        'Clean up hookah equipment',
        'Update session status to "Completed"',
        'Record session analytics'
      ],
      role: 'FOH',
      duration: '3-5 minutes'
    }
  ];

  const sessionTypes = [
    {
      name: 'Standard Session',
      description: 'Basic hookah session with one flavor',
      duration: '45 minutes',
      price: '$25',
      features: ['Single flavor', 'Standard equipment', 'Basic service']
    },
    {
      name: 'Premium Session',
      description: 'Enhanced session with multiple flavors',
      duration: '60 minutes',
      price: '$35',
      features: ['Multiple flavors', 'Premium equipment', 'Enhanced service']
    },
    {
      name: 'VIP Session',
      description: 'Luxury experience with premium service',
      duration: '90 minutes',
      price: '$50',
      features: ['Premium flavors', 'Luxury equipment', 'Personal attendant']
    }
  ];

  const pricingSetup = [
    {
      step: 1,
      title: 'Access Pricing Settings',
      description: 'Go to Admin → System Settings → Pricing',
      action: 'Navigate to pricing configuration'
    },
    {
      step: 2,
      title: 'Set Base Prices',
      description: 'Configure prices for each session type',
      action: 'Enter your standard pricing'
    },
    {
      step: 3,
      title: 'Configure Add-ons',
      description: 'Set up additional charges for extras',
      action: 'Add flavor upgrades, time extensions, etc.'
    },
    {
      step: 4,
      title: 'Test Pricing',
      description: 'Use test mode to verify pricing',
      action: 'Create test sessions to validate pricing'
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
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Flame className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Creating Your First Session</h1>
              <p className="text-zinc-400">Step-by-step guide to creating and managing hookah sessions</p>
            </div>
          </div>
        </div>

        {/* Workflow Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Session Workflow Overview</h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mx-auto mb-3">
                    {step.icon}
                  </div>
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-400 mb-2">{step.description}</p>
                  <div className="text-xs text-zinc-500">
                    <span className="bg-zinc-700 px-2 py-1 rounded">{step.role}</span>
                    <span className="ml-2">{step.duration}</span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block mt-4">
                      <ArrowRight className="w-4 h-4 text-zinc-500 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Workflow Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Detailed Workflow Steps</h2>
          <div className="space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-zinc-400">
                        <Users className="w-4 h-4" />
                        <span>{step.role}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{step.duration}</span>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Session Types & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionTypes.map((type, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3">{type.description}</p>
                  <div className="text-2xl font-bold text-green-400">{type.price}</div>
                  <div className="text-sm text-zinc-500">{type.duration}</div>
                </div>
                
                <div className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Setup */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Setting Up Pricing</h2>
          <div className="space-y-4">
            {pricingSetup.map((item, index) => (
              <div key={item.step} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-semibold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </div>
                  <div className="text-sm text-zinc-500 italic">
                    {item.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-lg font-semibold mb-4">Ready to Create Your First Session?</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/fire-session-dashboard">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Flame className="w-4 h-4 mr-2" />
                Go to Fire Sessions
              </Button>
            </Link>
            <Link href="/preorder/T-001">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <Play className="w-4 h-4 mr-2" />
                Test Pre-order Flow
              </Button>
            </Link>
            <Link href="/docs/getting-started/user-roles">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <Users className="w-4 h-4 mr-2" />
                Next: User Roles
              </Button>
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-300 mb-2">Pro Tips</h4>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Always test your workflow with staff before going live</li>
                <li>• Use the $1 test session feature to verify payment processing</li>
                <li>• Set up role-based permissions to ensure proper access control</li>
                <li>• Monitor session analytics to optimize your operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
