'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mobile Performance Optimizer Component
 * -------------------------------------
 * Performance optimization component with:
 * - Lazy loading for images and components
 * - Virtual scrolling for large lists
 * - Memory management
 * - Network optimization
 * - Battery usage monitoring
 * - Performance metrics tracking
 */

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  batteryLevel: number;
  fps: number;
}

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enableVirtualScrolling?: boolean;
  enableMemoryManagement?: boolean;
  enableNetworkOptimization?: boolean;
  enableBatteryMonitoring?: boolean;
  enablePerformanceTracking?: boolean;
  className?: string;
}

export default function MobilePerformanceOptimizer({
  children,
  enableLazyLoading = true,
  enableVirtualScrolling = true,
  enableMemoryManagement = true,
  enableNetworkOptimization = true,
  enableBatteryMonitoring = true,
  enablePerformanceTracking = true,
  className
}: MobilePerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    batteryLevel: 100,
    fps: 60
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const performanceRef = useRef<PerformanceObserver | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (enableLazyLoading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } else {
      setIsVisible(true);
    }
  }, [enableLazyLoading]);

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceTracking) {
      // Monitor render performance
      const measureRenderTime = () => {
        const start = performance.now();
        requestAnimationFrame(() => {
          const end = performance.now();
          setMetrics(prev => ({
            ...prev,
            renderTime: end - start
          }));
        });
      };

      // Monitor FPS
      const measureFPS = () => {
        frameCountRef.current++;
        const now = performance.now();
        
        if (now - lastTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
          setMetrics(prev => ({
            ...prev,
            fps: fps
          }));
          
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
        
        requestAnimationFrame(measureFPS);
      };

      // Monitor memory usage
      const measureMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
          }));
        }
      };

      // Monitor network latency
      const measureNetwork = () => {
        const start = performance.now();
        fetch('/api/ping', { method: 'HEAD' })
          .then(() => {
            const latency = performance.now() - start;
            setMetrics(prev => ({
              ...prev,
              networkLatency: latency
            }));
          })
          .catch(() => {
            setMetrics(prev => ({
              ...prev,
              networkLatency: 999
            }));
          });
      };

      // Monitor battery level
      const measureBattery = () => {
        if ('getBattery' in navigator) {
          (navigator as any).getBattery().then((battery: any) => {
            setMetrics(prev => ({
              ...prev,
              batteryLevel: battery.level * 100
            }));
          });
        }
      };

      // Start monitoring
      measureRenderTime();
      measureFPS();
      measureMemory();
      measureNetwork();
      measureBattery();

      // Set up intervals
      const renderInterval = setInterval(measureRenderTime, 1000);
      const memoryInterval = setInterval(measureMemory, 5000);
      const networkInterval = setInterval(measureNetwork, 10000);
      const batteryInterval = setInterval(measureBattery, 30000);

      return () => {
        clearInterval(renderInterval);
        clearInterval(memoryInterval);
        clearInterval(networkInterval);
        clearInterval(batteryInterval);
      };
    }
  }, [enablePerformanceTracking]);

  // Performance optimization based on metrics
  useEffect(() => {
    const isLow = metrics.fps < 30 || metrics.memoryUsage > 0.8 || metrics.batteryLevel < 20;
    setIsLowPerformance(isLow);
  }, [metrics]);

  // Memory management
  useEffect(() => {
    if (enableMemoryManagement) {
      const cleanup = () => {
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      };

      // Cleanup on visibility change
      document.addEventListener('visibilitychange', cleanup);
      
      return () => {
        document.removeEventListener('visibilitychange', cleanup);
      };
    }
  }, [enableMemoryManagement]);

  // Network optimization
  useEffect(() => {
    if (enableNetworkOptimization) {
      // Preload critical resources
      const preloadCriticalResources = () => {
        const criticalResources = [
          '/api/session/start',
          '/api/session/update',
          '/api/session/end'
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = resource;
          document.head.appendChild(link);
        });
      };

      preloadCriticalResources();
    }
  }, [enableNetworkOptimization]);

  // Optimized children with performance enhancements
  const optimizedChildren = useMemo(() => {
    if (!isVisible && enableLazyLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
        </div>
      );
    }

    return children;
  }, [children, isVisible, enableLazyLoading]);

  return (
    <div className={`relative ${className || ''}`}>
      {/* Performance Optimized Content */}
      <div
        ref={(el) => {
          if (el && observerRef.current && enableLazyLoading) {
            observerRef.current.observe(el);
          }
        }}
        className={isLowPerformance ? 'opacity-75' : ''}
      >
        {optimizedChildren}
      </div>

      {/* Performance Metrics Display (Development Only) */}
      {process.env.NODE_ENV === 'development' && enablePerformanceTracking && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg z-50">
          <div>FPS: {metrics.fps}</div>
          <div>Memory: {Math.round(metrics.memoryUsage * 100)}%</div>
          <div>Battery: {Math.round(metrics.batteryLevel)}%</div>
          <div>Network: {Math.round(metrics.networkLatency)}ms</div>
          <div>Render: {Math.round(metrics.renderTime)}ms</div>
        </div>
      )}

      {/* Low Performance Warning */}
      <AnimatePresence>
        {isLowPerformance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 left-4 right-4 bg-yellow-500/90 text-black text-sm p-3 rounded-lg z-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
              <span>Performance optimized for your device</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    batteryLevel: 100,
    fps: 60
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Get current performance metrics
      const newMetrics: PerformanceMetrics = {
        renderTime: 0,
        memoryUsage: 0,
        networkLatency: 0,
        batteryLevel: 100,
        fps: 60
      };

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }

      // Battery level
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          newMetrics.batteryLevel = battery.level * 100;
        });
      }

      setMetrics(newMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Virtual Scrolling Component
export function VirtualScrollingList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;

  return (
    <div
      ref={setContainerRef}
      className={`overflow-auto ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
