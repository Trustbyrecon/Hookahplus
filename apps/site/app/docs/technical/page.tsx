'use client';

import React, { useState } from 'react';
import PageHero from '../../../components/PageHero';
import NewsletterSignup from '../../../components/NewsletterSignup';
import { 
  BookOpen, 
  Code, 
  Play, 
  FileText, 
  Users, 
  Settings, 
  Zap,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Download,
  Globe,
  Database,
  Shield,
  Cpu,
  Workflow,
  Clock,
  Terminal,
  Lock
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'getting-started' | 'api' | 'integration' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  content?: React.ReactNode;
}

const TechnicalDocsPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docSections: DocSection[] = [
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      description: 'Get up and running with Hookah+ in minutes',
      icon: <Zap className="w-5 h-5" />,
      category: 'getting-started',
      difficulty: 'beginner',
      estimatedTime: '5 min',
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">1. Create Your Account</h3>
            <p className="text-zinc-300 mb-4">
              Sign up for Hookah+ and verify your email address. You'll receive a welcome email with your account details.
            </p>
            <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300">Sign Up</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('curl -X POST https://api.hookahplus.net/auth/signup');
                    setCopiedCode('signup');
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'signup' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <code className="text-sm text-green-400">curl -X POST https://api.hookahplus.net/auth/signup</code>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">2. Configure Your Venue</h3>
            <p className="text-zinc-300 mb-4">
              Set up your venue details, staff accounts, and session preferences through our guided setup wizard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Venue Settings</h4>
                <ul className="text-sm text-zinc-300 space-y-1">
                  <li>• Venue name and location</li>
                  <li>• Operating hours</li>
                  <li>• Table configuration</li>
                  <li>• Pricing models</li>
                </ul>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Staff Setup</h4>
                <ul className="text-sm text-zinc-300 space-y-1">
                  <li>• Create staff accounts</li>
                  <li>• Assign roles (FOH/BOH/Admin)</li>
                  <li>• Set permissions</li>
                  <li>• Configure notifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">3. Start Your First Session</h3>
            <p className="text-zinc-300 mb-4">
              Use the Fire Session Dashboard to create and manage your first hookah session.
            </p>
            <div className="bg-gradient-to-r from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Workflow className="w-5 h-5 text-primary-400 mr-2" />
                <span className="text-sm font-medium text-primary-300">AI-Powered Workflow</span>
              </div>
              <p className="text-sm text-zinc-300">
                Our AI agents will automatically optimize your workflow based on your venue's patterns and preferences.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation for developers',
      icon: <Code className="w-5 h-5" />,
      category: 'api',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
            <p className="text-zinc-300 mb-4">
              All API requests require authentication using Bearer tokens. Include the token in the Authorization header.
            </p>
            <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300">Authorization Header</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('Authorization: Bearer YOUR_API_TOKEN');
                    setCopiedCode('auth');
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'auth' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <code className="text-sm text-green-400">Authorization: Bearer YOUR_API_TOKEN</code>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Core Endpoints</h3>
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-3">POST</span>
                    <span className="text-sm font-medium text-white">/api/sessions</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('POST /api/sessions');
                      setCopiedCode('sessions');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'sessions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300 mb-2">Create a new hookah session</p>
                <div className="bg-black border border-zinc-700 rounded p-3">
                  <pre className="text-xs text-green-400 overflow-x-auto">
{`{
  "tableId": "T-001",
  "flavors": ["mint", "strawberry"],
  "duration": 60,
  "pricingModel": "flat-fee"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-3">GET</span>
                    <span className="text-sm font-medium text-white">/api/sessions/{'{sessionId}'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('GET /api/sessions/{sessionId}');
                      setCopiedCode('get-session');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'get-session' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300 mb-2">Retrieve session details and status</p>
                <div className="bg-black border border-zinc-700 rounded p-3">
                  <pre className="text-xs text-green-400 overflow-x-auto">
{`{
  "sessionId": "sess_123",
  "tableId": "T-001",
  "status": "active",
  "duration": 45,
  "flavors": ["mint", "strawberry"],
  "startTime": "2026-01-15T20:00:00Z"
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded mr-3">PUT</span>
                    <span className="text-sm font-medium text-white">/api/sessions/{'{sessionId}'}/extend</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('PUT /api/sessions/{sessionId}/extend');
                      setCopiedCode('extend-session');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'extend-session' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300 mb-2">Extend session duration</p>
                <div className="bg-black border border-zinc-700 rounded p-3">
                  <pre className="text-xs text-green-400 overflow-x-auto">
{`{
  "additionalMinutes": 15
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-3">DELETE</span>
                    <span className="text-sm font-medium text-white">/api/sessions/{'{sessionId}'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('DELETE /api/sessions/{sessionId}');
                      setCopiedCode('close-session');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'close-session' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300">Close session and calculate final total</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-3">GET</span>
                    <span className="text-sm font-medium text-white">/api/lounges/{'{loungeId}'}/analytics</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('GET /api/lounges/{loungeId}/analytics');
                      setCopiedCode('analytics');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'analytics' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300">Get lounge performance analytics and reports</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-3">POST</span>
                    <span className="text-sm font-medium text-white">/api/loyalty/credits</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('POST /api/loyalty/credits');
                      setCopiedCode('loyalty');
                      setTimeout(() => setCopiedCode(null), 2000);
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'loyalty' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-zinc-300 mb-2">Issue loyalty credits to customer</p>
                <div className="bg-black border border-zinc-700 rounded p-3">
                  <pre className="text-xs text-green-400 overflow-x-auto">
{`{
  "customerId": "cust_123",
  "amount": 50,
  "reason": "session_completion"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-400 mb-1">1000</div>
                <div className="text-sm text-zinc-300">Requests per hour</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-400 mb-1">100</div>
                <div className="text-sm text-zinc-300">Concurrent connections</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-400 mb-1">10MB</div>
                <div className="text-sm text-zinc-300">Payload size limit</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'payment-integration',
      title: 'Smart Payment Architecture',
      description: 'Connect Hookah+ seamlessly with your existing payment system',
      icon: <Database className="w-5 h-5" />,
      category: 'integration',
      difficulty: 'advanced',
      estimatedTime: '30 min',
      content: (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment System Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Square</h4>
                <p className="text-xs text-zinc-400 mb-2">Full integration available</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Toast</h4>
                <p className="text-xs text-zinc-400 mb-2">Beta integration</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                  <span className="text-xs text-yellow-400">Beta</span>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Clover</h4>
                <p className="text-xs text-zinc-400 mb-2">Coming soon</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                  <span className="text-xs text-blue-400">Q2 2026</span>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Custom POS</h4>
                <p className="text-xs text-zinc-400 mb-2">API integration</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                  <span className="text-xs text-purple-400">Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Integration Steps</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Connect Your Payment System</h4>
                  <p className="text-sm text-zinc-300">Use our secure integration flow to connect your existing payment system</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Sync Menu Items</h4>
                  <p className="text-sm text-zinc-300">Automatically sync your hookah flavors and pricing</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Configure Workflow</h4>
                  <p className="text-sm text-zinc-300">Set up automated session tracking and billing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI Features Guide',
      description: 'Leverage AI agents for optimal operations',
      icon: <Cpu className="w-5 h-5" />,
      category: 'advanced',
      difficulty: 'intermediate',
      estimatedTime: '20 min',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Cpu className="w-6 h-6 text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Flow Constant Λ∞</h3>
            </div>
            <p className="text-zinc-300 mb-4">
              Our AI orchestration system continuously optimizes your operations using advanced machine learning algorithms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Predictive Analytics</h4>
                <ul className="text-xs text-zinc-300 space-y-1">
                  <li>• Session duration prediction</li>
                  <li>• Flavor preference analysis</li>
                  <li>• Peak hour optimization</li>
                  <li>• Staff scheduling insights</li>
                </ul>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Automated Workflows</h4>
                <ul className="text-xs text-zinc-300 space-y-1">
                  <li>• Smart session management</li>
                  <li>• Automatic refill suggestions</li>
                  <li>• Dynamic pricing adjustments</li>
                  <li>• Customer experience optimization</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Agent Configuration</h3>
            <p className="text-zinc-300 mb-4">
              Configure your AI agents to match your venue's specific needs and preferences.
            </p>
            <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300">Agent Settings</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('PUT /api/agents/config');
                    setCopiedCode('agent-config');
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'agent-config' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-black border border-zinc-700 rounded p-3">
                <pre className="text-xs text-green-400 overflow-x-auto">
{`{
  "sessionAgent": {
    "enabled": true,
    "autoRefillThreshold": 0.3,
    "sessionExtensionEnabled": true
  },
  "pricingAgent": {
    "enabled": true,
    "dynamicPricing": true,
    "peakHourMultiplier": 1.2
  },
  "staffAgent": {
    "enabled": true,
    "autoAssignment": true,
    "performanceTracking": true
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = docSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All', count: docSections.length },
    { id: 'getting-started', label: 'Getting Started', count: docSections.filter(s => s.category === 'getting-started').length },
    { id: 'api', label: 'API', count: docSections.filter(s => s.category === 'api').length },
    { id: 'integration', label: 'Integration', count: docSections.filter(s => s.category === 'integration').length },
    { id: 'advanced', label: 'Advanced', count: docSections.filter(s => s.category === 'advanced').length }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Everything you need to master Hookah+"
        subheadline="Step-by-step guides, API docs, best practices"
        benefit={{
          value: "Get started in 5 minutes, scale to enterprise",
          description: "From quick start to advanced integrations"
        }}
        primaryCTA={{
          text: "Quick Start Guide",
          onClick: () => {
            const quickStart = document.getElementById('quick-start');
            if (quickStart) {
              quickStart.scrollIntoView({ behavior: 'smooth' });
            } else {
              setActiveSection('quick-start');
            }
          }
        }}
        trustIndicators={[
          { icon: <Zap className="w-4 h-4 text-teal-400" />, text: "5-minute setup" },
          { icon: <BookOpen className="w-4 h-4 text-teal-400" />, text: "Step-by-step guides" },
          { icon: <Code className="w-4 h-4 text-teal-400" />, text: "API documentation" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <span>{category.label}</span>
                      <span className="text-xs bg-zinc-700 px-2 py-1 rounded">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/docs/api" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                    <Code className="w-4 h-4 mr-2" />
                    API Reference
                  </a>
                  <a href="/docs/tutorials" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    Video Tutorials
                  </a>
                  <a href="/docs/examples" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    Code Examples
                  </a>
                  <a href="/community" className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Documentation Sections */}
            <div className="space-y-6">
              {filteredSections.map((section) => (
                <div key={section.id} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg">
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="text-primary-400 mr-4">
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-1">{section.title}</h2>
                        <p className="text-sm text-zinc-400">{section.description}</p>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(section.difficulty)}`}>
                            {section.difficulty}
                          </span>
                          <span className="text-xs text-zinc-500">{section.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {activeSection === section.id && section.content && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-zinc-700 pt-6">
                        {section.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="mt-12 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-8">
              <h2 className="text-xl font-bold text-white mb-6">Additional Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SDK Downloads */}
                <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Download className="w-6 h-6 text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">SDK Downloads</h3>
                  </div>
                  <p className="text-sm text-zinc-300 mb-4">
                    Download our official SDKs for popular programming languages. All SDKs include TypeScript definitions, comprehensive documentation, and example code.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Code className="w-5 h-5 text-blue-400 mr-2" />
                          <h4 className="font-semibold text-white">JavaScript SDK</h4>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">v1.2.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">Node.js 16+ and modern browsers. Includes React hooks and TypeScript support.</p>
                      <div className="flex items-center gap-2">
                        <a 
                          href="https://github.com/hookahplus/js-sdk" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          GitHub Repository
                        </a>
                        <span className="text-zinc-500">•</span>
                        <a 
                          href="https://www.npmjs.com/package/@hookahplus/sdk" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          npm install
                        </a>
                      </div>
                      <div className="mt-3 bg-zinc-950 border border-zinc-700 rounded p-2">
                        <code className="text-xs text-green-400">npm install @hookahplus/sdk</code>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Terminal className="w-5 h-5 text-green-400 mr-2" />
                          <h4 className="font-semibold text-white">Python SDK</h4>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">v1.1.5</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">Python 3.8+. Full async/await support with asyncio. Includes Django and Flask examples.</p>
                      <div className="flex items-center gap-2">
                        <a 
                          href="https://github.com/hookahplus/python-sdk" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          GitHub Repository
                        </a>
                        <span className="text-zinc-500">•</span>
                        <a 
                          href="https://pypi.org/project/hookahplus/" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PyPI Package
                        </a>
                      </div>
                      <div className="mt-3 bg-zinc-950 border border-zinc-700 rounded p-2">
                        <code className="text-xs text-green-400">pip install hookahplus</code>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Code className="w-5 h-5 text-purple-400 mr-2" />
                          <h4 className="font-semibold text-white">React Components</h4>
                        </div>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">v1.0.8</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">Pre-built React components for session timers, flavor selectors, and QR code scanners. TypeScript ready.</p>
                      <div className="flex items-center gap-2">
                        <a 
                          href="https://github.com/hookahplus/react-components" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          GitHub Repository
                        </a>
                        <span className="text-zinc-500">•</span>
                        <a 
                          href="https://www.npmjs.com/package/@hookahplus/react" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          npm install
                        </a>
                      </div>
                      <div className="mt-3 bg-zinc-950 border border-zinc-700 rounded p-2">
                        <code className="text-xs text-green-400">npm install @hookahplus/react</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Compliance */}
                <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-primary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">Security & Compliance</h3>
                  </div>
                  <p className="text-sm text-zinc-300 mb-4">
                    Hookah+ is built with security and compliance as core principles. Learn about our security measures, data protection, and compliance certifications.
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="/privacy" 
                      className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors group"
                    >
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-green-400 mr-3" />
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Security Overview</h4>
                          <p className="text-xs text-zinc-400">Trust-Lock encryption, TLS 1.3, secure API keys</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-primary-400 transition-colors" />
                    </a>

                    <a 
                      href="/privacy" 
                      className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors group"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Privacy Policy</h4>
                          <p className="text-xs text-zinc-400">How we collect, use, and protect your data</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-primary-400 transition-colors" />
                    </a>

                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <h4 className="font-semibold text-white">SOC 2 Type II Compliance</h4>
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">
                        Hookah+ maintains SOC 2 Type II certification, ensuring enterprise-grade security controls for availability, confidentiality, and processing integrity.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>• PCI-DSS Level 1 compliant</span>
                        <span>• GDPR ready</span>
                        <span>• HIPAA compatible</span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lock className="w-5 h-5 text-teal-400 mr-3" />
                        <h4 className="font-semibold text-white">Trust-Lock Security (TLH-v1)</h4>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Our proprietary Trust-Lock encryption ensures all session data, customer information, and payment details are encrypted at rest and in transit. SessionNotes are stored separately with zero-knowledge architecture.
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Database className="w-5 h-5 text-purple-400 mr-3" />
                        <h4 className="font-semibold text-white">Data Residency & Backup</h4>
                      </div>
                      <p className="text-xs text-zinc-400">
                        All data is stored in secure, geographically distributed data centers with automated daily backups. 99.9% uptime SLA with disaster recovery protocols.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-12">
              <NewsletterSignup
                variant="inline"
                title="Get Weekly Tips & Updates"
                description="Stay updated with the latest Hookah+ features, best practices, and industry insights delivered to your inbox."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDocsPage;

