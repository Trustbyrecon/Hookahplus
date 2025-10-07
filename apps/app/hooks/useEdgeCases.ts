"use client";

import { useState, useEffect, useCallback } from 'react';
import { EdgeCase } from '../components/EdgeCaseDrawer';

export const useEdgeCases = () => {
  const [activeEdgeCases, setActiveEdgeCases] = useState<EdgeCase[]>([]);
  const [resolvedEdgeCases, setResolvedEdgeCases] = useState<EdgeCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active edge cases
  const fetchActiveEdgeCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/edge?severity=all');
      const data = await response.json();
      
      if (data.success) {
        const edgeCases = data.data.map((item: any) => ({
          id: item.id,
          type: item.edgeCase,
          severity: 'medium' as const, // Default severity
          description: item.edgeNote || 'No description',
          reportedBy: 'System',
          sessionId: item.id,
          tableId: item.tableId,
          status: 'open' as const,
          createdAt: new Date(item.createdAt)
        }));
        setActiveEdgeCases(edgeCases);
      } else {
        setError(data.error || 'Failed to fetch edge cases');
      }
    } catch (err) {
      setError('Failed to fetch edge cases');
      console.error('Edge cases fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Report new edge case
  const reportEdgeCase = useCallback(async (edgeCaseData: Omit<EdgeCase, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          data: {
            sessionId: edgeCaseData.sessionId || 'unknown',
            edgeCase: edgeCaseData.type,
            description: edgeCaseData.description,
            severity: edgeCaseData.severity,
            reportedBy: edgeCaseData.reportedBy,
            tableId: edgeCaseData.tableId
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add to active cases
        const newEdgeCase: EdgeCase = {
          ...edgeCaseData,
          id: `edge_${Date.now()}`,
          createdAt: new Date(),
          status: 'open'
        };
        setActiveEdgeCases(prev => [newEdgeCase, ...prev]);
        
        // Log to GhostLog
        try {
          await fetch('/api/ghost-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              kind: 'edge_case_reported',
              edgeCaseId: newEdgeCase.id,
              type: edgeCaseData.type,
              severity: edgeCaseData.severity,
              tableId: edgeCaseData.tableId,
              reportedBy: edgeCaseData.reportedBy
            })
          });
        } catch (logError) {
          console.warn('Failed to log edge case to GhostLog:', logError);
        }
        
        return newEdgeCase;
      } else {
        throw new Error(data.error || 'Failed to report edge case');
      }
    } catch (err) {
      console.error('Failed to report edge case:', err);
      throw err;
    }
  }, []);

  // Resolve edge case
  const resolveEdgeCase = useCallback(async (edgeCaseId: string, resolution: string) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resolve',
          data: {
            sessionId: edgeCaseId,
            resolution,
            resolvedBy: 'Staff'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Move from active to resolved
        setActiveEdgeCases(prev => {
          const edgeCase = prev.find(ec => ec.id === edgeCaseId);
          if (edgeCase) {
            const resolvedCase = {
              ...edgeCase,
              status: 'resolved' as const,
              resolvedAt: new Date(),
              resolution
            };
            setResolvedEdgeCases(prev => [resolvedCase, ...prev]);
            return prev.filter(ec => ec.id !== edgeCaseId);
          }
          return prev;
        });

        // Log to GhostLog
        try {
          await fetch('/api/ghost-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              kind: 'edge_case_resolved',
              edgeCaseId,
              resolution,
              resolvedBy: 'Staff'
            })
          });
        } catch (logError) {
          console.warn('Failed to log edge case resolution to GhostLog:', logError);
        }
      } else {
        throw new Error(data.error || 'Failed to resolve edge case');
      }
    } catch (err) {
      console.error('Failed to resolve edge case:', err);
      throw err;
    }
  }, []);

  // Escalate edge case
  const escalateEdgeCase = useCallback(async (edgeCaseId: string, reason: string) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'escalate',
          data: {
            sessionId: edgeCaseId,
            escalationReason: reason,
            escalatedBy: 'Staff',
            priority: 'high'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update edge case status
        setActiveEdgeCases(prev => 
          prev.map(ec => 
            ec.id === edgeCaseId 
              ? { ...ec, status: 'escalated' as const }
              : ec
          )
        );

        // Log to GhostLog
        try {
          await fetch('/api/ghost-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              kind: 'edge_case_escalated',
              edgeCaseId,
              reason,
              escalatedBy: 'Staff'
            })
          });
        } catch (logError) {
          console.warn('Failed to log edge case escalation to GhostLog:', logError);
        }
      } else {
        throw new Error(data.error || 'Failed to escalate edge case');
      }
    } catch (err) {
      console.error('Failed to escalate edge case:', err);
      throw err;
    }
  }, []);

  // Load edge cases on mount
  useEffect(() => {
    fetchActiveEdgeCases();
  }, [fetchActiveEdgeCases]);

  return {
    activeEdgeCases,
    resolvedEdgeCases,
    loading,
    error,
    reportEdgeCase,
    resolveEdgeCase,
    escalateEdgeCase,
    refetch: fetchActiveEdgeCases
  };
};
