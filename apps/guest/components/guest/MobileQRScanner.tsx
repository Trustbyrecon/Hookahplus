'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

interface MobileQRScannerProps {
  onQRScanned: (data: string) => void;
  onManualEntry: () => void;
  isScanning?: boolean;
}

export default function MobileQRScanner({ onQRScanned, onManualEntry, isScanning = false }: MobileQRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkCameraSupport();
  }, []);

  const checkCameraSupport = async () => {
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        setHasCamera(true);
      }
    } catch (err) {
      setHasCamera(false);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access to scan QR codes.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // QR Code detection logic would go here
  // For now, we'll simulate it
  const simulateQRDetection = () => {
    setTimeout(() => {
      onQRScanned('lounge_001?tableId=T-001&zone=VIP');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* QR Scanner Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 mb-4">
          <QrCode className="w-4 h-4 text-teal-400" />
          <span className="text-teal-400 font-medium text-sm">QR Code Scanner</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Scan Your Table QR Code</h2>
        <p className="text-zinc-400 text-sm">
          Point your camera at the QR code on your table to start your hookah session
        </p>
      </div>

      {/* Camera Preview */}
      {isScanning && hasCamera && (
        <div className="relative bg-zinc-800 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          
          {/* QR Code Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-teal-400 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg"></div>
            </div>
          </div>

          {/* Scanning Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
              animate={{ y: [0, 240, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Camera Error</span>
          </div>
          <p className="text-red-200 text-xs mt-1">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isScanning ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={hasCamera ? startScanning : simulateQRDetection}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {hasCamera ? 'Start Scanning' : 'Simulate QR Scan'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stopScanning}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Stop Scanning
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onManualEntry}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Enter Table Number Manually
        </motion.button>
      </div>

      {/* Mobile Tips */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Mobile Tips:</h3>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Hold your phone steady over the QR code</li>
          <li>• Ensure good lighting for better scanning</li>
          <li>• Allow camera permissions when prompted</li>
          <li>• Use the manual entry if scanning fails</li>
        </ul>
      </div>
    </div>
  );
}
