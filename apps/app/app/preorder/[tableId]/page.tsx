"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GlobalNavigation from '../../../components/GlobalNavigation';
import PreorderEntry from '../../../components/PreorderEntry';
import QRCode from 'qrcode';
import Card from '../../../components/Card';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  ShoppingCart,
  QrCode,
  Copy,
  CheckCircle,
  Flame,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../../../components/Button';
import { SessionProvider, useSessionContext } from '../../../contexts/SessionContext';
import { STATUS_TO_TRACKER_STAGE, TrackerStage } from '../../../types/enhancedSession';
import { Badge } from '../../../components';

function PreOrderPageContent() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.tableId as string;
  const { sessions, refreshSessions } = useSessionContext();
  
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
  
  // Table configuration
  const [tableData] = useState({
    id: tableId,
    name: 'VIP Booth 1',
    type: 'booth',
    capacity: 6,
    zone: 'VIP',
    status: 'active'
  });

  // Generate QR Code for quick sharing
  const generateQRCode = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hookahplus.net';
      const qrUrl = `${baseUrl}/preorder/${tableId}`;
      
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
  }, [tableId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <ShoppingCart className="w-10 h-10 text-teal-400" />
                Pre-Order
              </h1>
              <p className="text-xl text-zinc-400 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Table {tableId} • {tableData.zone} • {tableData.capacity} People
              </p>
            </div>
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
                onClick={() => router.push(`/fire-session-dashboard?sessionId=${existingSession.id}`)}
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
                    onClick={() => router.push(`/fire-session-dashboard?sessionId=${existingSession.id}`)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Go to Session Dashboard
                  </Button>
                </div>
              </Card>
            ) : (
              <PreorderEntry tableId={tableId} loungeId="default-lounge" />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Active Orders</span>
                  <span className="text-white font-semibold">{activeOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Pending</span>
                  <span className="text-yellow-400 font-semibold">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <span className="text-zinc-400">Completed</span>
                  <span className="text-green-400 font-semibold">{completedOrders}</span>
                </div>
              </div>
            </Card>

            {/* Table Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Table Info
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
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-400" />
                  Share This Page
                </h3>
                <div className="text-center">
                  <div className="inline-block p-3 bg-white rounded-lg mb-4">
                    <img 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">
                    Share this QR code for quick ordering
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
      <PreOrderPageContent />
    </SessionProvider>
  );
}
