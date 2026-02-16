import type { NextApiRequest, NextApiResponse } from 'next';
import type { AnalyticsEvent } from './events';

type Event = AnalyticsEvent;
const trustStore: Record<string, number> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const staffId = String(
    (req.method === 'GET' ? req.query.staffId : req.body?.staffId) || 'anon'
  );
  const sessionId = String(
    (req.method === 'GET' ? req.query.sessionId : req.body?.sessionId) ||
      'default'
  );
  const key = `${sessionId}:${staffId}`;

  if (req.method === 'GET') {
    const trust = trustStore[key] ?? 7.9;
    return res.status(200).json({ trust });
  }

  if (req.method === 'POST') {
    const events: Event[] = Array.isArray(req.body?.events)
      ? req.body.events
      : [
          {
            delta: req.body?.delta,
            trigger: req.body?.trigger,
            sessionId,
            staffId,
            zone: req.body?.zone || 'unknown',
            flavor: req.body?.flavor || 'unknown',
            latency: Number(req.body?.latency || 0),
            timestamp: Date.now(),
          },
        ];
    const totalDelta = events.reduce(
      (sum, e) => sum + Number(e.delta || 0),
      0
    );
    const current = trustStore[key] ?? 7.9;
    const next = Math.max(0, Math.min(10, current + totalDelta));
    trustStore[key] = next;
    // TODO: persist per lounge/session/staff in DB
    return res.status(200).json({ trust: next, events });
  }

  res.status(405).end();
}
