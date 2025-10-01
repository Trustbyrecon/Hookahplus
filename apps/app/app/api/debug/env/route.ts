import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow in development or with specific debug key
  const debugKey = req.nextUrl.searchParams.get('key');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && debugKey !== 'debug-stripe-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      region: process.env.VERCEL_REGION,
      url: process.env.VERCEL_URL
    },
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      publicKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.substring(0, 10) + '...',
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
    },
    app: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      prettyTheme: process.env.NEXT_PUBLIC_PRETTY_THEME
    }
  });
}
