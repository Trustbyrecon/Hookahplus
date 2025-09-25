import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.3', // FORCE VERCEL DEPLOYMENT - Final Supabase removal fix
    app: 'hookahplus-app',
    build: 'ee61e97' // Reference to commit with complete Supabase removal
  });
}
