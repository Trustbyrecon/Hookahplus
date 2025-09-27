"use client";

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, Clock, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { SessionNotes } from '../types/session';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionNotes: SessionNotes[];
  onAddNote: (sessionId: string, note: string, type: SessionNotes['type']) => void;
}

const noteTypes = [
  { value: 'general', label: 'General', icon: <MessageSquare className="w-4 h-4" />, color: 'text-blue-400' },
  { value: 'issue', label: 'Issue', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400' },
  { value: 'resolution', label: 'Resolution', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
  { value: 'customer_request', label: 'Customer Request', icon: <Star className="w-4 h-4" />, color: 'text-yellow-400' }
];

export default function SessionNotesModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  sessionNotes, 
  onAddNote 
}: SessionNotesModalProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<SessionNotes['type']>('general');
  const [author, setAuthor] = useState('Current User'); // In real app, get from auth context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(sessionId, newNote.trim(), noteType);
      setNewNote('');
      setNoteType('general');
    }
  };

  const getNoteTypeIcon = (type: SessionNotes['type']) => {
    const noteType = noteTypes.find(nt => nt.value === type);
    return noteType?.icon || <MessageSquare className="w-4 h-4" />;
  };

  const getNoteTypeColor = (type: SessionNotes['type']) => {
    const noteType = noteTypes.find(nt => nt.value === type);
    return noteType?.color || 'text-blue-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-teal-400" />
            Session Notes
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-6">
            {sessionNotes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No notes yet. Add the first note below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div key={note.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`${getNoteTypeColor(note.type)}`}>
                          {getNoteTypeIcon(note.type)}
                        </div>
                        <span className="text-sm font-medium text-zinc-300">
                          {note.author}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full text-zinc-400">
                        {note.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Note Form */}
          <div className="border-t border-zinc-800 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Note Type Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Note Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {noteTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNoteType(type.value as SessionNotes['type'])}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        noteType === type.value
                          ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                          : 'border-zinc-600 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={type.color}>
                          {type.icon}
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Add Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Add a note about this session..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
