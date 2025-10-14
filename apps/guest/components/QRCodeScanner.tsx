'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, Clock, Users, AlertCircle } from 'lucide-react';
import { tableDataSync, TableData, LoungeData } from '../lib/tableDataSync';

interface QRCodeScannerProps {
  onTableDetected: (tableData: TableData) => void;
  onLoungeDetected: (loungeData: LoungeData) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onTableDetected,
  onLoungeDetected
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTableData, setCurrentTableData] = useState<TableData | null>(null);
  const [currentLoungeData, setCurrentLoungeData] = useState<LoungeData | null>(null);

  useEffect(() => {
    // Start real-time sync with App build
    tableDataSync.startRealTimeSync();
  }, []);

  const handleQRScan = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      // Simulate QR code scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would parse the QR code
      // For now, we'll simulate scanning T-001
      const tableId = 'T-001';
      const loungeId = 'lounge_001';
      
      // Fetch table data from App build
      const tables = await tableDataSync.fetchTableData(loungeId, tableId);
      const lounge = await tableDataSync.fetchLoungeData(loungeId);
      
      if (tables.length > 0 && lounge) {
        const tableData = tables[0];
        setCurrentTableData(tableData);
        setCurrentLoungeData(lounge);
        setScanResult(tableData.qrCode);
        onTableDetected(tableData);
        onLoungeDetected(lounge);
      } else {
        setError('Table not found. Please check your QR code.');
      }
    } catch (err) {
      setError('Failed to connect to table data. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEntry = async () => {
    const tableId = prompt('Enter your table number (e.g., T-001):');
    if (tableId) {
      try {
        const loungeId = 'lounge_001'; // Default lounge for now
        const tables = await tableDataSync.fetchTableData(loungeId, tableId.toUpperCase());
        const lounge = await tableDataSync.fetchLoungeData(loungeId);
        
        if (tables.length > 0 && lounge) {
          const tableData = tables[0];
          setCurrentTableData(tableData);
          setCurrentLoungeData(lounge);
          setScanResult(tableData.qrCode);
          onTableDetected(tableData);
          onLoungeDetected(lounge);
        } else {
          setError('Table not found. Please check the table number.');
        }
      } catch (err) {
        setError('Failed to connect to table data. Please try again.');
      }
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <div className="text-center mb-4">
        <QrCode className="w-8 h-8 text-primary-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold mb-1">Table QR Scanner</h3>
        <p className="text-zinc-400 text-xs">
          Scan QR code or enter table number
        </p>
      </div>

      {!scanResult ? (
        <div className="space-y-3">
          <button
            onClick={handleQRScan}
            disabled={isScanning}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-zinc-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Scan QR Code'}
          </button>

          <div className="text-center">
            <span className="text-zinc-400 text-xs">or</span>
          </div>

          <button
            onClick={handleManualEntry}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Enter Table Number
          </button>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 font-medium text-sm">Table Connected</span>
            </div>
            <p className="text-xs text-zinc-300">
              Table {currentTableData?.tableId} • {currentTableData?.loungeName}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Zone: {currentTableData?.zone} • Status: {currentTableData?.status}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <MapPin className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-300">{currentLoungeData?.address}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-300">{currentLoungeData?.hours}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Users className="w-3 h-3 text-zinc-400" />
              <span className="text-zinc-300">Capacity: {currentTableData?.capacity} people</span>
            </div>
          </div>

          {currentTableData?.currentSession && (
            <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-xs text-blue-400 font-medium mb-1">Active Session</div>
              <div className="text-xs text-zinc-300">
                Started: {new Date(currentTableData.currentSession.startTime).toLocaleTimeString()}
              </div>
              <div className="text-xs text-zinc-300">
                Duration: {currentTableData.currentSession.duration} minutes
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setScanResult(null);
              setError(null);
              setCurrentTableData(null);
              setCurrentLoungeData(null);
            }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-3 rounded-lg text-xs transition-colors"
          >
            Scan Different Table
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
