"use client";

/**
 * Reconciliation Dashboard
 * 
 * Agent: Noor
 * Objective: O1.5 - Metrics & Reporting
 * 
 * Dashboard to track reconciliation rate over time and alert on < 95%
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/Card';

interface ReconciliationMetrics {
  reconciliationRate: number;
  pricingParity: number;
  totalPosTickets: number;
  totalStripeCharges: number;
  matched: number;
  orphanedPosTickets: number;
  orphanedStripeCharges: number;
  recentReconciliations: Array<{
    id: string;
    stripeChargeId?: string;
    posTicketId?: string;
    amount?: number;
    status: string;
    createdAt: string;
  }>;
}

export default function ReconciliationDashboard() {
  const [metrics, setMetrics] = useState<ReconciliationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/pos/reconcile');
      if (!response.ok) {
        throw new Error('Failed to fetch reconciliation metrics');
      }

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runReconciliation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pos/reconcile', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run reconciliation');
      }

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading reconciliation metrics...</p>
        </div>
      </div>
    );
  }

  const reconciliationRate = metrics?.reconciliationRate || 0;
  const pricingParity = metrics?.pricingParity || 0;
  const meetsTarget = reconciliationRate >= 0.95;
  const parityMeetsTarget = pricingParity >= 0.99;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">POS Reconciliation Dashboard</h1>
          <p className="text-xl text-zinc-400">Monitor Stripe ↔ POS ticket matching</p>
        </div>

        {/* Status Banner */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {meetsTarget ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {meetsTarget ? 'POS Sync Ready ✅' : 'POS Sync Not Ready ⚠️'}
                </h2>
                <p className="text-zinc-400">
                  {meetsTarget
                    ? 'Reconciliation rate meets target (≥95%)'
                    : 'Reconciliation rate below target (<95%)'}
                </p>
              </div>
            </div>
            <button
              onClick={runReconciliation}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Reconciliation'}
            </button>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reconciliation Rate</h3>
              {meetsTarget ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <div className="text-3xl font-bold mb-2">
              {(reconciliationRate * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-zinc-400">
              Target: ≥95% | Status: {meetsTarget ? '✅ PASS' : '❌ FAIL'}
            </div>
            <div className="mt-4 w-full bg-zinc-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  meetsTarget ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(reconciliationRate * 100, 100)}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pricing Parity</h3>
              {parityMeetsTarget ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <div className="text-3xl font-bold mb-2">
              {(pricingParity * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-zinc-400">
              Target: ≥99% | Status: {parityMeetsTarget ? '✅ PASS' : '❌ FAIL'}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Matches</h3>
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold mb-2">{metrics?.matched || 0}</div>
            <div className="text-sm text-zinc-400">
              {metrics?.totalPosTickets || 0} POS tickets | {metrics?.totalStripeCharges || 0} Stripe charges
            </div>
          </Card>
        </div>

        {/* Orphaned Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Orphaned Stripe Charges</h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {metrics?.orphanedStripeCharges || 0}
            </div>
            <p className="text-sm text-zinc-400">
              Stripe charges without matching POS tickets
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Orphaned POS Tickets</h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {metrics?.orphanedPosTickets || 0}
            </div>
            <p className="text-sm text-zinc-400">
              POS tickets without matching Stripe charges
            </p>
          </Card>
        </div>

        {/* Recent Reconciliations */}
        {metrics?.recentReconciliations && metrics.recentReconciliations.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reconciliations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Stripe Charge</th>
                    <th className="text-left py-2">POS Ticket</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-left py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentReconciliations.map((rec) => (
                    <tr key={rec.id} className="border-b border-zinc-800">
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            rec.status === 'matched'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {rec.stripeChargeId || 'N/A'}
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {rec.posTicketId || 'N/A'}
                      </td>
                      <td className="py-2 text-right">
                        {rec.amount ? `$${(rec.amount / 100).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="py-2 text-zinc-400">
                        {new Date(rec.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-6 bg-red-500/20 border-red-500">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

