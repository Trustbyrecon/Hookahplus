"use client";

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  AlertTriangle,
  RotateCcw,
  Plus
} from 'lucide-react';
import { sessionStateMachine, SessionState, SessionTransition } from '../lib/sessionStateMachine';

interface SessionStateTransitionProps {
  currentState: SessionState;
  userRole: string;
  onTransition: (transition: SessionTransition, note?: string) => void;
  sessionId: string;
  className?: string;
}

export const SessionStateTransition: React.FC<SessionStateTransitionProps> = ({
  currentState,
  userRole,
  onTransition,
  sessionId,
  className
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState<SessionTransition | null>(null);
  const [transitionNote, setTransitionNote] = useState('');

  const validTransitions = sessionStateMachine.getValidTransitions(currentState, userRole);
  const stateInfo = sessionStateMachine.getStateInfo(currentState);

  const getTransitionIcon = (transition: SessionTransition) => {
    switch (transition) {
      case 'start_prep':
        return <Clock className="w-4 h-4" />;
      case 'prep_complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'start_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivery_complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'activate_session':
        return <Play className="w-4 h-4" />;
      case 'pause_session':
        return <Pause className="w-4 h-4" />;
      case 'resume_session':
        return <Play className="w-4 h-4" />;
      case 'complete_session':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancel_session':
        return <XCircle className="w-4 h-4" />;
      case 'extend_session':
        return <Plus className="w-4 h-4" />;
      default:
        return <RotateCcw className="w-4 h-4" />;
    }
  };

  const getTransitionColor = (transition: SessionTransition) => {
    switch (transition) {
      case 'start_prep':
      case 'prep_complete':
      case 'start_delivery':
      case 'delivery_complete':
      case 'activate_session':
      case 'resume_session':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'pause_session':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'complete_session':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'cancel_session':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'extend_session':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-zinc-600 hover:bg-zinc-700 text-white';
    }
  };

  const handleTransitionClick = (transition: SessionTransition) => {
    const transitionDetails = sessionStateMachine.getTransitionDetails(transition);
    
    if (transitionDetails?.requiresConfirmation) {
      setShowConfirmDialog(transition);
    } else {
      onTransition(transition);
    }
  };

  const handleConfirmTransition = () => {
    if (showConfirmDialog) {
      onTransition(showConfirmDialog, transitionNote);
      setShowConfirmDialog(null);
      setTransitionNote('');
    }
  };

  const handleCancelTransition = () => {
    setShowConfirmDialog(null);
    setTransitionNote('');
  };

  if (validTransitions.length === 0) {
    return (
      <div className={cn('text-center text-zinc-400 py-4', className)}>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>No available transitions for current state</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current State Display */}
      <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
        <div className={cn('p-2 rounded-lg', `bg-${stateInfo.color}-500/20`)}>
          {React.createElement(require('lucide-react')[stateInfo.icon], { className: 'w-5 h-5' })}
        </div>
        <div>
          <div className="font-semibold text-white">{stateInfo.label}</div>
          <div className="text-sm text-zinc-400">{stateInfo.description}</div>
        </div>
      </div>

      {/* Available Transitions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-zinc-300">Available Actions:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {validTransitions.map((transition) => (
            <button
              key={transition.transition}
              onClick={() => handleTransitionClick(transition.transition)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                getTransitionColor(transition.transition)
              )}
            >
              {getTransitionIcon(transition.transition)}
              <span>{transition.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
            </div>
            
            <p className="text-zinc-300 mb-4">
              Are you sure you want to {sessionStateMachine.getTransitionDetails(showConfirmDialog)?.description.toLowerCase()}?
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add a note about this transition..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmTransition}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    getTransitionColor(showConfirmDialog)
                  )}
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancelTransition}
                  className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
