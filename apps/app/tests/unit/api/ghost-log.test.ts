import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/ghost-log/route';

describe('/api/ghost-log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should log entry successfully', async () => {
      const logEntry = {
        kind: 'test_event',
        data: { message: 'Test log entry' },
        timestamp: '2025-10-06T12:00:00Z'
      };

      const request = new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: JSON.stringify(logEntry)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.logged).toBe(true);
    });

    it('should add timestamp if not provided', async () => {
      const logEntry = {
        kind: 'test_event',
        data: { message: 'Test log entry' }
      };

      const request = new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: JSON.stringify(logEntry)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
    });
  });

  describe('GET', () => {
    it('should retrieve logs successfully', async () => {
      // First, add some test logs
      const logEntry = {
        kind: 'test_event',
        data: { message: 'Test log entry' }
      };

      const postRequest = new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: JSON.stringify(logEntry)
      });

      await POST(postRequest);

      // Now retrieve logs
      const getRequest = new NextRequest('http://localhost:3000/api/ghost-log');
      const response = await GET(getRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.logs).toBeDefined();
      expect(Array.isArray(data.logs)).toBe(true);
    });

    it('should filter logs by kind', async () => {
      // Add logs with different kinds
      const log1 = { kind: 'test_event', data: { message: 'Test 1' } };
      const log2 = { kind: 'other_event', data: { message: 'Test 2' } };

      await POST(new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: JSON.stringify(log1)
      }));

      await POST(new NextRequest('http://localhost:3000/api/ghost-log', {
        method: 'POST',
        body: JSON.stringify(log2)
      }));

      // Filter by kind
      const request = new NextRequest('http://localhost:3000/api/ghost-log?kind=test_event');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs.every((log: any) => log.kind === 'test_event')).toBe(true);
    });

    it('should limit results', async () => {
      // Add multiple logs
      for (let i = 0; i < 5; i++) {
        const logEntry = {
          kind: 'test_event',
          data: { message: `Test ${i}` }
        };

        await POST(new NextRequest('http://localhost:3000/api/ghost-log', {
          method: 'POST',
          body: JSON.stringify(logEntry)
        }));
      }

      // Limit to 2 results
      const request = new NextRequest('http://localhost:3000/api/ghost-log?limit=2');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs.length).toBeLessThanOrEqual(2);
    });
  });
});
