"use client";

import React from 'react';
import { Calendar } from 'lucide-react';
import Card from './Card';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">Date Range</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            onStartDateChange(weekAgo.toISOString().split('T')[0]);
            onEndDateChange(today);
          }}
          className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
        >
          Last 7 Days
        </button>
        
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            const monthStart = new Date();
            monthStart.setDate(1);
            onStartDateChange(monthStart.toISOString().split('T')[0]);
            onEndDateChange(today);
          }}
          className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
        >
          This Month
        </button>
      </div>
    </Card>
  );
};

export default DateRangeSelector;

