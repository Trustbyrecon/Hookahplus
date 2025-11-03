"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import GlobalNavigation from '../../../components/GlobalNavigation';
import PreorderEntry from '../../../components/PreorderEntry';
import QRCode from 'qrcode';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { 
  QrCode, 
  Download, 
  Printer, 
  RefreshCw, 
  Copy, 
  CheckCircle, 
  BarChart3, 
  Users, 
  MapPin, 
  ShoppingCart,
  Zap,
  AlertCircle,
  DollarSign,
  Sparkles
} from 'lucide-react';

function PreOrderPageContent() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  // QR Code state
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // View mode: 'order' (customer) or 'manage' (staff)
  const [viewMode, setViewMode] = useState<'order' | 'manage'>('order');
  
  // Order management state
  const [activeOrders, setActiveOrders] = useState(3);
  const [pendingOrders, setPendingOrders] = useState(1);
  const [completedOrders, setCompletedOrders] = useState(12);
  
  // Table configuration
  const [tableData] = useState({
    id: tableId,
    name: 'VIP Booth 1',
    type: 'booth',
    capacity: 6,
    zone: 'VIP',
    status: 'active'
  });
  
  // QR generation state
  const [selectedTable, setSelectedTable] = useState(tableId);
  const [selectedCampaign, setSelectedCampaign] = useState('none');

  // Generate QR Code
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hookahplus.net';
      const qrUrl = `${baseUrl}/preorder/${selectedTable}`;
      
      const qrDataURL = await QRCode.toDataURL(qrUrl, {
        width: 300,
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
                <div class="qr-title">Hookah+ Pre-Order QR Code</div>
                <img src="${qrCodeDataURL}" alt="QR Code" style="width: 300px; height: 300px;" />
                <div class="qr-info">
                  <div><strong>Table:</strong> ${tableId}</div>
                  <div><strong>Zone:</strong> ${tableData.zone}</div>
                  <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    Scan this QR code to place your pre-order
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

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [tableId, selectedTable]);

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
            
            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('order')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'order'
                    ? 'bg-teal-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Order
              </button>
              <button
                onClick={() => setViewMode('manage')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'manage'
                    ? 'bg-teal-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                Manage QR
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'order' ? (
          /* Customer Order View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preorder Form - Main Content */}
            <div className="lg:col-span-2">
              <PreorderEntry tableId={tableId} loungeId="default-lounge" />
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

              {/* Quick QR Access */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-400" />
                  Quick QR
                </h3>
                {qrCodeDataURL && (
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
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          /* Staff Management View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Management Card */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-teal-400" />
                QR Code Management
              </h2>
              
              {/* Table Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="T-001">VIP Booth 1 (VIP - 6 people)</option>
                  <option value="T-002">VIP Booth 2 (VIP - 6 people)</option>
                  <option value="T-003">Main Floor 1 (Main - 4 people)</option>
                  <option value="T-004">Main Floor 2 (Main - 4 people)</option>
                  <option value="T-005">Patio Table (Patio - 2 people)</option>
                </select>
              </div>

              {/* QR Code Display */}
              {qrCodeDataURL && (
                <div className="mb-6 text-center">
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img 
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-zinc-400 mt-2">
                    Scan this QR code to start ordering at Table {selectedTable}
                  </p>
                </div>
              )}

              {/* QR URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  QR Code URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-zinc-700 hover:bg-zinc-600"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Copied to clipboard!
                  </p>
                )}
              </div>

              {/* QR Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingQR ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  onClick={printQRCode}
                  disabled={!qrCodeDataURL}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  onClick={() => {
                    if (qrCodeDataURL) {
                      const link = document.createElement('a');
                      link.href = qrCodeDataURL;
                      link.download = `qr-code-${selectedTable}.png`;
                      link.click();
                    }
                  }}
                  disabled={!qrCodeDataURL}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </Card>

            {/* Order Management Card */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-teal-400" />
                Order Management
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="text-zinc-400 text-sm">Active Orders</p>
                    <p className="text-2xl font-bold text-white">{activeOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-teal-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="text-zinc-400 text-sm">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-400">{pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="text-zinc-400 text-sm">Completed Orders</p>
                    <p className="text-2xl font-bold text-green-400">{completedOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-teal-600 hover:bg-teal-500">
                  View Active Orders
                </Button>
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600">
                  Order Analytics
                </Button>
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600">
                  Export Orders
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreOrderPage() {
  return <PreOrderPageContent />;
}
