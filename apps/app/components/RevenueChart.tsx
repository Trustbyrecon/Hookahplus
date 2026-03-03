"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from './Card';

interface TrendDataPoint {
  date: string;
  revenue: number;
  sessions: number;
}

interface RevenueChartProps {
  data: TrendDataPoint[];
  className?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, className }) => {
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Revenue Trend (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#14B8A6"
            strokeWidth={2}
            dot={{ fill: '#14B8A6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;

