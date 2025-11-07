'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalNavigation from '../../../components/GlobalNavigation';
import Breadcrumbs from '../../../components/Breadcrumbs';
import PageHero from '../../../components/PageHero';
import { 
  FileText, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  Activity,
  Shield,
  Flame,
  TrendingUp,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import Button from '../../../components/Button';

interface GhostLogEntry {
  timestamp: string;
  kind: string;
  data: any;
}

export default function GhostLogPage() {
  const [entries, setEntries] = useState<GhostLogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<GhostLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    loadGhostLog();
    const interval = setInterval(loadGhostLog, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, kindFilter, dateFilter]);

  const loadGhostLog = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ghost-log');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.entries) {
          setEntries(data.entries);
        }
      }
    } catch (error) {
      console.error('[GhostLog] Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Filter by kind
    if (kindFilter !== 'all') {
      filtered = filtered.filter(entry => entry.kind === kindFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.kind.toLowerCase().includes(term) ||
        JSON.stringify(entry.data).toLowerCase().includes(term)
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        return entryDate === dateFilter;
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setFilteredEntries(filtered);
  };

  const getKindIcon = (kind: string) => {
    if (kind.includes('session')) return <Flame className="w-4 h-4 text-orange-400" />;
    if (kind.includes('payment') || kind.includes('stripe')) return <Shield className="w-4 h-4 text-green-400" />;
    if (kind.includes('reflex') || kind.includes('trust')) return <TrendingUp className="w-4 h-4 text-blue-400" />;
    return <Activity className="w-4 h-4 text-zinc-400" />;
  };

  const getKindColor = (kind: string) => {
    if (kind.includes('session')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (kind.includes('payment') || kind.includes('stripe')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (kind.includes('reflex') || kind.includes('trust')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  };

  const uniqueKinds = Array.from(new Set(entries.map(e => e.kind)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />
        
        <PageHero
          headline="Ghost Log Viewer"
          subheadline="System event log for debugging, monitoring, and audit trails. Track all system events and their impact."
          benefit={{
            value: `${entries.length} Total Entries`,
            description: `${filteredEntries.length} entries match current filters`,
            icon: <FileText className="w-5 h-5 text-teal-400" />
          }}
          primaryCTA={{
            text: 'Refresh Log',
            onClick: loadGhostLog
          }}
          trustIndicators={[
            { icon: <Clock className="w-4 h-4" />, text: 'Real-time updates' },
            { icon: <Activity className="w-4 h-4" />, text: `${uniqueKinds.length} event types` }
          ]}
        />

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Event Types</option>
              {uniqueKinds.map(kind => (
                <option key={kind} value={kind}>{kind}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            />
            <Button
              onClick={() => {
                setSearchTerm('');
                setKindFilter('all');
                setDateFilter('');
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading Ghost Log entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-700 rounded-lg">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No entries found matching your filters</p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getKindIcon(entry.kind)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getKindColor(entry.kind)}`}>
                          {entry.kind}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-zinc-950/50 rounded p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
                  <pre>{JSON.stringify(entry.data, null, 2)}</pre>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Related Features */}
        <div className="mt-16 border-t border-zinc-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Related Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="font-medium text-white">Admin Control Center</span>
              </div>
              <p className="text-sm text-zinc-400">System administration and management</p>
            </Link>
            <Link
              href="/operator"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-white">Operator Dashboard</span>
              </div>
              <p className="text-sm text-zinc-400">System metrics and trust score</p>
            </Link>
            <Link
              href="/analytics"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Analytics</span>
              </div>
              <p className="text-sm text-zinc-400">View detailed analytics and reports</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

