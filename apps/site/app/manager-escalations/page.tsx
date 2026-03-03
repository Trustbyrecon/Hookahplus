'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
  Search,
  Flame
} from 'lucide-react';

export default function ManagerEscalationsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const escalations = [
    {
      id: 'esc-001',
      sessionId: 'session-123',
      type: 'payment_issue',
      priority: 'high',
      status: 'pending',
      reportedBy: 'BOH Staff',
      reportedAt: '2024-11-04 14:30',
      description: 'Payment failed but customer claims card was charged',
      escalationReason: 'Requires manager override for refund processing',
      assignedTo: null,
      resolvedAt: null,
      resolution: null,
    },
    {
      id: 'esc-002',
      sessionId: 'session-456',
      type: 'customer_complaint',
      priority: 'urgent',
      status: 'pending',
      reportedBy: 'FOH Staff',
      reportedAt: '2024-11-04 15:15',
      description: 'Customer requests remake - flavor quality issue',
      escalationReason: 'Second remake request - needs manager approval',
      assignedTo: null,
      resolvedAt: null,
      resolution: null,
    },
    {
      id: 'esc-003',
      sessionId: 'session-789',
      type: 'refund_request',
      priority: 'medium',
      status: 'resolved',
      reportedBy: 'Delivery Staff',
      reportedAt: '2024-11-04 13:20',
      description: 'Customer not satisfied - requests full refund',
      escalationReason: 'Partial refund requires manager authorization',
      assignedTo: 'Manager John',
      resolvedAt: '2024-11-04 13:45',
      resolution: 'Partial refund approved - 50% returned',
    },
    {
      id: 'esc-004',
      sessionId: 'session-321',
      type: 'staff_conflict',
      priority: 'high',
      status: 'pending',
      reportedBy: 'BOH Staff',
      reportedAt: '2024-11-04 16:00',
      description: 'Table assignment conflict between BOH and FOH',
      escalationReason: 'Requires manager decision on workflow',
      assignedTo: null,
      resolvedAt: null,
      resolution: null,
    },
  ];

  const filteredEscalations = escalations.filter(esc => {
    if (filter !== 'all' && esc.status !== filter) return false;
    if (searchQuery && !esc.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !esc.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_issue': return <Flame className="w-4 h-4" />;
      case 'customer_complaint': return <MessageSquare className="w-4 h-4" />;
      case 'refund_request': return <XCircle className="w-4 h-4" />;
      case 'staff_conflict': return <User className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                  Manager Escalations
                </h1>
                <p className="text-zinc-400 mt-2">Resolve escalated issues from BOH, FOH, and Delivery teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search escalations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'resolved', 'urgent'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-teal-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Escalations List */}
        <div className="space-y-4">
          {filteredEscalations.map((esc) => (
            <Card key={esc.id} className={`border-l-4 ${
              esc.priority === 'urgent' ? 'border-l-red-500' :
              esc.priority === 'high' ? 'border-l-orange-500' :
              esc.priority === 'medium' ? 'border-l-yellow-500' :
              'border-l-zinc-500'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getPriorityColor(esc.priority)}`}>
                      {getTypeIcon(esc.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {esc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(esc.priority)}`}>
                          {esc.priority.toUpperCase()}
                        </span>
                        {esc.status === 'pending' && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            PENDING
                          </span>
                        )}
                        {esc.status === 'resolved' && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300 mb-2">{esc.description}</p>
                      <div className="text-sm text-zinc-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>Reported: {esc.reportedAt} by {esc.reportedBy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-orange-400">{esc.escalationReason}</span>
                        </div>
                        {esc.assignedTo && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>Assigned to: {esc.assignedTo}</span>
                          </div>
                        )}
                        {esc.resolvedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Resolved: {esc.resolvedAt}</span>
                          </div>
                        )}
                        {esc.resolution && (
                          <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                            <strong>Resolution:</strong> {esc.resolution}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {esc.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-700">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        alert(`Assigning escalation ${esc.id} to current manager`);
                      }}
                    >
                      Assign to Me
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const resolution = prompt('Enter resolution notes:');
                        if (resolution) {
                          alert(`Escalation ${esc.id} resolved: ${resolution}`);
                        }
                      }}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/fire-session-dashboard?sessionId=${esc.sessionId}`;
                      }}
                    >
                      View Session
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredEscalations.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Escalations Found</h3>
              <p className="text-zinc-400">All escalations have been resolved or match your filters.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

