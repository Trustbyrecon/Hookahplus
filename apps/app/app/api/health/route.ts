import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.4', // FORCE VERCEL DEPLOYMENT - Breakthrough Supabase package removal
    app: 'hookahplus-app',
    build: '539bd35' // Reference to breakthrough commit with complete Supabase package removal
  });
}
