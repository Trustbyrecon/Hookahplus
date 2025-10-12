'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, HelpCircle, FileText, Home, Clock } from 'lucide-react';

interface GlobalNavigationProps {
  currentPage?: string;
  trustScore?: number;
  flowStatus?: number;
}

export const GlobalNavigation: React.FC<GlobalNavigationProps> = ({
  currentPage = 'home',
  trustScore = 0.87,
  flowStatus = 71
}) => {
  const navigationItems = [
    { name: 'Home', href: '/', icon: Home, current: currentPage === 'home' },
    { name: 'Extend Session', href: '/extend-session', icon: Clock, current: currentPage === 'extend-session' }
  ];

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Main Navigation */}
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Flow Status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🍃</div>
              <div>
                <div className="text-lg font-bold text-white">H+ HOOKAH+ GUEST</div>
                <div className="text-xs text-zinc-400">Flow Status: {flowStatus}%</div>
              </div>
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-primary-600 text-white'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.current && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Trust-Lock, Support, Docs */}
          <div className="flex items-center space-x-4">
            {/* Trust-Lock with Shield */}
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-white">Trust-Lock</span>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
            </div>

            {/* Support and Docs */}
            <div className="flex items-center space-x-3">
              <Link
                href="/support"
                className="flex items-center space-x-1 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center space-x-1 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Docs</span>
              </Link>
            </div>

            {/* Profile */}
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-zinc-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalNavigation;