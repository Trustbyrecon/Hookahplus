"use client";

import React from 'react';
import { DollarSign, TrendingUp, Calendar, Users, Clock, Coffee } from 'lucide-react';
import MetricCard from './dashboard/MetricCard';

interface RevenueMetricsProps {
  today: number;
  week: number;
  month: number;
  avgSessionValue: number;
  sessionCount: number;
  extensionRevenue?: number;
  refillRevenue?: number;
  className?: string;
}

const RevenueMetrics: React.FC<RevenueMetricsProps> = ({
  today,
  week,
  month,
  avgSessionValue,
  sessionCount,
  extensionRevenue = 0,
  refillRevenue = 0,
  className,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      <MetricCard
        title="Today's Revenue"
        value={`$${today.toFixed(2)}`}
        icon={<DollarSign className="w-6 h-6" />}
        color="text-green-400"
        bgColor="bg-green-500/20"
      />
      
      <MetricCard
        title="Week Revenue"
        value={`$${week.toFixed(2)}`}
        icon={<TrendingUp className="w-6 h-6" />}
        color="text-blue-400"
        bgColor="bg-blue-500/20"
      />
      
      <MetricCard
        title="Month Revenue"
        value={`$${month.toFixed(2)}`}
        icon={<Calendar className="w-6 h-6" />}
        color="text-purple-400"
        bgColor="bg-purple-500/20"
      />
      
      <MetricCard
        title="Extension Revenue"
        value={`$${extensionRevenue.toFixed(2)}`}
        icon={<Clock className="w-6 h-6" />}
        color="text-orange-400"
        bgColor="bg-orange-500/20"
      />
      
      <MetricCard
        title="Refill Revenue"
        value={`$${refillRevenue.toFixed(2)}`}
        icon={<Coffee className="w-6 h-6" />}
        color="text-cyan-400"
        bgColor="bg-cyan-500/20"
      />
      
      <MetricCard
        title="Avg Session Value"
        value={`$${avgSessionValue.toFixed(2)}`}
        icon={<DollarSign className="w-6 h-6" />}
        color="text-yellow-400"
        bgColor="bg-yellow-500/20"
      />
      
      <MetricCard
        title="Total Sessions"
        value={sessionCount}
        icon={<Users className="w-6 h-6" />}
        color="text-pink-400"
        bgColor="bg-pink-500/20"
      />
    </div>
  );
};

export default RevenueMetrics;

