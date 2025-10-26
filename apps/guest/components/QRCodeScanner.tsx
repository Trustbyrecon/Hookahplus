'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, MapPin, Clock, Users, AlertCircle, Camera, CameraOff } from 'lucide-react';
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
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Start real-time sync with App build
    tableDataSync.startRealTimeSync();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraPermission('denied');
      setError('Camera access is required to scan QR codes. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const parseQRCodeFromURL = (url: string) => {
    try {
      const urlObj = new URL(url);
      const loungeId = urlObj.searchParams.get('loungeId');
      const tableId = urlObj.searchParams.get('tableId');
      const ref = urlObj.searchParams.get('ref');
      
      return { loungeId, tableId, ref };
    } catch (err) {
      console.error('Invalid QR code URL:', err);
      return null;
    }
  };

  const handleQRScan = async (qrData?: string) => {
    setIsScanning(true);
    setError(null);
    
    try {
      let qrContent = qrData;
      
      // If no QR data provided, simulate scanning
      if (!qrContent) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        qrContent = `${window.location.origin}/?loungeId=Cloud%20Nine%20Demo&tableId=T-001&ref=demo`;
      }
      
      const parsed = parseQRCodeFromURL(qrContent);
      if (!parsed || !parsed.loungeId) {
        throw new Error('Invalid QR code format');
      }
      
      const { loungeId, tableId, ref } = parsed;
      
      // Fetch table data from App build
      const tables = await tableDataSync.fetchTableData(loungeId, tableId || 'T-001');
      const lounge = await tableDataSync.fetchLoungeData(loungeId);
      
      if (tables.length > 0 && lounge) {
        const tableData = tables[0];
        setCurrentTableData(tableData);
        setCurrentLoungeData(lounge);
        setScanResult(qrContent);
        onTableDetected(tableData);
        onLoungeDetected(lounge);
        
        // Track QR scan event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'qr_scan', {
            event_category: 'engagement',
            event_label: `lounge:${loungeId},table:${tableId},ref:${ref || 'none'}`
          });
        }
      } else {
        throw new Error('Table or lounge not found');
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan QR code');
    } finally {
      setIsScanning(false);
    }
  };

  const startCameraScan = async () => {
    if (cameraPermission === 'denied') {
      setError('Camera access denied. Please enable camera permissions in your browser settings.');
      return;
    }
    
    if (cameraPermission === 'prompt') {
      await requestCameraPermission();
    }
    
    if (cameraPermission === 'granted' && stream) {
      setIsScanning(true);
      // In a real implementation, you would use a QR code scanning library like jsQR
      // For now, we'll simulate the scan after camera is active
      setTimeout(() => {
        handleQRScan();
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (scanResult && currentTableData && currentLoungeData) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <QrCode className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">QR Code Scanned Successfully</h3>
            <p className="text-sm text-zinc-400">Table detected and ready for session</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-zinc-300">Table: {currentTableData.tableId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-zinc-300">Lounge: {currentLoungeData.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-zinc-300">Status: {currentTableData.status}</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            setScanResult(null);
            setCurrentTableData(null);
            setCurrentLoungeData(null);
          }}
          className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Scan Another QR Code
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <QrCode className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">QR Code Scanner</h3>
          <p className="text-sm text-zinc-400">Scan your table QR code to start your session</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        </div>
      )}

      {cameraPermission === 'granted' && stream && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-48 bg-zinc-800 rounded-lg object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="space-y-3">
        {cameraPermission === 'prompt' && (
          <button
            onClick={startCameraScan}
            disabled={isScanning}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>{isScanning ? 'Starting Camera...' : 'Start Camera Scan'}</span>
          </button>
        )}

        {cameraPermission === 'granted' && (
          <div className="flex space-x-2">
            <button
              onClick={startCameraScan}
              disabled={isScanning}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Scanning...' : 'Scan QR Code'}</span>
            </button>
            <button
              onClick={stopCamera}
              className="bg-zinc-600 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <CameraOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="text-center">
            <p className="text-sm text-zinc-400 mb-3">
              Camera access is required to scan QR codes.
            </p>
            <button
              onClick={() => setCameraPermission('prompt')}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        <button
          onClick={() => handleQRScan()}
          disabled={isScanning}
          className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {isScanning ? 'Scanning...' : 'Demo Scan (T-001)'}
        </button>
      </div>
    </div>
  );
};