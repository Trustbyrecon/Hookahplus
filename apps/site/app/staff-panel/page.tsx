'use client';

import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, ChefHat, Bell, Target, Award } from 'lucide-react';

export default function StaffPanelPage() {
  const staffPerformance = [
    {
      id: 'staff_001',
      name: 'Sarah Johnson',
      role: 'Floor Manager',
      rating: 4.8,
      tasksCompleted: 24,
      efficiency: 94,
      revenue: '$2,340',
      avatar: 'SJ'
    },
    {
      id: 'staff_002',
      name: 'Mike Chen',
      role: 'Server',
      rating: 4.6,
      tasksCompleted: 18,
      efficiency: 87,
      revenue: '$1,890',
      avatar: 'MC'
    },
    {
      id: 'staff_003',
      name: 'Emma Rodriguez',
      role: 'Host',
      rating: 4.9,
      tasksCompleted: 31,
      efficiency: 91,
      revenue: '$2,120',
      avatar: 'ER'
    }
  ];

  const teamGoals = [
    {
      id: 'goal_001',
      title: 'Customer Satisfaction',
      target: 95,
      current: 94,
      unit: '%',
      status: 'on_track'
    },
    {
      id: 'goal_002',
      title: 'Service Speed',
      target: 15,
      current: 12,
      unit: 'min',
      status: 'exceeding'
    },
    {
      id: 'goal_003',
      title: 'Revenue Target',
      target: 50000,
      current: 42340,
      unit: '$',
      status: 'on_track'
    }
  ];

  const metrics = [
    {
      title: 'Team Rating',
      value: '4.8',
      icon: <Star className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      change: '+0.2',
      changeType: 'positive' as const
    },
    {
      title: 'Tasks Completed',
      value: '73',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+12',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Efficiency',
      value: '91%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      title: 'Team Revenue',
      value: '$6,350',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+8%',
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
              <h1 className="text-3xl font-bold text-white">Team Control</h1>
              <p className="text-zinc-400 mt-2">Staff performance monitoring and management</p>
            </div>
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Recognizing staff member');
                alert('Staff Recognition System\n\nSelect a staff member to recognize for outstanding performance!');
              }}
            >
              <Award className="w-4 h-4" />
              Recognize Staff
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
          {/* Staff Performance */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Staff Performance</h2>
            <div className="space-y-4">
              {staffPerformance.map((staff) => (
                <Card key={staff.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                          <span className="text-teal-400 font-semibold">{staff.avatar}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{staff.name}</h3>
                          <p className="text-sm text-zinc-400">{staff.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{staff.rating}</span>
                        </div>
                        <p className="text-xs text-zinc-400">Rating</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-teal-400">{staff.tasksCompleted}</div>
                        <div className="text-xs text-zinc-400">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-400">{staff.efficiency}%</div>
                        <div className="text-xs text-zinc-400">Efficiency</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span>{staff.efficiency}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${staff.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                      <div>
                        <div className="text-sm text-zinc-400">Revenue Generated</div>
                        <div className="text-lg font-semibold text-green-400">{staff.revenue}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log(`Viewing details for staff ${staff.id}`);
                          alert(`Staff Performance Details:\n\nName: ${staff.name}\nRole: ${staff.role}\nRating: ${staff.rating}/5\nTasks Completed: ${staff.tasksCompleted}\nEfficiency: ${staff.efficiency}%\nRevenue Generated: ${staff.revenue}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Goals */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Team Goals</h2>
            <div className="space-y-4">
              {teamGoals.map((goal) => (
                <Card key={goal.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'exceeding' ? 'bg-green-500/20 text-green-400' :
                        goal.status === 'on_track' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {goal.status === 'exceeding' ? 'Exceeding' :
                         goal.status === 'on_track' ? 'On Track' : 'Behind'}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            goal.status === 'exceeding' ? 'bg-green-400' :
                            goal.status === 'on_track' ? 'bg-blue-400' :
                            'bg-yellow-400'
                          }`}
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-400">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </div>
                      <div className="text-sm text-zinc-400">of target achieved</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
