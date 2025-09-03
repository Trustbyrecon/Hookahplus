"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    pages: ['/staff', '/admin']
  },
            {
            id: 'operations',
            label: 'Operations',
            bgColor: 'bg-orange-600/20 border-orange-500/50',
            pages: ['/pre-order', '/checkout', '/demo', '/pos-waitlist']
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

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const sessions = await response.json();
          setSessionCount(sessions.length);
          setActiveSessions(sessions.filter((s: any) => s.status === 'active').length);
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
      }
    };

    fetchSessionData();
    const interval = setInterval(fetchSessionData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getFlowStatusIcon = () => {
    if (activeSessions === 0) return '⚪';
    if (activeSessions < 5) return '🟢';
    if (activeSessions < 10) return '🟡';
    return '🔴';
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Logo and Current Page */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-teal-400 text-2xl animate-pulse">🍃</div>
            <div className="text-teal-400 font-bold text-xl">HOOKAH+</div>
            {activeGroup && (
              <div className={`${activeGroup.bgColor} text-zinc-300 text-sm font-medium px-3 py-1 rounded-lg border transition-all duration-300`}>
                {activeGroup.label.toUpperCase()}
              </div>
            )}
          </div>

          {/* Current Page and Flow Status */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-zinc-400">Current Page</div>
              <div className="text-white font-medium">
                {pathname === '/' ? 'Home' : 
                 pathname.split('/').filter(Boolean).map(word => 
                   word.charAt(0).toUpperCase() + word.slice(1)
                 ).join(' / ')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-zinc-400">Flow Status</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getFlowStatusIcon()}</span>
                <span className="text-white font-medium">{activeSessions}</span>
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
              ⚙️ Staff Mgmt
            </Link>
            
                                <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        pathname === '/admin'
                          ? 'bg-orange-600 text-white'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      ⚙️ Admin
                    </Link>

                    <Link
                      href="/pos-waitlist"
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        pathname === '/pos-waitlist'
                          ? 'bg-orange-600 text-white'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      📋 POS Waitlist
                    </Link>
          </div>

          {/* Quick Actions and Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-zinc-400">Total Sessions:</span>
              <span className="text-white font-medium">{sessionCount}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-zinc-400">Active:</span>
              <span className="text-green-400 font-medium">{activeSessions}</span>
            </div>
            
            <Link 
              href="/fire-session-dashboard" 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              🔥 Fire Session
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;
