import type { NextApiRequest, NextApiResponse } from 'next';

export type AnalyticsEvent = {
  delta?: number;
  sessionId: string;
  staffId: string;
  trigger: string;
  zone: string;
  flavor: string;
  latency: number;
  timestamp: number;
};

// In-memory analytics store. In production, replace with persistent storage.
const analyticsStore: AnalyticsEvent[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(200).json({ events: analyticsStore });
  }

  if (req.method === 'POST') {
    const events: AnalyticsEvent[] = Array.isArray(req.body?.events)
      ? req.body.events
      : [req.body];
    analyticsStore.push(
      ...events.map((e) => ({ ...e, timestamp: e.timestamp || Date.now() }))
    );
    return res.status(200).json({ stored: events.length });
  }

  res.status(405).end();
}

