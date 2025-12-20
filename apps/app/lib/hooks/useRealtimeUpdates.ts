/**
 * Real-Time Updates Hook
 * 
 * Provides real-time data updates using polling or WebSocket
 * Falls back to polling if WebSocket is not available
 */

import { useEffect, useRef, useState, useCallback } from 'react';

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
 * WebSocket hook for real-time updates (future implementation)
 */
export function useWebSocketUpdates<T = any>({
  url,
  enabled = true,
  onMessage,
  onError,
  onOpen,
  onClose,
}: {
  url: string;
  enabled?: boolean;
  onMessage?: (data: T) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          setData(result);
          onMessage?.(result);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        const err = new Error('WebSocket error');
        onError?.(err);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onClose?.();
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create WebSocket');
      onError?.(error);
    }
  }, [url, enabled, onMessage, onError, onOpen, onClose]);

  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    data,
    isConnected,
    send,
  };
}

