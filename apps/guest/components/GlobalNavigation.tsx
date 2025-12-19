'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, HelpCircle, FileText, Home, Clock, Trophy, Menu, X, Flame } from 'lucide-react';
import { useGuestSessionContext } from '../contexts/GuestSessionContext';
import { STATUS_TO_TRACKER_STAGE } from '../../app/types/enhancedSession';
import Badge from './Badge';

interface GlobalNavigationProps {
  currentPage?: string;
  trustScore?: number;
  flowStatus?: number;
}

export const GlobalNavigation: React.FC<GlobalNavigationProps> = ({
  currentPage,
  trustScore = 0.87,
  flowStatus = 71
}) => {
  const { activeSession } = useGuestSessionContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Auto-detect current page from pathname if not provided
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (pathname === '/') return 'home';
    if (pathname === '/rewards') return 'rewards';
    if (pathname === '/extend-session') return 'extend-session';
    if (pathname === '/support') return 'support';
    if (pathname === '/docs') return 'docs';
    return 'home';
  };
  
  const activePage = getCurrentPage();
  
  const navigationItems = [
    { name: 'Home', href: '/', icon: Home, current: activePage === 'home' },
    { name: 'Your Rewards', href: '/rewards', icon: Trophy, current: activePage === 'rewards' },
    { name: 'Extend Session', href: '/extend-session', icon: Clock, current: activePage === 'extend-session' }
  ];

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🍃</div>
              <div>
                <div className="text-lg font-bold text-white">H+ Guest</div>
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

          {/* Right Side - Session Status, Support and Docs */}
          <div className="flex items-center space-x-4">
            {/* Active Session Indicator */}
            {activeSession && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                <Flame className="w-4 h-4 text-teal-400" />
                <Badge className="bg-teal-500/20 text-teal-400 text-xs border-0">
                  {STATUS_TO_TRACKER_STAGE[activeSession.status as keyof typeof STATUS_TO_TRACKER_STAGE]}
                </Badge>
                <span className="text-xs text-zinc-300">{activeSession.tableId}</span>
              </div>
            )}
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
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-zinc-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🍃</div>
            <div className="text-lg font-bold text-white">H+ Guest</div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-zinc-800 pt-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-primary-600 text-white'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.current && (
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-auto" />
                    )}
                  </Link>
                );
              })}
              
              {/* Support and Docs in Mobile Menu */}
              <div className="pt-2 mt-2 border-t border-zinc-800">
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Support</span>
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span>Docs</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalNavigation;