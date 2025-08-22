// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markPaid } from "../../../../lib/orders";
import { verifyTrust } from "../../../../lib/trustlock";

export const runtime = "nodejs"; // ensure Netlify uses Node runtime

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
  const sig = req.headers.get("stripe-signature")!;
  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? "";
    const trustSig = session.metadata?.trustSig ?? "";

    // Verify Trust-Lock signature bound at session creation
    if (!orderId || !trustSig || !verifyTrust(orderId, trustSig)) {
      return new NextResponse("Trust verification failed", { status: 400 });
    }

    // Mark order paid for dashboard
    markPaid(orderId);
    
    // Audit log (MVP)
    console.log(`audit.order.paid: ${new Date().toISOString()} | orderId: ${orderId} | tableId: ${session.metadata?.tableId} | trustSig: ${trustSig}`);
  }

  return NextResponse.json({ received: true });
}
