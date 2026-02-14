'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, CheckCircle, RefreshCw } from 'lucide-react';

interface QRCodeGeneratorProps {
  loungeId?: string;
  tableId?: string;
  campaignRef?: string;
  onQRGenerated?: (qrData: string) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  loungeId = 'Cloud Nine Demo',
  tableId = 'T-001',
  campaignRef = 'demo',
  onQRGenerated
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // Create the URL for the QR code - point to Guest page with parameters
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://guest.hookahplus.net';
      const encodedLoungeId = encodeURIComponent(loungeId);
      const qrUrl = `${baseUrl}/?loungeId=${encodedLoungeId}&tableId=${tableId}&ref=${campaignRef}`;
      
      // Generate QR code as data URL
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
      
      // Notify parent component
      onQRGenerated?.(qrUrl);
      
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
      link.download = `qr-${loungeId}-${tableId}-${campaignRef}.png`;
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
              <title>QR Code - ${loungeId} ${tableId}</title>
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
                  <div><strong>Lounge:</strong> ${loungeId}</div>
                  <div><strong>Table:</strong> ${tableId}</div>
                  <div><strong>Campaign:</strong> ${campaignRef}</div>
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

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, [loungeId, tableId, campaignRef]);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <QrCode className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">QR Code Generator</h3>
          <p className="text-sm text-zinc-400">Generate QR codes for testing</p>
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
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center space-x-1"
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
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={generateQRCode}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
        </button>
        
        {qrCodeDataURL && (
          <button
            onClick={downloadQRCode}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
      </div>

      {/* QR Code Info */}
      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="text-sm text-zinc-400 space-y-1">
          <div><strong>Lounge ID:</strong> {loungeId}</div>
          <div><strong>Table ID:</strong> {tableId}</div>
          <div><strong>Campaign:</strong> {campaignRef}</div>
        </div>
      </div>
    </div>
  );
};
