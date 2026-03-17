"use client";

import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Send,
  FileText,
  BookOpen,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Edit,
  Shield,
  BarChart3
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'features' | 'staff';
  helpful: number;
  notHelpful: number;
  tags: string[];
  lastUpdated: Date;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 'faq_1',
      question: 'How do I create a new session?',
      answer: 'To create a new session, go to the Fire Session Dashboard and click the "Create New Session" button. Fill in the required details including table ID, customer information, and session duration.',
      category: 'features',
      helpful: 24,
      notHelpful: 2,
      tags: ['sessions', 'dashboard', 'getting-started'],
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'faq_2',
      question: 'How do I process payments?',
      answer: 'Payments are processed automatically through Stripe integration. When a session is completed, the payment intent is automatically captured. You can also manually process payments from the session details.',
      category: 'technical',
      helpful: 18,
      notHelpful: 1,
      tags: ['payments', 'stripe', 'billing'],
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'faq_3',
      question: 'Can I customize the timer duration?',
      answer: 'Yes! When creating a session, you can set a custom timer duration from 30 minutes to 2 hours. The timer will automatically notify staff when the session is approaching completion.',
      category: 'features',
      helpful: 31,
      notHelpful: 0,
      tags: ['timer', 'sessions', 'customization'],
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'faq_4',
      question: 'How do I manage staff roles?',
      answer: 'Staff roles can be managed from the Staff Panel. You can assign BOH, FOH, Manager, or Admin roles to different staff members with appropriate permissions.',
      category: 'general',
      helpful: 15,
      notHelpful: 3,
      tags: ['staff', 'roles', 'management'],
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'faq_5',
      question: 'What if I encounter a technical issue?',
      answer: 'If you encounter any technical issues, please submit a support ticket through this help center. Our technical team will respond within 24 hours during business days.',
      category: 'technical',
      helpful: 22,
      notHelpful: 1,
      tags: ['support', 'technical', 'troubleshooting'],
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'faq_6',
      question: 'How do I use Scan-to-act?',
      answer: 'Scan-to-act lets you jump straight into a session cockpit from a table QR code, receipt, or table tent. Enter or paste the session ID in the Scan-to-act input (on the Staff Panel or Fire Session Dashboard) and click "Open cockpit". Best for timer changes, delivery updates, and quick notes.',
      category: 'staff',
      helpful: 0,
      notHelpful: 0,
      tags: ['staff', 'scan-to-act', 'session', 'floor'],
      lastUpdated: new Date()
    },
    {
      id: 'faq_7',
      question: 'How do I manage my schedule?',
      answer: 'Go to the Staff Panel and open the Schedule tab. There you can view your shifts, request time off, and see upcoming assignments. Managers can create and edit shifts from the same panel.',
      category: 'staff',
      helpful: 0,
      notHelpful: 0,
      tags: ['staff', 'schedule', 'shifts'],
      lastUpdated: new Date()
    },
    {
      id: 'faq_8',
      question: 'Where do I view my performance?',
      answer: 'Your performance metrics are available in the Staff Panel under the Performance tab. You can see sessions completed, ratings, on-time delivery, and other key metrics. Managers have access to team-wide analytics.',
      category: 'staff',
      helpful: 0,
      notHelpful: 0,
      tags: ['staff', 'performance', 'analytics'],
      lastUpdated: new Date()
    }
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'ticket_1',
      title: 'Payment processing issue',
      description: 'Stripe payment is not working for table T-002',
      status: 'open',
      priority: 'high',
      category: 'technical',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      assignedTo: 'Support Team'
    },
    {
      id: 'ticket_2',
      title: 'Session not starting',
      description: 'Fire session dashboard shows session as ready but not starting',
      status: 'in_progress',
      priority: 'medium',
      category: 'bug_report',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      assignedTo: 'Technical Team'
    },
    {
      id: 'ticket_3',
      title: 'Feature request: Bulk operations',
      description: 'Would like to be able to manage multiple sessions at once',
      status: 'resolved',
      priority: 'low',
      category: 'feature_request',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      assignedTo: 'Product Team'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority']
  });

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'tickets', label: 'Support Tickets', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact Us', icon: <Phone className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'features', label: 'Features' },
    { value: 'staff', label: 'Staff' }
  ];

  const statusColors = {
    open: 'bg-orange-500/20 text-orange-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-gray-500/20 text-gray-400'
  };

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQHelpful = (faqId: string, isHelpful: boolean) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId 
        ? { 
            ...faq, 
            helpful: isHelpful ? faq.helpful + 1 : faq.helpful,
            notHelpful: !isHelpful ? faq.notHelpful + 1 : faq.notHelpful
          }
        : faq
    ));
  };

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;

    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority,
      category: newTicket.category,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    });
    setShowNewTicket(false);
  };

  const renderFAQ = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.map(faq => (
          <Card key={faq.id} className="p-6">
            <div 
              className="cursor-pointer"
              onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white hover:text-teal-400 transition-colors">
                  {faq.question}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-zinc-700 text-zinc-300">
                    {faq.category}
                  </Badge>
                  {expandedFAQ === faq.id ? 
                    <ChevronDown className="w-5 h-5 text-zinc-400" /> : 
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  }
                </div>
              </div>
              
              {expandedFAQ === faq.id && (
                <div className="mt-4 space-y-4">
                  <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFAQHelpful(faq.id, true);
                          }}
                          className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{faq.helpful}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFAQHelpful(faq.id, false);
                          }}
                          className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">{faq.notHelpful}</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {faq.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <span className="text-sm text-zinc-500">
                      Updated {faq.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
          <p className="text-zinc-400">Manage your support requests and track their status</p>
        </div>
        <Button onClick={() => setShowNewTicket(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No support tickets yet</p>
            <p className="text-sm text-zinc-500 mt-1">Create a ticket above when you need assistance</p>
          </Card>
        ) : (
        filteredTickets.map(ticket => (
          <Card key={ticket.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-zinc-300 mb-3">{ticket.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-zinc-400">
                  <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                  <span>Updated: {ticket.updatedAt.toLocaleDateString()}</span>
                  {ticket.assignedTo && <span>Assigned to: {ticket.assignedTo}</span>}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
        )}
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Phone className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
          <p className="text-zinc-400 mb-4">Call us for immediate assistance</p>
          <p className="text-white font-medium">+1 (555) 123-4567</p>
          <p className="text-sm text-zinc-500 mt-1">Mon-Fri 9AM-6PM EST</p>
        </Card>

        <Card className="p-6 text-center">
          <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
          <p className="text-zinc-400 mb-4">Send us an email anytime</p>
          <p className="text-white font-medium">support@hookahplus.com</p>
          <p className="text-sm text-zinc-500 mt-1">Response within 24 hours</p>
        </Card>

        <Card className="p-6 text-center relative">
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">TBD</span>
          <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
          <p className="text-zinc-400 mb-4">Chat with our support team</p>
          <Button className="w-full" disabled title="Live chat coming soon">
            Start Chat
          </Button>
          <p className="text-sm text-zinc-500 mt-2">Coming soon</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Contact Form</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Subject</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Brief description of your issue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Please describe your issue in detail..."
            />
          </div>
          
          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </Card>
    </div>
  );

  const handleViewAPI = () => {
    window.open('/api/docs', '_blank');
  };

  const renderResources = () => (
    <div className="space-y-6">
      <Card className="p-12 text-center">
        <BookOpen className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Resources</h3>
        <p className="text-zinc-400 mb-6">Content coming soon. Check back for User Manual, Video Tutorials, API Docs, and Additional Resources.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/docs/user-manual" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            View User Manual
          </a>
          <button onClick={handleViewAPI} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4" />
            API Documentation
          </button>
        </div>
      </Card>

      {/* Additional Resources - Wire to Guides */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/docs/getting-started/quick-start" className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-teal-400" />
              <div>
                <h4 className="font-semibold text-white">Setup Guide</h4>
                <p className="text-sm text-zinc-400">Quick start setup instructions</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>

          <a href="/docs/security-guide" className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <div>
                <h4 className="font-semibold text-white">Security Guide</h4>
                <p className="text-sm text-zinc-400">Best practices for security</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>

          <a href="/docs/analytics-guide" className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-semibold text-white">Analytics Guide</h4>
                <p className="text-sm text-zinc-400">Understanding your data</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>

          <a href="/docs/team-management" className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="font-semibold text-white">Team Management Guide</h4>
                <p className="text-sm text-zinc-400">Managing staff and roles</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'faq': return renderFAQ();
      case 'tickets': return renderTickets();
      case 'contact': return renderContact();
      case 'resources': return renderResources();
      default: return renderFAQ();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Help Center
              </h1>
              <p className="text-xl text-zinc-400">Get help with HookahPLUS and manage your support tickets</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Create Support Ticket</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as SupportTicket['category'] }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="bug_report">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as SupportTicket['priority'] }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={4}
                    placeholder="Please describe your issue in detail..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleCreateTicket} className="flex-1">
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowNewTicket(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
