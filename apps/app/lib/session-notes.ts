/**
 * Session Notes Helper Functions
 * Provides utilities for filtering and managing staff-only notes
 */

import { SessionNote } from '@prisma/client';

/**
 * Staff-only note types that should never be exposed to customers
 */
const STAFF_ONLY_NOTE_TYPES = [
  'STAFF_OBSERVATION',
  'ISSUE',
  'BEHAVIOR',
  // PREFERENCE can be shared with customers if needed
];

/**
 * Check if a note type is staff-only
 */
export function isStaffOnlyNote(noteType: string): boolean {
  return STAFF_ONLY_NOTE_TYPES.includes(noteType);
}

/**
 * Filter out staff-only notes from a list
 * Use this in all customer-facing endpoints
 */
export function filterStaffNotes<T extends { noteType?: string }>(
  notes: T[]
): T[] {
  if (!notes || !Array.isArray(notes)) {
    return [];
  }
  
  return notes.filter(note => {
    // If noteType is not defined, assume it's staff-only (safe default)
    if (!note.noteType) {
      return false;
    }
    
    // Filter out staff-only note types
    return !isStaffOnlyNote(note.noteType);
  });
}

/**
 * Remove notes field from session object
 * Use this to ensure notes are never accidentally included
 */
export function removeNotesFromSession<T extends { notes?: any; [key: string]: any }>(
  session: T
): Omit<T, 'notes'> {
  const { notes, ...sessionWithoutNotes } = session;
  return sessionWithoutNotes;
}

/**
 * Remove SessionNote relations from Prisma query result
 */
export function sanitizeSessionForCustomer(session: any): any {
  if (!session) {
    return session;
  }
  
  // Remove notes relation if present
  if (session.notes) {
    const { notes, ...rest } = session;
    return rest;
  }
  
  // Remove tableNotes if it contains staff-only information
  // Note: tableNotes is a string field on Session, not a relation
  // We'll keep it but ensure it's not exposed in customer endpoints
  
  return session;
}

/**
 * Verify that a response object doesn't contain staff notes
 * Use this in tests or validation
 */
export function verifyNoStaffNotes(data: any): boolean {
  if (!data) {
    return true;
  }
  
  // Check if notes array exists and contains staff-only notes
  if (Array.isArray(data.notes)) {
    const hasStaffNotes = data.notes.some((note: any) => 
      note.noteType && isStaffOnlyNote(note.noteType)
    );
    if (hasStaffNotes) {
      return false;
    }
  }
  
  // Check nested objects
  if (typeof data === 'object') {
    for (const key in data) {
      if (key === 'notes' && Array.isArray(data[key])) {
        const hasStaffNotes = data[key].some((note: any) => 
          note.noteType && isStaffOnlyNote(note.noteType)
        );
        if (hasStaffNotes) {
          return false;
        }
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        if (!verifyNoStaffNotes(data[key])) {
          return false;
        }
      }
    }
  }
  
  return true;
}

