import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.E2E_BASE_URL || "http://localhost:3002",
    defaultCommandTimeout: 8000,
    retries: 1,
    env: {
      STAGING: "true",
      TRUST_LOCK: "on",
      STRIPE_MODE: "test",
      TEST_LOUNGE_ID: "L-TEST-001",
      TEST_OPERATOR_EMAIL: "op_test@example.com",
    },
  },
  video: false,
  viewportWidth: 1280,
  viewportHeight: 800,
});
