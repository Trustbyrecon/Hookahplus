import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'idle' | 'warning' | 'error';
  label: string;
  value: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  value,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'idle': return 'text-yellow-400';
      case 'warning': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-red-400';
      case 'idle': return 'bg-yellow-400';
      case 'warning': return 'bg-orange-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-zinc-400';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
      <div className="text-sm">
        <div className="text-zinc-400">{label}</div>
        <div className={`font-semibold ${getStatusColor()}`}>{value}</div>
      </div>
    </div>
  );
};

export default StatusIndicator;
