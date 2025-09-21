import React from 'react';
import { cn } from '../../utils/cn';
import { formatTime, formatRelativeTime } from '../../utils/format';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Button } from '../Button';
import { 
  Clock, 
  User, 
  DollarSign, 
  Flame, 
  ChefHat, 
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Flag,
  Pause,
  Zap
} from 'lucide-react';

export interface SessionCardProps {
  session: {
    id: string;
    tableId: string;
    customerName?: string;
    flavor?: string;
    amount: number;
    status: 'new' | 'preparing' | 'active' | 'paused' | 'completed' | 'cancelled';
    createdAt: number;
    sessionStartTime?: number;
    sessionDuration?: number;
    coalStatus?: 'active' | 'needs_refill' | 'burnt_out';
    assignedBOHStaff?: string;
    sessionNotes?: string;
    deliveryStatus?: 'preparing' | 'ready' | 'delivered';
  };
  onAction?: (action: string, sessionId: string) => void;
  className?: string;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onAction, className }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600';
      case 'preparing': return 'bg-yellow-600';
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-orange-600';
      case 'completed': return 'bg-gray-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <UserCheck className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'active': return <Flame className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCoalStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'needs_refill': return 'text-yellow-400';
      case 'burnt_out': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCoalStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return '🔥';
      case 'needs_refill': return '⚠️';
      case 'burnt_out': return '💀';
      default: return '⚪';
    }
  };

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-white">{session.tableId}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {session.customerName || 'Anonymous'} - {session.flavor || 'Custom Mix'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="default" className={cn('text-xs', getStatusColor(session.status))}>
            {getStatusIcon(session.status)}
            <span className="ml-1 uppercase">{session.status}</span>
          </Badge>
          <span className="text-lg font-bold text-white">${session.amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Session Details */}
      <div className="space-y-3 mb-4">
        {/* Assigned BOH Staff */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Assigned BOH Staff:</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white">{session.assignedBOHStaff || 'staff_001'}</span>
            <Button size="sm" variant="outline" className="text-xs">
              Assign BOH
            </Button>
          </div>
        </div>

        {/* Session Notes */}
        <div className="space-y-2">
          <span className="text-sm text-zinc-400">Session Notes:</span>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">
              {session.sessionNotes || 'Source: undefined, External Ref: undefined'}
            </span>
            <Button size="sm" variant="ghost" className="text-xs text-blue-400">
              Add Note
            </Button>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Created:</span>
          <span className="text-sm text-zinc-300">
            {session.createdAt ? formatRelativeTime(session.createdAt) : 'Invalid Date'}
          </span>
        </div>

        {/* Coal Status */}
        {session.coalStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Coal Status:</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCoalStatusIcon(session.coalStatus)}</span>
              <span className={cn('text-sm font-medium', getCoalStatusColor(session.coalStatus))}>
                {session.coalStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="success"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => onAction?.('restart_prep', session.id)}
        >
          Restart Prep
        </Button>
        
        <Button
          size="sm"
          variant="info"
          leftIcon={<UserCheck className="w-4 h-4" />}
          onClick={() => onAction?.('resolve_issue', session.id)}
        >
          Resolve Issue
        </Button>
        
        <Button
          size="sm"
          variant="danger"
          leftIcon={<Flag className="w-4 h-4" />}
          onClick={() => onAction?.('flag_manager', session.id)}
        >
          Flag Manager
        </Button>
        
        <Button
          size="sm"
          variant="warning"
          leftIcon={<Pause className="w-4 h-4" />}
          onClick={() => onAction?.('hold_session', session.id)}
        >
          Hold Session
        </Button>
        
        <Button
          size="sm"
          variant="accent"
          leftIcon={<Zap className="w-4 h-4" />}
          onClick={() => onAction?.('request_refill', session.id)}
        >
          Request Refill
        </Button>
      </div>
    </Card>
  );
};

export default SessionCard;
