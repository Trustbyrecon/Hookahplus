"use client";
import { useState, useEffect } from 'react';
import StripeTestComponent from '../../components/StripeTestComponent';

interface LaunchChecklist {
  id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function EPAgentLaunchPage() {
  const [checklist, setChecklist] = useState<LaunchChecklist[]>([
    {
      id: 'env-setup',
      task: 'Environment Configuration',
      status: 'pending',
      description: 'Configure .env.production and .env.staging with Stripe keys',
      priority: 'high'
    },
    {
      id: 'stripe-integration',
      task: 'Stripe Integration',
      status: 'pending',
      description: 'Set up webhooks, test mode transactions, and payment flow',
      priority: 'high'
    },
    {
      id: 'checkout-qa',
      task: 'Checkout Flow QA',
      status: 'pending',
      description: 'Test full payment flow, mobile validation, and responsiveness',
      priority: 'high'
    },
    {
      id: 'analytics-wiring',
      task: 'Analytics Wiring',
      status: 'pending',
      description: 'Configure GA ID and Trust-Lock events on CTAs',
      priority: 'medium'
    },
    {
      id: 'live-verification',
      task: 'Live Mode Verification',
      status: 'pending',
      description: 'Test live mode with $1 transaction and deploy to hookahplus.net',
      priority: 'high'
    },
    {
      id: 'dns-ssl',
      task: 'DNS & SSL Verification',
      status: 'pending',
      description: 'Verify domain configuration and SSL certificates',
      priority: 'medium'
    }
  ]);

  const [currentPhase, setCurrentPhase] = useState<'prep' | 'testing' | 'launch' | 'live'>('prep');
  const [launchStatus, setLaunchStatus] = useState<'preparing' | 'ready' | 'launching' | 'live'>('preparing');

  const updateChecklistItem = (id: string, status: LaunchChecklist['status']) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const getPhaseProgress = () => {
    const completed = checklist.filter(item => item.status === 'completed').length;
    return Math.round((completed / checklist.length) * 100);
  };

  const canLaunch = () => {
    return checklist.every(item => item.status === 'completed');
  };

  const handleLaunch = () => {
    if (canLaunch()) {
      setLaunchStatus('launching');
      // Simulate launch process
      setTimeout(() => {
        setLaunchStatus('live');
        setCurrentPhase('live');
      }, 3000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">EP Agent - Stripe MVP Launch</h1>
          <p className="text-zinc-400 text-xl">Launch verification dashboard for hookahplus.net</p>
        </div>
      </div>

      {/* Launch Status */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Launch Status</h2>
            <div className={`px-4 py-2 rounded-lg font-medium ${
              launchStatus === 'live' ? 'bg-green-600 text-white' :
              launchStatus === 'launching' ? 'bg-yellow-600 text-white' :
              launchStatus === 'ready' ? 'bg-blue-600 text-white' :
              'bg-zinc-600 text-white'
            }`}>
              {launchStatus === 'live' ? '🚀 LIVE' :
               launchStatus === 'launching' ? '🚀 LAUNCHING' :
               launchStatus === 'ready' ? '✅ READY' :
               '⏳ PREPARING'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-300">Launch Progress</span>
              <span className="text-teal-400 font-bold">{getPhaseProgress()}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getPhaseProgress()}%` }}
              />
            </div>
          </div>

          {/* Launch Button */}
          <div className="text-center">
            <button
              onClick={handleLaunch}
              disabled={!canLaunch() || launchStatus === 'launching' || launchStatus === 'live'}
              className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${
                canLaunch() && launchStatus === 'ready'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white transform hover:scale-105'
                  : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {launchStatus === 'live' ? '🚀 LAUNCHED SUCCESSFULLY' :
               launchStatus === 'launching' ? '🚀 LAUNCHING...' :
               canLaunch() ? '🚀 LAUNCH TO PRODUCTION' :
               '⏳ COMPLETE CHECKLIST FIRST'}
            </button>
          </div>
        </div>

        {/* Launch Checklist */}
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Launch Checklist</h2>
          <div className="space-y-4">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-zinc-700 rounded-lg">
                <div className="text-2xl">{getStatusIcon(item.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{item.task}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${getPriorityColor(item.priority)} bg-zinc-800`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateChecklistItem(item.id, 'in-progress')}
                    disabled={item.status === 'completed'}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateChecklistItem(item.id, 'completed')}
                    disabled={item.status === 'completed'}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateChecklistItem(item.id, 'failed')}
                    disabled={item.status === 'completed'}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                  >
                    Fail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Integration Testing */}
        <StripeTestComponent />

        {/* Launch Documentation */}
        <div className="mt-8 bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <h2 className="text-2xl font-bold text-white mb-6">Launch Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-teal-300 mb-3">Pre-Launch Checklist</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Environment variables configured</li>
                <li>• Stripe keys verified (test & live)</li>
                <li>• Webhook endpoints tested</li>
                <li>• Payment flow validated</li>
                <li>• Mobile responsiveness confirmed</li>
                <li>• Analytics tracking verified</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Launch Steps</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Deploy to production environment</li>
                <li>• Verify DNS and SSL configuration</li>
                <li>• Test live mode with $1 transaction</li>
                <li>• Monitor webhook delivery</li>
                <li>• Verify analytics tracking</li>
                <li>• Document launch completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
