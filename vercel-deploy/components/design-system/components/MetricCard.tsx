'use client';

import React from 'react';
import { cn } from '../utils/cn';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    title, 
    value, 
    icon, 
    color = 'text-zinc-300', 
    bgColor = 'bg-zinc-800/50',
    change,
    changeType = 'neutral',
    description,
    ...props 
  }: MetricCardProps, ref: React.Ref<HTMLDivElement>) => {
    const changeColors: Record<string, string> = {
      positive: 'text-green-400',
      negative: 'text-red-400',
      neutral: 'text-zinc-400',
    };

    return (
      <div
        className={cn(
          'p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/50 hover:bg-zinc-800/50 transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <div className={color}>
              {icon}
            </div>
          </div>
          {change && (
            <span className={cn('text-sm font-medium', changeColors[changeType])}>
              {change}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-zinc-400">{title}</div>
          {description && (
            <div className="text-xs text-zinc-500">{description}</div>
          )}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export default MetricCard;
