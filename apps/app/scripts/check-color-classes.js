#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const bannedRegex = /\b(?:bg|text|border|from|to|via)-(?:black|white|gray-\d{1,3})\b/g;
const allowedExt = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html']);

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log('No files specified for palette check.');
  process.exit(0);
}

let failed = false;
for (const file of files) {
  const ext = path.extname(file);
  if (!allowedExt.has(ext) || !fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(bannedRegex);
  if (matches) {
    console.error(`${file}: found forbidden color classes: ${[...new Set(matches)].join(', ')}`);
    failed = true;
  }
}

if (failed) {
  console.error('Forbidden Tailwind color classes detected. Use moodbook palette instead.');
  process.exit(1);
} else {
  console.log('No forbidden Tailwind color classes found.');
}
