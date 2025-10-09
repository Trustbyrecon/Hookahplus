'use client';

import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, ChefHat, Bell, Target, Award, Crown, Database, Server } from 'lucide-react';

export default function AdminPage() {
  const systemStatus = [
    {
      id: 'status_001',
      service: 'Database',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '12ms',
      icon: <Database className="w-5 h-5" />
    },
    {
      id: 'status_002',
      service: 'API Gateway',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '8ms',
      icon: <Server className="w-5 h-5" />
    },
    {
      id: 'status_003',
      service: 'Payment Processing',
      status: 'healthy',
      uptime: '100%',
      responseTime: '45ms',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'status_004',
      service: 'AI Services',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '156ms',
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const adminActions = [
    {
      id: 'action_001',
      title: 'System Backup',
      description: 'Create full system backup',
      lastRun: '2 hours ago',
      status: 'completed',
      icon: <Database className="w-5 h-5" />
    },
    {
      id: 'action_002',
      title: 'Security Scan',
      description: 'Run security vulnerability scan',
      lastRun: '6 hours ago',
      status: 'completed',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'action_003',
      title: 'Performance Report',
      description: 'Generate system performance report',
      lastRun: '1 day ago',
      status: 'completed',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'action_004',
      title: 'User Audit',
      description: 'Review user access and permissions',
      lastRun: '3 days ago',
      status: 'pending',
      icon: <Users className="w-5 h-5" />
    }
  ];

  const metrics = [
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+0.1%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Users',
      value: '247',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+23',
      changeType: 'positive' as const
    },
    {
      title: 'API Calls',
      value: '12.4K',
      icon: <Server className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+1.2K',
      changeType: 'positive' as const
    },
    {
      title: 'Error Rate',
      value: '0.02%',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '-0.01%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Administrative Control</h1>
              <p className="text-zinc-400 mt-2">System management and monitoring</p>
            </div>
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Opening admin actions');
                alert('Admin Actions Panel\n\nAvailable Actions:\n• System Backup\n• Security Scan\n• Performance Report\n• User Audit\n• Database Maintenance');
              }}
            >
              <Crown className="w-4 h-4" />
              Admin Actions
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div>
            <h2 className="text-2xl font-bold mb-6">System Status</h2>
            <div className="space-y-4">
              {systemStatus.map((service) => (
                <Card key={service.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-teal-400">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.service}</h3>
                          <p className="text-sm text-zinc-400">Service Status</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Healthy</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-teal-400">{service.uptime}</div>
                        <div className="text-xs text-zinc-400">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{service.responseTime}</div>
                        <div className="text-xs text-zinc-400">Response Time</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Actions</h2>
            <div className="space-y-4">
              {adminActions.map((action) => (
                <Card key={action.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-teal-400">
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-zinc-400">{action.description}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {action.status === 'completed' ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                      <div>
                        <div className="text-sm text-zinc-400">Last Run</div>
                        <div className="text-sm text-white">{action.lastRun}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log(`Admin action: ${action.title}`);
                          if (action.status === 'completed') {
                            alert(`Viewing Report for: ${action.title}\n\nLast Run: ${action.lastRun}\nStatus: ${action.status}\n\nReport Contents:\n• System metrics\n• Performance data\n• Security logs\n• User activity`);
                          } else {
                            alert(`Running Action: ${action.title}\n\nDescription: ${action.description}\n\nThis action will:\n• Check system status\n• Generate reports\n• Update logs\n• Notify administrators`);
                          }
                        }}
                      >
                        {action.status === 'completed' ? 'View Report' : 'Run Now'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Initiating system backup');
                alert('System Backup\n\nInitiating full system backup...\n\n• Database backup\n• File system backup\n• Configuration backup\n• Estimated time: 15 minutes');
              }}
            >
              <Database className="w-4 h-4" />
              Backup
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Starting security scan');
                alert('Security Scan\n\nStarting comprehensive security scan...\n\n• Vulnerability assessment\n• Access control review\n• Threat detection\n• Estimated time: 10 minutes');
              }}
            >
              <Shield className="w-4 h-4" />
              Security Scan
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Generating reports');
                alert('Performance Reports\n\nGenerating system performance reports...\n\n• Usage statistics\n• Performance metrics\n• Error logs\n• User activity');
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Reports
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Opening system settings');
                alert('System Settings\n\nOpening system configuration panel...\n\n• User permissions\n• System preferences\n• Security settings\n• Maintenance options');
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
