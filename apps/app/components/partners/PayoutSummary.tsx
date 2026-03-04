"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DollarSign, Download, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react";

interface PayoutData {
  id: string;
  period: string;
  gross: number;
  revSharePct: number;
  net: number;
  status: 'paid' | 'pending';
  createdAt: string;
  paidAt?: string;
}

interface PayoutSummaryProps {
  partnerId: string;
}

export default function PayoutSummary({ partnerId }: PayoutSummaryProps) {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [summary, setSummary] = useState({
    totalGross: 0,
    totalNet: 0,
    totalPayouts: 0,
    nextPayout: null as PayoutData | null
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchPayouts = useCallback(async () => {
    try {
      const response = await fetch(`/api/partners/${partnerId}/payouts`);
      const data = await response.json();
      
      if (data.success) {
        setPayouts(data.payouts);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_${partnerId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-neutral-700 rounded"></div>
              <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Earnings</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.totalNet)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(summary.totalGross)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Payouts</p>
                <p className="text-2xl font-bold text-purple-400">
                  {summary.totalPayouts}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Payout History</CardTitle>
          <Button 
            onClick={handleExportCSV}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="border-neutral-600"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">No payouts yet</p>
            ) : (
              payouts.map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {payout.status === 'paid' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                      <span className="font-medium">{payout.period}</span>
                    </div>
                    <div className="text-sm text-neutral-400">
                      {payout.gross.toLocaleString()} × {payout.revSharePct}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(payout.net)}
                    </div>
                    <div className="text-sm text-neutral-400 capitalize">
                      {payout.status}
                      {payout.paidAt && (
                        <span className="ml-2">
                          • {formatDate(payout.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Payout */}
      {summary.nextPayout && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">Next Payout</h3>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(summary.nextPayout.net)}
                </p>
                <p className="text-sm text-neutral-400">
                  Period: {summary.nextPayout.period}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
