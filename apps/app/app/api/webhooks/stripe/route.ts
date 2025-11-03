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
  return req.text();
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return Response.json("Missing stripe-signature header", { status: 400 });
    }

    const raw = await readRawBody(req);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        raw,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
      );
    } catch (err: any) {
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

