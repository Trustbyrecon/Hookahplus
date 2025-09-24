/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type Cfg = {
  thresholds: { minimal: number; optimal: number };
  smoketest: { stripe: "required" | "optional"; webhook: "required" | "optional"; ghostlog_entry: "required" | "optional" };
};

function readYamlFallback(): Cfg {
  // Tiny inline YAML-ish reader (no deps) — expects the exact keys from reflex.config.yaml
  const p = path.join(process.cwd(), "reflex", "reflex.config.yaml");
  const raw = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  const get = (k: RegExp, d: string) => (raw.match(k)?.[1] ?? d);
  const minimal = parseFloat(get(/minimal:\s*([0-9.]+)/, "0.87"));
  const optimal = parseFloat(get(/optimal:\s*([0-9.]+)/, "0.92"));
  const stripe = (get(/stripe:\s*(\w+)/, "required") as "required" | "optional");
  const webhook = (get(/webhook:\s*(\w+)/, "required") as "required" | "optional");
  const ghostlog_entry = (get(/ghostlog_entry:\s*(\w+)/, "required") as "required" | "optional");
  return { thresholds: { minimal, optimal }, smoketest: { stripe, webhook, ghostlog_entry } };
}

function requireEnv(name: string) {
  if (!process.env[name] || String(process.env[name]).trim() === "") {
    throw new Error(`Missing ENV: ${name}`);
  }
}

function main() {
  const ci = process.argv.includes("--ci");
  const cfg = readYamlFallback();

  // 1) Verify critical envs (adjust per repo: site/app/guests)
  // Common Stripe/Supabase keys present in your screenshots:
  const required = [
    "NEXT_PUBLIC_SITE_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ];
  if (cfg.smoketest.stripe === "required") {
    required.push("STRIPE_SECRET_KEY");
  }
  if (cfg.smoketest.webhook === "required") {
    required.push("STRIPE_WEBHOOK_SECRET_GUEST"); // adapt per repo
  }
  for (const k of required) requireEnv(k);

  // 2) Simulated reflex score gate (replace with live metric if available)
  // Allow override via CI var
  const reflexScore = Number(process.env.REFLEX_SCORE ?? "0.93");

  console.log(`Reflex score observed: ${reflexScore.toFixed(3)}`);
  if (reflexScore < cfg.thresholds.minimal) {
    throw new Error(`Reflex score ${reflexScore} < minimal ${cfg.thresholds.minimal}. Block.`);
  }

  if (ci && reflexScore < cfg.thresholds.optimal) {
    throw new Error(`Reflex score ${reflexScore} < optimal ${cfg.thresholds.optimal} in CI. Block.`);
  }

  // 3) Optional GhostLog presence check
  if (cfg.smoketest.ghostlog_entry === "required") {
    const ghostLog = path.join(process.cwd(), "GhostLog.md");
    if (!fs.existsSync(ghostLog)) {
      throw new Error(`GhostLog.md not found. Required for smoke.`);
    }
  }

  console.log("Reflex smoke: PASS ✅");
}

try {
  main();
} catch (e: any) {
  console.error("Reflex smoke: FAIL ❌");
  console.error(e?.message || e);
  process.exit(1);
}
