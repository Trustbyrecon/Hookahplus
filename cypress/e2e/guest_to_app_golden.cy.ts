describe("Guest → App sync (Golden Path)", () => {
  const email = `qa+wl1+${Date.now()}@example.com`;
  const loungeId = Cypress.env("TEST_LOUNGE_ID");

  it("T-01 Waitlist → Lead within 5s with Reflex/GhostLog entries", () => {
    cy.submitWaitlist(email, {
      utm_source: "e2e",
      utm_medium: "test",
      utm_campaign: "sync",
      ref_code: "CREW-TEST",
    }).its("status").should("eq", 200);

    cy.getLeadByEmail(email).then((res) => {
      expect(res.status).to.eq(200);
      const lead = res.body?.lead;
      expect(lead.email).to.eq(email);
      expect(lead.utm_source).to.eq("e2e");
      expect(lead.ref_code).to.eq("CREW-TEST");
    });

    // Check events stream for Reflex + GhostLog + payload seal
    cy.getEvents().then((res) => {
      const events = res.body?.events || [];
      const waitlist = events.find((e: any) => e.type === "guest.event.waitlist_submitted");
      const created = events.find((e: any) => e.type === "app.lead.created");
      expect(waitlist).to.exist;
      expect(created).to.exist;
      expect(created.payload_hash).to.eq(waitlist.payload_hash);
    });
  });

  it("T-02/T-03 Pre-order (Stripe test) → Order + Session seed", () => {
    cy.startPreorder(["mint", "peach"], loungeId).then((res) => {
      expect(res.status).to.eq(200);
      const { payment_intent_id, session_seed_id } = res.body;
      expect(payment_intent_id).to.be.a("string");
      expect(session_seed_id).to.be.a("string");

      cy.completeStripeTest();
      cy.waitForWebhook(payment_intent_id);

      cy.getOrderByPaymentIntent(payment_intent_id).then((o) => {
        const order = o.body?.order;
        expect(order.lounge_id).to.eq(loungeId);
        expect(order.payment_intent_id).to.eq(payment_intent_id);
        expect(order.flavor_mix).to.include.members(["mint", "peach"]);
      });

      cy.getSessionById(session_seed_id).then((s) => {
        const session = s.body?.session;
        expect(session.status).to.match(/pending_guest_arrival|ready_to_start/);
        expect(session.flavor_mix).to.include.members(["mint", "peach"]);
      });

      cy.getEvents().then((res) => {
        const events = res.body?.events || [];
        const paid = events.find((e: any) => e.type === "order.paid" && e.payment_intent_id === payment_intent_id);
        expect(paid).to.exist;
      });
    });
  });

  it("T-04 QR → Session handoff", () => {
    // Create a fresh preorder to get a session id
    cy.startPreorder(["lemon", "mint"], loungeId).then((res) => {
      const { session_seed_id, payment_intent_id } = res.body;
      cy.completeStripeTest();
      cy.waitForWebhook(payment_intent_id);

      cy.scanQR(session_seed_id).its("status").should("eq", 200);

      cy.getSessionById(session_seed_id).then((s) => {
        const session = s.body?.session;
        expect(session.status).to.match(/arrived|ready_to_start/);
      });

      cy.getEvents().then((res) => {
        const events = res.body?.events || [];
        const joined = events.find((e: any) => e.type === "qr.session.joined" && e.session_id === session_seed_id);
        expect(joined).to.exist;
      });
    });
  });

  it("T-05 Referral attribution present in Order & Analytics", () => {
    cy.startPreorder(["mint"], loungeId, {
      ref: "CREW-ALPHA",
      utm_source: "ig",
      utm_campaign: "softlaunch",
    }).then((res) => {
      const { payment_intent_id } = res.body;
      cy.completeStripeTest();
      cy.waitForWebhook(payment_intent_id);

      cy.getOrderByPaymentIntent(payment_intent_id).then((o) => {
        const order = o.body?.order;
        expect(order.ref_source).to.eq("ig");
        expect(order.ref_campaign).to.eq("softlaunch");
        expect(order.ref_code).to.eq("CREW-ALPHA");
      });

      cy.request("GET", "/api/admin/analytics/referrals?code=CREW-ALPHA").then((a) => {
        expect(a.status).to.eq(200);
        expect(a.body?.count).to.be.greaterThan(0);
      });
    });
  });

  it("SessionNotes private stub stored & linked", () => {
    cy.startPreorder(["mint"], loungeId).then((res) => {
      const { session_seed_id, payment_intent_id } = res.body;
      cy.completeStripeTest();
      cy.waitForWebhook(payment_intent_id);

      cy.addSessionNote(session_seed_id, "prefers mint-heavy mixes").its("status").should("eq", 200);

      cy.request("GET", `/api/session/notes?session_id=${session_seed_id}`).then((n) => {
        const note = n.body?.notes?.[0];
        expect(note.note).to.eq("prefers mint-heavy mixes");
        expect(note.visibility).to.eq("private");
      });
    });
  });
});
