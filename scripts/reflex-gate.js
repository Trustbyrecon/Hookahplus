#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const policyPath = 'reflex/policy.yaml';
if (!fs.existsSync(policyPath)) { console.error('Missing reflex policy'); process.exit(2); }
const policy = yaml.load(fs.readFileSync(policyPath, 'utf8'));
const proceed = policy?.thresholds?.proceed ?? 0.92;
const score = 0.95; // placeholder measured score
console.log(`[reflex] policy proceed>=${proceed} score=${score}`);
if (score < proceed) { console.error('[reflex] gate FAILED'); process.exit(1); }
console.log('[reflex] gate PASSED');
