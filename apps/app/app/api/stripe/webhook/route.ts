import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-06-20' 
});

const supaAdmin = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_ANON_KEY!, 
  {
    auth: { persistSession: false }
  }
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const raw = await req.text();
  
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET_APP!);
  } catch (e: any) {
    console.error('Webhook signature verification failed:', e.message);
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
  }

  console.log(`Processing webhook event: ${evt.type}`);

  try {
    switch (evt.type) {
      case 'checkout.session.completed': {
        const cs = evt.data.object as any;
        const venueId = cs.metadata?.venue_id;
        const sessionId = cs.metadata?.session_id;
        const extend = parseInt(cs.metadata?.extend_minutes || '0', 10);

        if (sessionId) {
          if (extend > 0) {
            // Extension: push ends_at
            const { data: s } = await supaAdmin
              .from('sessions')
              .select('ends_at')
              .eq('id', sessionId)
              .single();
              
            const base = s?.ends_at ? new Date(s.ends_at) : new Date();
            const ends = new Date(base.getTime() + extend * 60000);
            
            await supaAdmin
              .from('sessions')
              .update({ 
                ends_at: ends.toISOString(), 
                status: 'ACTIVE' 
              })
              .eq('id', sessionId);
              
            await supaAdmin.from('ghostlog').insert({
              venue_id: venueId, 
              session_id: sessionId, 
              actor: 'system', 
              event: 'SESSION_EXTENDED', 
              meta: { minutes: extend }
            });
          } else {
            // Initial payment: start now
            const duration = parseInt(cs.metadata?.duration_minutes || '90', 10);
            const ends = new Date(Date.now() + (duration * 60000));
            
            await supaAdmin
              .from('sessions')
              .update({
                status: 'ACTIVE', 
                started_at: new Date().toISOString(), 
                ends_at: ends.toISOString(),
                checkout_session_id: cs.id, 
                payment_intent_id: cs.payment_intent
              })
              .eq('id', sessionId);
              
            await supaAdmin.from('ghostlog').insert({
              venue_id: venueId, 
              session_id: sessionId, 
              actor: 'system', 
              event: 'SESSION_STARTED', 
              meta: { duration }
            });
          }
        }
        break;
      }

      case 'payment_intent.captured': {
        const pi = evt.data.object as any;
        if (pi.metadata?.type === 'reservation_hold') {
          await supaAdmin
            .from('reservations')
            .update({ status: 'NO_SHOW' })
            .eq('payment_intent_id', pi.id);
            
          await supaAdmin.from('ghostlog').insert({
            venue_id: pi.metadata.venue_id, 
            event: 'RESERVATION_CAPTURED', 
            meta: { table_id: pi.metadata.table_id }
          });
        }
        break;
      }

      case 'payment_intent.canceled': {
        const pi = evt.data.object as any;
        if (pi.metadata?.type === 'reservation_hold') {
          await supaAdmin
            .from('reservations')
            .update({ status: 'ARRIVED' })
            .eq('payment_intent_id', pi.id);
            
          await supaAdmin.from('ghostlog').insert({
            venue_id: pi.metadata.venue_id, 
            event: 'RESERVATION_CANCELLED', 
            meta: { table_id: pi.metadata.table_id }
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${evt.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
