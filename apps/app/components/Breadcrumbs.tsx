'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route label mapping for auto-generation
const routeLabels: Record<string, string> = {
  '': 'Home',
  'admin': 'Admin',
  'operator-onboarding': 'Operator Onboarding',
  'operator': 'Operator Dashboard',
  'sessions': 'Sessions',
  'fire-session-dashboard': 'Fire Session Dashboard',
  'staff-ops': 'Staff Operations',
  'staff-panel': 'Staff Panel',
  'analytics': 'Analytics',
  'pricing': 'Pricing Intelligence',
  'lounge-layout': 'Lounge Layout',
  'guest-intelligence': 'Guest Intelligence',
  'settings': 'Settings',
  'help': 'Help Center',
  'qr-generator': 'QR Generator',
  'qr-pathway': 'QR Pathway',
  'waitlist': 'Waitlist',
  'campaigns': 'Marketing Campaigns',
  'ghost-log': 'Ghost Log',
  'revenue': 'Revenue',
  'reconciliation': 'Reconciliation',
  'partnership': 'Partnership',
  'visual-grounder': 'Visual Grounder',
  'layout-preview': 'Layout Preview'
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    const generated: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      generated.push({
        label,
        href: currentPath
      });
    });
    
    return generated;
  })();

  // Don't show breadcrumbs on home page
  if (pathname === '/' || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer rounded p-1 hover:bg-zinc-800/50"
                  title="Go to Home"
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 text-zinc-600 mx-2" />
                  {isLast ? (
                    <span className="text-white font-medium">{item.label}</span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-zinc-400 hover:text-teal-400 transition-colors cursor-pointer rounded px-2 py-1 hover:bg-zinc-800/50"
                      title={`Go to ${item.label}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

