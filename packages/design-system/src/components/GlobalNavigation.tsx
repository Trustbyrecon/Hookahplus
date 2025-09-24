'use client';

import React, { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';
import TrustLock from './TrustLock';

interface NavigationGroup {
  id: string;
  label: string;
  bgColor: string;
  pages: string[];
}

const navigationGroups: NavigationGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    bgColor: 'bg-blue-600/20 border-blue-500/50',
    pages: ['/dashboard']
  },
  {
    id: 'sessions',
    label: 'Sessions',
    bgColor: 'bg-green-600/20 border-green-500/50',
    pages: ['/sessions', '/fire-session-dashboard']
  },
  {
    id: 'staff',
    label: 'Staff',
    bgColor: 'bg-purple-600/20 border-purple-500/50',
    pages: ['/staff', '/staff-panel']
  },
  {
    id: 'support',
    label: 'Support',
    bgColor: 'bg-green-600/20 border-green-500/50',
    pages: ['/support', '/docs', '/api-docs']
  },
  {
    id: 'admin',
    label: 'Admin',
    bgColor: 'bg-blue-600/20 border-blue-500/50',
    pages: ['/admin', '/admin-control', '/admin-customers', '/admin-connectors']
  },
  {
    id: 'operations',
    label: 'Operations',
    bgColor: 'bg-orange-600/20 border-orange-500/50',
    pages: ['/monitoring', '/backup']
  }
];

interface GlobalNavigationProps {
  showTrustLock?: boolean;
  showStatusIndicators?: boolean;
  currentPage?: string;
  flowStatus?: 'idle' | 'normal' | 'busy' | 'overloaded';
  liveSessions?: number;
  revenue?: string;
  systemHealth?: 'excellent' | 'good' | 'warning' | 'error';
  onNavigate?: (path: string) => void;
}

const GlobalNavigation: React.FC<GlobalNavigationProps> = ({
  showTrustLock = true,
  showStatusIndicators = true,
  currentPage = '/',
  flowStatus = 'normal',
  liveSessions = 0,
  revenue = '$0',
  systemHealth = 'excellent',
  onNavigate
}) => {
  const [activeGroup, setActiveGroup] = useState<NavigationGroup | null>(null);

  // Determine current navigation group
  useEffect(() => {
    const currentGroup = navigationGroups.find(group => 
      group.pages.some(page => currentPage.startsWith(page))
    );
    setActiveGroup(currentGroup || null);
  }, [currentPage]);

  const getFlowStatusIcon = () => {
    if (liveSessions === 0) return '😴';
    if (liveSessions < 5) return '😊';
    if (liveSessions < 10) return '😅';
    return '🔥';
  };

  const getFlowStatusText = () => {
    if (liveSessions === 0) return 'Idle';
    if (liveSessions < 5) return 'Quiet';
    if (liveSessions < 10) return 'Busy';
    return 'Overloaded';
  };

  // Get current page info
  const getCurrentPageInfo = () => {
    if (currentPage === '/staff') return { icon: '👥', label: 'Staff Ops', description: 'Staff operations dashboard' };
    if (currentPage === '/staff-panel') return { icon: '🧠', label: 'Staff Panel', description: 'Behavioral memory & customer profiles' };
    if (currentPage === '/admin') return { icon: '⚙️', label: 'Admin', description: 'System administration' };
    if (currentPage === '/admin-control') return { icon: '⚙️', label: 'Control Center', description: 'Admin dashboard' };
    if (currentPage === '/admin-customers') return { icon: '👥', label: 'Customers', description: 'Customer management' };
    if (currentPage === '/admin-connectors') return { icon: '🔗', label: 'Connectors', description: 'Integration management' };
    if (currentPage === '/support') return { icon: '🎫', label: 'Help Center', description: 'FAQ, contact forms, and support tickets' };
    if (currentPage === '/docs') return { icon: '📚', label: 'Documentation', description: 'User guides and API documentation' };
    if (currentPage === '/api-docs') return { icon: '🔌', label: 'API Docs', description: 'Developer API reference' };
    if (currentPage === '/dashboard') return { icon: '📊', label: 'Dashboard', description: 'Main lounge overview' };
    if (currentPage.startsWith('/sessions')) return { icon: '🔥', label: 'Sessions', description: 'Active hookah sessions' };
    return null;
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Logo and Current Page */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <a 
              href="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/');
              }}
            >
              <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
              <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            </a>
            {activeGroup && (
              <div className={`${activeGroup.bgColor} text-zinc-300 text-sm font-medium px-3 py-1 rounded-lg border transition-all duration-300`}>
                {activeGroup.label.toUpperCase()}
              </div>
            )}
          </div>

          {/* Current Page and Flow Status */}
          <div className="flex items-center space-x-6">
            {/* Current Page Info */}
            {currentPageInfo && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-white">
                  <span className="text-lg">{currentPageInfo.icon}</span>
                  <span className="font-medium">{currentPageInfo.label}</span>
                </div>
                <div className="text-sm text-zinc-400">{currentPageInfo.description}</div>
              </div>
            )}
            
            {/* Status Indicators */}
            {showStatusIndicators && (
              <>
                <StatusIndicator status="idle" label="Current Page" value="Home" />
                <StatusIndicator status={flowStatus as any} label="Flow Status" value={getFlowStatusText()} />
                <StatusIndicator status="online" label="Live Sessions" value={liveSessions.toString()} />
                <StatusIndicator status="online" label="Revenue" value={revenue} />
                <StatusIndicator status="online" label="System Health" value={systemHealth.toUpperCase()} />
              </>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-between py-3 border-t border-zinc-800/50">
          <div className="flex items-center space-x-6">
            <a 
              href="/dashboard" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === '/dashboard' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/dashboard');
              }}
            >
              📊 Dashboard
            </a>
            
            <a 
              href="/sessions" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage.startsWith('/sessions') 
                  ? 'bg-green-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/sessions');
              }}
            >
              🔥 Sessions
            </a>
            
            <a 
              href="/staff" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === '/staff' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/staff');
              }}
            >
              👥 Staff Ops
            </a>
            
            <a 
              href="/staff-panel" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === '/staff-panel' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/staff-panel');
              }}
            >
              🧠 Staff Panel
            </a>
            
            <a 
              href="/admin" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage.startsWith('/admin') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/admin');
              }}
            >
              ⚙️ Admin
            </a>
          </div>

          {/* Support and Help Links */}
          <div className="flex items-center space-x-3">
            <a 
              href="/support" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage.startsWith('/support') 
                  ? 'bg-green-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/support');
              }}
            >
              🎫 Support
            </a>
            
            <a 
              href="/docs" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage.startsWith('/docs') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('/docs');
              }}
            >
              📚 Docs
            </a>
          </div>
        </div>

        {/* Trust Lock Display */}
        {showTrustLock && (
          <div className="py-3 border-t border-zinc-800/50">
            <div className="flex justify-center">
              <TrustLock trustScore={0.87} status="active" version="TLH-v1" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavigation;