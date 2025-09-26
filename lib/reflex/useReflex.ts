import { useState, useCallback, useRef } from 'react';
import type { ReflexContext, EnrichmentFingerprint } from '../../types/reflex';
import { createReflexLayer, quickReflexCheck } from './index';

interface UseReflexOptions {
  context: ReflexContext;
  autoCheck?: boolean;
  threshold?: number;
}

interface ReflexState {
  isProcessing: boolean;
  lastScore: number | null;
  lastAction: 'proceed' | 'recover' | 'halt' | null;
  lastReason: string | null;
  lastFingerprint: EnrichmentFingerprint | null;
  error: string | null;
}

/**
 * React hook for using the Reflex Layer in components
 */
export function useReflex(options: UseReflexOptions) {
  const { context, autoCheck = true, threshold = 0.87 } = options;
  const reflexLayerRef = useRef(createReflexLayer(context));
  
  const [state, setState] = useState<ReflexState>({
    isProcessing: false,
    lastScore: null,
    lastAction: null,
    lastReason: null,
    lastFingerprint: null,
    error: null
  });

  const checkOutput = useCallback(async (
    output: string | object | null,
    expectedType?: 'text' | 'json' | 'code' | 'tool'
  ) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await reflexLayerRef.current.processOutput(output, expectedType);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastScore: result.score,
        lastAction: result.action,
        lastReason: result.reason,
        lastFingerprint: result.fingerprint
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, []);

  const quickCheck = useCallback(async (
    output: string | object | null
  ): Promise<boolean> => {
    try {
      return await quickReflexCheck(output, context.route, context.action, context.domain);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Quick check failed'
      }));
      return false;
    }
  }, [context]);

  const getSystemHealth = useCallback(() => {
    return reflexLayerRef.current.getSystemHealth();
  }, []);

  const getNodesNeedingAttention = useCallback(() => {
    return reflexLayerRef.current.getNodesNeedingAttention();
  }, []);

  const getNodeReliability = useCallback((nodeId: string) => {
    return reflexLayerRef.current.getNodeReliability(nodeId);
  }, []);

  return {
    ...state,
    checkOutput,
    quickCheck,
    getSystemHealth,
    getNodesNeedingAttention,
    getNodeReliability,
    isHealthy: state.lastScore === null || state.lastScore >= threshold,
    needsAttention: state.lastScore !== null && state.lastScore < threshold
  };
}

/**
 * Hook for monitoring system health across the application
 */
export function useReflexHealth() {
  const [health, setHealth] = useState({
    averageReliability: 0.5,
    unreliableCount: 0,
    totalNodes: 0,
    healthScore: 0.5
  });

  const [nodesNeedingAttention, setNodesNeedingAttention] = useState<any[]>([]);

  const refreshHealth = useCallback(() => {
    // In a real implementation, this would fetch from a global health service
    // For now, we'll use a mock implementation
    const mockHealth = {
      averageReliability: 0.85,
      unreliableCount: 2,
      totalNodes: 15,
      healthScore: 0.82
    };
    
    const mockNodes = [
      {
        id: 'api/payments:process',
        type: 'route',
        reliability: 0.65,
        lastUpdated: new Date().toISOString(),
        failureCount: 3,
        successCount: 7,
        dependencies: []
      }
    ];

    setHealth(mockHealth);
    setNodesNeedingAttention(mockNodes);
  }, []);

  return {
    health,
    nodesNeedingAttention,
    refreshHealth,
    isHealthy: health.healthScore >= 0.8,
    needsAttention: health.unreliableCount > 0
  };
}
