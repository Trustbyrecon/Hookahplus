"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  Pause, 
  Play,
  MoreVertical,
  Flame
} from 'lucide-react';

interface SimpleFSDDesignProps {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (action: string, sessionId: string) => void;
  className?: string;
}

export default function SimpleFSDDesign({ 
  sessions = [],
  userRole = 'MANAGER',
  onSessionAction,
  className = ''
}: SimpleFSDDesignProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleCreateSession = () => {
    window.dispatchEvent(new CustomEvent('openCreateSessionModal'));
  };

  const handleSessionAction = (action: string, sessionId: string) => {
    if (onSessionAction) {
      onSessionAction(action, sessionId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'text-green-400 bg-green-500/10';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'completed':
        return 'text-blue-400 bg-blue-500/10';
      case 'pending':
        return 'text-orange-400 bg-orange-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Session Management</h2>
            <p className="text-sm text-zinc-400">Manage active hookah sessions</p>
          </div>
        </div>
        
        <button
          onClick={handleCreateSession}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['overview', 'boh', 'foh'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Flame className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No Active Sessions</h3>
            <p className="text-zinc-500 mb-4">Create your first session to get started</p>
            <button
              onClick={handleCreateSession}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Create Session
            </button>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id || session.session_id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(session.status || session.state)}`}>
                    {getStatusIcon(session.status || session.state)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {session.table_id || session.tableId || 'Table Unknown'}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {session.customer_name || session.customerName || 'Guest Customer'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status || session.state)}`}>
                    {session.status || session.state || 'Unknown'}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {session.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleSessionAction('pause', session.id || session.session_id)}
                          className="p-1 text-zinc-400 hover:text-yellow-400 transition-colors"
                          title="Pause Session"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSessionAction('complete', session.id || session.session_id)}
                          className="p-1 text-zinc-400 hover:text-green-400 transition-colors"
                          title="Complete Session"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {session.flavor_mix && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-sm text-zinc-400">
                    <span className="font-medium">Flavors:</span> {Array.isArray(session.flavor_mix) ? session.flavor_mix.join(', ') : session.flavor_mix}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-zinc-400">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{sessions.length}</p>
          </div>
          
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-400" />
              <span className="text-sm text-zinc-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {sessions.filter(s => (s.status || s.state)?.toLowerCase() === 'active').length}
            </p>
          </div>
          
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-zinc-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {sessions.filter(s => (s.status || s.state)?.toLowerCase() === 'pending').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
