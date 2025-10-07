'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, Clock, Users } from 'lucide-react';

interface QRCodeScannerProps {
  onTableDetected: (tableData: TableData) => void;
  onLoungeDetected: (loungeData: LoungeData) => void;
}

interface TableData {
  tableId: string;
  loungeId: string;
  loungeName: string;
  zone: string;
  capacity: number;
  qrCode: string;
}

interface LoungeData {
  loungeId: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onTableDetected,
  onLoungeDetected
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock QR code data for demonstration
  const mockTableData: TableData = {
    tableId: 'T-001',
    loungeId: 'lounge_001',
    loungeName: 'Hookah Paradise Downtown',
    zone: 'VIP',
    capacity: 4,
    qrCode: 'hookahplus://table/T-001/lounge_001'
  };

  const mockLoungeData: LoungeData = {
    loungeId: 'lounge_001',
    name: 'Hookah Paradise Downtown',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567',
    hours: 'Mon-Sun: 6PM-2AM',
    features: ['VIP Lounge', 'Outdoor Patio', 'Live Music', 'Full Bar']
  };

  const handleQRScan = () => {
    setIsScanning(true);
    setError(null);
    
    // Simulate QR code scanning
    setTimeout(() => {
      // In a real implementation, this would use a QR code scanner library
      // For now, we'll simulate a successful scan
      setScanResult(mockTableData.qrCode);
      onTableDetected(mockTableData);
      onLoungeDetected(mockLoungeData);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualEntry = () => {
    // Allow manual table entry as fallback
    const tableId = prompt('Enter your table number (e.g., T-001):');
    if (tableId) {
      const manualTableData = {
        ...mockTableData,
        tableId: tableId.toUpperCase()
      };
      onTableDetected(manualTableData);
      onLoungeDetected(mockLoungeData);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <QrCode className="w-12 h-12 text-primary-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Table QR Code Scanner</h3>
        <p className="text-zinc-400 text-sm">
          Scan the QR code on your table to automatically set up your session
        </p>
      </div>

      {!scanResult ? (
        <div className="space-y-4">
          <button
            onClick={handleQRScan}
            disabled={isScanning}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Scan QR Code'}
          </button>

          <div className="text-center">
            <span className="text-zinc-400 text-sm">or</span>
          </div>

          <button
            onClick={handleManualEntry}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Enter Table Number Manually
          </button>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 font-medium">Table Connected</span>
            </div>
            <p className="text-sm text-zinc-300">
              Table {mockTableData.tableId} • {mockTableData.loungeName}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">{mockLoungeData.address}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">{mockLoungeData.hours}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">Capacity: {mockTableData.capacity} people</span>
            </div>
          </div>

          <button
            onClick={() => {
              setScanResult(null);
              setError(null);
            }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Scan Different Table
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
