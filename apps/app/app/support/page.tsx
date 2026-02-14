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
  Filter,
  Send,
  FileText,
  Video,
  BookOpen,
  Users,
  Settings
} from 'lucide-react';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';

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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'getting_started' | 'billing' | 'technical' | 'features';
  helpful: number;
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const [faqs] = useState<FAQ[]>([
    {
      id: 'faq_1',
      question: 'How do I start a new hookah session?',
      answer: 'Navigate to the Fire Session Dashboard, click "Create New Session", fill in the customer details, and click "Start Session". The session will begin in the BOH workflow.',
      category: 'getting_started',
      helpful: 12
    },
    {
      id: 'faq_2',
      question: 'Why is my payment not processing?',
      answer: 'Check your Stripe configuration in Settings > Payment. Ensure your API keys are correct and your account is active. For test mode, use test card numbers.',
      category: 'technical',
      helpful: 8
    },
    {
      id: 'faq_3',
      question: 'How do I assign staff to sessions?',
      answer: 'In the Fire Session Dashboard, click on a session card, then use the "Assign Staff" button to assign BOH or FOH staff members to the session.',
      category: 'features',
      helpful: 15
    },
    {
      id: 'faq_4',
      question: 'Can I customize the session workflow?',
      answer: 'Yes, you can customize the BOH/FOH workflow in Settings > Workflow. You can add custom states, transitions, and role permissions.',
      category: 'features',
      helpful: 6
    },
    {
      id: 'faq_5',
      question: 'How do I handle customer complaints?',
      answer: 'Use the Flag Manager in the session card to create a flag, then add resolution notes. You can escalate to management or offer customer compensation.',
      category: 'features',
      helpful: 9
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as SupportTicket['priority'],
    category: 'general' as SupportTicket['category']
  });

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
      updatedAt: new Date(),
      assignedTo: 'Support Team'
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general'
    });
    setShowNewTicket(false);
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-500/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'closed': return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'urgent': return 'text-red-400 bg-red-500/20';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Support Center</h1>
              <p className="text-zinc-400">Get help with HookahPLUS and manage your support tickets</p>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">Live Chat</div>
                  <div className="text-sm text-zinc-400">Available 24/7</div>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-zinc-400">(555) 123-4567</div>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-zinc-400">support@hookahplus.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-zinc-800 rounded-lg p-1">
            {[
              { id: 'tickets', label: 'My Tickets', icon: FileText },
              { id: 'faq', label: 'FAQ', icon: BookOpen },
              { id: 'contact', label: 'Contact', icon: MessageCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tickets, FAQ, or ask a question..."
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
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="feature_request">Feature Request</option>
              <option value="bug_report">Bug Report</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Support Tickets</h2>
              <Button
                onClick={() => setShowNewTicket(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{ticket.title}</h3>
                      <p className="text-sm text-zinc-400 mb-2">{ticket.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500">
                        <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                        <span>Updated: {ticket.updatedAt.toLocaleTimeString()}</span>
                        {ticket.assignedTo && <span>Assigned to: {ticket.assignedTo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-medium text-white mb-2">{faq.question}</h3>
                  <p className="text-sm text-zinc-400 mb-3">{faq.answer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {faq.helpful} people found this helpful
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="text-zinc-400 border-zinc-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Send us a message</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white"
                      placeholder="What can we help you with?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white h-32 resize-none"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <h3 className="text-lg font-semibold mb-4">Other ways to reach us</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-zinc-400">(555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-zinc-400">support@hookahplus.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-zinc-400">Available 24/7</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium">Response Time</div>
                      <div className="text-sm text-zinc-400">Usually within 2 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Support Ticket</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTicket(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-24 resize-none"
                  placeholder="Detailed description of your issue or question"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as SupportTicket['priority'] }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as SupportTicket['category'] }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="bug_report">Bug Report</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewTicket(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={!newTicket.title.trim() || !newTicket.description.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
