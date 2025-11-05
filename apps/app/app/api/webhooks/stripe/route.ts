export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { PrismaClient } from '@prisma/client';
import crypto from "crypto";

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

async function readRawBody(req: Request): Promise<string> {
  // For Stripe webhook signature verification, we need the raw body
  // as a Buffer to preserve exact formatting (including newlines and whitespace)
  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('utf8');
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      console.error('[Stripe Webhook] Stripe not configured - missing STRIPE_SECRET_KEY');
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Check for both STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SECRET_APP
    // (some deployments use the _APP suffix for app-specific config)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_APP;
    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      console.error('[Stripe Webhook] Webhook secret not configured');
      console.error('[Stripe Webhook] Checked: STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_APP');
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Check DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[Stripe Webhook] DATABASE_URL not configured');
      console.error('[Stripe Webhook] Make sure DATABASE_URL is set for Production environment in Vercel');
      return Response.json({ 
        error: "Database not configured",
        details: "DATABASE_URL environment variable is missing. Please add it to Vercel Production environment variables."
      }, { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return Response.json("Missing stripe-signature header", { status: 400 });
    }

    // Read raw body - must be exact bytes as sent by Stripe
    const raw = await readRawBody(req);
    
    if (!raw || raw.length === 0) {
      console.error('[Stripe Webhook] Empty request body');
      return Response.json("Empty request body", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        raw,
        sig,
        webhookSecret
      );
      console.log('[Stripe Webhook] Verified event:', event.id, event.type);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      console.error('[Stripe Webhook] Body length:', raw.length);
      console.error('[Stripe Webhook] Signature header:', sig.substring(0, 20) + '...');
      return Response.json(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const loungeId = (session.metadata?.loungeId as string) || "default-lounge";
      const externalRef = session.id; // anchor by Stripe checkout session ID
      const tableId = (session.metadata?.tableId as string) || "T-001";
      
      // Parse flavorMix from metadata
      const flavorMix = session.metadata?.flavorMix || session.metadata?.flavors
        ? (session.metadata?.flavorMix || JSON.parse(session.metadata?.flavors || '[]'))
        : null;
      
      // Parse flavors array if available
      let flavorsArray: string[] = [];
      if (session.metadata?.flavors) {
        try {
          flavorsArray = JSON.parse(session.metadata.flavors);
        } catch {
          flavorsArray = [session.metadata.flavors];
        }
      }
      
      // Calculate price from session amount
      const priceCents = session.amount_total || 0;
      
      // Get payment intent ID if available
      const paymentIntentId = session.payment_intent as string | undefined;

      // Create trust signature
      const trustSignature = seal({
        loungeId,
        source: "QR",
        externalRef,
        customerPhone: session.customer_details?.phone,
        flavorMix,
      });

      // Create or update session
      // Check if session already exists by externalRef
      const existingSession = await prisma.session.findFirst({
        where: {
          externalRef: externalRef,
        },
      });

      if (existingSession) {
        // Update existing session
        await prisma.session.update({
          where: { id: existingSession.id },
          data: {
            paymentStatus: session.payment_status === 'paid' ? 'succeeded' : session.payment_status,
            paymentIntent: paymentIntentId,
            priceCents: priceCents,
          },
        });
      } else {
        // Generate QR code URL for staff scanning
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
        const sessionIdForQR = externalRef; // Use Stripe checkout session ID initially
        const qrScanUrl = `${baseUrl}/staff/scan/${sessionIdForQR}`;
        
        // Create new session
        const newSession = await prisma.session.create({
          data: {
            loungeId,
            source: "QR",
            externalRef,
            trustSignature,
            tableId,
            customerPhone: session.customer_details?.phone || undefined,
            flavor: flavorsArray.length > 0 ? flavorsArray[0] : undefined,
            flavorMix: flavorMix ? (typeof flavorMix === 'string' ? flavorMix : JSON.stringify(flavorMix)) : undefined,
            priceCents: priceCents,
            state: "NEW",
            paymentIntent: paymentIntentId,
            paymentStatus: session.payment_status === 'paid' ? 'succeeded' : session.payment_status,
            qrCodeUrl: qrScanUrl, // Store QR code URL for fraud prevention
          },
        });
        
        // Update QR code URL with actual session ID after creation
        const actualQrScanUrl = `${baseUrl}/staff/scan/${newSession.id}`;
        await prisma.session.update({
          where: { id: newSession.id },
          data: {
            qrCodeUrl: actualQrScanUrl,
          },
        });

        // Initialize Reflex Chain for new session
        try {
          const { initializeReflexChain } = await import('../../../../lib/reflex-chain/integration');
          const fireSession = {
            id: newSession.id,
            status: 'NEW' as const,
            flavorMix: flavorMix || undefined,
            tableId: tableId || undefined,
            source: 'QR' as const,
            notes: undefined,
          };
          await initializeReflexChain(fireSession as any);
          console.log('[Webhook] Reflex Chain initialized for session:', newSession.id);
        } catch (reflexError) {
          console.error('[Webhook] Failed to initialize Reflex Chain:', reflexError);
          // Don't fail the webhook if Reflex Chain initialization fails
        }
      }
    }

    return Response.json("ok", { status: 200 });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    return Response.json(
      {
        error: "Webhook handler failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

