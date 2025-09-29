"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Flag, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  User,
  Zap
} from 'lucide-react';
import { SessionNotes as SessionNotesComponent, SessionNote } from './SessionNotes';
import { FlagManager } from './FlagManager';
import { ResolutionNotes } from './ResolutionNotes';
import { RoleBasedActions } from './RoleBasedActions';
import { Session } from '../types/session';

interface OptimizedSessionCardProps {
  session: Session;
  userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  sessionNotes: SessionNote[];
  sessionFlags: any[];
  onStateChange: (sessionId: string, transition: string, note?: string, edge?: string) => void;
  onAddNote: (note: SessionNote) => void;
  onUpdateNote: (noteId: string, updates: Partial<SessionNote>) => void;
  onDeleteNote: (noteId: string) => void;
  onFlagIssue: (type: string, severity: string, description: string) => void;
  onResolveFlag: (flagId: string, resolution: string, customerCompensation?: string) => void;
}

export function OptimizedSessionCard({
  session,
  userRole,
  sessionNotes,
  sessionFlags,
  onStateChange,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onFlagIssue,
  onResolveFlag
}: OptimizedSessionCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showFlags, setShowFlags] = useState(false);
  const [showResolutionNotes, setShowResolutionNotes] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const sessionNotesForThisSession = sessionNotes.filter(note => note.sessionId === session.id);
  const sessionFlagsForThisSession = sessionFlags.filter(flag => flag.sessionId === session.id);
  const hasNotes = sessionNotesForThisSession.length > 0;
  const hasFlags = sessionFlagsForThisSession.length > 0;
  const hasResolutionNotes = sessionFlagsForThisSession.some(flag => flag.status === 'resolved');

  const getStatusBadge = (status: string, statusColor: string, statusIcon: string) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{statusIcon}</span>
        <span className={`${statusColor} text-white text-sm font-bold px-3 py-1 rounded-full`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>
    );
  };

  const getNotesPreview = () => {
    if (!hasNotes) return null;
    const latestNote = sessionNotesForThisSession[sessionNotesForThisSession.length - 1];
    return (
      <div className="text-xs text-zinc-400 truncate max-w-32">
        {latestNote.content.substring(0, 30)}...
      </div>
    );
  };

  const getFlagsPreview = () => {
    if (!hasFlags) return null;
    const openFlags = sessionFlagsForThisSession.filter(flag => flag.status === 'open');
    const resolvedFlags = sessionFlagsForThisSession.filter(flag => flag.status === 'resolved');
    
    return (
      <div className="flex items-center space-x-1">
        {openFlags.length > 0 && (
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400">{openFlags.length}</span>
          </div>
        )}
        {resolvedFlags.length > 0 && (
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">{resolvedFlags.length}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="session-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">
            {session.team === 'BOH' ? '👨‍🍳' : session.team === 'FOH' ? '🚚' : '⚠️'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-400">
              Table {session.tableId}
            </h3>
            <p className="text-zinc-400">{session.customerRef} - {session.flavor}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full text-zinc-300">
                {session.team}
              </span>
              <span className="text-xs text-zinc-500">{session.created}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(session.state, session.statusColor || 'bg-gray-500', session.statusIcon || '❓')}
          <div className="text-lg font-semibold text-white mt-1">
            ${(session.priceCents / 100).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Assigned BOH:</label>
          <div className="text-sm text-zinc-300">{session.assignedBOH}</div>
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Assigned FOH:</label>
          <div className="text-sm text-zinc-300">{session.assignedFOH}</div>
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Notes:</label>
          <div className="text-sm text-zinc-300">{session.notes}</div>
        </div>
      </div>

      {/* Compact Notes and Flags Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          {/* Notes Section */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onMouseEnter={() => setHoveredSection('notes')}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => setShowNotes(!showNotes)}
          >
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm text-zinc-400 group-hover:text-blue-400 transition-colors">Notes</span>
              {hasNotes && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {sessionNotesForThisSession.length}
                </span>
              )}
            </div>
            {hasNotes && getNotesPreview()}
            {hasNotes && (
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showNotes ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Flags Section */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onMouseEnter={() => setHoveredSection('flags')}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => setShowFlags(!showFlags)}
          >
            <div className="flex items-center space-x-1">
              <Flag className="w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-sm text-zinc-400 group-hover:text-orange-400 transition-colors">Flags</span>
              {hasFlags && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {sessionFlagsForThisSession.length}
                </span>
              )}
            </div>
            {hasFlags && getFlagsPreview()}
            {hasFlags && (
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showFlags ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Resolution Notes Section */}
          {hasResolutionNotes && (
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onMouseEnter={() => setHoveredSection('resolution')}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => setShowResolutionNotes(!showResolutionNotes)}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-green-400 transition-colors" />
                <span className="text-sm text-zinc-400 group-hover:text-green-400 transition-colors">Resolved</span>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {sessionFlagsForThisSession.filter(flag => flag.status === 'resolved').length}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showResolutionNotes ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>

        {/* Hover Tooltips */}
        {hoveredSection === 'notes' && (
          <div className="absolute z-10 mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-xs text-zinc-300">
              {hasNotes ? `${sessionNotesForThisSession.length} notes` : 'No notes yet'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Click to {showNotes ? 'hide' : 'view'} notes
            </div>
          </div>
        )}

        {hoveredSection === 'flags' && (
          <div className="absolute z-10 mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-xs text-zinc-300">
              {hasFlags ? `${sessionFlagsForThisSession.length} flags` : 'No flags yet'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Click to {showFlags ? 'hide' : 'view'} flags
            </div>
          </div>
        )}

        {hoveredSection === 'resolution' && (
          <div className="absolute z-10 mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg">
            <div className="text-xs text-zinc-300">
              {sessionFlagsForThisSession.filter(flag => flag.status === 'resolved').length} resolved issues
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Click to {showResolutionNotes ? 'hide' : 'view'} resolutions
            </div>
          </div>
        )}
      </div>

      {/* Expandable Notes Section */}
      {showNotes && (
        <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-zinc-300">Session Notes</h4>
            <button
              onClick={() => setShowNotes(false)}
              className="text-zinc-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <SessionNotesComponent
            sessionId={session.id}
            notes={sessionNotesForThisSession}
            onNoteAdded={onAddNote}
            onNoteUpdated={(noteId, content) => onUpdateNote(noteId, { content })}
            onNoteDeleted={onDeleteNote}
          />
        </div>
      )}

      {/* Expandable Flags Section */}
      {showFlags && (
        <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-zinc-300">Session Flags</h4>
            <button
              onClick={() => setShowFlags(false)}
              className="text-zinc-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <FlagManager
            sessionId={session.id}
            onFlagCreated={(flag) => console.log('Flag created:', flag)}
            onFlagResolved={(flagId) => console.log('Flag resolved:', flagId)}
          />
        </div>
      )}

      {/* Expandable Resolution Notes Section */}
      {showResolutionNotes && hasResolutionNotes && (
        <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-zinc-300">Resolution Notes</h4>
            <button
              onClick={() => setShowResolutionNotes(false)}
              className="text-zinc-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <ResolutionNotes
            sessionId={session.id}
            sessionState={session.state}
            onResolutionAdded={(resolution) => console.log('Resolution added:', resolution)}
            onResumeSession={() => {
              // Resume session logic - move back to active state
              onStateChange(session.id, 'RESUME', 'Session resumed after issue resolution');
              setShowResolutionNotes(false);
            }}
          />
        </div>
      )}

      {/* Role-Based Actions */}
      <RoleBasedActions
        session={session}
        userRole={userRole}
        onStateChange={onStateChange}
        onFlagIssue={onFlagIssue}
      />
    </div>
  );
}
