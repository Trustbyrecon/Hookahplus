#!/usr/bin/env tsx
/**
 * Cleanup Training Wheels Script
 * 
 * This script helps manage training wheels visibility in the Fire Session Dashboard.
 * It can:
 * - Mark First Light as completed
 * - Enable metrics
 * - Activate Alpha Stability mode
 * - Reset all flags (for testing)
 * 
 * Usage:
 *   npx tsx scripts/cleanup-training-wheels.ts [command]
 * 
 * Commands:
 *   mark-first-light    - Mark First Light as completed
 *   enable-metrics      - Enable metrics
 *   activate-alpha      - Activate Alpha Stability mode
 *   reset               - Reset all flags (for testing)
 *   status              - Show current flag status
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FLAGS_FILE = join(process.cwd(), 'apps/app/.feature-flags.json');

interface FeatureFlags {
  firstLightCompleted: boolean;
  firstLightFocus: boolean;
  metricsEnabled: boolean;
  alphaStabilityActive: boolean;
}

function loadFlags(): FeatureFlags {
  try {
    const content = readFileSync(FLAGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    // Default flags
    return {
      firstLightCompleted: false,
      firstLightFocus: false,
      metricsEnabled: false,
      alphaStabilityActive: false,
    };
  }
}

function saveFlags(flags: FeatureFlags): void {
  writeFileSync(FLAGS_FILE, JSON.stringify(flags, null, 2) + '\n');
}

function markFirstLight(): void {
  const flags = loadFlags();
  flags.firstLightCompleted = true;
  flags.firstLightFocus = false; // Remove focus mode
  saveFlags(flags);
  console.log('✅ First Light marked as completed');
  console.log('   Training wheels will be hidden on next page load');
}

function enableMetrics(): void {
  const flags = loadFlags();
  flags.metricsEnabled = true;
  saveFlags(flags);
  console.log('✅ Metrics enabled');
  console.log('   Real-time analytics are now active');
}

function activateAlpha(): void {
  const flags = loadFlags();
  flags.firstLightCompleted = true;
  flags.metricsEnabled = true;
  flags.alphaStabilityActive = true;
  flags.firstLightFocus = false;
  saveFlags(flags);
  console.log('✅ Alpha Stability mode activated');
  console.log('   All training wheels removed');
  console.log('   Metrics enabled');
  console.log('   Production-ready mode active');
}

function reset(): void {
  const flags = {
    firstLightCompleted: false,
    firstLightFocus: false,
    metricsEnabled: false,
    alphaStabilityActive: false,
  };
  saveFlags(flags);
  console.log('✅ All flags reset');
  console.log('   Training wheels will be visible again');
}

function status(): void {
  const flags = loadFlags();
  console.log('\n📊 Feature Flags Status:\n');
  console.log(`   First Light Completed: ${flags.firstLightCompleted ? '✅' : '❌'}`);
  console.log(`   First Light Focus:     ${flags.firstLightFocus ? '✅' : '❌'}`);
  console.log(`   Metrics Enabled:      ${flags.metricsEnabled ? '✅' : '❌'}`);
  console.log(`   Alpha Stability:       ${flags.alphaStabilityActive ? '✅' : '❌'}`);
  console.log('\n');
  
  if (flags.alphaStabilityActive) {
    console.log('🎉 Production-ready mode active!');
  } else if (flags.firstLightCompleted) {
    console.log('🚀 First Light achieved - ready for Alpha Stability');
  } else {
    console.log('🔧 Training wheels active - complete First Light to proceed');
  }
  console.log('');
}

// Main
const command = process.argv[2] || 'status';

switch (command) {
  case 'mark-first-light':
    markFirstLight();
    break;
  case 'enable-metrics':
    enableMetrics();
    break;
  case 'activate-alpha':
    activateAlpha();
    break;
  case 'reset':
    reset();
    break;
  case 'status':
  default:
    status();
    break;
}

