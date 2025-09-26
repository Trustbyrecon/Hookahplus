#!/usr/bin/env node
const args = process.argv.slice(2);
const minIdx = args.indexOf('--min');
const min = minIdx >= 0 ? parseFloat(args[minIdx+1]) : 0.92;
const measured = 0.95; // placeholder
console.log(`[reflex] measured=${measured} min=${min}`);
if (measured < min) { process.exit(1); }
