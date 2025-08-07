'use client';

import React from 'react';
import { reflex } from '../lib/reflex';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    try {
      reflex?.logEvent?.('error_boundary_triggered', {
        error: String(error),
        info,
      });
    } catch (e) {
      console.warn('Reflex failed to load, using fallback.', e);
    }
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-ember">
          Something went wrong while loading the interface.
        </div>
      );
    }

    return this.props.children;
  }
}
