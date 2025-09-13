'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<NavigationGroup | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  // Determine current navigation group
  useEffect(() => {
    const currentGroup = navigationGroups.find(group => 
      group.pages.some(page => pathname.startsWith(page))
    );
    setActiveGroup(currentGroup || null);
  }, [pathname]);

  // Fetch real-time session data from customer journey
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch('/api/customer-journey');
        if (response.ok) {
          const data = await response.json();
          setSessionCount(data.totalSessions || 0);
          setActiveSessions(data.activeSessions || 0);
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
      }
    };

    fetchSessionData();
    const interval = setInterval(fetchSessionData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFlowStatusIcon = () => {
    if (activeSessions === 0) return '😴';
    if (activeSessions < 5) return '😊';
    if (activeSessions < 10) return '😅';
    return '🔥';
  };

  const getFlowStatusText = () => {
    if (activeSessions === 0) return 'Idle';
    if (activeSessions < 5) return 'Quiet';
    if (activeSessions < 10) return 'Busy';
    return 'Overloaded';
  };

  // Get current page info
  const getCurrentPageInfo = () => {
    if (pathname === '/staff') return { icon: '👥', label: 'Staff Ops', description: 'Staff operations dashboard' };
    if (pathname === '/staff-panel') return { icon: '🧠', label: 'Staff Panel', description: 'Behavioral memory & customer profiles' };
    if (pathname === '/admin') return { icon: '⚙️', label: 'Admin', description: 'System administration' };
    if (pathname === '/admin-control') return { icon: '⚙️', label: 'Control Center', description: 'Admin dashboard' };
    if (pathname === '/admin-customers') return { icon: '👥', label: 'Customers', description: 'Customer management' };
    if (pathname === '/admin-connectors') return { icon: '🔗', label: 'Connectors', description: 'Integration management' };
    if (pathname === '/support') return { icon: '🎫', label: 'Help Center', description: 'FAQ, contact forms, and support tickets' };
    if (pathname === '/docs') return { icon: '📚', label: 'Documentation', description: 'User guides and API documentation' };
    if (pathname === '/api-docs') return { icon: '🔌', label: 'API Docs', description: 'Developer API reference' };
    if (pathname === '/dashboard') return { icon: '📊', label: 'Dashboard', description: 'Main lounge overview' };
    if (pathname.startsWith('/sessions')) return { icon: '🔥', label: 'Sessions', description: 'Active hookah sessions' };
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
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
              <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            </Link>
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
            
            <div className="text-center">
              <div className="text-sm text-zinc-400">Flow Status</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getFlowStatusIcon()}</span>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{activeSessions}</span>
                  <span className="text-xs text-zinc-400">{getFlowStatusText()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-between py-3 border-t border-zinc-800/50">
          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              📊 Dashboard
            </Link>
            
            <Link 
              href="/sessions" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname.startsWith('/sessions') 
                  ? 'bg-green-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              🔥 Sessions
            </Link>
            
            <Link 
              href="/staff" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname === '/staff' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              👥 Staff Ops
            </Link>
            
            <Link 
              href="/staff-panel" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname === '/staff-panel' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              🧠 Staff Panel
            </Link>
            
            <Link 
              href="/admin" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname.startsWith('/admin') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              ⚙️ Admin
            </Link>
          </div>

          {/* Support and Help Links */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/support" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname.startsWith('/support') 
                  ? 'bg-green-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              🎫 Support
            </Link>
            
            <Link 
              href="/docs" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                pathname.startsWith('/docs') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              📚 Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;