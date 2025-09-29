"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Video,
  Download,
  ExternalLink,
  Code,
  Settings,
  Users,
  Zap,
  Shield,
  BarChart3,
  Flame,
  ChefHat,
  UserCheck,
  HelpCircle,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: DocArticle[];
  expanded: boolean;
}

interface DocArticle {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'tutorial' | 'reference' | 'api' | 'video';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  lastUpdated: Date;
  tags: string[];
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of HookahPLUS',
      icon: <Zap className="w-5 h-5" />,
      expanded: expandedSections.has('getting-started'),
      articles: [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          description: 'Get up and running with HookahPLUS in 5 minutes',
          type: 'guide',
          difficulty: 'beginner',
          readTime: '5 min',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['setup', 'basics', 'quick-start']
        },
        {
          id: 'first-session',
          title: 'Creating Your First Session',
          description: 'Step-by-step guide to creating and managing hookah sessions',
          type: 'tutorial',
          difficulty: 'beginner',
          readTime: '10 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['sessions', 'workflow', 'tutorial']
        },
        {
          id: 'user-roles',
          title: 'Understanding User Roles',
          description: 'Learn about BOH, FOH, Manager, and Admin roles',
          type: 'guide',
          difficulty: 'beginner',
          readTime: '8 min',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['roles', 'permissions', 'workflow']
        }
      ]
    },
    {
      id: 'workflow-management',
      title: 'Workflow Management',
      description: 'BOH/FOH session workflows and state management',
      icon: <Flame className="w-5 h-5" />,
      expanded: expandedSections.has('workflow-management'),
      articles: [
        {
          id: 'boh-workflow',
          title: 'Back of House (BOH) Workflow',
          description: 'Complete guide to BOH session management',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '15 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['boh', 'workflow', 'preparation']
        },
        {
          id: 'foh-workflow',
          title: 'Front of House (FOH) Workflow',
          description: 'Customer service and delivery management',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '12 min',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['foh', 'customer-service', 'delivery']
        },
        {
          id: 'session-states',
          title: 'Session State Management',
          description: 'Understanding session states and transitions',
          type: 'reference',
          difficulty: 'intermediate',
          readTime: '10 min',
          lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: ['states', 'transitions', 'management']
        },
        {
          id: 'edge-cases',
          title: 'Handling Edge Cases',
          description: 'Managing equipment issues, customer complaints, and exceptions',
          type: 'guide',
          difficulty: 'advanced',
          readTime: '20 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['edge-cases', 'troubleshooting', 'exceptions']
        }
      ]
    },
    {
      id: 'payment-integration',
      title: 'Payment Integration',
      description: 'Stripe payment processing and financial management',
      icon: <Shield className="w-5 h-5" />,
      expanded: expandedSections.has('payment-integration'),
      articles: [
        {
          id: 'stripe-setup',
          title: 'Stripe Setup and Configuration',
          description: 'Configure Stripe for payment processing',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '25 min',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['stripe', 'payments', 'configuration']
        },
        {
          id: 'test-payments',
          title: 'Testing Payments',
          description: 'Using test mode and $1 test sessions',
          type: 'tutorial',
          difficulty: 'beginner',
          readTime: '8 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['testing', 'payments', 'test-mode']
        },
        {
          id: 'payment-webhooks',
          title: 'Payment Webhooks',
          description: 'Handling Stripe webhooks for real-time updates',
          type: 'reference',
          difficulty: 'advanced',
          readTime: '18 min',
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['webhooks', 'stripe', 'real-time']
        }
      ]
    },
    {
      id: 'staff-management',
      title: 'Staff Management',
      description: 'Managing staff, roles, and permissions',
      icon: <Users className="w-5 h-5" />,
      expanded: expandedSections.has('staff-management'),
      articles: [
        {
          id: 'staff-roles',
          title: 'Staff Roles and Permissions',
          description: 'Setting up and managing staff roles',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '12 min',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['roles', 'permissions', 'staff']
        },
        {
          id: 'staff-operations',
          title: 'Staff Operations Dashboard',
          description: 'Using the staff operations interface',
          type: 'tutorial',
          difficulty: 'beginner',
          readTime: '10 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['dashboard', 'operations', 'staff']
        },
        {
          id: 'task-management',
          title: 'Task Management',
          description: 'Creating and assigning tasks to staff',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '15 min',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['tasks', 'assignments', 'management']
        }
      ]
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      description: 'Understanding your business metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      expanded: expandedSections.has('analytics-reporting'),
      articles: [
        {
          id: 'dashboard-overview',
          title: 'Dashboard Overview',
          description: 'Understanding the main dashboard metrics',
          type: 'guide',
          difficulty: 'beginner',
          readTime: '8 min',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['dashboard', 'metrics', 'overview']
        },
        {
          id: 'revenue-tracking',
          title: 'Revenue Tracking',
          description: 'Monitoring sales and financial performance',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '12 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['revenue', 'sales', 'tracking']
        },
        {
          id: 'session-analytics',
          title: 'Session Analytics',
          description: 'Analyzing session performance and trends',
          type: 'guide',
          difficulty: 'intermediate',
          readTime: '15 min',
          lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          tags: ['analytics', 'sessions', 'performance']
        }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Technical documentation for developers',
      icon: <Code className="w-5 h-5" />,
      expanded: expandedSections.has('api-reference'),
      articles: [
        {
          id: 'api-overview',
          title: 'API Overview',
          description: 'Introduction to the HookahPLUS API',
          type: 'reference',
          difficulty: 'intermediate',
          readTime: '10 min',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['api', 'overview', 'introduction']
        },
        {
          id: 'authentication',
          title: 'Authentication',
          description: 'API authentication and security',
          type: 'reference',
          difficulty: 'intermediate',
          readTime: '12 min',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['auth', 'security', 'api']
        },
        {
          id: 'session-endpoints',
          title: 'Session Endpoints',
          description: 'API endpoints for session management',
          type: 'api',
          difficulty: 'advanced',
          readTime: '20 min',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['api', 'sessions', 'endpoints']
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getTypeIcon = (type: DocArticle['type']) => {
    switch (type) {
      case 'guide': return <FileText className="w-4 h-4" />;
      case 'tutorial': return <Play className="w-4 h-4" />;
      case 'reference': return <BookOpen className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: DocArticle['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
    }
  };

  const filteredSections = docSections.map(section => ({
    ...section,
    articles: section.articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || article.type === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  })).filter(section => section.articles.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Documentation</h1>
              <p className="text-zinc-400">Complete guide to using HookahPLUS effectively</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="guide">Guides</option>
              <option value="tutorial">Tutorials</option>
              <option value="reference">Reference</option>
              <option value="api">API</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-6">
          {filteredSections.map(section => (
            <div key={section.id} className="bg-zinc-800/50 rounded-lg border border-zinc-700">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-blue-400">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      <p className="text-sm text-zinc-400">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-zinc-500">
                      {section.articles.length} articles
                    </span>
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedSections.has(section.id) && (
                <div className="px-6 pb-6 space-y-3">
                  {section.articles.map(article => (
                    <div key={article.id} className="bg-zinc-700/50 rounded-lg p-4 hover:bg-zinc-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-zinc-400">
                            {getTypeIcon(article.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{article.title}</h3>
                            <p className="text-sm text-zinc-400">{article.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                            {article.difficulty.toUpperCase()}
                          </span>
                          <span className="text-xs text-zinc-500">{article.readTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-zinc-500">
                          <span>Updated: {article.lastUpdated.toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <span>Tags:</span>
                            {article.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1 py-0.5 bg-zinc-600 rounded text-zinc-300">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-zinc-400">+{article.tags.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="text-zinc-400 border-zinc-600">
                            <FileText className="w-3 h-3 mr-1" />
                            Read
                          </Button>
                          {article.type === 'video' && (
                            <Button size="sm" variant="outline" className="text-zinc-400 border-zinc-600">
                              <Play className="w-3 h-3 mr-1" />
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors">
              <Video className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-medium">Video Tutorials</div>
                <div className="text-sm text-zinc-400">Watch step-by-step guides</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors">
              <Download className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium">Download PDFs</div>
                <div className="text-sm text-zinc-400">Offline documentation</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-medium">API Explorer</div>
                <div className="text-sm text-zinc-400">Test API endpoints</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
