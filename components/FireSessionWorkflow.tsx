'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  fireSessionWorkflow, 
  WorkflowButton, 
  StaffRole, 
  SessionState, 
  WorkflowEvent 
} from '../lib/fire-session-workflow';

interface FireSessionWorkflowProps {
  sessionId: string;
  staffRole: StaffRole;
  staffId: string;
  onStateChange?: (session: SessionState) => void;
  onEvent?: (event: WorkflowEvent) => void;
}

export default function FireSessionWorkflow({
  sessionId,
  staffRole,
  staffId,
  onStateChange,
  onEvent
}: FireSessionWorkflowProps) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Subscribe to workflow events
  useEffect(() => {
    const unsubscribe = fireSessionWorkflow.subscribeToAgentEvents((event) => {
      if (event.sessionId === sessionId) {
        setSession(event.newState);
        onEvent?.(event);
        onStateChange?.(event.newState);
      }
    });

    // Load initial session state
    const initialSession = fireSessionWorkflow.getSession(sessionId);
    if (initialSession) {
      setSession(initialSession);
    }

    return unsubscribe;
  }, [sessionId, onEvent, onStateChange]);

  // 🔑 Button press handler
  const handleButtonPress = useCallback(async (
    button: WorkflowButton, 
    metadata?: Record<string, any>
  ) => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      const event = fireSessionWorkflow.pressButton(
        sessionId, 
        button, 
        staffRole, 
        staffId, 
        metadata
      );

      if (!event) {
        setError(`Invalid button press: ${button} for role ${staffRole}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, staffRole, staffId, session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Status Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Fire Session: {sessionId}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              session.currentStatus === 'prep' ? 'bg-blue-100 text-blue-800' :
              session.currentStatus === 'delivery' ? 'bg-yellow-100 text-yellow-800' :
              session.currentStatus === 'service' ? 'bg-green-100 text-green-800' :
              session.currentStatus === 'refill' ? 'bg-purple-100 text-purple-800' :
              session.currentStatus === 'coals_needed' ? 'bg-orange-100 text-orange-800' :
              session.currentStatus === 'recovery' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {session.currentStatus.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              Table {session.tableId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Flavor Mix:</span> {session.flavorMix}
          </div>
          <div>
            <span className="font-medium">Prep Staff:</span> {session.staffAssigned.prep}
          </div>
          {session.staffAssigned.front && (
            <div>
              <span className="font-medium">Front Staff:</span> {session.staffAssigned.front}
            </div>
          )}
          {session.staffAssigned.hookah_room && (
            <div>
              <span className="font-medium">Hookah Room:</span> {session.staffAssigned.hookah_room}
            </div>
          )}
          {session.sessionTimer?.startedAt && (
            <div>
              <span className="font-medium">Session Started:</span> {session.sessionTimer.startedAt.toLocaleTimeString()}
            </div>
          )}
          {session.demoMode && (
            <div className="col-span-2">
              <span className="font-medium text-blue-600">🔥 Demo Mode Active</span>
              <span className="text-xs text-gray-500 ml-2">
                (30s cycles → 15s refills → 10s coal burnout)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Workflow Buttons */}
      <div className="space-y-4">
        {/* 🔧 Prep Room Buttons */}
        {staffRole === 'prep' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Prep Room Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <WorkflowButton
                button="prep_started"
                label="Prep Started"
                description="Hookah assembly begun"
                disabled={session.prepStage.isStarted || isLoading}
                onClick={() => handleButtonPress('prep_started')}
                variant="primary"
              />
              
              <WorkflowButton
                button="flavor_locked"
                label="Flavor Locked"
                description="Flavor mix finalized"
                disabled={!session.prepStage.isStarted || session.prepStage.isFlavorLocked || isLoading}
                onClick={() => handleButtonPress('flavor_locked')}
                variant="primary"
              />
              
              <WorkflowButton
                button="session_timer_armed"
                label="Timer Armed"
                description="Set session duration"
                disabled={!session.prepStage.isFlavorLocked || session.prepStage.isTimerArmed || isLoading}
                onClick={() => handleButtonPress('session_timer_armed', { duration: 60 })}
                variant="primary"
              />
              
              <WorkflowButton
                button="ready_for_delivery"
                label="Ready for Delivery"
                description="Notify front staff"
                disabled={!session.prepStage.isTimerArmed || session.prepStage.isReadyForDelivery || isLoading}
                onClick={() => handleButtonPress('ready_for_delivery')}
                variant="success"
              />
            </div>
          </div>
        )}

        {/* 🚚 Front Staff Buttons */}
        {staffRole === 'front' && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">Front Staff Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <WorkflowButton
                button="picked_up"
                label="Picked Up"
                description="Hookah collected from prep"
                disabled={!session.prepStage.isReadyForDelivery || session.deliveryStage.isPickedUp || isLoading}
                onClick={() => handleButtonPress('picked_up')}
                variant="primary"
              />
              
              <WorkflowButton
                button="delivered"
                label="Delivered"
                description="Hookah at table, session active"
                disabled={!session.deliveryStage.isPickedUp || session.deliveryStage.isDelivered || isLoading}
                onClick={() => handleButtonPress('delivered')}
                variant="success"
              />

              <WorkflowButton
                button="refill_delivered"
                label="Refill Delivered"
                description="Customer refill completed"
                disabled={session.currentStatus !== 'refill' || isLoading}
                onClick={() => handleButtonPress('refill_delivered')}
                variant="success"
              />

              <WorkflowButton
                button="session_complete"
                label="Session Complete"
                description="End session"
                disabled={session.currentStatus === 'completed' || isLoading}
                onClick={() => handleButtonPress('session_complete')}
                variant="info"
              />
            </div>
          </div>
        )}

        {/* 🔥 Hookah Room Staff Buttons */}
        {staffRole === 'hookah_room' && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-900 mb-3">Hookah Room Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <WorkflowButton
                button="coals_delivered"
                label="Coals Delivered"
                description="New coals delivered to table"
                disabled={session.currentStatus !== 'coals_needed' || isLoading}
                onClick={() => handleButtonPress('coals_delivered', { coalType: 'quick_light' })}
                variant="success"
              />
            </div>
          </div>
        )}

        {/* 👤 Customer Buttons */}
        {staffRole === 'customer' && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-3">Customer Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <WorkflowButton
                button="customer_confirmed"
                label="Order Confirmed"
                description="Verify order received"
                disabled={!session.deliveryStage.isDelivered || session.deliveryStage.isCustomerConfirmed || isLoading}
                onClick={() => handleButtonPress('customer_confirmed')}
                variant="success"
              />

              <WorkflowButton
                button="refill_requested"
                label="Request Refill"
                description="Need flavor or water refill"
                disabled={session.currentStatus !== 'service' || isLoading}
                onClick={() => handleButtonPress('refill_requested', { refillType: 'both' })}
                variant="warning"
              />

              <WorkflowButton
                button="coals_burned_out"
                label="Coals Burned Out"
                description="Need new coals"
                disabled={session.currentStatus !== 'service' || isLoading}
                onClick={() => handleButtonPress('coals_burned_out', { coalType: 'quick_light' })}
                variant="warning"
              />
            </div>
          </div>
        )}

        {/* ⚠️ Edge Case Buttons */}
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-900 mb-3">Recovery & Edge Cases</h3>
          <div className="grid grid-cols-2 gap-3">
            <WorkflowButton
              button="hold"
              label="Hold"
              description="Pause session"
              disabled={isLoading}
              onClick={() => handleButtonPress('hold', { reason: 'Session paused by staff' })}
              variant="warning"
            />
            
            <WorkflowButton
              button="redo_remix"
              label="Redo/Remix"
              description="Remake required"
              disabled={isLoading}
              onClick={() => handleButtonPress('redo_remix', { reason: 'Flavor or equipment error' })}
              variant="warning"
            />
            
            <WorkflowButton
              button="swap_charcoal"
              label="Swap Charcoal"
              description="Mid-session service"
              disabled={session.currentStatus !== 'service' || isLoading}
              onClick={() => handleButtonPress('swap_charcoal')}
              variant="info"
            />
            
            <WorkflowButton
              button="cancel"
              label="Cancel"
              description="Drop order"
              disabled={isLoading}
              onClick={() => handleButtonPress('cancel')}
              variant="danger"
            />
            
            <WorkflowButton
              button="return_to_prep"
              label="Return to Prep"
              description="Send back to prep room"
              disabled={session.currentStatus === 'prep' || isLoading}
              onClick={() => handleButtonPress('return_to_prep', { reason: 'Delivery issue' })}
              variant="warning"
            />
          </div>
        </div>
      </div>

      {/* Session Progress */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Session Progress</h3>
        <div className="space-y-2">
          <ProgressStep
            label="Prep Started"
            completed={session.prepStage.isStarted}
            timestamp={session.prepStage.startedAt}
          />
          <ProgressStep
            label="Flavor Locked"
            completed={session.prepStage.isFlavorLocked}
            timestamp={session.prepStage.flavorLockedAt}
          />
          <ProgressStep
            label="Timer Armed"
            completed={session.prepStage.isTimerArmed}
            timestamp={session.prepStage.timerArmedAt}
          />
          <ProgressStep
            label="Ready for Delivery"
            completed={session.prepStage.isReadyForDelivery}
            timestamp={session.prepStage.readyForDeliveryAt}
            highlight={session.prepStage.isReadyForDelivery}
          />
          <ProgressStep
            label="Picked Up"
            completed={session.deliveryStage.isPickedUp}
            timestamp={session.deliveryStage.pickedUpAt}
          />
          <ProgressStep
            label="Delivered"
            completed={session.deliveryStage.isDelivered}
            timestamp={session.deliveryStage.deliveredAt}
          />
          <ProgressStep
            label="Customer Confirmed"
            completed={session.deliveryStage.isCustomerConfirmed}
            timestamp={session.deliveryStage.customerConfirmedAt}
          />
          
          {/* New Refill & Coal Progress */}
          <div className="border-t pt-2 mt-2">
            <div className="text-xs font-medium text-gray-600 mb-2">Service Management</div>
            <ProgressStep
              label="Refill Requested"
              completed={session.refillStage.isRequested}
              timestamp={session.refillStage.requestedAt}
              highlight={session.currentStatus === 'refill'}
            />
            <ProgressStep
              label="Refill Delivered"
              completed={session.refillStage.isDelivered}
              timestamp={session.refillStage.deliveredAt}
            />
            <ProgressStep
              label="Coals Needed"
              completed={session.coalStage.needsReplacement}
              timestamp={session.coalStage.requestedAt}
              highlight={session.currentStatus === 'coals_needed'}
            />
            <ProgressStep
              label="Coals Delivered"
              completed={session.coalStage.isDelivered}
              timestamp={session.coalStage.deliveredAt}
            />
          </div>
        </div>
      </div>

      {/* Service Statistics */}
      {session.serviceStage.isActive && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Service Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Refills:</span>
              <div className="text-blue-900 font-semibold">{session.serviceStage.refillCount}</div>
            </div>
            <div>
              <span className="font-medium text-blue-700">Coal Swaps:</span>
              <div className="text-blue-900 font-semibold">{session.serviceStage.charcoalSwaps}</div>
            </div>
            <div>
              <span className="font-medium text-blue-700">Coal Burnouts:</span>
              <div className="text-blue-900 font-semibold">{session.serviceStage.coalBurnoutCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Status */}
      {session.demoMode && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">🔥 Demo Mode Status</h3>
          <div className="text-sm text-yellow-800">
            <p><strong>Current Cycle:</strong> {session.sessionTimer?.currentCycle || 0}</p>
            <p><strong>Status:</strong> 
              {session.currentStatus === 'service' && '🔄 Running 30s cycle'}
              {session.currentStatus === 'refill' && '⏳ 15s refill period'}
              {session.currentStatus === 'coals_needed' && '⏳ 10s coal replacement'}
            </p>
            <p className="text-xs mt-2">
              Demo automatically cycles through: Service → Refill → Coals → Service
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔘 Individual Workflow Button Component
interface WorkflowButtonProps {
  button: WorkflowButton;
  label: string;
  description: string;
  disabled: boolean;
  onClick: () => void;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

function WorkflowButton({
  button,
  label,
  description,
  disabled,
  onClick,
  variant
}: WorkflowButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    info: 'bg-gray-600 hover:bg-gray-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-lg text-left transition-all duration-200 ${
        disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : `${variantClasses[variant]} hover:shadow-md`
      }`}
      title={description}
    >
      <div className="font-medium">{label}</div>
      <div className={`text-sm ${disabled ? 'text-gray-300' : 'text-white/80'}`}>
        {description}
      </div>
    </button>
  );
}

// 📊 Progress Step Component
interface ProgressStepProps {
  label: string;
  completed: boolean;
  timestamp?: Date;
  highlight?: boolean;
}

function ProgressStep({ label, completed, timestamp, highlight }: ProgressStepProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-4 h-4 rounded-full border-2 ${
        completed 
          ? 'bg-green-500 border-green-500' 
          : highlight
          ? 'bg-yellow-500 border-yellow-500 animate-pulse'
          : 'border-gray-300'
      }`}>
        {completed && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <span className={`text-sm ${
          completed 
            ? 'text-green-700' 
            : highlight 
            ? 'text-yellow-700 font-medium' 
            : 'text-gray-500'
        }`}>
          {label}
        </span>
        {timestamp && (
          <div className="text-xs text-gray-400">
            {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
