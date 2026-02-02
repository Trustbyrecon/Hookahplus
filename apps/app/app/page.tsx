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
  Brain,
  Wind,
  Sparkles,
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
  // Quick Access has been moved to Global Navigation

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

      {/* Quick Access moved to Global Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Quick Start Section for New Users */}
        <div className="mt-16 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3">New to Hookah+?</h3>
            <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
              Start with the Fire Session Dashboard to manage live sessions, or set up your lounge layout to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/fire-session-dashboard">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3">
                  <Flame className="w-4 h-4 mr-2" />
                  Start Managing Sessions
                </Button>
              </Link>
              <Link href="/lounge-layout">
                <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 px-6 py-3">
                  <Eye className="w-4 h-4 mr-2" />
                  Set Up Lounge Layout
                </Button>
              </Link>
            </div>
          </div>
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
              © 2025 HookahPlus. All rights reserved. Powered by H+ Labs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}