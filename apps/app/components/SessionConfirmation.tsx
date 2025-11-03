"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, QrCode, Calendar, MapPin, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import QRCode from 'qrcode';

interface SessionConfirmationProps {
  sessionId: string;
  tableId?: string;
  flavorMix?: string;
  amount?: number;
  className?: string;
}

const SessionConfirmation: React.FC<SessionConfirmationProps> = ({
  sessionId,
  tableId,
  flavorMix,
  amount,
  className,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Generate QR code with session data
        const qrData = JSON.stringify({
          sessionId,
          tableId,
          type: 'hookah_session',
        });
        
        const qrCodeUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setQrLoading(false);
      }
    };

    generateQR();
  }, [sessionId, tableId]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Session Confirmed!</h2>
        <p className="text-zinc-400">Your hookah session has been created successfully</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-300">Session ID:</span>
          </div>
          <span className="text-white font-mono text-sm">{sessionId}</span>
        </div>

        {tableId && (
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-zinc-400" />
              <span className="text-zinc-300">Table:</span>
            </div>
            <span className="text-white font-semibold">{tableId}</span>
          </div>
        )}

        {flavorMix && (
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-400" />
              <span className="text-zinc-300">Flavor Mix:</span>
            </div>
            <span className="text-white">{flavorMix}</span>
          </div>
        )}

        {amount && (
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">Amount Paid:</span>
            </div>
            <span className="text-green-400 font-semibold">${(amount / 100).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* QR Code Display */}
      <div className="border-t border-zinc-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code for Staff Scanning
        </h3>
        <div className="flex justify-center">
          {qrLoading ? (
            <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCodeDataUrl} alt="Session QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
              Failed to generate QR code
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-400 text-center mt-4">
          Staff can scan this QR code to access your session details
        </p>
      </div>
    </Card>
  );
};

export default SessionConfirmation;

