"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import GlobalNavigation from '../../../components/GlobalNavigation';
import PreorderEntry from '../../../components/PreorderEntry';
import QRCode from 'qrcode';
import Card from '../../../components/Card';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  QrCode,
  Copy,
  CheckCircle,
  Flame,
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import Button from '../../../components/Button';
import { SessionProvider, useSessionContext } from '../../../contexts/SessionContext';
import { STATUS_TO_TRACKER_STAGE } from '../../../types/enhancedSession';
import { Badge } from '../../../components';

function PreOrderPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = params.tableId as string;
  // Lounge context from URL: ?lounge=CODIGO for CODIGO pilot
  const loungeId = searchParams.get('lounge') || 'default-lounge';
  const { sessions } = useSessionContext();
  
  // QR Code state (for quick share)
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Find existing session for this table
  const existingSession = sessions.find(s => s.tableId === tableId);
  
  // Calculate order stats from sessions for this table
  const tableSessions = sessions.filter(s => s.tableId === tableId);
  const activeOrders = tableSessions.filter(s => s.status === 'ACTIVE' || s.status === 'PREP_IN_PROGRESS' || s.status === 'READY_FOR_DELIVERY' || s.status === 'OUT_FOR_DELIVERY').length;
  const pendingOrders = tableSessions.filter(s => s.status === 'PAID_CONFIRMED' || s.status === 'NEW').length;
  const completedOrders = tableSessions.filter(s => s.status === 'CLOSED').length;
  
  // Table configuration - load from layout
  const [tableData, setTableData] = useState<{
    id: string;
    name: string;
    type: string;
    capacity: number;
    zone: string;
    status: string;
  } | null>(null);
  const [tableValidationError, setTableValidationError] = useState<string | null>(null);

  // Validate table on mount (pass loungeId for CODIGO/seat resolution)
  useEffect(() => {
    const validateTable = async () => {
      try {
        const response = await fetch('/api/lounges/tables/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableId,
            loungeId,
            checkAvailability: true,
          }),
        });

        if (response.ok) {
          const validation = await response.json();
          if (validation.valid && validation.table) {
            setTableData({
              id: validation.table.id,
              name: validation.table.name,
              type: validation.table.seatingType || 'Booth',
              capacity: validation.table.capacity || 4,
              zone: validation.table.zone || 'Main',
              status: validation.available ? 'active' : 'occupied'
            });
            setTableValidationError(null);
          } else {
            setTableValidationError(validation.error || 'Table not found');
            setTableData(null);
          }
        } else {
          setTableValidationError('Failed to validate table');
          setTableData(null);
        }
      } catch (error) {
        console.error('Table validation error:', error);
        // Fallback to default table data
        setTableData({
          id: tableId,
          name: `Table ${tableId}`,
          type: 'booth',
          capacity: 6,
          zone: 'Main',
          status: 'active'
        });
      }
    };

    validateTable();
  }, [tableId, loungeId]);

  // Generate QR Code for quick sharing (include lounge param for CODIGO)
  const generateQRCode = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hookahplus.net';
      const qrUrl = loungeId !== 'default-lounge'
        ? `${baseUrl}/preorder/${tableId}?lounge=${loungeId}`
        : `${baseUrl}/preorder/${tableId}`;
      
      const qrDataURL = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataURL(qrDataURL);
      setQrUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Copy QR URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [tableId, loungeId]);

  // Show error if table validation failed
  if (tableValidationError && !tableData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Table Not Found</h1>
            <p className="text-zinc-400 mb-6">{tableValidationError}</p>
            <Button
              variant="primary"
              onClick={() => router.push('/lounge-layout')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Configure Tables
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading table information...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header — editorial hierarchy, mobile-first */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-teal-500/80 mb-2">
            Hookah+ Guest
          </p>
          <h1 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
            Pre-order
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
            Curate your session before you settle in. Your team prepares from this order—nothing hits the kitchen until you complete checkout.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5 text-zinc-300">
              <MapPin className="w-4 h-4 text-teal-500/80 shrink-0" />
              {tableData.name || tableId}
              <span className="text-zinc-600">·</span>
              {tableData.zone}
              <span className="text-zinc-600">·</span>
              Up to {tableData.capacity} guests
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-500/70 shrink-0" />
              Secure checkout
            </span>
          </div>
        </div>

        {/* Session Status Alert */}
        {existingSession && (
          <Card className="mb-6 p-6 border-teal-500/30 bg-teal-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-teal-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Session in Progress</h3>
                  <p className="text-sm text-zinc-400">
                    Table {tableId} has an active session
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-teal-500/20 text-teal-400">
                      {STATUS_TO_TRACKER_STAGE[existingSession.status as keyof typeof STATUS_TO_TRACKER_STAGE]}
                    </Badge>
                    <span className="text-sm text-zinc-400">
                      {existingSession.customerName} • {existingSession.flavor}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push(`/fire-session-dashboard?session=${existingSession.id}`)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Session
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preorder Form - Main Content */}
          <div className="lg:col-span-2">
            {existingSession && existingSession.status !== 'NEW' && existingSession.status !== 'PAID_CONFIRMED' ? (
              <Card className="p-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Session Already in Progress</h3>
                  <p className="text-zinc-400 mb-4">
                    This table already has an active session. Please complete or close the current session before creating a new one.
                  </p>
                  <Button
                    onClick={() => router.push(`/fire-session-dashboard?session=${existingSession.id}`)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Go to Session Dashboard
                  </Button>
                </div>
              </Card>
            ) : (
              <PreorderEntry
                tableId={tableId}
                loungeId={loungeId}
                showTestMode={searchParams.get('test') === '1'}
                tableLabel={tableData.name || tableId}
                zoneLabel={tableData.zone}
                capacity={tableData.capacity}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 border-zinc-800/80">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Floor pulse
              </h3>
              <p className="text-xs text-zinc-500 mb-4">Live view for this table (operator context)</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-400 text-sm">In service</span>
                  <span className="text-white font-semibold tabular-nums">{activeOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-400 text-sm">Awaiting prep</span>
                  <span className="text-amber-400/90 font-semibold tabular-nums">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-400 text-sm">Closed today</span>
                  <span className="text-emerald-400/90 font-semibold tabular-nums">{completedOrders}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-zinc-800/80">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Your table
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Table:</span>
                  <span className="text-white font-semibold">{tableId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Zone:</span>
                  <span className="text-white font-semibold">{tableData.zone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Capacity:</span>
                  <span className="text-white font-semibold">{tableData.capacity} people</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-green-400 font-semibold capitalize">{tableData.status}</span>
                </div>
              </div>
            </Card>

            {/* Quick QR Share */}
            {qrCodeDataURL && (
              <Card className="p-6 border-zinc-800/80">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-400" />
                  Invite your party
                </h3>
                <p className="text-xs text-zinc-500 mb-4">Same menu & pricing for everyone at this table</p>
                <div className="text-center">
                  <div className="inline-block p-3 bg-white rounded-xl mb-4 shadow-inner">
                    <img 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">
                    Scan or share link—guests land on this pre-order flow
                  </p>
                  <Button
                    onClick={copyToClipboard}
                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  {copied && (
                    <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Link copied!
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreOrderPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400" />
        </div>
      }>
        <PreOrderPageContent />
      </Suspense>
    </SessionProvider>
  );
}
