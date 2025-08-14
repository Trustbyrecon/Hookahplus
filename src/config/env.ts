// src/config/env.ts
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  APP_NAME: z.string(),
  APP_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_BASE_URL: z.string().url(),

  SC_ENABLED: z.string().transform(v => v === "true"),
  SC_API_KEY: z.string().min(1),
  SC_PROJECT_ID: z.string().min(1),
  SC_ENDPOINT: z.string().url().optional().or(z.literal("")),

  TRUST_LOCK_ENABLED: z.string().transform(v => v === "true"),
  TRUST_SIGNATURE_SALT: z.string().min(16),
  TRUST_CURSOR_SALT: z.string().min(16),
  TRUST_PAYLOAD_SEAL_SECRET: z.string().min(16),
  TRUST_ECHO_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  TRUST_FAILOVER_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  TRUST_FAILOVER_EMAILS: z.string().optional().or(z.literal("")),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_WEBHOOK_ENDPOINT_URL: z.string().url(),

  SESSION_BASE_PRICE_DEFAULT: z.string().default("30"),

  CLOVER_APP_ID: z.string().optional(),
  CLOVER_APP_SECRET: z.string().optional(),
  CLOVER_MERCHANT_ID: z.string().optional(),
  TOAST_API_KEY: z.string().optional(),
  TOAST_ENV: z.enum(["sandbox","production"]).default("sandbox"),

  SESSION_NOTES_KEY: z.string().min(16),
  JWT_SECRET: z.string().min(16),
  COOKIE_SECRET: z.string().min(16),

  FEATURE_REFLEX_LOG: z.string().transform(v => v === "true").default("true" as any),
  FEATURE_TRUST_GRAPH: z.string().transform(v => v === "true").default("true" as any),
  FEATURE_QR_PREORDER: z.string().transform(v => v === "true").default("true" as any),
  FEATURE_FLAVOR_MIX_HISTORY: z.string().transform(v => v === "true").default("true" as any),
  PRICING_DRIFT_WATCHER_ENABLED: z.string().transform(v => v === "true").default("true" as any),

  LOG_LEVEL: z.enum(["debug","info","warn","error"]).default("info"),
  SENTRY_DSN: z.string().optional().or(z.literal("")),

  NETLIFY_SITE_NAME: z.string().optional(),
  NETLIFY_CONTEXT: z.string().optional(),
});

export const env = schema.parse(process.env);
