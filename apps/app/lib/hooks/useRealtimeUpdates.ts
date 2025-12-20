/**
 * Real-Time Updates Hook
 * 
 * Provides real-time data updates using WebSocket with polling fallback
 * Automatically tries WebSocket first, falls back to polling if unavailable
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService } from '../services/WebSocketService';

interface UseRealtimeUpdatesOptions {
  endpoint: string;
  interval?: number; // Polling interval in milliseconds (default: 5000)
  enabled?: boolean;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeUpdates<T = any>({
  endpoint,
  interval = 5000,
  enabled = true,
  onUpdate,
  onError
}: UseRealtimeUpdatesOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setIsConnected(true);
      onUpdate?.(result);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsConnected(false);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled, onUpdate, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchData();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, interval, fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isConnected,
    refresh,
  };
}

/**
 * Enhanced WebSocket hook for real-time updates
 * Uses WebSocketService for connection management
 */
export function useWebSocketUpdates<T = any>({
  channel,
  enabled = true,
  onMessage,
  onError,
  onOpen,
  onClose,
  fallbackToPolling = true,
  pollingEndpoint,
  pollingInterval = 5000,
}: {
  channel: string;
  enabled?: boolean;
  onMessage?: (data: T) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  fallbackToPolling?: boolean;
  pollingEndpoint?: string;
  pollingInterval?: number;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket service
  useEffect(() => {
    if (typeof window === 'undefined') return; // Server-side rendering

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}/api/ws`;
    
    wsServiceRef.current = WebSocketService.getInstance(wsUrl);

    return () => {
      if (subscriptionIdRef.current && wsServiceRef.current) {
        wsServiceRef.current.unsubscribe(subscriptionIdRef.current);
      }
    };
  }, []);

  // Set up WebSocket connection and subscription
  useEffect(() => {
    if (!enabled || !wsServiceRef.current || usePolling) return;

    const wsService = wsServiceRef.current;

    // Subscribe to channel
    subscriptionIdRef.current = wsService.subscribe(
      channel,
      (messageData: T) => {
        setData(messageData);
        onMessage?.(messageData);
      },
      (error: Error) => {
        console.error('[useWebSocketUpdates] Error:', error);
        if (fallbackToPolling && pollingEndpoint) {
          console.log('[useWebSocketUpdates] Falling back to polling');
          setUsePolling(true);
        }
        onError?.(error);
      }
    );

    // Set up connection handlers
    const handleOpen = () => {
      setIsConnected(true);
      setUsePolling(false);
      onOpen?.();
    };

    const handleClose = () => {
      setIsConnected(false);
      if (fallbackToPolling && pollingEndpoint) {
        setUsePolling(true);
      }
      onClose?.();
    };

    const handleError = (error: Error) => {
      if (fallbackToPolling && pollingEndpoint) {
        setUsePolling(true);
      }
      onError?.(error);
    };

    wsService.onOpen(handleOpen);
    wsService.onClose(handleClose);
    wsService.onError(handleError);

    // Try to connect
    wsService.connect().catch((error) => {
      console.error('[useWebSocketUpdates] Failed to connect:', error);
      if (fallbackToPolling && pollingEndpoint) {
        setUsePolling(true);
      }
    });

    return () => {
      wsService.removeOnOpen(handleOpen);
      wsService.removeOnClose(handleClose);
      wsService.removeOnError(handleError);
      
      if (subscriptionIdRef.current) {
        wsService.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [channel, enabled, usePolling, fallbackToPolling, pollingEndpoint, onMessage, onError, onOpen, onClose]);

  // Fallback to polling if WebSocket fails
  useEffect(() => {
    if (!enabled || !usePolling || !pollingEndpoint) return;

    const fetchData = async () => {
      try {
        const response = await fetch(pollingEndpoint);
        if (response.ok) {
          const result = await response.json();
          setData(result);
          onMessage?.(result);
        }
      } catch (error) {
        console.error('[useWebSocketUpdates] Polling error:', error);
        onError?.(error instanceof Error ? error : new Error('Polling failed'));
      }
    };

    fetchData();
    pollingIntervalRef.current = setInterval(fetchData, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, usePolling, pollingEndpoint, pollingInterval, onMessage, onError]);

  const send = useCallback((message: any) => {
    if (wsServiceRef.current?.isConnected) {
      wsServiceRef.current.send(message);
    } else {
      console.warn('[useWebSocketUpdates] Cannot send: not connected');
    }
  }, []);

  return {
    data,
    isConnected: usePolling ? false : isConnected,
    send,
    usePolling,
  };
}

/**
 * Unified real-time hook that tries WebSocket first, falls back to polling
 */
export function useUnifiedRealtimeUpdates<T = any>({
  endpoint,
  channel,
  interval = 5000,
  enabled = true,
  onUpdate,
  onError,
  preferWebSocket = true,
}: {
  endpoint: string;
  channel?: string;
  interval?: number;
  enabled?: boolean;
  onUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
  preferWebSocket?: boolean;
}) {
  const [useWebSocket, setUseWebSocket] = useState(preferWebSocket);
  
  // Try WebSocket first if enabled and channel provided
  const wsResult = useWebSocketUpdates<T>({
    channel: channel || endpoint.replace(/^\//, '').replace(/\//g, '-'),
    enabled: enabled && useWebSocket && !!channel,
    onMessage: (data) => {
      onUpdate?.(data);
    },
    onError: (error) => {
      console.warn('[useUnifiedRealtimeUpdates] WebSocket failed, falling back to polling:', error);
      setUseWebSocket(false);
      onError?.(error);
    },
    fallbackToPolling: true,
    pollingEndpoint: endpoint,
    pollingInterval: interval,
  });

  // Fallback to polling
  const pollingResult = useRealtimeUpdates<T>({
    endpoint,
    interval,
    enabled: enabled && !useWebSocket,
    onUpdate,
    onError,
  });

  return useWebSocket && wsResult.isConnected ? {
    ...wsResult,
    loading: false,
    refresh: () => wsResult.send({ type: 'refresh', channel: channel || endpoint }),
  } : {
    ...pollingResult,
    usePolling: true,
  };
}

