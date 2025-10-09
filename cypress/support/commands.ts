// Add your real endpoints here if different.
declare global {
  namespace Cypress {
    interface Chainable {
      submitWaitlist(email: string, utm?: Record<string,string>): Chainable<any>;
      startPreorder(flavors: string[], loungeId: string, ref?: Record<string,string>): Chainable<any>;
      completeStripeTest(): Chainable<any>;
      scanQR(sessionId: string): Chainable<any>;
      addSessionNote(sessionId: string, note: string): Chainable<any>;

      // Assertions / fetchers
      getLeadByEmail(email: string): Chainable<any>;
      getOrderByPaymentIntent(pi: string): Chainable<any>;
      getSessionById(sessionId: string): Chainable<any>;
      getEvents(limit?: number): Chainable<any>;
      waitForWebhook(pi: string): Chainable<any>;
    }
  }
}

Cypress.Commands.add("submitWaitlist", (email, utm = {}) => {
  return cy.request("POST", "/api/leads", {
    email,
    utm_source: utm.utm_source || "e2e",
    utm_medium: utm.utm_medium || "test",
    utm_campaign: utm.utm_campaign || "sync",
    ref_code: utm.ref_code || undefined,
  });
});

Cypress.Commands.add("startPreorder", (flavors, loungeId, ref = {}) => {
  return cy.request("POST", "/api/preorders", {
    flavor_mix: flavors,
    lounge_id: loungeId,
    ref_code: ref.ref,
    utm_source: ref.utm_source,
    utm_campaign: ref.utm_campaign,
    amount: 3500, // cents
    currency: "usd",
  });
});

Cypress.Commands.add("completeStripeTest", () => {
  // If you return a Checkout URL, you can mock completion or trigger via test webhook.
  return cy.request("POST", "/api/test/stripe/checkout-complete", {
    card: "4242 4242 4242 4242",
  });
});

Cypress.Commands.add("scanQR", (sessionId) => {
  return cy.request("POST", "/api/session/join", { session_id: sessionId });
});

Cypress.Commands.add("addSessionNote", (sessionId, note) => {
  return cy.request("POST", "/api/session/notes", {
    session_id: sessionId,
    note,
    visibility: "private",
  });
});

Cypress.Commands.add("getLeadByEmail", (email) => {
  return cy.request("GET", `/api/leads?email=${encodeURIComponent(email)}`);
});

Cypress.Commands.add("getOrderByPaymentIntent", (pi) => {
  return cy.request("GET", `/api/orders?payment_intent_id=${encodeURIComponent(pi)}`);
});

Cypress.Commands.add("getSessionById", (sessionId) => {
  return cy.request("GET", `/api/sessions/${encodeURIComponent(sessionId)}`);
});

Cypress.Commands.add("getEvents", (limit = 50) => {
  return cy.request("GET", `/api/admin/sync/events?limit=${limit}`);
});

Cypress.Commands.add("waitForWebhook", (pi) => {
  return cy.wrap(null).then(() => {
    // simple poll loop
    const maxTries = 10;
    let tries = 0;
    function check() {
      tries++;
      return cy
        .request("GET", `/api/webhooks/stripe/status?payment_intent_id=${pi}`)
        .then((res) => {
          const ok = res.body?.delivered === true;
          if (ok) return;
          if (tries >= maxTries) throw new Error("Stripe webhook not delivered in time");
          return cy.wait(500).then(check);
        });
    }
    return check();
  });
});
