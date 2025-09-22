import React from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: Date;
  dueAt?: Date;
  customerName?: string;
  tableNumber?: string;
  type: 'refill' | 'cleanup' | 'setup' | 'payment' | 'service';
}

export interface TaskQueueProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskAssign: (taskId: string, staffId: string) => void;
  className?: string;
}

const TaskQueue: React.FC<TaskQueueProps> = ({
  tasks,
  onTaskUpdate,
  onTaskAssign,
  className
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refill': return '🔄';
      case 'cleanup': return '🧹';
      case 'setup': return '⚙️';
      case 'payment': return '💳';
      case 'service': return '🛠️';
      default: return '📋';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeRemaining = (dueAt?: Date) => {
    if (!dueAt) return null;
    const now = new Date();
    const diff = dueAt.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m left`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const statusOrder = { pending: 4, in_progress: 3, completed: 2, cancelled: 1 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return statusOrder[b.status] - statusOrder[a.status];
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Task Queue</h3>
        <div className="flex items-center space-x-4 text-sm text-zinc-400">
          <span>Total: {tasks.length}</span>
          <span>Pending: {tasks.filter(t => t.status === 'pending').length}</span>
          <span>In Progress: {tasks.filter(t => t.status === 'in_progress').length}</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.map(task => (
          <Card
            key={task.id}
            className={cn(
              'transition-all duration-200 hover:shadow-lg',
              task.status === 'completed' ? 'opacity-75' : '',
              task.priority === 'urgent' ? 'border-red-500/50' : ''
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(task.type)}</span>
                <div>
                  <h4 className="font-semibold text-white">{task.title}</h4>
                  <p className="text-sm text-zinc-400">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium border',
                  getPriorityColor(task.priority)
                )}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
              <div className="flex items-center space-x-4">
                {task.customerName && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{task.customerName}</span>
                  </div>
                )}
                {task.tableNumber && (
                  <span>Table {task.tableNumber}</span>
                )}
                <span>Created: {formatTime(task.createdAt)}</span>
              </div>
              {task.dueAt && (
                <span className={cn(
                  'font-medium',
                  getTimeRemaining(task.dueAt) === 'Overdue' ? 'text-red-400' : 'text-zinc-400'
                )}>
                  {getTimeRemaining(task.dueAt)}
                </span>
              )}
            </div>

            {task.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onTaskUpdate(task.id, { status: 'in_progress' })}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Start
                </button>
                <button
                  onClick={() => onTaskUpdate(task.id, { status: 'completed' })}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => onTaskUpdate(task.id, { status: 'cancelled' })}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {task.status === 'in_progress' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onTaskUpdate(task.id, { status: 'completed' })}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => onTaskUpdate(task.id, { status: 'pending' })}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                >
                  Pause
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-zinc-400">No tasks in queue</p>
        </div>
      )}
    </div>
  );
};

export default TaskQueue;
