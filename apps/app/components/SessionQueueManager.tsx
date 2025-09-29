"use client";

import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  Grid,
  List,
  Zap,
  Pause,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Target,
  Timer,
  UserCheck,
  ChefHat,
  Truck
} from 'lucide-react';
import Button from './Button';

interface SessionQueueManagerProps {
  sessions: any[];
  userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onBulkAction?: (action: string, sessionIds: string[]) => void;
}

export function SessionQueueManager({ sessions, userRole, onBulkAction }: SessionQueueManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'table' | 'status'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [groupBy, setGroupBy] = useState<'status' | 'staff' | 'priority' | 'none'>('status');

  // Advanced filtering and sorting
  const processedSessions = useMemo(() => {
    let filtered = sessions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.tableId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.customerRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.flavor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus.length > 0) {
      filtered = filtered.filter(session => filterStatus.includes(session.state));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'time':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'table':
          aValue = parseInt(a.tableId.replace('T-', ''));
          bValue = parseInt(b.tableId.replace('T-', ''));
          break;
        case 'status':
          const statusOrder = { 'NEW': 1, 'PREP_IN_PROGRESS': 2, 'READY_FOR_DELIVERY': 3, 'OUT_FOR_DELIVERY': 4, 'ACTIVE': 5, 'PAUSED': 6, 'COMPLETED': 7, 'CANCELLED': 8 };
          aValue = statusOrder[a.state] || 0;
          bValue = statusOrder[b.state] || 0;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [sessions, searchQuery, filterStatus, sortBy, sortOrder]);

  // Group sessions
  const groupedSessions = useMemo(() => {
    if (groupBy === 'none') return { 'All': processedSessions };

    const groups: { [key: string]: any[] } = {};
    
    processedSessions.forEach(session => {
      let groupKey = 'Other';
      
      switch (groupBy) {
        case 'status':
          groupKey = session.state;
          break;
        case 'staff':
          groupKey = session.assignedBOH || session.assignedFOH || 'Unassigned';
          break;
        case 'priority':
          groupKey = session.priority || 'medium';
          break;
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });

    return groups;
  }, [processedSessions, groupBy]);

  const handleBulkAction = (action: string) => {
    if (selectedSessions.length === 0) return;
    onBulkAction?.(action, selectedSessions);
    setSelectedSessions([]);
    setShowBulkActions(false);
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const selectAllInGroup = (sessions: any[]) => {
    const sessionIds = sessions.map(s => s.id);
    setSelectedSessions(prev => {
      const newSelection = [...prev];
      sessionIds.forEach(id => {
        if (!newSelection.includes(id)) newSelection.push(id);
      });
      return newSelection;
    });
  };

  const getStatusStats = () => {
    const stats = {
      NEW: 0,
      PREP_IN_PROGRESS: 0,
      READY_FOR_DELIVERY: 0,
      OUT_FOR_DELIVERY: 0,
      ACTIVE: 0,
      PAUSED: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    sessions.forEach(session => {
      stats[session.state] = (stats[session.state] || 0) + 1;
    });

    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sessions, tables, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
            >
              <option value="priority">Priority</option>
              <option value="time">Time</option>
              <option value="table">Table</option>
              <option value="status">Status</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>

          {/* Group By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="staff">Staff</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Status:</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(prev => 
                      prev.includes(status) 
                        ? prev.filter(s => s !== status)
                        : [...prev, status]
                    );
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterStatus.includes(status)
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {status.replace('_', ' ')} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSessions.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">{selectedSessions.length} selected</span>
              <Button
                size="sm"
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Zap className="w-4 h-4 mr-1" />
                Bulk Actions
              </Button>
            </div>
          )}
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="mt-4 p-4 bg-zinc-700/50 rounded-lg border border-zinc-600">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleBulkAction('start_prep')}
                className="bg-green-500 hover:bg-green-600"
              >
                <ChefHat className="w-4 h-4 mr-1" />
                Start Prep
              </Button>
              <Button
                size="sm"
                onClick={() => handleBulkAction('mark_ready')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Ready
              </Button>
              <Button
                size="sm"
                onClick={() => handleBulkAction('take_delivery')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Truck className="w-4 h-4 mr-1" />
                Take Delivery
              </Button>
              <Button
                size="sm"
                onClick={() => handleBulkAction('pause')}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                onClick={() => handleBulkAction('complete')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700">
            <div className="text-lg font-bold text-white">{count}</div>
            <div className="text-xs text-zinc-400">{status.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      {/* Grouped Sessions */}
      <div className="space-y-6">
        {Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
          <div key={groupName} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>{groupName}</span>
                <span className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full text-sm">
                  {groupSessions.length}
                </span>
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectAllInGroup(groupSessions)}
                className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
              >
                Select All
              </Button>
            </div>

            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {groupSessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-zinc-800/50 rounded-lg p-4 border transition-all ${
                    selectedSessions.includes(session.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => toggleSessionSelection(session.id)}
                        className="w-4 h-4 text-blue-500 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <h4 className="font-medium text-white">Table {session.tableId}</h4>
                        <p className="text-sm text-zinc-400">{session.customerRef}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        ${(session.priceCents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(session.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.state === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        session.state === 'PREP_IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' :
                        session.state === 'READY_FOR_DELIVERY' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {session.state.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Flavor:</span>
                      <span className="text-zinc-300">{session.flavor}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Staff:</span>
                      <span className="text-zinc-300">
                        {session.assignedBOH || session.assignedFOH || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {session.edgeCase && (
                    <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400">Issue: {session.edgeCase}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
