/**
 * Event System Entry Point
 * Phase 3: Night After Night Engine - Event System
 * 
 * Exports all event system components
 */

export * from './types';
export * from './queue';
export * from './workers';
export * from './store';

// Re-export for convenience
export { eventQueue, publishEvent } from './queue';
export { eventStore } from './store';
export { initializeWorkers } from './workers';

