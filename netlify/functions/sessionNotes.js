const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const { sessionId, checkoutSessionId, loungeId='demo-lounge-001', notes } = body;
    if (!notes || !notes.trim()) return { statusCode: 400, body: JSON.stringify({ error: 'notes required' }) };

    let paymentIntentId = null;
    if (checkoutSessionId) {
      const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      paymentIntentId = cs.payment_intent || null;
    } else if (sessionId) {
      const query = `metadata['hp_session_id']:'${sessionId}'`;
      const res = await stripe.paymentIntents.search({ query, limit: 1 });
      if (res.data?.length) paymentIntentId = res.data[0].id;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'provide sessionId or checkoutSessionId' }) };
    }

    if (!paymentIntentId) return { statusCode: 404, body: JSON.stringify({ error: 'payment_intent not found for provided id(s)' }) };

    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { hp_private_notes: notes, hp_notes_updated_at: new Date().toISOString(), hp_lounge_id: loungeId }
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true, payment_intent: updated.id, notes_length: notes.length }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};