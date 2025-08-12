const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const sig = event.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return { statusCode: 500, body: 'Webhook secret not configured' };

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret);
    } catch (e) {
      console.error('Webhook verify fail:', e.message);
      return { statusCode: 400, body: `Webhook Error: ${e.message}` };
    }

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const s = stripeEvent.data.object;
        console.log('✅ checkout.session.completed', {
          id: s.id,
          amount_total: s.amount_total,
          hp_ref: s.metadata?.hp_ref,
          hp_session_id: s.metadata?.hp_session_id,
          hp_flavor_mix: s.metadata?.hp_flavor_mix,
        });
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = stripeEvent.data.object;
        console.log('💸 payment_intent.succeeded', { id: pi.id, amount: pi.amount, currency: pi.currency });
        break;
      }
      default:
        console.log('ℹ️ Unhandled event', stripeEvent.type);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (e) {
    console.error('err', e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

exports.config = { path: '/stripeWebhook', bodyParser: false };