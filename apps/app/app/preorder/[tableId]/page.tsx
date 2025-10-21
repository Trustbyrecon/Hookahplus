"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge } from '../../../components';
import { CartProvider, useCart } from '../../../components/cart/CartProvider';
import { CartDisplay } from '../../../components/cart/CartDisplay';
import { StripeTestSession } from '../../../components/StripeTestSession';
import { NewSmokeTest } from '../../../components/NewSmokeTest';
import { StripeDiagnostic } from '../../../components/StripeDiagnostic';
import GlobalNavigation from '../../../components/GlobalNavigation';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Printer, 
  RefreshCw, 
  Copy, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Clock, 
  MapPin, 
  Building, 
  Filter, 
  Search,
  Zap,
  Flame,
  Settings,
  Eye,
  Plus,
  Activity,
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Play,
  Pause,
  Edit3,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

export default function PreOrderPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const { add, remove, items, subtotal } = useCart();
  
  // QR Code state
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Order management state
  const [activeOrders, setActiveOrders] = useState(3);
  const [pendingOrders, setPendingOrders] = useState(1);
  const [completedOrders, setCompletedOrders] = useState(12);
  
  // Table management state
  const [tableData, setTableData] = useState({
    id: tableId,
    name: 'VIP Booth 1',
    type: 'booth',
    capacity: 6,
    zone: 'VIP',
    status: 'active'
  });
  
  // $1 Smoke Test state
  const [testResult, setTestResult] = useState<{ok: boolean, message: string} | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Generate QR Code
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin.replace('app.', 'guest.') : 'https://guest.hookahplus.net';
      const qrUrl = `${baseUrl}/?loungeId=CLOUD_DEMO&tableId=${tableId}&ref=demo`;
      
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
      
      console.log('QR Code generated:', qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQR(false);
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

  // Print QR Code
  const printQRCode = () => {
    if (qrCodeDataURL) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${tableId}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px;
                  background: white;
                }
                .qr-container { 
                  display: inline-block; 
                  padding: 20px; 
                  border: 2px solid #333;
                  border-radius: 10px;
                }
                .qr-info {
                  margin-top: 15px;
                  font-size: 14px;
                  color: #333;
                }
                .qr-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="qr-title">Hookah+ Table QR Code</div>
                <img src="${qrCodeDataURL}" alt="QR Code" style="width: 250px; height: 250px;" />
                <div class="qr-info">
                  <div><strong>Table:</strong> ${tableId}</div>
                  <div><strong>Lounge:</strong> CLOUD_DEMO</div>
                  <div><strong>Campaign:</strong> demo</div>
                  <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    Scan this QR code to start your hookah session
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Run $1 Smoke Test
  const handleTestMode = async () => {
    setIsRunningTest(true);
    try {
      const response = await fetch('/api/payments/live-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TEST_TOKEN || ''
        },
        body: JSON.stringify({ source: 'preorder:$1-smoke' })
      });

      const data = await response.json();
      setTestResult({
        ok: response.ok,
        message: data.message || (response.ok ? 'Test successful' : 'Test failed')
      });
    } catch (error) {
      setTestResult({
        ok: false,
        message: 'Test failed: ' + (error as Error).message
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [tableId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Global Navigation */}
      <GlobalNavigation />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-4">
            <QrCode className="w-10 h-10 text-blue-400" />
            QR Pathway Management
          </h1>
          <p className="text-xl text-zinc-400">
            Table {tableId} • VIP Booth • 6 People • Active
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Scanner Section */}
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <QrCode className="w-6 h-6 text-blue-400" />
                QR Code Scanner
              </h2>
              
              {/* QR Code Display */}
              {qrCodeDataURL && (
                <div className="mb-6">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">
                    Scan this QR code to start ordering
                  </p>
                </div>
              )}

              {/* QR Actions */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingQR ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingQR ? 'Generating...' : 'Regenerate'}</span>
                </button>
                
                {qrCodeDataURL && (
                  <>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `qr-${tableId}.png`;
                        link.href = qrCodeDataURL;
                        link.click();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={printQRCode}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                  </>
                )}
              </div>

              {/* QR URL */}
              {qrUrl && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={qrUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm font-mono"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors flex items-center space-x-1"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Management Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Order Management
            </h2>
            
            {/* Order Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-zinc-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{activeOrders}</div>
                <div className="text-sm text-zinc-400">Active Orders</div>
              </div>
              <div className="text-center p-4 bg-zinc-700/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{pendingOrders}</div>
                <div className="text-sm text-zinc-400">Pending Orders</div>
              </div>
              <div className="text-center p-4 bg-zinc-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{completedOrders}</div>
                <div className="text-sm text-zinc-400">Completed Orders</div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="space-y-3">
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-between">
                <span>View Active Orders</span>
                <Eye className="w-4 h-4" />
              </button>
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-between">
                <span>Order Analytics</span>
                <TrendingUp className="w-4 h-4" />
              </button>
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-between">
                <span>Export Orders</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Generate QR</span>
            </button>
            <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Bulk Generate</span>
            </button>
            <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Printer className="w-5 h-5" />
              <span>Print QR</span>
            </button>
            <button className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </Card>

        {/* Table Management Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-400" />
            Table Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                <div>
                  <div className="font-semibold">Table {tableData.id}</div>
                  <div className="text-sm text-zinc-400">{tableData.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-400">{tableData.type}</div>
                  <div className="text-sm text-zinc-400">{tableData.capacity} people</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                <div>
                  <div className="font-semibold">Zone</div>
                  <div className="text-sm text-zinc-400">{tableData.zone}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Status</div>
                  <div className="text-sm text-green-400 capitalize">{tableData.status}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-between">
                <span>View Table Details</span>
                <Eye className="w-4 h-4" />
              </button>
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-between">
                <span>Edit Table</span>
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-between">
                <span>Generate QR</span>
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* $1 Smoke Test Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            $1 Smoke Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-700/50 rounded-lg">
                <h3 className="font-semibold mb-2">RWO: Order Management Integration</h3>
                <p className="text-sm text-zinc-400 mb-3">Using Stripe sandbox test card</p>
                <div className="text-sm font-mono bg-zinc-800 p-2 rounded mb-3">pm_card_visa</div>
                <p className="text-sm text-zinc-400">Automatic payment processing - no card input required</p>
              </div>
              
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.ok ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.ok ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-semibold">
                      {testResult.ok ? 'Test Successful' : 'Test Failed'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{testResult.message}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleTestMode}
                disabled={isRunningTest}
                className="w-full p-4 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isRunningTest ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isRunningTest ? 'Running Test...' : 'Run $1 Smoke Test'}</span>
              </button>
              
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>View Test Results</span>
              </button>
              
              <button className="w-full p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configure Test</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
