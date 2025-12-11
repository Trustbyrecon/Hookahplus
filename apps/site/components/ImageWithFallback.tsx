'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fallbackText?: string;
  width?: number;
  height?: number;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  className = '',
  priority = false,
  fallbackText,
  width,
  height,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [useUnoptimized, setUseUnoptimized] = useState(false);

  // Handle image load errors - try unoptimized as fallback
  const handleError = () => {
    if (!useUnoptimized) {
      // First error: try unoptimized version
      setUseUnoptimized(true);
    } else {
      // Second error: show fallback UI
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`} style={!fill && width && height ? { width, height } : {}}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 flex flex-col items-center justify-center border border-teal-500/30 rounded-xl backdrop-blur-sm">
          <ImageIcon className="w-16 h-16 text-teal-400/60 mb-3" />
          {fallbackText && (
            <p className="text-sm text-teal-400/80 text-center px-6 max-w-sm font-medium mb-1">
              {fallbackText}
            </p>
          )}
          <p className="text-xs text-zinc-500/70 text-center px-4 mt-1">
            {alt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      unoptimized={useUnoptimized}
      onError={handleError}
    />
  );
}

