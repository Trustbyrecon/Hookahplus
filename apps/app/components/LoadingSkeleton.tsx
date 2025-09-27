import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded ${className}`}>
      {children}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6 rounded-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center space-x-2 mt-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className="flex space-x-2 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24" />
      ))}
    </div>
  );
}

export function FlowOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-8 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
