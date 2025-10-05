export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getEnvVar } from "../../../lib/env";

const stripe = new Stripe(getEnvVar('STRIPE_SECRET_KEY'));

async function readRawBody(req: Request): Promise<string> {
  return req.text();
}

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return Response.json("Missing stripe-signature header", { status: 400 });
    }

    const raw = await readRawBody(req);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return Response.json(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const loungeId = (session.metadata?.loungeId as string) || "default";
      const externalRef = session.id; // anchor by Stripe session id

      await prisma.session.upsert({
        where: { 
          loungeId_externalRef: { 
            loungeId, 
            externalRef 
          } 
        },
        update: {},
        create: {
          loungeId,
          source: "QR", // or map your flow based on metadata
          externalRef,
          trustSignature: session.client_reference_id ?? session.id,
          customerPhone: session.customer_details?.phone,
          events: { 
            create: { 
              type: "CREATED", 
              payloadSeal: session.id, 
              data: session as any 
            } 
          }
        }
      });
    }

    return Response.json("ok", { status: 200 });
  } catch (error: any) {
    return Response.json({ 
      error: "Webhook handler failed",
      details: error.message 
    }, { status: 500 });
  }
}