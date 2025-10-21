"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '../components';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  // Theme is now managed entirely by ThemeToggle component
  // No local state needed to prevent hydration mismatch

  // Quick Access Cards
  const quickAccessCards = [
    {
      title: 'Dashboard',
      description: 'Overview & Analytics',
      icon: <BarChart3 className="w-6 h-6 text-teal-400" />,
      href: '/fire-session-dashboard',
      color: 'from-teal-500/20 to-cyan-500/20',
      borderColor: 'border-teal-500/30'
    },
    {
      title: 'Pre-Order',
      description: 'Table Ordering',
      icon: <QrCode className="w-6 h-6 text-blue-400" />,
      href: '/preorder/T-001',
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Fire Session',
      description: 'Live Management',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      href: '/fire-session-dashboard',
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      title: 'Operator Dashboard',
      description: 'Enterprise Control',
      icon: <Crown className="w-6 h-6 text-emerald-400" />,
      href: '/operator',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Staff Ops',
      description: 'Operations',
      icon: <Users className="w-6 h-6 text-purple-400" />,
      href: '/staff-ops',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Staff Mgmt',
      description: 'Team Management',
      icon: <UserCheck className="w-6 h-6 text-green-400" />,
      href: '/staff-panel',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'POS Waitlist',
      description: 'Queue Management',
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      href: '/waitlist',
      color: 'from-yellow-500/20 to-amber-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'Marketing Campaigns',
      description: 'Marketing Tools',
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      href: '/campaigns',
      color: 'from-cyan-500/20 to-teal-500/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      title: 'Lounge Onboarding',
      description: 'Physical lounge digitization',
      icon: <Eye className="w-6 h-6 text-indigo-400" />,
      href: '/layout-preview',
      color: 'from-indigo-500/20 to-purple-500/20',
      borderColor: 'border-indigo-500/30'
    },
    {
      title: 'Analytics',
      description: 'Reports & Insights',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      href: '/analytics',
      color: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Settings',
      description: 'Configuration',
      icon: <Settings className="w-6 h-6 text-gray-400" />,
      href: '/settings',
      color: 'from-gray-500/20 to-slate-500/20',
      borderColor: 'border-gray-500/30'
    },
    {
      title: 'QR Generator',
      description: 'Generate table QR codes',
      icon: <QrCode className="w-6 h-6 text-purple-400" />,
      href: '/qr-generator',
      color: 'from-purple-500/20 to-violet-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Help Center',
      description: 'Support & Docs',
      icon: <HelpCircle className="w-6 h-6 text-pink-400" />,
      href: '/help',
      color: 'from-pink-500/20 to-rose-500/20',
      borderColor: 'border-pink-500/30'
    }
  ];

  // Powered by Reflex Cards
  const reflexCards = [
    {
      title: 'Aletheia',
      description: 'AI-Powered Session Intelligence',
      icon: <Brain className="w-8 h-8 text-teal-400" />,
      color: 'from-teal-500/20 to-cyan-500/20',
      borderColor: 'border-teal-500/30'
    },
    {
      title: 'HiTrust Sentinel',
      description: 'Advanced Security & Trust Management',
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'EP Payments',
      description: 'Secure Payment Processing',
      icon: <CreditCard className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30'
    }
  ];

  // Always use pretty theme - ThemeToggle component manages the actual theme switching

  // Pretty Theme Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Hero */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Hookah+
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto">
                The future of hookah lounge management with AI-powered personalization, 
                secure payments, and seamless ordering experiences.
              </p>
            </div>

            {/* Primary CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link href="/preorder/T-001">
                <Button className="btn-pretty-primary text-lg px-8 py-4">
                  <QrCode className="w-5 h-5 mr-2" />
                  Pre-Order Station
                </Button>
              </Link>
            </div>

            {/* Secondary CTA Group */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link href="/sessions">
                <Button className="btn-pretty-secondary">
                  <Save className="w-4 h-4 mr-2" />
                  Sessions
                </Button>
              </Link>
              <Link href="/fire-session-dashboard">
                <Button className="btn-pretty-secondary">
                  <Flame className="w-4 h-4 mr-2" />
                  Fire Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Reflex Intelligence */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powered by Reflex Intelligence</h2>
          <p className="text-zinc-400 text-lg">Advanced AI systems working together to optimize your lounge experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reflexCards.map((card, index) => (
            <div key={index} className={`reflex-card bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-6`}>
              <div className="flex items-start mb-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  {card.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-zinc-300 text-sm">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Access</h2>
          <p className="text-zinc-400 text-lg">Everything you need to manage your hookah lounge</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {quickAccessCards.map((card, index) => (
            <Link key={index} href={card.href} className="group">
              <div className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-4 h-24 hover:scale-105 transition-all duration-300 cursor-pointer`}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-2">
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                  <p className="text-xs text-zinc-300 leading-tight">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H+</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                HOOKAH+
              </span>
            </div>
            <p className="text-zinc-400 text-sm">
              © 2025 HookahPlus. All rights reserved. Built with Reflex Intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}