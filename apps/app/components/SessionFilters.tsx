"use client";

import React, { useState } from "react";
import { Search, Filter, X, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "./Button";

export interface FilterOptions {
  search: string;
  status: string[];
  staff: string[];
  timeRange: 'all' | 'today' | 'week' | 'month';
  severity: string[];
}

interface SessionFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  availableStaff: string[];
}

export function SessionFilters({ onFiltersChange, availableStaff }: SessionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: [],
    staff: [],
    timeRange: 'all',
    severity: []
  });

  const statusOptions = [
    { value: 'NEW', label: 'New', icon: '🆕', color: 'text-blue-400' },
    { value: 'PREP_IN_PROGRESS', label: 'Prep In Progress', icon: '🔄', color: 'text-yellow-400' },
    { value: 'READY_FOR_DELIVERY', label: 'Ready for Delivery', icon: '✅', color: 'text-green-400' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚', color: 'text-purple-400' },
    { value: 'ACTIVE', label: 'Active', icon: '🔥', color: 'text-orange-400' },
    { value: 'PAUSED', label: 'Paused', icon: '⏸️', color: 'text-gray-400' },
    { value: 'COMPLETED', label: 'Completed', icon: '✔️', color: 'text-emerald-400' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '❌', color: 'text-red-400' }
  ];

  const severityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' }
  ];

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStaffToggle = (staff: string) => {
    const newStaff = filters.staff.includes(staff)
      ? filters.staff.filter(s => s !== staff)
      : [...filters.staff, staff];
    
    const newFilters = { ...filters, staff: newStaff };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTimeRangeChange = (timeRange: FilterOptions['timeRange']) => {
    const newFilters = { ...filters, timeRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSeverityToggle = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    
    const newFilters = { ...filters, severity: newSeverity };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      search: '',
      status: [],
      staff: [],
      timeRange: 'all',
      severity: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = filters.status.length + filters.staff.length + filters.severity.length + (filters.timeRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sessions, customers, flavors..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative ${activeFiltersCount > 0 ? 'border-teal-500 text-teal-400' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-4">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">Session Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status.includes(option.value)
                      ? `${option.color} bg-current/20 border border-current/30`
                      : 'text-zinc-400 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">Assigned Staff</label>
            <div className="flex flex-wrap gap-2">
              {availableStaff.map(staff => (
                <button
                  key={staff}
                  onClick={() => handleStaffToggle(staff)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.staff.includes(staff)
                      ? 'text-teal-400 bg-teal-500/20 border border-teal-500/30'
                      : 'text-zinc-400 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  <Users className="w-3 h-3 mr-1 inline" />
                  {staff}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <div className="flex space-x-2">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value as FilterOptions['timeRange'])}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.timeRange === option.value
                      ? 'text-teal-400 bg-teal-500/20 border border-teal-500/30'
                      : 'text-zinc-400 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  <Clock className="w-3 h-3 mr-1 inline" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">Issue Severity</label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSeverityToggle(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.severity.includes(option.value)
                      ? `${option.color} bg-current/20 border border-current/30`
                      : 'text-zinc-400 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 mr-1 inline" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
