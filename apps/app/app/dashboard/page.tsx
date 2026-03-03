'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function DashboardRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Accept legacy/alternate param names (some flows use loungeId).
    const lounge =
      searchParams.get('lounge') ||
      searchParams.get('loungeId') ||
      searchParams.get('lounge_id');
    const welcome = searchParams.get('welcome');
    const loungeIds = searchParams.get('loungeIds');
    const organizationId = searchParams.get('organizationId');
    
    // Build redirect URL to fire-session-dashboard (preserve demo/workflow params)
    const params = new URLSearchParams(searchParams.toString());
    // Normalize lounge parameter naming
    params.delete('loungeId');
    params.delete('lounge_id');
    if (lounge) {
      params.set('lounge', lounge);
    }
    if (!lounge && loungeIds) {
      // If we have a loungeIds list, pick the first one as the active lounge.
      const first = loungeIds.split(',').map((s) => s.trim()).filter(Boolean)[0];
      if (first) params.set('lounge', first);
      params.set('loungeIds', loungeIds);
    } else if (loungeIds) {
      params.set('loungeIds', loungeIds);
    }
    if (organizationId) {
      params.set('organizationId', organizationId);
    }
    if (welcome === 'true') params.set('welcome', 'true');
    else params.delete('welcome');
    
    const redirectUrl = `/fire-session-dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(redirectUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-white mb-2">Redirecting to Dashboard...</h2>
        <p className="text-zinc-400 text-sm">Setting up your lounge</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-white mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <DashboardRedirect />
    </Suspense>
  );
}

