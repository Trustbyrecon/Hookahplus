"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WaitlistEntry {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: 'hookah_lounge' | 'restaurant' | 'bar' | 'cafe' | 'other';
  location: string;
  currentSystem: string;
  painPoints: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'contacted' | 'demo_scheduled' | 'onboarding' | 'active';
  estimatedWaitTime: number; // days
  joinedDate: string;
  lastContact: string | null;
  notes: string;
}

export default function POSWaitlist() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'waitlist' | 'priority' | 'outreach'>('overview');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Generate demo waitlist data
  useEffect(() => {
    const demoWaitlist: WaitlistEntry[] = [
      {
        id: 'entry-1',
        businessName: 'Cloud Nine Hookah Lounge',
        ownerName: 'Alex Rodriguez',
        email: 'alex@cloudnine.com',
        phone: '+1-555-0123',
        businessType: 'hookah_lounge',
        location: 'Miami, FL',
        currentSystem: 'Square POS',
        painPoints: ['Slow order processing', 'No inventory management', 'Poor customer tracking'],
        priority: 'high',
        status: 'waiting',
        estimatedWaitTime: 7,
        joinedDate: '2024-05-20',
        lastContact: null,
        notes: 'High volume location, urgent need for better system'
      },
      {
        id: 'entry-2',
        businessName: 'Mystic Shisha Bar',
        ownerName: 'Sarah Chen',
        email: 'sarah@mysticshisha.com',
        phone: '+1-555-0456',
        businessType: 'hookah_lounge',
        location: 'Los Angeles, CA',
        currentSystem: 'Clover',
        painPoints: ['Expensive fees', 'Limited customization', 'Poor reporting'],
        priority: 'medium',
        status: 'contacted',
        estimatedWaitTime: 14,
        joinedDate: '2024-05-15',
        lastContact: '2024-06-01',
        notes: 'Interested in demo, flexible on timing'
      },
      {
        id: 'entry-3',
        businessName: 'Golden Sands Restaurant',
        ownerName: 'Mike Johnson',
        email: 'mike@goldensands.com',
        phone: '+1-555-0789',
        businessType: 'restaurant',
        location: 'Phoenix, AZ',
        currentSystem: 'Toast',
        painPoints: ['Complex interface', 'High training costs', 'Poor integration'],
        priority: 'low',
        status: 'demo_scheduled',
        estimatedWaitTime: 21,
        joinedDate: '2024-05-10',
        lastContact: '2024-06-03',
        notes: 'Demo scheduled for next week, very interested'
      }
    ];

    setWaitlist(demoWaitlist);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400';
      case 'contacted': return 'text-blue-400';
      case 'demo_scheduled': return 'text-purple-400';
      case 'onboarding': return 'text-orange-400';
      case 'active': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'hookah_lounge': return '🍃';
      case 'restaurant': return '🍽️';
      case 'bar': return '🍺';
      case 'cafe': return '☕';
      default: return '🏢';
    }
  };

  const addNewEntry = () => {
    const newEntry: WaitlistEntry = {
      id: `entry-${Date.now()}`,
      businessName: `Business ${waitlist.length + 1}`,
      ownerName: `Owner ${waitlist.length + 1}`,
      email: `owner${waitlist.length + 1}@business.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      businessType: 'hookah_lounge',
      location: 'City, State',
      currentSystem: 'Current POS',
      painPoints: ['Pain point 1'],
      priority: 'medium',
      status: 'waiting',
      estimatedWaitTime: 14,
      joinedDate: new Date().toISOString().split('T')[0],
      lastContact: null,
      notes: 'New waitlist entry'
    };

    setWaitlist(prev => [newEntry, ...prev]);
    setIsAddingEntry(false);
  };

  const updateEntryStatus = (entryId: string, newStatus: WaitlistEntry['status']) => {
    setWaitlist(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: newStatus, lastContact: new Date().toISOString().split('T')[0] }
        : entry
    ));
  };

  const filteredWaitlist = waitlist.filter(entry => {
    const matchesSearch = entry.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || entry.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const highPriorityCount = waitlist.filter(e => e.priority === 'high').length;
  const totalWaiting = waitlist.filter(e => e.status === 'waiting').length;
  const averageWaitTime = Math.round(waitlist.reduce((sum, e) => sum + e.estimatedWaitTime, 0) / waitlist.length);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-teal-300 mb-2">📋 POS Waitlist</h1>
          <p className="text-zinc-400">Manage the waitlist for Hookah+ POS system access</p>
          <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
            <p className="text-purple-300 text-sm">
              <strong>Business-to-Business:</strong> Track lounge owners and businesses waiting to get access to the Hookah+ POS system.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-white">{waitlist.length}</div>
            <div className="text-sm text-zinc-400">Total Entries</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🚨</div>
            <div className="text-2xl font-bold text-white">{highPriorityCount}</div>
            <div className="text-sm text-zinc-400">High Priority</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-white">{totalWaiting}</div>
            <div className="text-sm text-zinc-400">Waiting</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-white">{averageWaitTime} days</div>
            <div className="text-sm text-zinc-400">Avg Wait Time</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setIsAddingEntry(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              ➕ Add Entry
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              📧 Bulk Outreach
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/start-preorders"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
            >
              🚀 Start Preorders
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by business name, owner, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview', count: waitlist.length },
            { id: 'waitlist', label: '📋 Waitlist', count: filteredWaitlist.length },
            { id: 'priority', label: '🚨 Priority', count: highPriorityCount },
            { id: 'outreach', label: '📧 Outreach', count: waitlist.filter(e => e.status === 'waiting').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Waitlist Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🍃</div>
                  <div className="text-2xl font-bold text-green-400">
                    {waitlist.filter(e => e.businessType === 'hookah_lounge').length}
                  </div>
                  <div className="text-zinc-400">Hookah Lounges</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🍽️</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {waitlist.filter(e => e.businessType === 'restaurant').length}
                  </div>
                  <div className="text-zinc-400">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {waitlist.filter(e => e.status === 'waiting').length}
                  </div>
                  <div className="text-zinc-400">Waiting</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Additions</h3>
              <div className="space-y-3">
                {waitlist.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getBusinessTypeIcon(entry.businessType)}</div>
                      <div>
                        <div className="font-medium text-white">{entry.businessName}</div>
                        <div className="text-sm text-zinc-400">{entry.ownerName} • {entry.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPriorityColor(entry.priority)}`}>
                        {entry.priority.toUpperCase()}
                      </div>
                      <div className="text-xs text-zinc-500">{entry.joinedDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="space-y-6">
            {filteredWaitlist.map((entry) => (
              <div key={entry.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getBusinessTypeIcon(entry.businessType)}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-300">{entry.businessName}</h3>
                      <p className="text-zinc-400">{entry.ownerName} • {entry.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getPriorityColor(entry.priority)}`}>
                      {entry.priority.toUpperCase()}
                    </div>
                    <div className={`text-sm ${getStatusColor(entry.status)}`}>
                      {entry.status.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Contact:</span>
                    <div className="text-zinc-300 font-medium">{entry.email}</div>
                    <div className="text-zinc-300 font-medium">{entry.phone}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Current System:</span>
                    <div className="text-zinc-300 font-medium">{entry.currentSystem}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Pain Points:</span>
                    <div className="text-zinc-300 font-medium">
                      {entry.painPoints.slice(0, 2).join(', ')}
                      {entry.painPoints.length > 2 && ` +${entry.painPoints.length - 2} more`}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Wait Time:</span>
                    <div className="text-zinc-300 font-medium">{entry.estimatedWaitTime} days</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {entry.status === 'waiting' && (
                    <button
                      onClick={() => updateEntryStatus(entry.id, 'contacted')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      📧 Mark Contacted
                    </button>
                  )}
                  {entry.status === 'contacted' && (
                    <button
                      onClick={() => updateEntryStatus(entry.id, 'demo_scheduled')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      📅 Schedule Demo
                    </button>
                  )}
                  {entry.status === 'demo_scheduled' && (
                    <button
                      onClick={() => updateEntryStatus(entry.id, 'onboarding')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🚀 Start Onboarding
                    </button>
                  )}
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Priority Tab */}
        {activeTab === 'priority' && (
          <div className="space-y-6">
            {waitlist.filter(e => e.priority === 'high').map((entry) => (
              <div key={entry.id} className="bg-zinc-900 rounded-xl border border-red-500/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">🚨</div>
                    <div>
                      <h3 className="text-xl font-semibold text-red-300">{entry.businessName}</h3>
                      <p className="text-zinc-400">{entry.ownerName} • {entry.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-400">HIGH PRIORITY</div>
                    <div className="text-sm text-zinc-400">{entry.estimatedWaitTime} days wait</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Contact:</span>
                    <div className="text-zinc-300 font-medium">{entry.email}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Pain Points:</span>
                    <div className="text-zinc-300 font-medium">
                      {entry.painPoints.join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Notes:</span>
                    <div className="text-zinc-300 font-medium">{entry.notes}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    🚨 Immediate Contact
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    📧 Send Priority Email
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    📅 Schedule Priority Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Outreach Tab */}
        {activeTab === 'outreach' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Outreach Campaigns</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📧</div>
                  <div className="text-white font-medium">Welcome Email</div>
                  <div className="text-sm text-zinc-400">Send to new waitlist entries</div>
                  <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Send to {waitlist.filter(e => e.status === 'waiting').length} entries
                  </button>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-white font-medium">Demo Invitation</div>
                  <div className="text-sm text-zinc-400">Invite to product demo</div>
                  <button className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Send to {waitlist.filter(e => e.status === 'contacted').length} entries
                  </button>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-white font-medium">Early Access</div>
                  <div className="text-sm text-zinc-400">Priority onboarding</div>
                  <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Send to {highPriorityCount} entries
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Outreach</h3>
              <div className="space-y-3">
                {waitlist.filter(e => e.lastContact).slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getBusinessTypeIcon(entry.businessType)}</div>
                      <div>
                        <div className="font-medium text-white">{entry.businessName}</div>
                        <div className="text-sm text-zinc-400">{entry.ownerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Last Contact:</div>
                      <div className="text-zinc-300 font-medium">{entry.lastContact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {isAddingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-teal-300 mb-4">Add Waitlist Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Owner Name</label>
                <input
                  type="text"
                  placeholder="Owner Name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="owner@business.com"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="+1-555-0123"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Business Type</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                  <option value="hookah_lounge">Hookah Lounge</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="bar">Bar</option>
                  <option value="cafe">Cafe</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Priority</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddingEntry(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addNewEntry}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
