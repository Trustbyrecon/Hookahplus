"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QrCode, Clock, MapPin, Sparkles, DollarSign, User, Calendar, AlertCircle, ArrowLeft, Wrench, Printer } from 'lucide-react';
import GlobalNavigation from '../../../../components/GlobalNavigation';
import Card from '../../../../components/Card';
import Button from '../../../../components/Button';
import Link from 'next/link';

interface Session {
  id: string;
  loungeId?: string;
  tableId?: string;
  table_id?: string;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string;
  flavorMix?: string;
  flavor?: string;
  priceCents?: number;
  price_cents?: number;
  state?: string;
  status?: string;
  source?: string;
  createdAt?: string | Date;
  startedAt?: string | Date;
  qrCodeUrl?: string;
  paymentStatus?: string;
  paymentIntent?: string;
  participants?: Array<{
    id: string;
    displayName: string;
    status: string;
    createdAt?: string | Date;
    identityPreview?: string | null;
  }>;
}

export default function StaffScanPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Session not found');
        }

        const result = await response.json();
        setSession(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Session Not Found</h2>
            </div>
            <p className="text-zinc-400 mt-2">
              Check the QR link or ask the guest to scan again. The session may have been closed or the ID is incorrect.
            </p>
            <Link href="/staff-dashboard" className="mt-4 inline-block">
              <Button className="bg-teal-600 hover:bg-teal-500">Back to Staff Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <QrCode className="w-10 h-10 text-teal-400" />
            Session Details
          </h1>
          <p className="text-xl text-zinc-400">Scanned Session Information</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span className="text-zinc-300">Session ID:</span>
              </div>
              <span className="text-white font-mono text-sm">{session.id}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-400" />
                <span className="text-zinc-300">Table:</span>
              </div>
              <span className="text-white font-semibold">{session.tableId || session.table_id || 'N/A'}</span>
            </div>

            {session.flavorMix && (
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  <span className="text-zinc-300">Flavor Mix:</span>
                </div>
                <span className="text-white">{session.flavorMix}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-zinc-300">Amount:</span>
              </div>
              <span className="text-green-400 font-semibold">
                ${((session.priceCents || session.price_cents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-400" />
                <span className="text-zinc-300">Status:</span>
              </div>
              <span className={`font-semibold px-3 py-1 rounded ${
                session.state === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                session.state === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                session.state === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {session.state || session.status || 'NEW'}
              </span>
            </div>

            {(session.customerName || session.customer_name) && (
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-teal-400" />
                  <span className="text-zinc-300">Customer:</span>
                </div>
                <span className="text-white">{session.customerName || session.customer_name}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Session Actions</h3>
            <div className="space-y-3">
              <Link href={`/sessions`} className="block">
                <Button className="w-full bg-teal-600 hover:bg-teal-500">
                  View in Dashboard
                </Button>
              </Link>
              {(session.loungeId || session.tableId || session.table_id) && (
                <Link
                  href={`/admin/pos-ops?loungeId=${encodeURIComponent(session.loungeId || '')}&tableId=${encodeURIComponent(session.tableId || session.table_id || '')}`}
                  className="block"
                >
                  <Button className="w-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Resolve Table Conflict
                  </Button>
                </Link>
              )}
              <Link href="/admin/qr" className="block">
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  Generate / Reprint QR
                </Button>
              </Link>
              <Button className="w-full bg-zinc-700 hover:bg-zinc-600">
                Add Notes
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>Source: {session.source || 'QR'}</p>
              <p>Payment Status: <span className={`${
                session.paymentStatus === 'succeeded' ? 'text-green-400' : 'text-yellow-400'
              }`}>{session.paymentStatus || 'Pending'}</span></p>
              {session.createdAt && (
                <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
              )}
              {session.startedAt && (
                <p>Started: {new Date(session.startedAt).toLocaleString()}</p>
              )}
              {session.qrCodeUrl && (
                <p className="text-xs text-zinc-500 break-all">QR URL: {session.qrCodeUrl}</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Participants</h3>
          {session.participants?.length ? (
            <div className="space-y-3">
              {session.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div>
                    <p className="text-white font-medium">{participant.displayName || 'Guest'}</p>
                    <p className="text-xs text-zinc-400">
                      {participant.identityPreview ? `Identity ${participant.identityPreview}...` : 'Identity unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                      {participant.status}
                    </span>
                    <Button className="bg-zinc-700 hover:bg-zinc-600" size="sm">
                      Take action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">No active participants found for this session.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

