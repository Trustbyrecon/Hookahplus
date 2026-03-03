"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { QrCode, Camera, AlertCircle, CheckCircle } from 'lucide-react';
const QRScanner = ({ onScan, onError, className }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
        catch (err) {
            const errorMessage = 'Camera access denied. Please allow camera access to scan QR codes.';
            setError(errorMessage);
            onError?.(errorMessage);
            setIsScanning(false);
        }
    };
    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };
    const handleScan = (data) => {
        setSuccess(true);
        onScan(data);
        // Reset success state after 2 seconds
        setTimeout(() => {
            setSuccess(false);
        }, 2000);
    };
    // Simulate QR code detection (replace with actual QR library)
    const simulateQRDetection = () => {
        if (isScanning && Math.random() > 0.95) {
            const mockData = `table_${Math.floor(Math.random() * 100)}`;
            handleScan(mockData);
        }
    };
    useEffect(() => {
        let interval;
        if (isScanning) {
            interval = setInterval(simulateQRDetection, 100);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isScanning]);
    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);
    return (_jsxs(Card, { className: cn('p-6', className), children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx(QrCode, { className: "w-12 h-12 text-teal-400 mx-auto mb-3" }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Scan QR Code" }), _jsx("p", { className: "text-zinc-400", children: "Point your camera at the QR code on your table" })] }), _jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "aspect-square bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-700", children: isScanning ? (_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx(Camera, { className: "w-16 h-16 text-zinc-600" }) })) }), isScanning && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "w-48 h-48 border-2 border-teal-400 rounded-lg animate-pulse" }) })), success && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-green-500/20", children: _jsx(CheckCircle, { className: "w-16 h-16 text-green-400" }) }))] }), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400" }), _jsx("span", { className: "text-red-400 text-sm", children: error })] })), _jsx("div", { className: "flex space-x-3", children: !isScanning ? (_jsxs("button", { onClick: startScanning, className: "flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2", children: [_jsx(Camera, { className: "w-5 h-5" }), _jsx("span", { children: "Start Scanning" })] })) : (_jsx("button", { onClick: stopScanning, className: "flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-lg font-medium transition-colors", children: "Stop Scanning" })) })] }));
};
export default QRScanner;
