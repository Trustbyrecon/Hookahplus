"use client";

import React, { useState, useEffect, Suspense } from 'react';
import CreateSessionModal from '../../components/CreateSessionModal';
import GlobalNavigation from '../../components/GlobalNavigation';
import DollarTestButton from '../../components/DollarTestButton';
import EnhancedFSDDesign from '../../components/EnhancedFSDDesign';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { useLiveSessionData } from '../../hooks/useLiveSessionData';
import { 
  Flame, 
  AlertCircle
} from 'lucide-react';
import { SessionStatus } from '../../types/session';

export default function FireSessionDashboard() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-zinc-400 text-sm">Setting up your session</p>
        </div>
      </div>}>
        <ErrorBoundary>
          <FireSessionDashboardContent />
        </ErrorBoundary>
      </Suspense>
    </ThemeProvider>
  );
}

function FireSessionDashboardContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  
  // Use live session data
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState } = useLiveSessionData();
  const { currentTheme } = useTheme();
  
  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showCreateModal);
  }, [showCreateModal]);

  // Listen for Create Session modal events from Enhanced Design
  useEffect(() => {
    const handleOpenCreateSessionModal = () => {
      setShowCreateModal(true);
    };

    window.addEventListener('openCreateSessionModal', handleOpenCreateSessionModal);
    
    return () => {
      window.removeEventListener('openCreateSessionModal', handleOpenCreateSessionModal);
    };
  }, []);

  const handleCreateSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const newSession = await response.json();
      await refreshSessions(); // Refresh live data
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    updateSessionState(sessionId, newStatus);
  };

  const getThemeClasses = () => {
    return `bg-gradient-to-br ${currentTheme.gradients.background} text-${currentTheme.colors.text}`;
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <GlobalNavigation />
      
      {/* Unified Dashboard */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Simplified Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-${currentTheme.colors.primary}-500/20`}>
                <Flame className={`w-8 h-8 text-${currentTheme.colors.primary}-400`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold text-${currentTheme.colors.text}`}>
                  Fire Session Dashboard
                </h1>
                <p className={`text-sm text-${currentTheme.colors.textSecondary}`}>
                  Real-time session management with intelligent workflow automation and staff coordination.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DollarTestButton />
              <div className="flex items-center space-x-2">
                <span className={`text-sm text-${currentTheme.colors.textSecondary}`}>Role:</span>
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className={`bg-${currentTheme.colors.surface} text-${currentTheme.colors.text} text-sm font-medium px-3 py-2 rounded-lg border border-${currentTheme.colors.border} focus:outline-none focus:ring-2 focus:ring-${currentTheme.colors.primary}-500`}
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="BOH">BOH</option>
                  <option value="FOH">FOH</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <span className={`text-xs text-${currentTheme.colors.textSecondary}`}>(FOH View)</span>
              </div>
            </div>
          </div>




          {/* Error Display */}
          {error && (
            <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-200 text-sm mt-2">{error}</p>
            </div>
          )}

          {/* Session Management */}
          <EnhancedFSDDesign
            sessions={sessions}
            userRole={userRole}
            onSessionAction={(action, sessionId) => {
              if (action === 'complete') {
                handleStatusChange(sessionId, 'COMPLETED');
              } else if (action === 'pause') {
                handleStatusChange(sessionId, 'PAUSED');
              }
            }}
          />
        </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}