import React from 'react';
import { cn } from '../../utils/cn';
import Badge from '../Badge';
import Card from '../Card';
import Button from '../Button';
import { 
  Table, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Pause
} from 'lucide-react';

export interface TableCardProps {
  table: {
    id: string;
    name: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
    customerName?: string;
    sessionId?: string;
    estimatedWaitTime?: number;
    zone?: string;
    tableType?: 'high_boy' | 'table' | '2x_booth' | '4x_booth' | '8x_sectional' | '4x_sofa';
    position?: { x: number; y: number };
  };
  onAction?: (action: string, tableId: string) => void;
  className?: string;
}

const TableCard: React.FC<TableCardProps> = ({ table, onAction, className }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'occupied': return 'bg-red-600';
      case 'reserved': return 'bg-yellow-600';
      case 'cleaning': return 'bg-blue-600';
      case 'maintenance': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'cleaning': return <Pause className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Table className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'AVAILABLE';
      case 'occupied': return 'OCCUPIED';
      case 'reserved': return 'RESERVED';
      case 'cleaning': return 'CLEANING';
      case 'maintenance': return 'MAINTENANCE';
      default: return 'UNKNOWN';
    }
  };

  const getTableTypeIcon = (type?: string) => {
    switch (type) {
      case 'high_boy': return '🪑';
      case 'table': return '🪑';
      case '2x_booth': return '🛋️';
      case '4x_booth': return '🛋️';
      case '8x_sectional': return '🛋️';
      case '4x_sofa': return '🛋️';
      default: return '🪑';
    }
  };

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTableTypeIcon(table.tableType)}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{table.name}</h3>
            <p className="text-sm text-zinc-400">
              {table.capacity} people • {table.zone || 'Main Area'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="default" className={cn('text-xs', getStatusColor(table.status))}>
            {getStatusIcon(table.status)}
            <span className="ml-1">{getStatusText(table.status)}</span>
          </Badge>
        </div>
      </div>

      {/* Table Details */}
      <div className="space-y-3 mb-4">
        {/* Customer Info */}
        {table.customerName && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Customer:</span>
            <span className="text-sm text-white">{table.customerName}</span>
          </div>
        )}

        {/* Session Info */}
        {table.sessionId && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Session:</span>
            <span className="text-sm text-white font-mono">{table.sessionId}</span>
          </div>
        )}

        {/* Wait Time */}
        {table.estimatedWaitTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Wait Time:</span>
            <span className="text-sm text-white">{table.estimatedWaitTime} min</span>
          </div>
        )}

        {/* Position */}
        {table.position && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Position:</span>
            <span className="text-sm text-white">
              ({table.position.x}, {table.position.y})
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {table.status === 'available' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAction?.('fire_session', table.id)}
          >
            Fire Session
          </Button>
        )}
        
        {table.status === 'occupied' && (
          <Button
            size="sm"
            variant="warning"
            onClick={() => onAction?.('hold_session', table.id)}
          >
            Hold Session
          </Button>
        )}
        
        {table.status === 'reserved' && (
          <Button
            size="sm"
            variant="info"
            onClick={() => onAction?.('check_in', table.id)}
          >
            Check In
          </Button>
        )}
        
        {table.status === 'cleaning' && (
          <Button
            size="sm"
            variant="success"
            onClick={() => onAction?.('mark_ready', table.id)}
          >
            Mark Ready
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction?.('view_details', table.id)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default TableCard;
