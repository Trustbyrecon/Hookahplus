'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Download,
  Copy,
  Settings,
  Building,
  Users,
  Calendar,
  Link,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface QRCodeData {
  id: string;
  loungeId: string;
  tableId?: string;
  campaignRef?: string;
  url: string;
  qrCodeData: string;
  createdAt: string;
  usageCount: number;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'expired';
}

export default function QRGeneratorAdmin() {
  const [loungeId, setLoungeId] = useState('');
  const [tableId, setTableId] = useState('');
  const [campaignRef, setCampaignRef] = useState('');
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [qrHistory, setQrHistory] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);

  // Load QR history on component mount
  useEffect(() => {
    loadQRHistory();
  }, []);

  const loadQRHistory = async () => {
    try {
      const response = await fetch('/api/qr-generator');
      if (response.ok) {
        const data = await response.json();
        setQrHistory(data.qrCodes || []);
      }
    } catch (error) {
      console.error('Failed to load QR history:', error);
    }
  };

  const generateQRCode = async () => {
    if (!loungeId.trim()) {
      alert('Please enter a Lounge ID');
      return;
    }

    setIsGenerating(true);
    
    try {
      const qrData = {
        loungeId: loungeId.trim(),
        tableId: tableId.trim() || undefined,
        campaignRef: campaignRef.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      // Generate URL with parameters
      const baseUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
      const params = new URLSearchParams();
      params.set('loungeId', qrData.loungeId);
      if (qrData.tableId) params.set('tableId', qrData.tableId);
      if (qrData.campaignRef) params.set('ref', qrData.campaignRef);
      
      const qrUrl = `${baseUrl}?${params.toString()}`;

      // Generate QR code using a simple API (in production, use a proper QR library)
      const qrCodeData = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12" fill="black">
            QR: ${qrData.loungeId}${qrData.tableId ? `-${qrData.tableId}` : ''}
          </text>
        </svg>
      `)}`;

      const newQR: QRCodeData = {
        id: `qr_${Date.now()}`,
        loungeId: qrData.loungeId,
        tableId: qrData.tableId,
        campaignRef: qrData.campaignRef,
        url: qrUrl,
        qrCodeData,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        status: 'active'
      };

      // Save to backend
      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQR)
      });

      if (response.ok) {
        setGeneratedQR(newQR);
        setQrHistory(prev => [newQR, ...prev]);
        setShowPreview(true);
      } else {
        throw new Error('Failed to save QR code');
      }

    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadQR = (qr: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qr.qrCodeData;
    link.download = `qr-${qr.loungeId}-${qr.tableId || 'general'}.svg`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-yellow-400 bg-yellow-500/20';
      case 'expired': return 'text-red-400 bg-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span>QR Code Generator</span>
            </h1>
            <p className="text-zinc-400 mt-2">Generate QR codes for your lounge tables and campaigns</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-zinc-400">Total QR Codes</div>
              <div className="text-2xl font-bold text-blue-400">{qrHistory.length}</div>
            </div>
            <button
              onClick={loadQRHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generator Form */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <span>Generate New QR Code</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lounge ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={loungeId}
                  onChange={(e) => setLoungeId(e.target.value)}
                  placeholder="e.g., lounge_001"
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Table ID (Optional)
                </label>
                <input
                  type="text"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder="e.g., T-001, Table-5"
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign Reference (Optional)
                </label>
                <input
                  type="text"
                  value={campaignRef}
                  onChange={(e) => setCampaignRef(e.target.value)}
                  placeholder="e.g., summer2024, vip-event"
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={generateQRCode}
                disabled={isGenerating || !loungeId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Generate QR Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated QR Preview */}
            {generatedQR && showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-zinc-700 rounded-lg border border-zinc-600"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>QR Code Generated Successfully!</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <img
                      src={generatedQR.qrCodeData}
                      alt="Generated QR Code"
                      className="w-32 h-32 mx-auto border border-zinc-600 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-zinc-400">Lounge ID:</span>
                      <span className="text-sm text-white ml-2">{generatedQR.loungeId}</span>
                    </div>
                    {generatedQR.tableId && (
                      <div>
                        <span className="text-sm text-zinc-400">Table ID:</span>
                        <span className="text-sm text-white ml-2">{generatedQR.tableId}</span>
                      </div>
                    )}
                    {generatedQR.campaignRef && (
                      <div>
                        <span className="text-sm text-zinc-400">Campaign:</span>
                        <span className="text-sm text-white ml-2">{generatedQR.campaignRef}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-zinc-400">URL:</span>
                      <div className="text-xs text-blue-400 break-all">{generatedQR.url}</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => copyToClipboard(generatedQR.url)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </button>
                  <button
                    onClick={() => downloadQR(generatedQR)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* QR History */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span>QR Code History</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {qrHistory.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No QR codes generated yet</p>
                </div>
              ) : (
                qrHistory.map((qr) => (
                  <div
                    key={qr.id}
                    className="bg-zinc-700 border border-zinc-600 rounded-lg p-4 hover:border-zinc-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">{qr.loungeId}</span>
                        {qr.tableId && (
                          <>
                            <span className="text-zinc-400">-</span>
                            <span className="text-zinc-300">{qr.tableId}</span>
                          </>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(qr.status)}`}>
                        {qr.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-3">
                      <div>Created: {formatDate(qr.createdAt)}</div>
                      <div>Usage: {qr.usageCount} scans</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedQR(qr)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(qr.url)}
                        className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => downloadQR(qr)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* QR Code Detail Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">QR Code Details</h3>
                <button
                  onClick={() => setSelectedQR(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center mb-4">
                <img
                  src={selectedQR.qrCodeData}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto border border-zinc-600 rounded-lg"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Lounge ID:</span>
                  <span className="text-white">{selectedQR.loungeId}</span>
                </div>
                {selectedQR.tableId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Table ID:</span>
                    <span className="text-white">{selectedQR.tableId}</span>
                  </div>
                )}
                {selectedQR.campaignRef && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Campaign:</span>
                    <span className="text-white">{selectedQR.campaignRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Usage:</span>
                  <span className="text-white">{selectedQR.usageCount} scans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created:</span>
                  <span className="text-white">{formatDate(selectedQR.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => copyToClipboard(selectedQR.url)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() => downloadQR(selectedQR)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
