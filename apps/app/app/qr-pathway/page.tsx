'use client';

import React, { useState } from 'react';
import { QrCode, Download, Printer, RefreshCw, Copy, CheckCircle, BarChart3, Users, Clock, MapPin, Building, Filter, Search } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRPathwayPage() {
  const [selectedLounge, setSelectedLounge] = useState('CLOUD_DEMO');
  const [selectedTable, setSelectedTable] = useState('table_1');
  const [selectedCampaign, setSelectedCampaign] = useState('welcome_2024');
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock data for lounges and tables
  const lounges = [
    { id: 'CLOUD_DEMO', name: 'Cloud Lounge Demo', tables: 5 },
    { id: 'LOUNGE_001', name: 'Downtown Lounge', tables: 12 },
    { id: 'LOUNGE_002', name: 'Uptown Lounge', tables: 8 }
  ];

  const tables = [
    { id: 'table_1', name: 'VIP Booth 1', type: 'booth', capacity: 6, zone: 'VIP' },
    { id: 'table_2', name: 'VIP Booth 2', type: 'booth', capacity: 6, zone: 'VIP' },
    { id: 'table_3', name: 'Regular Table 1', type: 'table', capacity: 4, zone: 'Main Floor' },
    { id: 'table_4', name: 'Regular Table 2', type: 'table', capacity: 4, zone: 'Main Floor' },
    { id: 'table_5', name: 'Bar Seating 1', type: 'bar', capacity: 2, zone: 'Bar' }
  ];

  const campaigns = [
    { id: 'welcome_2024', name: 'Welcome 2024', active: true },
    { id: 'vip_loyalty', name: 'VIP Loyalty Program', active: true },
    { id: 'happy_hour', name: 'Happy Hour Special', active: true }
  ];

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin.replace('app.', 'guest.') : 'https://guest.hookahplus.net';
      const qrUrl = `${baseUrl}/?loungeId=${selectedLounge}&tableId=${selectedTable}&ref=${selectedCampaign}`;
      
      const qrDataURL = await QRCode.toDataURL(qrUrl, {
        width: 256,
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
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `qr-${selectedLounge}-${selectedTable}-${selectedCampaign}.png`;
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  const printQRCode = () => {
    if (qrCodeDataURL) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${selectedLounge} ${selectedTable}</title>
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
                <img src="${qrCodeDataURL}" alt="QR Code" style="width: 300px; height: 300px;" />
                <div class="qr-info">
                  <div><strong>Lounge:</strong> ${selectedLounge}</div>
                  <div><strong>Table:</strong> ${selectedTable}</div>
                  <div><strong>Campaign:</strong> ${selectedCampaign}</div>
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

  // Generate QR code on component mount
  React.useEffect(() => {
    generateQRCode();
  }, [selectedLounge, selectedTable, selectedCampaign]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-4">
            <QrCode className="w-10 h-10 text-blue-400" />
            QR Pathway Management
          </h1>
          <p className="text-xl text-zinc-400">
            Generate and manage QR codes for table ordering flow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generator */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-400" />
              QR Code Generator
            </h2>

            {/* Configuration */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lounge
                </label>
                <select
                  value={selectedLounge}
                  onChange={(e) => setSelectedLounge(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {lounges.map(lounge => (
                    <option key={lounge.id} value={lounge.id}>
                      {lounge.name} ({lounge.tables} tables)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} - {table.type} ({table.capacity} people) - {table.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* QR Code Display */}
            {qrCodeDataURL && (
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Scan this QR code to test the guest experience
                </p>
              </div>
            )}

            {/* URL Display */}
            {qrUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Generated URL:
                </label>
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

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
              </button>
              
              {qrCodeDataURL && (
                <>
                  <button
                    onClick={downloadQRCode}
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
          </div>

          {/* Analytics & Management */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              QR Analytics
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">24</div>
                <div className="text-sm text-zinc-400">Active QR Codes</div>
              </div>
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">156</div>
                <div className="text-sm text-zinc-400">Total Scans</div>
              </div>
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">6.5</div>
                <div className="text-sm text-zinc-400">Avg Scans/Code</div>
              </div>
              <div className="bg-zinc-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">89%</div>
                <div className="text-sm text-zinc-400">Success Rate</div>
              </div>
            </div>

            {/* Seating Analytics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                Seating Analytics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">VIP Booths</span>
                  </div>
                  <div className="text-sm font-medium">8 scans</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Main Floor</span>
                  </div>
                  <div className="text-sm font-medium">45 scans</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm">Bar Seating</span>
                  </div>
                  <div className="text-sm font-medium">23 scans</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm">
                  Bulk Generate
                </button>
                <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm">
                  Export Data
                </button>
                <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm">
                  View History
                </button>
                <button className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
