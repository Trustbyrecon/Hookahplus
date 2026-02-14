"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Star,
  Eye,
  Edit,
  Trash2,
  Send,
  Calendar as CalendarIcon,
  BarChart3,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Building,
  Utensils,
  Coffee
} from 'lucide-react';
import Button from '../../../components/Button';
import GlobalNavigation from '../../../components/GlobalNavigation';

interface WaitlistEntry {
  id: string;
  businessName: string;
  ownerName: string;
  location: string;
  email: string;
  phone: string;
  currentSystem: string;
  painPoints: string[];
  waitTime: number; // days
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'waiting' | 'contacted' | 'demo_scheduled' | 'onboarding' | 'approved';
  businessType: 'hookah_lounge' | 'restaurant' | 'bar' | 'cafe' | 'other';
  addedDate: Date;
  lastContact?: Date;
  notes?: string;
  revenue?: number;
  employees?: number;
}

export default function POSWaitlistPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showBulkOutreach, setShowBulkOutreach] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([
    {
      id: 'entry_1',
      businessName: 'Cloud Nine Hookah Lounge',
      ownerName: 'Alex Rodriguez',
      location: 'Miami, FL',
      email: 'alex@cloudnine.com',
      phone: '+1-555-0123',
      currentSystem: 'Square POS',
      painPoints: ['Slow order processing', 'No inventory management', 'High transaction fees'],
      waitTime: 7,
      priority: 'high',
      status: 'waiting',
      businessType: 'hookah_lounge',
      addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      revenue: 150000,
      employees: 8
    },
    {
      id: 'entry_2',
      businessName: 'Mystic Shisha Bar',
      ownerName: 'Sarah Chen',
      location: 'Los Angeles, CA',
      email: 'sarah@mysticshisha.com',
      phone: '+1-555-0456',
      currentSystem: 'Clover',
      painPoints: ['Expensive fees', 'Limited customization', 'Poor customer support'],
      waitTime: 14,
      priority: 'medium',
      status: 'contacted',
      businessType: 'hookah_lounge',
      addedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      revenue: 200000,
      employees: 12
    },
    {
      id: 'entry_3',
      businessName: 'Golden Sands Restaurant',
      ownerName: 'Mike Johnson',
      location: 'Phoenix, AZ',
      email: 'mike@goldensands.com',
      phone: '+1-555-0789',
      currentSystem: 'Toast',
      painPoints: ['Complex interface', 'High training costs', 'Slow updates'],
      waitTime: 21,
      priority: 'low',
      status: 'demo_scheduled',
      businessType: 'restaurant',
      addedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      revenue: 300000,
      employees: 15
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    businessName: '',
    ownerName: '',
    location: '',
    email: '',
    phone: '',
    currentSystem: '',
    painPoints: '',
    priority: 'medium' as WaitlistEntry['priority'],
    businessType: 'hookah_lounge' as WaitlistEntry['businessType'],
    notes: ''
  });

  const handleAddEntry = () => {
    if (!newEntry.businessName.trim() || !newEntry.ownerName.trim()) return;

    const entry: WaitlistEntry = {
      id: `entry_${Date.now()}`,
      businessName: newEntry.businessName,
      ownerName: newEntry.ownerName,
      location: newEntry.location,
      email: newEntry.email,
      phone: newEntry.phone,
      currentSystem: newEntry.currentSystem,
      painPoints: newEntry.painPoints.split(',').map(p => p.trim()).filter(p => p),
      waitTime: 0,
      priority: newEntry.priority,
      status: 'waiting',
      businessType: newEntry.businessType,
      addedDate: new Date(),
      notes: newEntry.notes
    };

    setWaitlistEntries(prev => [entry, ...prev]);
    setNewEntry({
      businessName: '',
      ownerName: '',
      location: '',
      email: '',
      phone: '',
      currentSystem: '',
      painPoints: '',
      priority: 'medium',
      businessType: 'hookah_lounge',
      notes: ''
    });
    setShowAddEntry(false);
  };

  const handleStatusChange = (entryId: string, newStatus: WaitlistEntry['status']) => {
    setWaitlistEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: newStatus, lastContact: new Date() }
        : entry
    ));
  };

  const getPriorityColor = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'urgent': return 'text-red-400 bg-red-500/20';
    }
  };

  const getStatusColor = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400 bg-yellow-500/20';
      case 'contacted': return 'text-blue-400 bg-blue-500/20';
      case 'demo_scheduled': return 'text-purple-400 bg-purple-500/20';
      case 'onboarding': return 'text-orange-400 bg-orange-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
    }
  };

  const getBusinessTypeIcon = (type: WaitlistEntry['businessType']) => {
    switch (type) {
      case 'hookah_lounge': return <Building2 className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'bar': return <Coffee className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = entry.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || entry.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const totalEntries = waitlistEntries.length;
  const highPriority = waitlistEntries.filter(e => e.priority === 'high' || e.priority === 'urgent').length;
  const waiting = waitlistEntries.filter(e => e.status === 'waiting').length;
  const avgWaitTime = Math.round(waitlistEntries.reduce((sum, e) => sum + e.waitTime, 0) / totalEntries);

  const businessTypeCounts = waitlistEntries.reduce((acc, entry) => {
    acc[entry.businessType] = (acc[entry.businessType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">POS Waitlist</h1>
              <p className="text-zinc-400">Track lounge owners and businesses waiting to get access to the Hookah+ POS system</p>
            </div>
          </div>

          {/* B2B Context Banner */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-purple-300">Business-to-Business</span>
            </div>
            <p className="text-sm text-purple-200 mt-1">
              Track lounge owners and businesses waiting to get access to the Hookah+ POS system with live data integration.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{totalEntries}</div>
              <div className="text-zinc-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Total Entries</div>
            <div className="text-xs text-zinc-500">Last Updated {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{highPriority}</div>
              <div className="text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">High Priority</div>
            <div className="text-xs text-zinc-500">1 urgent</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{waiting}</div>
              <div className="text-yellow-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Waiting</div>
            <div className="text-xs text-zinc-500">1 contacted</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{avgWaitTime}</div>
              <div className="text-zinc-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Avg Wait Time</div>
            <div className="text-xs text-zinc-500">days</div>
          </div>
        </div>

        {/* Action Buttons and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowAddEntry(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
            <Button
              onClick={() => setShowBulkOutreach(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Bulk Outreach
            </Button>
            <Button
              variant="outline"
              className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Preorders
            </Button>
          </div>

          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by business name, owner, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-zinc-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', count: totalEntries },
            { id: 'waitlist', label: 'Waitlist', count: waiting },
            { id: 'priority', label: 'Priority', count: highPriority },
            { id: 'outreach', label: 'Outreach', count: waitlistEntries.filter(e => e.status === 'contacted').length },
            { id: 'analytics', label: 'Analytics', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-xs bg-zinc-600 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Waitlist Distribution */}
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 mb-6">
          <h3 className="font-medium mb-4">Waitlist Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(businessTypeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center space-x-2">
                {getBusinessTypeIcon(type as WaitlistEntry['businessType'])}
                <span className="text-sm text-zinc-300">
                  {count} {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Additions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Additions</h3>
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="text-orange-400">
                    {getBusinessTypeIcon(entry.businessType)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{entry.businessName}</h4>
                    <p className="text-sm text-zinc-400">{entry.ownerName} • {entry.location}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{entry.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{entry.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.addedDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                    {entry.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {entry.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-400">Current System</label>
                  <p className="text-sm text-zinc-300">{entry.currentSystem}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Wait Time</label>
                  <p className="text-sm text-zinc-300">{entry.waitTime} days</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-zinc-400">Pain Points</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.painPoints.map((point, index) => (
                    <span key={index} className="px-2 py-1 bg-zinc-700 text-xs text-zinc-300 rounded">
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                  Added: {entry.addedDate.toLocaleDateString()}
                  {entry.lastContact && (
                    <span className="ml-4">Last Contact: {entry.lastContact.toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {entry.status === 'waiting' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(entry.id, 'contacted')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Mark Contacted
                    </Button>
                  )}
                  {entry.status === 'contacted' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(entry.id, 'demo_scheduled')}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Schedule Demo
                    </Button>
                  )}
                  {entry.status === 'demo_scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(entry.id, 'onboarding')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Start Onboarding
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Waitlist Entry</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddEntry(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    value={newEntry.businessName}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="Cloud Nine Hookah Lounge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Owner Name</label>
                  <input
                    type="text"
                    value={newEntry.ownerName}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="Alex Rodriguez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={newEntry.location}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="Miami, FL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Type</label>
                  <select
                    value={newEntry.businessType}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, businessType: e.target.value as WaitlistEntry['businessType'] }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="hookah_lounge">Hookah Lounge</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="bar">Bar</option>
                    <option value="cafe">Cafe</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={newEntry.email}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="alex@cloudnine.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newEntry.phone}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current System</label>
                <input
                  type="text"
                  value={newEntry.currentSystem}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, currentSystem: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="Square POS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pain Points (comma-separated)</label>
                <input
                  type="text"
                  value={newEntry.painPoints}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, painPoints: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="Slow order processing, High fees, Poor support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newEntry.priority}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, priority: e.target.value as WaitlistEntry['priority'] }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                  placeholder="Additional notes about this business..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddEntry(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={!newEntry.businessName.trim() || !newEntry.ownerName.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
