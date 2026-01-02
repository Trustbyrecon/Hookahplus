'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function DashboardRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const lounge = searchParams.get('lounge');
    const welcome = searchParams.get('welcome');
    
    // Build redirect URL to fire-session-dashboard
    const params = new URLSearchParams();
    if (lounge) {
      params.set('lounge', lounge);
    }
    if (welcome === 'true') {
      params.set('welcome', 'true');
    }
    
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

