import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.2', // FORCE VERCEL DEPLOYMENT - Dynamic import fixes applied
    app: 'hookahplus-app',
    build: 'df37716' // Reference to commit with dynamic import fixes
  });
}
