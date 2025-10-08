import crypto from 'crypto';

export const createGhostLogEntry = (event: any) => {
  const timestamp = new Date().toISOString();
  const eventData = JSON.stringify(event);
  const hash = crypto.createHash('sha256').update(eventData + timestamp).digest('hex');
  
  return {
    id: hash,
    timestamp,
    event,
    hash,
  };
};

export const hashGuestEvent = (eventType: string, guestId: string, loungeId: string, sessionId: string, data: any) => {
  const eventData = JSON.stringify({ eventType, guestId, loungeId, sessionId, data });
  const hash = crypto.createHash('sha256').update(eventData).digest('hex');
  return { ghostHash: hash };
};

export const hashSessionEvent = (event: any) => {
  const eventData = JSON.stringify(event);
  return crypto.createHash('sha256').update(eventData).digest('hex');
};
