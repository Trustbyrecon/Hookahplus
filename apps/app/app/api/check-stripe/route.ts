import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      region: process.env.VERCEL_REGION
    },
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...',
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      publicKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.length || 0,
      publicKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.substring(0, 12) + '...'
    },
    app: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      prettyTheme: process.env.NEXT_PUBLIC_PRETTY_THEME
    }
  });
}
