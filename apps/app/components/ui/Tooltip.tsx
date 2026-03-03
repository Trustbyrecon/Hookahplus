'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  variant?: 'default' | 'info' | 'warning' | 'success';
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  delay = 200,
  className = '',
  variant = 'default'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDelay, setShowDelay] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const variantStyles = {
    default: 'bg-zinc-800 text-white border-zinc-700',
    info: 'bg-blue-900/90 text-blue-100 border-blue-700',
    warning: 'bg-yellow-900/90 text-yellow-100 border-yellow-700',
    success: 'bg-green-900/90 text-green-100 border-green-700',
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 border-t-transparent border-b-transparent border-l-transparent',
  };

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowDelay(timeout);
  };

  const handleMouseLeave = () => {
    if (showDelay) {
      clearTimeout(showDelay);
      setShowDelay(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showDelay) {
        clearTimeout(showDelay);
      }
    };
  }, [showDelay]);

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm rounded-lg border shadow-lg pointer-events-none ${variantStyles[variant]} ${positionStyles[position]}`}
          role="tooltip"
          aria-live="polite"
        >
          {typeof content === 'string' ? (
            <p>{content}</p>
          ) : (
            content
          )}
          <div className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  );
}

interface HelpIconProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'info' | 'warning' | 'success';
  className?: string;
}

export function HelpIcon({ 
  content, 
  position = 'top',
  variant = 'info',
  className = ''
}: HelpIconProps) {
  return (
    <Tooltip content={content} position={position} variant={variant} className={className}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Help"
      >
        <HelpCircle className="w-3 h-3" />
      </button>
    </Tooltip>
  );
}

interface ContextualHelpProps {
  title: string;
  content: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContextualHelp({ title, content, children, className = '' }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {children}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-0 right-0 p-1 text-zinc-400 hover:text-white transition-colors"
        aria-label="Toggle help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-8 right-0 w-64 p-4 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Close help"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-zinc-300">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        </div>
      )}
    </div>
  );
}

