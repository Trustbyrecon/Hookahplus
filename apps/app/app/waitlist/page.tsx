"use client";

import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Bell,
  UserCheck,
  Timer,
  Star,
  ChevronDown,
  ChevronRight,
  BarChart3,
  DollarSign,
  Gift,
  Target,
  Crown
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';

interface WaitlistEntry {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  partySize: number;
  estimatedWait: number; // minutes
  status: 'waiting' | 'seated' | 'cancelled' | 'no_show';
  priority: 'normal' | 'vip' | 'urgent';
  specialRequests?: string;
  addedAt: Date;
  estimatedSeating?: Date;
  tablePreference?: string;
  notes?: string;
}

export default function WaitlistPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('waiting');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([
    {
      id: 'entry_1',
      customerName: 'Sarah Johnson',
      phone: '+1-555-0123',
      email: 'sarah.j@email.com',
      partySize: 4,
      estimatedWait: 25,
      status: 'waiting',
      priority: 'normal',
      specialRequests: 'Booth preferred',
      addedAt: new Date(Date.now() - 15 * 60 * 1000),
      estimatedSeating: new Date(Date.now() + 10 * 60 * 1000),
      tablePreference: 'Booth',
      notes: 'Regular customer'
    },
    {
      id: 'entry_2',
      customerName: 'Mike Chen',
      phone: '+1-555-0456',
      partySize: 2,
      estimatedWait: 15,
      status: 'waiting',
      priority: 'vip',
      addedAt: new Date(Date.now() - 5 * 60 * 1000),
      estimatedSeating: new Date(Date.now() + 10 * 60 * 1000),
      tablePreference: 'Window',
      notes: 'VIP member'
    },
    {
      id: 'entry_3',
      customerName: 'Alex Rodriguez',
      phone: '+1-555-0789',
      partySize: 6,
      estimatedWait: 45,
      status: 'waiting',
      priority: 'normal',
      specialRequests: 'Large table needed',
      addedAt: new Date(Date.now() - 30 * 60 * 1000),
      estimatedSeating: new Date(Date.now() + 15 * 60 * 1000),
      tablePreference: 'Large Table',
      notes: 'Birthday party'
    },
    {
      id: 'entry_4',
      customerName: 'Emma Wilson',
      phone: '+1-555-0321',
      partySize: 3,
      estimatedWait: 0,
      status: 'seated',
      priority: 'normal',
      addedAt: new Date(Date.now() - 60 * 60 * 1000),
      notes: 'Seated at Table 12'
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    customerName: '',
    phone: '',
    email: '',
    partySize: 2,
    priority: 'normal' as WaitlistEntry['priority'],
    specialRequests: '',
    tablePreference: '',
    notes: ''
  });

  const tabs = [
    { id: 'onboarding', label: 'Onboarding Queue', icon: <Clock className="w-4 h-4" /> },
    { id: 'referrals', label: 'Referral Program', icon: <Star className="w-4 h-4" /> },
    { id: 'partners', label: 'Connector Partners', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const priorityColors = {
    normal: 'bg-blue-500/20 text-blue-400',
    vip: 'bg-yellow-500/20 text-yellow-400',
    urgent: 'bg-red-500/20 text-red-400'
  };

  const statusColors = {
    waiting: 'bg-orange-500/20 text-orange-400',
    seated: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
    no_show: 'bg-red-500/20 text-red-400'
  };

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = entry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.phone.includes(searchQuery) ||
                         (entry.email && entry.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || entry.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddEntry = () => {
    if (!newEntry.customerName.trim() || !newEntry.phone.trim()) return;

    const entry: WaitlistEntry = {
      id: `entry_${Date.now()}`,
      customerName: newEntry.customerName,
      phone: newEntry.phone,
      email: newEntry.email || undefined,
      partySize: newEntry.partySize,
      estimatedWait: Math.floor(Math.random() * 60) + 10, // Random wait time 10-70 minutes
      status: 'waiting',
      priority: newEntry.priority,
      specialRequests: newEntry.specialRequests || undefined,
      addedAt: new Date(),
      estimatedSeating: new Date(Date.now() + (Math.floor(Math.random() * 60) + 10) * 60 * 1000),
      tablePreference: newEntry.tablePreference || undefined,
      notes: newEntry.notes || undefined
    };

    setWaitlistEntries(prev => [entry, ...prev]);
    setNewEntry({
      customerName: '',
      phone: '',
      email: '',
      partySize: 2,
      priority: 'normal',
      specialRequests: '',
      tablePreference: '',
      notes: ''
    });
    setShowAddEntry(false);
  };

  const handleStatusChange = (entryId: string, newStatus: WaitlistEntry['status']) => {
    setWaitlistEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, status: newStatus } : entry
    ));
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes === 0) return 'Ready';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderQueue = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="waiting">Waiting</option>
            <option value="seated">Seated</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
            <option value="all">All Status</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Priority</option>
            <option value="normal">Normal</option>
            <option value="vip">VIP</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <Button onClick={() => setShowAddEntry(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add to Waitlist</span>
        </Button>
      </div>

      {/* Waitlist Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry, index) => (
          <Card key={entry.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-zinc-400 w-8">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{entry.customerName}</h3>
                    <Badge className={priorityColors[entry.priority]}>
                      {entry.priority.toUpperCase()}
                    </Badge>
                    <Badge className={statusColors[entry.status]}>
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{entry.partySize} people</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{entry.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4" />
                      <span className={entry.estimatedWait === 0 ? 'text-green-400' : 'text-orange-400'}>
                        {formatWaitTime(entry.estimatedWait)}
                      </span>
                    </div>
                  </div>

                  {entry.specialRequests && (
                    <div className="mt-2 text-sm text-zinc-300">
                      <strong>Requests:</strong> {entry.specialRequests}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="mt-1 text-sm text-zinc-400">
                      <strong>Notes:</strong> {entry.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {entry.status === 'waiting' && (
                  <>
                    <Button size="sm" onClick={() => handleStatusChange(entry.id, 'seated')}>
                      <CheckCircle className="w-4 h-4" />
                      Seat
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(entry.id, 'cancelled')}>
                      Cancel
                    </Button>
                  </>
                )}
                {entry.status === 'seated' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(entry.id, 'waiting')}>
                    <Clock className="w-4 h-4" />
                    Back to Queue
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSeated = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Currently Seated</p>
              <p className="text-2xl font-bold text-white">
                {waitlistEntries.filter(e => e.status === 'seated').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Waiting</p>
              <p className="text-2xl font-bold text-white">
                {waitlistEntries.filter(e => e.status === 'waiting').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. Wait Time</p>
              <p className="text-2xl font-bold text-white">
                {waitlistEntries.filter(e => e.status === 'waiting').length > 0 
                  ? Math.round(waitlistEntries.filter(e => e.status === 'waiting').reduce((sum, e) => sum + e.estimatedWait, 0) / waitlistEntries.filter(e => e.status === 'waiting').length)
                  : 0}m
              </p>
            </div>
            <Timer className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Currently Seated Customers</h3>
        <div className="space-y-4">
          {waitlistEntries.filter(e => e.status === 'seated').map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{entry.customerName}</h4>
                  <p className="text-sm text-zinc-400">{entry.partySize} people • {entry.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={priorityColors[entry.priority]}>
                  {entry.priority.toUpperCase()}
                </Badge>
                <span className="text-sm text-zinc-400">
                  Seated {Math.floor((Date.now() - entry.addedAt.getTime()) / (1000 * 60))}m ago
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderReferrals = () => (
    <div className="space-y-6">
      {/* Referral Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Referrers</p>
              <p className="text-2xl font-bold text-white">47</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Referrals</p>
              <p className="text-2xl font-bold text-white">234</p>
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Revenue Generated</p>
              <p className="text-2xl font-bold text-white">$12,450</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Referral Program Benefits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hookah+ Connector Partnership Program</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white">Flat Payout Structure</h4>
                <p className="text-sm text-zinc-400">$500 flat payout after 90 days for every lounge you bring to Hookah+</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white">Early Access</h4>
                <p className="text-sm text-zinc-400">Early access to new add-ons like AI Flavors & Loyalty</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Crown className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white">Spotlight</h4>
                <p className="text-sm text-zinc-400">Features on our platforms + access for you and your friends</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Gift className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white">Community Badge</h4>
                <p className="text-sm text-zinc-400">Earn and display the Hookah+ Community Connector profile badge</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-2">Apply Now</h4>
              <p className="text-sm text-zinc-400 mb-4">Join the movement. Shape the culture.</p>
              <Button 
                className="w-full"
                onClick={() => window.open('https://forms.hookahplus.net/become-connector', '_blank')}
              >
                <Star className="w-4 h-4 mr-2" />
                Become a Connector
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPartners = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Connector Partners</h3>
        <div className="space-y-4">
          {[
            { name: 'Alex Rodriguez', city: 'Miami, FL', referrals: 12, revenue: 2450, status: 'active', tier: 'Gold' },
            { name: 'Sarah Chen', city: 'Los Angeles, CA', referrals: 8, revenue: 1890, status: 'active', tier: 'Silver' },
            { name: 'Mike Johnson', city: 'Phoenix, AZ', referrals: 15, revenue: 3200, status: 'active', tier: 'Platinum' },
            { name: 'Emma Wilson', city: 'Chicago, IL', referrals: 5, revenue: 1200, status: 'pending', tier: 'Bronze' }
          ].map((partner, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{partner.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{partner.name}</h4>
                  <p className="text-sm text-zinc-400">{partner.city} • {partner.referrals} referrals</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={
                  partner.tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                  partner.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  partner.tier === 'Silver' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-orange-500/20 text-orange-400'
                }>
                  {partner.tier}
                </Badge>
                <div className="text-right">
                  <p className="text-white font-semibold">${partner.revenue.toLocaleString()}</p>
                  <p className="text-sm text-zinc-400">Revenue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'onboarding': return renderQueue();
      case 'referrals': return renderReferrals();
      case 'partners': return renderPartners();
      case 'analytics': return <div className="text-center py-12 text-zinc-400">Onboarding Analytics Coming Soon</div>;
      default: return renderQueue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Lounge Onboarding
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage new lounge customer intake, referral program, and onboarding flow
          </p>
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

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Add to Waitlist</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={newEntry.customerName}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={newEntry.phone}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+1-555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEntry.email}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="customer@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Party Size</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newEntry.partySize}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                    <select
                      value={newEntry.priority}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, priority: e.target.value as WaitlistEntry['priority'] }))}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="vip">VIP</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Special Requests</label>
                  <textarea
                    value={newEntry.specialRequests}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, specialRequests: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Any special requests or preferences"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
                  <textarea
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={handleAddEntry} className="flex-1">
                  Add to Waitlist
                </Button>
                <Button variant="outline" onClick={() => setShowAddEntry(false)} className="flex-1">
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
