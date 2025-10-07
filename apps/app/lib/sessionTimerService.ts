import { Session } from '../types/session';

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  elapsedTime: number; // in seconds
  pausedDuration: number; // in seconds
}

export class SessionTimerService {
  private static instance: SessionTimerService;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: Map<string, (state: TimerState) => void> = new Map();

  static getInstance(): SessionTimerService {
    if (!SessionTimerService.instance) {
      SessionTimerService.instance = new SessionTimerService();
    }
    return SessionTimerService.instance;
  }

  /**
   * Start a timer for a session
   */
  startTimer(sessionId: string, durationMinutes: number, onUpdate: (state: TimerState) => void): void {
    this.stopTimer(sessionId); // Stop any existing timer
    
    const durationSeconds = durationMinutes * 60;
    const timerState: TimerState = {
      isRunning: true,
      isPaused: false,
      timeRemaining: durationSeconds,
      elapsedTime: 0,
      pausedDuration: 0
    };

    this.callbacks.set(sessionId, onUpdate);
    onUpdate(timerState);

    const interval = setInterval(() => {
      const currentState = this.getTimerState(sessionId);
      if (!currentState) return;

      if (currentState.isRunning && !currentState.isPaused) {
        currentState.timeRemaining = Math.max(0, currentState.timeRemaining - 1);
        currentState.elapsedTime = durationSeconds - currentState.timeRemaining;
        
        onUpdate(currentState);

        if (currentState.timeRemaining <= 0) {
          this.completeTimer(sessionId);
        }
      }
    }, 1000);

    this.timers.set(sessionId, interval);
  }

  /**
   * Pause a timer
   */
  pauseTimer(sessionId: string): void {
    const state = this.getTimerState(sessionId);
    if (state) {
      state.isPaused = true;
      state.isRunning = false;
      this.notifyUpdate(sessionId, state);
    }
  }

  /**
   * Resume a paused timer
   */
  resumeTimer(sessionId: string): void {
    const state = this.getTimerState(sessionId);
    if (state) {
      state.isPaused = false;
      state.isRunning = true;
      this.notifyUpdate(sessionId, state);
    }
  }

  /**
   * Stop a timer
   */
  stopTimer(sessionId: string): void {
    const interval = this.timers.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.timers.delete(sessionId);
    }
    this.callbacks.delete(sessionId);
  }

  /**
   * Complete a timer
   */
  private completeTimer(sessionId: string): void {
    const state = this.getTimerState(sessionId);
    if (state) {
      state.isRunning = false;
      state.isPaused = false;
      state.timeRemaining = 0;
      this.notifyUpdate(sessionId, state);
    }
    this.stopTimer(sessionId);
  }

  /**
   * Get current timer state
   */
  private getTimerState(sessionId: string): TimerState | null {
    // This would typically come from a store or database
    // For now, we'll return a mock state
    return {
      isRunning: true,
      isPaused: false,
      timeRemaining: 1800, // 30 minutes
      elapsedTime: 0,
      pausedDuration: 0
    };
  }

  /**
   * Notify callback of state update
   */
  private notifyUpdate(sessionId: string, state: TimerState): void {
    const callback = this.callbacks.get(sessionId);
    if (callback) {
      callback(state);
    }
  }

  /**
   * Calculate timer state from session data
   */
  static calculateTimerState(session: Session): TimerState {
    if (!session.timerDuration || !session.timerStartedAt) {
      return {
        isRunning: false,
        isPaused: false,
        timeRemaining: session.timerDuration ? session.timerDuration * 60 : 0,
        elapsedTime: 0,
        pausedDuration: session.timerPausedDuration || 0
      };
    }

    const now = new Date();
    const startedAt = new Date(session.timerStartedAt);
    const totalDuration = session.timerDuration * 60; // Convert to seconds
    const pausedDuration = session.timerPausedDuration || 0;
    
    let elapsedTime = 0;
    if (session.timerStatus === 'running') {
      elapsedTime = Math.floor((now.getTime() - startedAt.getTime()) / 1000) - pausedDuration;
    } else if (session.timerStatus === 'paused' && session.timerPausedAt) {
      const pausedAt = new Date(session.timerPausedAt);
      elapsedTime = Math.floor((pausedAt.getTime() - startedAt.getTime()) / 1000) - pausedDuration;
    }

    const timeRemaining = Math.max(0, totalDuration - elapsedTime);
    const isCompleted = timeRemaining <= 0;

    return {
      isRunning: session.timerStatus === 'running' && !isCompleted,
      isPaused: session.timerStatus === 'paused',
      timeRemaining,
      elapsedTime: Math.min(elapsedTime, totalDuration),
      pausedDuration
    };
  }

  /**
   * Format time in MM:SS format
   */
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get timer color based on remaining time
   */
  static getTimerColor(timeRemaining: number, totalDuration: number): string {
    const percentage = (timeRemaining / totalDuration) * 100;
    if (percentage < 10) return 'text-red-400';
    if (percentage < 25) return 'text-orange-400';
    if (percentage < 50) return 'text-yellow-400';
    return 'text-green-400';
  }
}
