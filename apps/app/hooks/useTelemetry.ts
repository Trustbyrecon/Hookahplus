"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import { telemetryService, TelemetryEvent } from '../lib/telemetryService';

export interface UseTelemetryOptions {
  component: string;
  userId?: string;
  sessionId?: string;
  tableId?: string;
  userRole?: string;
}

export const useTelemetry = (options: UseTelemetryOptions) => {
  const { component, userId, sessionId, tableId, userRole } = options;
  const startTimeRef = useRef<number>(0);

  // Track performance
  const trackPerformance = useCallback((
    action: string,
    responseTime: number,
    success: boolean,
    additionalData: Record<string, any> = {}
  ) => {
    telemetryService.trackPerformance(
      component,
      action,
      responseTime,
      success,
      additionalData,
      { userId, sessionId, tableId, userRole }
    );
  }, [component, userId, sessionId, tableId, userRole]);

  // Track user actions
  const trackUserAction = useCallback((
    action: string,
    data: Record<string, any> = {}
  ) => {
    telemetryService.trackUserAction(
      component,
      action,
      data,
      { userId, sessionId, tableId, userRole }
    );
  }, [component, userId, sessionId, tableId, userRole]);

  // Track errors
  const trackError = useCallback((
    action: string,
    error: Error | string,
    additionalData: Record<string, any> = {}
  ) => {
    telemetryService.trackError(
      component,
      action,
      error,
      additionalData,
      { userId, sessionId, tableId, userRole }
    );
  }, [component, userId, sessionId, tableId, userRole]);

  // Track API calls
  const trackApiCall = useCallback((
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    success: boolean,
    additionalData: Record<string, any> = {}
  ) => {
    telemetryService.trackApiCall(
      endpoint,
      method,
      responseTime,
      statusCode,
      success,
      additionalData,
      { userId, sessionId, tableId, userRole }
    );
  }, [userId, sessionId, tableId, userRole]);

  // Track system events
  const trackSystemEvent = useCallback((
    event: string,
    data: Record<string, any> = {}
  ) => {
    telemetryService.trackSystemEvent(
      component,
      event,
      data,
      { userId, sessionId, tableId, userRole }
    );
  }, [component, userId, sessionId, tableId, userRole]);

  // Start performance timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  // End performance timer and track
  const endTimer = useCallback((
    action: string,
    success: boolean = true,
    additionalData: Record<string, any> = {}
  ) => {
    const responseTime = Date.now() - startTimeRef.current;
    trackPerformance(action, responseTime, success, additionalData);
  }, [trackPerformance]);

  // Track component mount
  useEffect(() => {
    trackSystemEvent('component_mounted', {
      timestamp: new Date().toISOString()
    });

    return () => {
      trackSystemEvent('component_unmounted', {
        timestamp: new Date().toISOString()
      });
    };
  }, [trackSystemEvent]);

  return {
    trackPerformance,
    trackUserAction,
    trackError,
    trackApiCall,
    trackSystemEvent,
    startTimer,
    endTimer
  };
};

// Higher-order component for automatic telemetry
export const withTelemetry = <P extends object>(
  WrappedComponent: React.ComponentType<P & { telemetry?: any }>,
  componentName: string
) => {
  const TelemetryWrapper = (props: P) => {
    const telemetry = useTelemetry({ component: componentName });
    
    return React.createElement(WrappedComponent, {
      ...props,
      telemetry
    });
  };
  
  TelemetryWrapper.displayName = `withTelemetry(${componentName})`;
  return TelemetryWrapper;
};

// Hook for tracking async operations
export const useAsyncTelemetry = (options: UseTelemetryOptions) => {
  const { trackPerformance, trackError } = useTelemetry(options);

  const trackAsync = useCallback(async <T>(
    action: string,
    asyncFn: () => Promise<T>,
    additionalData: Record<string, any> = {}
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await asyncFn();
      const responseTime = Date.now() - startTime;
      
      trackPerformance(action, responseTime, true, {
        ...additionalData,
        resultType: typeof result
      });
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      trackError(action, error as Error, {
        ...additionalData,
        responseTime
      });
      
      throw error;
    }
  }, [trackPerformance, trackError]);

  return { trackAsync };
};
