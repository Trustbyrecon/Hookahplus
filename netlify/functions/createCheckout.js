const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const {
      sessionId,
      loungeId = 'demo-lounge-001',
      flavorMix = ['Mint', 'Blue Mist'],
      basePrice = 3000,
      addOns = [{ name: 'Premium Flavor', amount: 500 }],
      notes = '',
      ref = ''
    } = JSON.parse(event.body || '{}');

    const base = process.env.APP_BASE_URL || 'https://hookahplus.net';

    const line_items = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Hookah Session' },
          unit_amount: basePrice
        },
        quantity: 1
      },
      ...addOns.map(a => ({
        price_data: {
          currency: 'usd',
          product_data: { name: a.name },
          unit_amount: a.amount
        },
        quantity: 1
      }))
    ];

    const metadata = {
      hp_session_id: sessionId || `hp_${Date.now()}`,
      hp_lounge_id: loungeId,
      hp_flavor_mix: Array.isArray(flavorMix) ? flavorMix.join('|') : String(flavorMix || ''),
      hp_notes: notes,
      hp_ref: ref || ''
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata,
      success_url: `${base}/checkout/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};