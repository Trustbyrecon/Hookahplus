import React from 'react';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/format';
import Badge from '../Badge';
import Card from '../Card';
import Button from '../Button';
import { User, CheckCircle, AlertCircle, Pause, Activity, Star } from 'lucide-react';
const StaffCard = ({ staff, onAction, className }) => {
    const getRoleColor = (role) => {
        switch (role) {
            case 'manager': return 'bg-purple-600';
            case 'foh': return 'bg-blue-600';
            case 'boh': return 'bg-green-600';
            case 'host': return 'bg-yellow-600';
            case 'admin': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case 'manager': return '👑';
            case 'foh': return '👥';
            case 'boh': return '👨‍🍳';
            case 'host': return '🎯';
            case 'admin': return '⚙️';
            default: return '👤';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-600';
            case 'break': return 'bg-yellow-600';
            case 'off': return 'bg-gray-600';
            case 'busy': return 'bg-orange-600';
            default: return 'bg-gray-600';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4"/>;
            case 'break': return <Pause className="w-4 h-4"/>;
            case 'off': return <AlertCircle className="w-4 h-4"/>;
            case 'busy': return <Activity className="w-4 h-4"/>;
            default: return <User className="w-4 h-4"/>;
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'ACTIVE';
            case 'break': return 'BREAK';
            case 'off': return 'OFF';
            case 'busy': return 'BUSY';
            default: return 'UNKNOWN';
        }
    };
    const getPerformanceColor = (rating) => {
        if (rating >= 4.5)
            return 'text-green-400';
        if (rating >= 3.5)
            return 'text-yellow-400';
        return 'text-red-400';
    };
    return (<Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
            {staff.avatar ? (<img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full object-cover"/>) : (<span className="text-2xl">{getRoleIcon(staff.role)}</span>)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
            <p className="text-sm text-zinc-400">
              {staff.role.toUpperCase()} • {formatRelativeTime(staff.lastActive)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="default" className={cn('text-xs', getStatusColor(staff.status))}>
            {getStatusIcon(staff.status)}
            <span className="ml-1">{getStatusText(staff.status)}</span>
          </Badge>
        </div>
      </div>

      {/* Staff Details */}
      <div className="space-y-3 mb-4">
        {/* Assigned Tables */}
        {staff.assignedTables && staff.assignedTables.length > 0 && (<div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Assigned Tables:</span>
            <div className="flex items-center space-x-1">
              {staff.assignedTables.map((tableId, index) => (<Badge key={index} variant="outline" className="text-xs">
                  {tableId}
                </Badge>))}
            </div>
          </div>)}

        {/* Performance Metrics */}
        {staff.performance && (<div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Performance:</span>
              <div className="flex items-center space-x-2">
                <Star className={cn('w-4 h-4', getPerformanceColor(staff.performance.rating))}/>
                <span className={cn('text-sm font-medium', getPerformanceColor(staff.performance.rating))}>
                  {staff.performance.rating.toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Orders Handled:</span>
              <span className="text-sm text-white">{staff.performance.ordersHandled}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Avg Session Time:</span>
              <span className="text-sm text-white">{staff.performance.avgSessionTime}h</span>
            </div>
          </div>)}

        {/* Last Active */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Last Active:</span>
          <span className="text-sm text-white">{formatRelativeTime(staff.lastActive)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {staff.status === 'active' && (<Button size="sm" variant="warning" onClick={() => onAction?.('send_break', staff.id)}>
            Send Break
          </Button>)}
        
        {staff.status === 'break' && (<Button size="sm" variant="success" onClick={() => onAction?.('end_break', staff.id)}>
            End Break
          </Button>)}
        
        {staff.status === 'off' && (<Button size="sm" variant="primary" onClick={() => onAction?.('start_shift', staff.id)}>
            Start Shift
          </Button>)}
        
        <Button size="sm" variant="outline" onClick={() => onAction?.('view_profile', staff.id)}>
          View Profile
        </Button>
        
        <Button size="sm" variant="outline" onClick={() => onAction?.('assign_tables', staff.id)}>
          Assign Tables
        </Button>
      </div>
    </Card>);
};
export default StaffCard;
