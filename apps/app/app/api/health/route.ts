import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.5', // FORCE VERCEL DEPLOYMENT - Regenerated lock file without Supabase
    app: 'hookahplus-app',
    build: '8723e5e' // Reference to commit with regenerated pnpm-lock.yaml without Supabase
  });
}
