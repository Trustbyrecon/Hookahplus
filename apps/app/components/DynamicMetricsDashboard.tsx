import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Users, 
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LiveMetrics {
  activeSessions: number;
  revenue: number;
  avgDuration: number;
  alerts: number;
  staffAssigned: number;
  totalSessions: number;
  changes: {
    activeSessions: string;
    revenue: string;
    avgDuration: string;
    alerts: string;
    staffAssigned: string;
    totalSessions: string;
  };
}

interface MetricsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change: string;
  isPositive?: boolean;
  delay?: number;
}

function MetricsCard({ icon, value, label, change, isPositive = true, delay = 0 }: MetricsCardProps) {
  const { currentTheme } = useTheme();
  
  const isPositiveChange = change.startsWith('+') || change === '0%';
  const changeColor = isPositiveChange ? 'text-green-400' : 'text-red-400';
  const changeIcon = isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`${getThemeClasses(currentTheme, 'card')} rounded-xl p-4 hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${currentTheme.colors.primary}-500/20`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
          {changeIcon}
          <span className="font-medium">{change}</span>
        </div>
      </div>
      
      <div className={`text-2xl font-bold text-${currentTheme.colors.text} mb-1`}>
        {value}
      </div>
      
      <div className={`text-sm text-${currentTheme.colors.textSecondary}`}>
        {label}
      </div>
    </motion.div>
  );
}

interface DynamicMetricsDashboardProps {
  metrics: LiveMetrics;
  loading?: boolean;
}

export default function DynamicMetricsDashboard({ metrics, loading = false }: DynamicMetricsDashboardProps) {
  const { currentTheme } = useTheme();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className={`${getThemeClasses(currentTheme, 'card')} rounded-xl p-4 animate-pulse`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 bg-${currentTheme.colors.surface} rounded-lg`}></div>
              <div className={`w-12 h-4 bg-${currentTheme.colors.surface} rounded`}></div>
            </div>
            <div className={`w-16 h-8 bg-${currentTheme.colors.surface} rounded mb-2`}></div>
            <div className={`w-20 h-4 bg-${currentTheme.colors.surface} rounded`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
      <MetricsCard
        icon={<Flame className={`w-5 h-5 text-${currentTheme.colors.primary}-400`} />}
        value={metrics.activeSessions}
        label="Active Sessions"
        change={metrics.changes.activeSessions}
        delay={0}
      />
      
      <MetricsCard
        icon={<DollarSign className={`w-5 h-5 text-green-400`} />}
        value={`$${metrics.revenue}`}
        label="Revenue"
        change={metrics.changes.revenue}
        delay={1}
      />
      
      <MetricsCard
        icon={<Clock className={`w-5 h-5 text-blue-400`} />}
        value={`${metrics.avgDuration}min`}
        label="Avg Duration"
        change={metrics.changes.avgDuration}
        isPositive={false}
        delay={2}
      />
      
      <MetricsCard
        icon={<AlertTriangle className={`w-5 h-5 text-yellow-400`} />}
        value={metrics.alerts}
        label="Alerts"
        change={metrics.changes.alerts}
        delay={3}
      />
      
      <MetricsCard
        icon={<Users className={`w-5 h-5 text-purple-400`} />}
        value={metrics.staffAssigned}
        label="Staff Assigned"
        change={metrics.changes.staffAssigned}
        delay={4}
      />
      
      <MetricsCard
        icon={<BarChart3 className={`w-5 h-5 text-${currentTheme.colors.accent}-400`} />}
        value={metrics.totalSessions}
        label="Total Sessions"
        change={metrics.changes.totalSessions}
        delay={5}
      />
      
      <MetricsCard
        icon={<BarChart3 className={`w-5 h-5 text-${currentTheme.colors.secondary}-400`} />}
        value="📊"
        label="Performance"
        change="+5%"
        delay={6}
      />
    </div>
  );
}

// Helper function to get theme classes (imported from ThemeContext)
function getThemeClasses(theme: any, component: string): string {
  const baseClasses = {
    background: `bg-${theme.colors.background}`,
    surface: `bg-${theme.colors.surface}`,
    text: `text-${theme.colors.text}`,
    border: `border-${theme.colors.border}`,
    button: `bg-${theme.colors.primary}-600 hover:bg-${theme.colors.primary}-700 text-white`,
    card: `bg-${theme.colors.surface}/50 border border-${theme.colors.border} backdrop-blur-sm`
  };

  return baseClasses[component as keyof typeof baseClasses] || '';
}
