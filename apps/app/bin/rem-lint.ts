#!/usr/bin/env node

/**
 * REM Linter CLI Tool
 * 
 * Agent: Lumi
 * 
 * Validates REM events and reports coverage statistics
 * 
 * Usage:
 *   rem-lint [file]              # Validate specific file
 *   rem-lint --coverage          # Check REM coverage
 *   rem-lint --migrate           # Migrate ReflexEvent to TrustEvent.v1
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { validateTrustEvent } from '../lib/reflex/rem-types';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  // When run from apps/app directory, this resolves to apps/app/prisma/dev.db
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

interface LintResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Lint a single TrustEvent
 */
function lintTrustEvent(event: any): LintResult {
  const validation = validateTrustEvent(event);
  
  const warnings: string[] = [];
  
  // Check for optional but recommended fields
  if (!event.context) {
    warnings.push('context is recommended but optional');
  }
  
  if (!event.behavior) {
    warnings.push('behavior is recommended but optional');
  }
  
  if (!event.sentiment) {
    warnings.push('sentiment is recommended but optional');
  }
  
  return {
    valid: validation.valid,
    errors: validation.errors,
    warnings,
  };
}

/**
 * Check REM coverage
 */
async function checkCoverage(): Promise<void> {
  console.log('[rem-lint] Checking REM coverage...\n');

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const allEvents = await prisma.reflexEvent.findMany({
    where: {
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  const remCompliant = allEvents.filter((event) => {
    if (!event.payload) return false;
    try {
      const payload = JSON.parse(event.payload);
      return payload.actor?.anon_hash && payload.effect?.loyalty_delta !== undefined;
    } catch {
      return false;
    }
  });

  const coverage = allEvents.length > 0 ? remCompliant.length / allEvents.length : 0;

  console.log(`Total events (24h): ${allEvents.length}`);
  console.log(`REM compliant: ${remCompliant.length}`);
  console.log(`Coverage: ${(coverage * 100).toFixed(2)}%`);
  console.log(`Target: ≥95%`);

  if (coverage >= 0.95) {
    console.log('\n✅ REM coverage meets target');
    process.exit(0);
  } else {
    console.log('\n❌ REM coverage below target');
    process.exit(1);
  }
}

/**
 * Validate file
 */
function validateFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const event = JSON.parse(content);
    
    const result = lintTrustEvent(event);
    
    if (result.valid) {
      console.log(`✅ ${filePath} is valid`);
      if (result.warnings.length > 0) {
        console.log('Warnings:');
        result.warnings.forEach((w) => console.log(`  - ${w}`));
      }
      process.exit(0);
    } else {
      console.error(`❌ ${filePath} has errors:`);
      result.errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--coverage')) {
  checkCoverage()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
} else if (args[0]) {
  validateFile(args[0]);
} else {
  console.log('Usage:');
  console.log('  rem-lint [file]              # Validate specific file');
  console.log('  rem-lint --coverage          # Check REM coverage');
  process.exit(1);
}

