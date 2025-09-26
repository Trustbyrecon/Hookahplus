#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');

const matrixPath = 'ops/env.matrix.yaml';
if (!fs.existsSync(matrixPath)) {
  console.error(`Missing env matrix at ${matrixPath}`);
  process.exit(2);
}

const envMatrix = yaml.load(fs.readFileSync(matrixPath, 'utf8'));
let hasMissing = false;

for (const [project, cfg] of Object.entries(envMatrix.projects)) {
  const required = (cfg.required_envs && cfg.required_envs.production) || [];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    hasMissing = true;
    console.error(`[${project}] missing required envs:`);
    for (const k of missing) console.error(` - ${k}`);
  } else {
    console.log(`[${project}] OK`);
  }
}

process.exit(hasMissing ? 1 : 0);
