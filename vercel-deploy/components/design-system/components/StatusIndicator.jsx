'use client';
import React from 'react';
import { cn } from '../utils/cn';
const StatusIndicator = React.forwardRef(({ className, status, label, value, description, size = 'md', ...props }, ref) => {
    const statusConfig = {
        online: {
            color: 'bg-green-400',
            text: 'Online',
            icon: '🟢'
        },
        offline: {
            color: 'bg-gray-400',
            text: 'Offline',
            icon: '⚫'
        },
        busy: {
            color: 'bg-orange-400',
            text: 'Busy',
            icon: '🟠'
        },
        idle: {
            color: 'bg-blue-400',
            text: 'Idle',
            icon: '🔵'
        },
        error: {
            color: 'bg-red-400',
            text: 'Error',
            icon: '🔴'
        },
        warning: {
            color: 'bg-yellow-400',
            text: 'Warning',
            icon: '🟡'
        }
    };
    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };
    const config = statusConfig[status] || statusConfig.offline;
    return (<div className={cn('flex items-center space-x-2', sizeClasses[size], className)} ref={ref} {...props}>
        <div className={cn('w-2 h-2 rounded-full animate-pulse', config.color)}/>
        <div className="flex flex-col">
          {label && (<span className="text-zinc-400">{label}</span>)}
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{value || config.text}</span>
            {description && (<span className="text-zinc-500">{description}</span>)}
          </div>
        </div>
      </div>);
});
StatusIndicator.displayName = 'StatusIndicator';
export default StatusIndicator;
