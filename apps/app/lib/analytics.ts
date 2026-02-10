// apps/app/lib/analytics.ts
// Lightweight analytics wrapper (GA4-first, Plausible optional).

export function track(name: string, data?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    (window as any).gtag?.("event", name, data);
  } catch {
    // ignore
  }

  try {
    (window as any).plausible?.(name, { props: data });
  } catch {
    // ignore
  }
}

