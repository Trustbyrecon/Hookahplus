import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.5',
    app: 'hookahplus-app',
    build: '8723e5e',
    env: process.env.NODE_ENV || 'development',
    ok: true
  });
}
