// Hookah+ Stripe SaaS Billing Integration
export const stripeCheckout = async (tier) => {
  const response = await fetch("/.netlify/functions/createStripeCheckout", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
  const { url } = await response.json();
  window.location.href = url;
};
