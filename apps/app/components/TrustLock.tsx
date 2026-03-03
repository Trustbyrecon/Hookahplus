import React from 'react';

interface TrustLockProps {
  trustScore: number;
  status: 'active' | 'pending' | 'verified' | 'inactive';
  version: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrustLock: React.FC<TrustLockProps> = ({
  trustScore,
  status,
  version,
  size = 'md',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16 text-xs';
      case 'md': return 'w-24 h-24 text-sm';
      case 'lg': return 'w-32 h-32 text-base';
      default: return 'w-24 h-24 text-sm';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-green-400 border-green-400';
      case 'pending': return 'text-yellow-400 border-yellow-400';
      case 'verified': return 'text-blue-400 border-blue-400';
      case 'inactive': return 'text-red-400 border-red-400';
      default: return 'text-zinc-400 border-zinc-400';
    }
  };

  const getTrustColor = () => {
    if (trustScore >= 0.8) return 'text-green-400';
    if (trustScore >= 0.6) return 'text-yellow-400';
    if (trustScore >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className={`${getSizeClasses()} rounded-full border-2 ${getStatusColor()} flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm`}>
        <div className={`font-bold ${getTrustColor()}`}>
          {Math.round(trustScore * 100)}%
        </div>
        <div className="text-xs opacity-75">TRUST</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-zinc-400">{version}</div>
        <div className={`text-xs font-medium ${getStatusColor()}`}>
          {status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default TrustLock;
