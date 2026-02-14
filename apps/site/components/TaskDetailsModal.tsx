'use client';

import React from 'react';
import { X, Clock, User, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    assignedTo: string;
    estimatedTime: string;
    status: string;
  };
}

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
          </div>

          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {task.priority.toUpperCase()} PRIORITY
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-teal-400 mt-0.5" />
              <div>
                <div className="text-sm text-zinc-400">Assigned To</div>
                <div className="text-white font-medium">{task.assignedTo}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <div className="text-sm text-zinc-400">Estimated Time</div>
                <div className="text-white font-medium">{task.estimatedTime}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-zinc-400">Status</div>
                <div className={`font-medium ${
                  task.status === 'completed' ? 'text-green-400' :
                  task.status === 'in_progress' ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {task.status === 'completed' ? 'Completed' :
                   task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
          {task.status !== 'completed' && (
            <button
              onClick={() => {
                console.log(`Managing task ${task.id}`);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Manage Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

