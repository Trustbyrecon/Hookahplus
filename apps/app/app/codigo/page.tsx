'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ONBOARDED_KEY = 'hp_codigo_onboarded_v1';
const MEMBER_ID_KEY = 'hp_codigo_member_id_v1';

/**
 * /codigo root — redirect based on onboarding state.
 * Not onboarded (no memberId or no onboarded flag) → /codigo/onboard
 * Onboarded → /codigo/operator
 */
export default function CodigoPage() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
    const memberId = (localStorage.getItem(MEMBER_ID_KEY) || '').trim();
    if (onboarded && memberId) {
      router.replace('/fire-session-dashboard?loungeIds=CODIGO');
    } else {
      router.replace('/codigo/onboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-500">Loading…</div>
    </div>
  );
}
