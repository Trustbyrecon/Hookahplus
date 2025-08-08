// netlify/functions/sessionNotes.js
// Stores private session notes by writing to Stripe metadata (no external DB needed).
// POST JSON: { sessionId?: string, checkoutSessionId?: string, loungeId?: string, notes: string }
//
// Priority:
// 1) If checkoutSessionId provided: fetch → get payment_intent → update metadata.hp_notes
// 2) Else if sessionId provided: search payment intents by metadata.hp_session_id and update first match
//
// Requires env: STRIPE_SECRET_KEY

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { sessionId, checkoutSessionId, loungeId = 'demo-lounge-001', notes } = body;

    if (!notes || !notes.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'notes required' }) };
    }

    let paymentIntentId = null;
    let checkoutId = checkoutSessionId;

    if (checkoutId) {
      // Retrieve Checkout Session to find Payment Intent
      const cs = await stripe.checkout.sessions.retrieve(checkoutId);
      paymentIntentId = cs.payment_intent || null;
    } else if (sessionId) {
      // Search for PaymentIntent by metadata hp_session_id
      // Note: Stripe Search API must be enabled on the account.
      const query = `metadata['hp_session_id']:'${sessionId}'`;
      const results = await stripe.paymentIntents.search({ query, limit: 1 });
      if (results.data && results.data.length) {
        paymentIntentId = results.data[0].id;
      }
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'provide sessionId or checkoutSessionId' }) };
    }

    if (!paymentIntentId) {
      return { statusCode: 404, body: JSON.stringify({ error: 'payment_intent not found for provided id(s)' }) };
    }

    // Update PI metadata with private notes and lounge id
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        hp_private_notes: notes,
        hp_notes_updated_at: new Date().toISOString(),
        hp_lounge_id: loungeId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        payment_intent: updated.id,
        notes_length: notes.length
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
