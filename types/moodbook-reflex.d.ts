declare module 'moodbook-reflex' {
  export interface ReflexScore {
    score: number;
    timestamp: string;
    category: 'ui' | 'ux' | 'performance' | 'accessibility';
    details: string;
  }

  export interface MoodbookReflexPanelProps {
    initialScore?: number;
    showLogPreview?: boolean;
    enableOnboarding?: boolean;
    threshold?: number;
    className?: string;
    onScoreUpdate?: (score: number) => void;
    onOnboardingComplete?: () => void;
  }

  export interface ReflexScoreUpdate {
    score: number;
    previousScore: number;
    timestamp: string;
    source: 'manual' | 'automated' | 'ci-cd';
  }

  export interface OnboardingState {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    progress: number;
    completed: boolean;
  }

  export interface ReflexPanelContext {
    currentScore: number;
    threshold: number;
    isOnboarding: boolean;
    logs: ReflexScore[];
    updateScore: (score: number) => void;
    startOnboarding: () => void;
    completeOnboarding: () => void;
  }
}

// Global type declarations for reflex scoring
declare global {
  interface Window {
    __REFLEX_SCORE__?: number;
    __REFLEX_THRESHOLD__?: number;
    __REFLEX_ONBOARDING__?: boolean;
  }

  namespace NodeJS {
    interface ProcessEnv {
      REFLEX_SCORE_THRESHOLD?: string;
      REFLEX_ENABLE_ONBOARDING?: string;
      REFLEX_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
    }
  }
}

export {};
