describe("Guest → App sync (Faults & Drift)", () => {
  const loungeId = Cypress.env("TEST_LOUNGE_ID");

  it("Webhook retry path (500 then 200) with no duplicates", () => {
    cy.request("POST", "/api/test/webhooks/stripe/toggle-failure", { active: true });

    cy.startPreorder(["mint"], loungeId).then((res) => {
      const { payment_intent_id, session_seed_id } = res.body;
      cy.completeStripeTest();

      // First check should fail delivery
      cy.wait(1000);
      cy.request("GET", `/api/webhooks/stripe/status?payment_intent_id=${payment_intent_id}`)
        .its("body.delivered").should("eq", false);

      // Disable failure to let retry succeed
      cy.request("POST", "/api/test/webhooks/stripe/toggle-failure", { active: false });

      cy.waitForWebhook(payment_intent_id);

      // Validate single order & session (idempotent)
      cy.getOrderByPaymentIntent(payment_intent_id).then((o) => {
        expect(o.body?.dupe).to.not.equal(true);
      });

      cy.getEvents().then((res) => {
        const events = res.body?.events || [];
        const fail = events.find((e: any) => e.type === "webhook.failover.trigger");
        const rec = events.find((e: any) => e.type === "webhook.recovered");
        expect(fail).to.exist;
        expect(rec).to.exist;
      });
    });
  });

  it("Duplicate form submit suppressed", () => {
    const email = `qa+dup+${Date.now()}@example.com`;
    cy.submitWaitlist(email);
    cy.submitWaitlist(email);
    cy.getLeadByEmail(email).then((res) => {
      expect(res.body?.lead?.deduped).to.eq(true);
    });
    cy.getEvents().then((r) => {
      const dup = r.body?.events?.find((e: any) => e.type === "guest.event.waitlist_submitted" && e.duplicate_suppressed);
      expect(dup).to.exist;
    });
  });

  it("Offline QR shows soft error, then succeeds after resume", () => {
    cy.request("POST", "/api/test/sessions/toggle-offline", { active: true });

    cy.startPreorder(["lemon"], loungeId).then((res) => {
      const { session_seed_id, payment_intent_id } = res.body;
      cy.completeStripeTest();
      cy.waitForWebhook(payment_intent_id);

      cy.scanQR(session_seed_id).then((r) => {
        expect([400, 503]).to.include(r.status);
      });

      cy.getEvents().then((res) => {
        const fail = res.body?.events?.find((e: any) => e.type === "qr.join.failed");
        expect(fail).to.exist;
      });

      cy.request("POST", "/api/test/sessions/toggle-offline", { active: false });
      cy.scanQR(session_seed_id).its("status").should("eq", 200);

      cy.getEvents().then((res) => {
        const ok = res.body?.events?.find((e: any) => e.type === "qr.session.joined" && e.session_id === session_seed_id);
        expect(ok).to.exist;
      });
    });
  });
});
