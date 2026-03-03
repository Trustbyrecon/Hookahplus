"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-900/20 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getColors()}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

interface PulseDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PulseDot({ color = 'bg-green-400', size = 'md' }: PulseDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}></div>
      <div className={`absolute inset-0 ${sizeClasses[size]} ${color} rounded-full animate-ping opacity-75`}></div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  animated?: boolean;
}

export function ProgressBar({ progress, color = 'bg-teal-500', animated = true }: ProgressBarProps) {
  return (
    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500 ease-out ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'idle' | 'error' | 'warning';
  label?: string;
  value?: string | number;
  animated?: boolean;
}

export function StatusIndicator({ status, label, value, animated = true }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: '🟢',
          dotColor: 'bg-green-400'
        };
      case 'offline':
        return {
          color: 'text-zinc-400',
          bgColor: 'bg-zinc-500/20',
          icon: '⚫',
          dotColor: 'bg-zinc-400'
        };
      case 'busy':
        return {
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          icon: '🟠',
          dotColor: 'bg-orange-400'
        };
      case 'idle':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          icon: '🟡',
          dotColor: 'bg-yellow-400'
        };
      case 'error':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          icon: '🔴',
          dotColor: 'bg-red-400'
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          icon: '⚠️',
          dotColor: 'bg-yellow-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}>
      {animated ? (
        <PulseDot color={config.dotColor} size="sm" />
      ) : (
        <span className="text-sm">{config.icon}</span>
      )}
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${config.color}`}>
          {value || config.icon}
        </span>
        {label && (
          <span className="text-xs text-zinc-400">{label}</span>
        )}
      </div>
    </div>
  );
}

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label, 
  position = 'bottom-right',
  color = 'bg-gradient-to-r from-teal-500 to-cyan-500'
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses[position]} ${color} text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-40 group`}
      aria-label={label}
    >
      <div className="flex items-center space-x-2">
        <span className="group-hover:rotate-90 transition-transform duration-300">
          {icon}
        </span>
        {label && (
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
    </button>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          confirmColor: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-500/30'
        };
      case 'danger':
        return {
          icon: '🗑️',
          confirmColor: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-500/30'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmColor: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-500/30'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className={`relative bg-gradient-to-br from-zinc-900 to-zinc-800 border ${config.borderColor} rounded-lg p-6 max-w-md w-full shadow-xl`}>
        <div className="text-center">
          <div className="text-4xl mb-4">{config.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 mb-6">{message}</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${config.confirmColor} text-white px-4 py-2 rounded-lg transition-colors duration-300`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
