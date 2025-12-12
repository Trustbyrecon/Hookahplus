"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../utils/cn';
import { 
  Home, 
  Flame,
  Sparkles,
  BarChart3,
  LayoutGrid,
  Link as LinkIcon,
  FileText,
  HelpCircle,
  ChevronDown,
  Calendar,
  TrendingUp,
  DollarSign,
  Briefcase
} from 'lucide-react';
import Button from './Button';
import { trackDemoRequest } from '../lib/ctaTracking';

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface Dropdown {
  label: string;
  items: DropdownItem[];
}

const productDropdown: Dropdown = {
  label: 'Product',
  items: [
    { label: 'Overview', href: '/#how-it-works', icon: <Home className="w-4 h-4" /> },
    { label: 'Sessions', href: '/sessions', icon: <Flame className="w-4 h-4" /> },
    { label: 'Flavor Mixes', href: '/flavor-demo', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Dashboard', href: '/fire-session-dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Lounge Layout', href: '/lounge-layout', icon: <LayoutGrid className="w-4 h-4" /> },
    { label: 'POS Sync', href: '/docs#integrations', icon: <LinkIcon className="w-4 h-4" /> },
  ],
};

const resultsDropdown: Dropdown = {
  label: 'Results',
  items: [
    { label: 'Case Study', href: '/results/case-study', icon: <FileText className="w-4 h-4" /> },
    { label: 'ROI Calculator', href: '/#roi-calculator', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Investor Overview', href: '/investors', icon: <Briefcase className="w-4 h-4" /> },
  ],
};

const GlobalNavigation: React.FC = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false; // Anchor links aren't "active" in nav
    return pathname === href;
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-xl font-bold text-white">HOOKAH+</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('Product')}
                className={cn(
                  'flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <span>Product</span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  activeDropdown === 'Product' && 'rotate-180'
                )} />
              </button>
              {activeDropdown === 'Product' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
                  {productDropdown.items.map((item) => (
                    <Link
                      key={item.href}
                          href={item.href}
                      onClick={() => setActiveDropdown(null)}
                          className={cn(
                        'flex items-center space-x-2 px-4 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                    </Link>
                  ))}
                              </div>
                            )}
                          </div>
            
            {/* Results Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle('Results')}
                className={cn(
                  'flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <span>Results</span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  activeDropdown === 'Results' && 'rotate-180'
                )} />
              </button>
              {activeDropdown === 'Results' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-2 z-50">
                  {resultsDropdown.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className={cn(
                        'flex items-center space-x-2 px-4 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Links */}
            <Link
              href="/pricing"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive('/pricing')
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive('/docs')
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              Docs
            </Link>
            <Link
              href="/support"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive('/support')
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              Support
            </Link>

            {/* Book Demo Button */}
            <Button
              variant="primary"
              size="md"
              className="ml-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => {
                trackDemoRequest('Navigation', { action: 'book_demo' });
                window.location.href = '/onboarding';
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="px-4 py-4 space-y-4">
            {/* Product Section */}
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Product
              </div>
              <div className="space-y-1">
                {productDropdown.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          
            {/* Results Section */}
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Results
              </div>
              <div className="space-y-1">
                {resultsDropdown.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct Links */}
            <div className="space-y-1">
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive('/pricing')
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <DollarSign className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive('/docs')
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                )}
              >
                <FileText className="w-4 h-4" />
                <span>Docs</span>
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive('/support')
                    ? 'bg-teal-500/20 text-teal-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </Link>
            </div>

            {/* Book Demo Button */}
            <Button
              variant="primary"
              size="md"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => {
                trackDemoRequest('Navigation', { action: 'book_demo' });
                window.location.href = '/onboarding';
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Demo
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
};

export default GlobalNavigation;
