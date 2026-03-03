'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  frameRate: number;
}

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  enableOptimizations?: boolean;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

export default function MobilePerformanceOptimizer({
  children,
  enableOptimizations = true,
  onPerformanceUpdate,
  className = ''
}: MobilePerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    frameRate: 60
  });
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'high' | 'medium' | 'low'>('high');

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    if (!enableOptimizations) return;

    const startTime = performance.now();
    
    // Measure render time
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      
      // Measure memory usage (if available)
      const memoryUsage = (performance as any).memory 
        ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
        : 0;

      // Measure network latency (simplified)
      const networkStart = performance.now();
      fetch('/api/ping', { method: 'HEAD' })
        .then(() => {
          const networkLatency = performance.now() - networkStart;
          setMetrics(prev => ({
            ...prev,
            renderTime,
            memoryUsage,
            networkLatency
          }));
        })
        .catch(() => {
          setMetrics(prev => ({
            ...prev,
            renderTime,
            memoryUsage,
            networkLatency: 0
          }));
        });
    });
  }, [enableOptimizations]);

  // Frame rate monitoring
  useEffect(() => {
    if (!enableOptimizations) return;

    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const frameRate = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, frameRate }));
        
        // Adjust optimization level based on performance
        if (frameRate < 30) {
          setOptimizationLevel('low');
          setIsLowPerformance(true);
        } else if (frameRate < 45) {
          setOptimizationLevel('medium');
          setIsLowPerformance(false);
        } else {
          setOptimizationLevel('high');
          setIsLowPerformance(false);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrameRate);
    };
    
    measureFrameRate();
  }, [enableOptimizations]);

  // Performance optimization effects
  useEffect(() => {
    if (!enableOptimizations) return;

    // Reduce motion for low performance devices
    if (isLowPerformance) {
      document.documentElement.style.setProperty('--motion-reduce', '1');
    } else {
      document.documentElement.style.setProperty('--motion-reduce', '0');
    }

    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (optimizationLevel === 'low') {
        img.style.imageRendering = 'pixelated';
        img.style.filter = 'contrast(1.1) saturate(0.8)';
      } else {
        img.style.imageRendering = 'auto';
        img.style.filter = 'none';
      }
    });
  }, [isLowPerformance, optimizationLevel, enableOptimizations]);

  // Memoized children with performance optimizations
  const optimizedChildren = useMemo(() => {
    if (!enableOptimizations) return children;

    // Apply performance optimizations based on level
    const optimizations = {
      high: {
        motionReduced: false,
        imageQuality: 'high',
        animationDuration: 0.3,
        enableGestures: true
      },
      medium: {
        motionReduced: false,
        imageQuality: 'medium',
        animationDuration: 0.2,
        enableGestures: true
      },
      low: {
        motionReduced: true,
        imageQuality: 'low',
        animationDuration: 0.1,
        enableGestures: false
      }
    };

    const config = optimizations[optimizationLevel];
    
    return (
      <div 
        className={`${className} ${config.motionReduced ? 'motion-reduce' : ''}`}
        style={{
          '--animation-duration': `${config.animationDuration}s`,
          '--image-quality': config.imageQuality
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }, [children, optimizationLevel, enableOptimizations, className]);

  // Report performance metrics
  useEffect(() => {
    if (onPerformanceUpdate) {
      onPerformanceUpdate(metrics);
    }
  }, [metrics, onPerformanceUpdate]);

  // Performance monitoring interval
  useEffect(() => {
    if (!enableOptimizations) return;

    const interval = setInterval(measurePerformance, 1000);
    return () => clearInterval(interval);
  }, [measurePerformance, enableOptimizations]);

  return (
    <div className="relative">
      {optimizedChildren}
      
      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-2 text-xs text-zinc-300 z-50">
          <div className="space-y-1">
            <div>FPS: {metrics.frameRate}</div>
            <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
            <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
            <div>Level: {optimizationLevel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for mobile performance monitoring
export function useMobilePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    frameRate: 60
  });
  const [isOptimized, setIsOptimized] = useState(false);

  const optimizeForMobile = useCallback(() => {
    // Enable mobile-specific optimizations
    document.documentElement.style.setProperty('--mobile-optimized', '1');
    
    // Reduce animations on mobile
    if (window.innerWidth < 768) {
      document.documentElement.style.setProperty('--motion-reduce', '1');
    }
    
    // Optimize touch interactions
    document.documentElement.style.setProperty('--touch-optimized', '1');
    
    setIsOptimized(true);
  }, []);

  const resetOptimizations = useCallback(() => {
    document.documentElement.style.removeProperty('--mobile-optimized');
    document.documentElement.style.removeProperty('--motion-reduce');
    document.documentElement.style.removeProperty('--touch-optimized');
    setIsOptimized(false);
  }, []);

  return {
    metrics,
    isOptimized,
    optimizeForMobile,
    resetOptimizations
  };
}

// Mobile-specific CSS optimizations
export const mobileOptimizations = `
  @media (max-width: 768px) {
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    input, textarea {
      -webkit-user-select: text;
      -khtml-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    
    .motion-reduce * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .touch-optimized {
      touch-action: manipulation;
    }
    
    .mobile-optimized {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeSpeed;
    }
  }
`;
