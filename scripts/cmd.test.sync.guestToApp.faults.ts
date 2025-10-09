import cypress from "cypress";

(async () => {
  const r = await cypress.run({
    spec: "cypress/e2e/guest_to_app_faults.cy.ts",
    headed: false,
  });
  if (r.totalFailed && r.totalFailed > 0) process.exit(1);
})();
