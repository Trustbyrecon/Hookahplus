'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalNavigation from '@/components/GlobalNavigation';

interface TrustPoint {
  id: string;
  label: string;
  status: 'verified' | 'pending' | 'failed';
  timestamp: string;
  details: string;
}

const MOCK_TRUST: TrustPoint[] = [
  { id: '1', label: 'Payment Gateway', status: 'verified', timestamp: '2024-01-15 10:30:00', details: 'Stripe integration active' },
  { id: '2', label: 'Data Encryption', status: 'verified', timestamp: '2024-01-15 10:25:00', details: 'AES-256 encryption enabled' },
  { id: '3', label: 'Session Security', status: 'pending', timestamp: '2024-01-15 10:20:00', details: 'Multi-factor authentication in progress' },
  { id: '4', label: 'API Security', status: 'verified', timestamp: '2024-01-15 10:15:00', details: 'OAuth 2.0 implementation complete' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>(MOCK_TRUST);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Admin Control Center</h1>
              <p className="text-zinc-400">Hookah+ System Management & Monitoring</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('trust')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'trust' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Trust-Lock Status
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'analytics' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'settings' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">System Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-400">Operational</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-2">All systems running normally</p>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">Active Sessions</h3>
                    <div className="text-2xl font-bold text-white">12</div>
                    <p className="text-zinc-400 text-sm">Currently in progress</p>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">Revenue Today</h3>
                    <div className="text-2xl font-bold text-white">$2,847</div>
                    <p className="text-zinc-400 text-sm">+12% from yesterday</p>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-teal-400 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-zinc-300">New session started at Table 5</span>
                      <span className="text-zinc-500 text-sm">2 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-zinc-300">Payment processed for Table 3</span>
                      <span className="text-zinc-500 text-sm">5 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-zinc-300">Session completed at Table 7</span>
                      <span className="text-zinc-500 text-sm">8 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-teal-400 mb-4">Trust-Lock Verification Points</h3>
                  <div className="space-y-4">
                    {trustPoints.map((point) => (
                      <div key={point.id} className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getStatusIcon(point.status)}</span>
                          <div>
                            <h4 className="font-medium text-white">{point.label}</h4>
                            <p className="text-zinc-400 text-sm">{point.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-zinc-400">{point.timestamp}</div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            point.status === 'verified' ? 'bg-green-600/20 text-green-400' :
                            point.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {point.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-4">Session Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Total Sessions Today</span>
                        <span className="text-white font-semibold">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Average Session Duration</span>
                        <span className="text-white font-semibold">52 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Peak Hours</span>
                        <span className="text-white font-semibold">8-10 PM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-4">Revenue Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Today's Revenue</span>
                        <span className="text-white font-semibold">$2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-300">This Week</span>
                        <span className="text-white font-semibold">$18,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-300">Growth Rate</span>
                        <span className="text-green-400 font-semibold">+12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-teal-400 mb-4">System Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Auto-session timeout</h4>
                        <p className="text-zinc-400 text-sm">Automatically end sessions after 2 hours</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Email notifications</h4>
                        <p className="text-zinc-400 text-sm">Send notifications for completed sessions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}