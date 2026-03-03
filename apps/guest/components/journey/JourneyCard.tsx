import React from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export interface JourneyCardProps {
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  duration?: string;
  nextAction?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  title,
  description,
  status,
  duration,
  nextAction,
  onAction,
  actionLabel = 'Continue',
  className
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'active':
        return <Clock className="w-5 h-5 text-teal-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-zinc-600" />;
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'border-green-500/50 bg-green-500/5';
      case 'active':
        return 'border-teal-500/50 bg-teal-500/5';
      case 'error':
        return 'border-red-500/50 bg-red-500/5';
      default:
        return 'border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-lg',
        getStatusStyles(),
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {duration && (
          <span className="text-sm text-zinc-400">{duration}</span>
        )}
      </div>

      <p className="text-zinc-300 mb-4">{description}</p>

      {nextAction && (
        <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-sm text-zinc-400">
            <span className="font-medium">Next:</span> {nextAction}
          </p>
        </div>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            'w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
            status === 'completed' 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : status === 'active'
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : status === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
          )}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </Card>
  );
};

export default JourneyCard;
