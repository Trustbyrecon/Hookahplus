#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const MODE = parseMode(process.argv.slice(2));

const BASE_REF = process.env.SECRET_GUARD_BASE_REF || "origin/main";

const BLOCKED_FILE_PATTERNS = [
  /(^|\/)\.env$/i,
  /(^|\/)\.env\.(?:local|development|production|test)$/i,
  /(^|\/)id_rsa$/i,
  /(^|\/).*\.pem$/i,
  /(^|\/)credentials\.json$/i,
  /(^|\/)secrets?\.json$/i,
];

// Allowlist is evaluated before secret patterns. Use this to avoid blocking known-safe
// public keys, placeholders, fixtures, or docs containing illustrative strings.
const ALLOWLIST_PATH_PATTERNS = [
  /(^|\/)\.env\.example$/i,
  /(^|\/)LAUNCH_CHECKLIST\.md$/i,
  /(^|\/)hookahplus-v2-\/LAUNCH_CHECKLIST\.md$/i,
];

const ALLOWLIST_LINE_PATTERNS = [
  /\bSUPABASE_ANON_KEY\b/i, // public (anon) key is expected in docs/tests
  /\bpk_(?:live|test)_[0-9A-Za-z]{10,}\b/, // publishable keys are not secrets
];

const SECRET_PATTERNS = [
  { name: "Private key block", regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "AWS Access Key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: "GitHub token", regex: /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{80,})\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "Stripe live secret", regex: /\b(?:sk_live|rk_live)_[0-9A-Za-z]{16,}\b/ },
  { name: "Google API key", regex: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { name: "JWT token", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
];

if (process.env.ALLOW_LEAK_SCAN_BYPASS === "1") {
  console.warn("[secret-guard] Bypass enabled by ALLOW_LEAK_SCAN_BYPASS set to 1");
  process.exit(0);
}

try {
  ensureGitRepo();
  const findings =
    MODE === "all" ? scanAllTrackedFiles() : scanPatch(getDiffPatch(MODE));

  if (findings.length > 0) {
    console.error("\n[secret-guard] Commit/push blocked: potential secret(s) detected.\n");
    for (const finding of findings) {
      console.error(`- ${finding.file}:${finding.line} [${finding.type}]`);
      console.error(`  ${finding.content}`);
    }
    console.error(
      "\nResolve the findings or rotate/remove the secret before committing.\n" +
        "If this is a confirmed false positive, refactor the string so it is not secret-like."
    );
    process.exit(1);
  }

  console.log("[secret-guard] No secret-like values detected.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[secret-guard] Failed to run scan: ${message}`);
  process.exit(2);
}

function parseMode(args) {
  if (args.includes("--all")) return "all";
  if (args.includes("--range")) return "range";
  return "staged";
}

function ensureGitRepo() {
  run("git rev-parse --is-inside-work-tree");
}

function getDiffPatch(mode) {
  if (mode === "range") {
    // Default: scan what differs from mainline to avoid missing local-only commits.
    // Uses merge-base(HEAD, origin/main) when available.
    const base = tryMergeBase(BASEREF());
    if (base) {
      return run(`git diff --no-color --unified=0 ${base}..HEAD`);
    }

    // Fallback: upstream tracking branch if configured.
    const upstream = tryRun("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
    if (upstream) return run(`git diff --no-color --unified=0 ${upstream}...HEAD`);

    const root = run("git rev-list --max-parents=0 HEAD | tail -n 1");
    return run(`git diff --no-color --unified=0 ${root}...HEAD`);
  }
  return run("git diff --cached --no-color --unified=0");
}

function BASEREF() {
  // Allow override like "origin/master" or a SHA via env var.
  return BASE_REF;
}

function tryMergeBase(ref) {
  if (!ref) return "";
  const exists = tryRun(`git rev-parse --verify ${ref}`);
  if (!exists) return "";
  return tryRun(`git merge-base HEAD ${ref}`) || "";
}

function scanPatch(patch) {
  const findings = [];
  if (!patch.trim()) return findings;

  const lines = patch.split("\n");
  let file = "";
  let newLine = 0;

  for (const rawLine of lines) {
    const line = rawLine ?? "";

    if (line.startsWith("+++ b/")) {
      file = line.slice("+++ b/".length).trim();
      continue;
    }

    if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+)(?:,\d+)?/);
      newLine = match ? Number(match[1]) : 0;
      continue;
    }

    if (!file) continue;

    if (line.startsWith("+") && !line.startsWith("+++")) {
      const content = line.slice(1);
      evaluateLine(findings, file, newLine, content);
      newLine += 1;
      continue;
    }

    if (line.startsWith(" ")) {
      newLine += 1;
    }
  }

  return findings;
}

function scanAllTrackedFiles() {
  const files = run("git ls-files -z")
    .split("\0")
    .map((f) => f.trim())
    .filter(Boolean);

  const findings = [];

  for (const file of files) {
    if (isBlockedFile(file)) {
      findings.push({
        file,
        line: 1,
        type: "Blocked sensitive filename",
        content: "File path is blocked by secret policy.",
      });
      continue;
    }

    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    if (content.includes("\u0000")) continue;

    const rows = content.split("\n");
    for (let i = 0; i < rows.length; i += 1) {
      evaluateLine(findings, file, i + 1, rows[i]);
    }
  }

  return findings;
}

function evaluateLine(findings, file, line, content) {
  if (!content || content.trim().length === 0) return;
  if (content.trimStart().startsWith("#")) return;
  if (isAllowlistedPath(file)) return;
  if (isAllowlistedLine(content)) return;
  if (isPlaceholderLike(content)) return;

  if (isBlockedFile(file)) {
    findings.push({
      file,
      line,
      type: "Blocked sensitive filename",
      content: trimForLog(content),
    });
    return;
  }

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.name === "JWT token") {
      // Skip known-public JWT-like values (anon/public keys) but keep catching private ones
      // like service-role keys.
      const isPublicish = /(?:ANON_KEY|NEXT_PUBLIC|PUBLIC)/i.test(content);
      const isServiceRole = /SERVICE[_-]?ROLE/i.test(content);
      if (isPublicish && !isServiceRole) continue;
    }

    if (pattern.regex.test(content)) {
      findings.push({
        file,
        line,
        type: pattern.name,
        content: trimForLog(content),
      });
    }
  }
}

function isBlockedFile(file) {
  const normalized = file.replace(/\\/g, "/");
  return BLOCKED_FILE_PATTERNS.some((regex) => regex.test(normalized));
}

function isAllowlistedPath(file) {
  const normalized = file.replace(/\\/g, "/");
  return ALLOWLIST_PATH_PATTERNS.some((regex) => regex.test(normalized));
}

function isAllowlistedLine(content) {
  return ALLOWLIST_LINE_PATTERNS.some((regex) => regex.test(content));
}

function trimForLog(line) {
  const cleaned = line.replace(/\s+/g, " ").trim();
  return cleaned.length <= 200 ? cleaned : `${cleaned.slice(0, 200)}...`;
}

function isPlaceholderLike(content) {
  return (
    /\b(?:example|placeholder|dummy|sample|fake)\b/i.test(content) ||
    /x{6,}/i.test(content) ||
    /\benv\(/i.test(content) ||
    /\b(?:pst_test_|test_123)\b/i.test(content)
  );
}

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trimEnd();
}

function tryRun(command) {
  try {
    return run(command);
  } catch {
    return "";
  }
}
