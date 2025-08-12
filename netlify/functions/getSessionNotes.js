const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
    const qs = event.queryStringParameters || {};
    const sessionId = qs.sessionId;
    const checkoutSessionId = qs.checkoutSessionId;
    const limit = Math.min(parseInt(qs.limit||'10',10)||10,50);

    let results = [];

    if (checkoutSessionId) {
      const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      const piId = cs.payment_intent;
      if (!piId) return { statusCode: 404, body: JSON.stringify({ error: 'payment_intent not found for checkout session' }) };
      const pi = await stripe.paymentIntents.retrieve(piId);
      results = [pi];
    } else if (sessionId) {
      const query = `metadata['hp_session_id']:'${sessionId}'`;
      const res = await stripe.paymentIntents.search({ query, limit: 1 });
      results = res.data;
    } else {
      const query = "metadata['hp_private_notes']:'*'";
      try {
        const res = await stripe.paymentIntents.search({ query, limit });
        results = res.data;
      } catch {
        const res = await stripe.paymentIntents.list({ limit });
        results = res.data.filter(pi => pi.metadata?.hp_private_notes);
      }
    }

    const out = results.map(pi => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      created: pi.created,
      status: pi.status,
      hp_session_id: pi.metadata?.hp_session_id || null,
      hp_ref: pi.metadata?.hp_ref || null,
      hp_flavor_mix: pi.metadata?.hp_flavor_mix || null,
      hp_private_notes: pi.metadata?.hp_private_notes || null,
      hp_notes_updated_at: pi.metadata?.hp_notes_updated_at || null,
      lounge: pi.metadata?.hp_lounge_id || null
    }));

    return { statusCode: 200, body: JSON.stringify({ ok:true, count: out.length, items: out }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};