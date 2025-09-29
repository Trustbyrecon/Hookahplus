"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Edit3, Trash2, User, Clock } from "lucide-react";
import Button from "./Button";

export interface SessionNote {
  id: string;
  sessionId: string;
  content: string;
  author: string;
  type: 'general' | 'customer' | 'staff' | 'equipment' | 'payment';
  createdAt: Date;
  updatedAt?: Date;
}

interface SessionNotesProps {
  sessionId: string;
  notes: SessionNote[];
  onNoteAdded?: (note: SessionNote) => void;
  onNoteUpdated?: (noteId: string, content: string) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export function SessionNotes({ 
  sessionId, 
  notes, 
  onNoteAdded, 
  onNoteUpdated, 
  onNoteDeleted 
}: SessionNotesProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general' as SessionNote['type']
  });

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;

    const note: SessionNote = {
      id: `note_${Date.now()}`,
      sessionId,
      content: newNote.content,
      author: 'Current User',
      type: newNote.type,
      createdAt: new Date()
    };

    onNoteAdded?.(note);
    setNewNote({ content: '', type: 'general' });
    setShowAddNote(false);
  };

  const handleUpdateNote = (noteId: string, content: string) => {
    onNoteUpdated?.(noteId, content);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    onNoteDeleted?.(noteId);
  };

  const getTypeColor = (type: SessionNote['type']) => {
    switch (type) {
      case 'customer': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'staff': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'equipment': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'payment': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getTypeIcon = (type: SessionNote['type']) => {
    switch (type) {
      case 'customer': return '👤';
      case 'staff': return '👥';
      case 'equipment': return '🔧';
      case 'payment': return '💳';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-3">
      {/* Notes Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Notes ({notes.length})</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddNote(true)}
          className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-4 text-zinc-500">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No notes yet</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                    <span className="mr-1">{getTypeIcon(note.type)}</span>
                    {note.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingNote(note.id)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {editingNote === note.id ? (
                <div className="space-y-2">
                  <textarea
                    defaultValue={note.content}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded text-white text-sm resize-none"
                    rows={2}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== note.content) {
                        handleUpdateNote(note.id, e.target.value.trim());
                      }
                      setEditingNote(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleUpdateNote(note.id, e.currentTarget.value.trim());
                        setEditingNote(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingNote(null);
                      }
                    }}
                    autoFocus
                  />
                  <p className="text-xs text-zinc-500">Ctrl+Enter to save, Esc to cancel</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 mb-2">{note.content}</p>
              )}

              <div className="flex items-center space-x-3 text-xs text-zinc-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{note.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{note.createdAt.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-4 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Note</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddNote(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Note Type</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as SessionNote['type'] }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                >
                  <option value="general">General</option>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="equipment">Equipment</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Add your note..."
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddNote(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.content.trim()}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
