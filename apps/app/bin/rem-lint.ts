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
import { join, resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { validateTrustEvent } from '../lib/reflex/rem-types';
import dotenv from 'dotenv';

// Load .env.local for DATABASE_URL
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Verify DATABASE_URL is set and valid
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('   Please ensure .env.local exists with DATABASE_URL set');
  process.exit(1);
}

if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://');
  console.error(`   Current value: ${process.env.DATABASE_URL.substring(0, 50)}...`);
  process.exit(1);
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
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Query events - exclude trustEventTypeV1 which may not be migrated yet
  // First try last 24 hours, if none found, try last 7 days
  let allEvents = await prisma.reflexEvent.findMany({
    where: {
      createdAt: {
        gte: last24Hours,
      },
    },
    select: {
      id: true,
      type: true,
      source: true,
      sessionId: true,
      paymentIntent: true,
      payload: true,
      payloadHash: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      ctaSource: true,
      ctaType: true,
      referrer: true,
      campaignId: true,
      metadata: true,
      // trustEventTypeV1 excluded - column may not exist if migration not fully applied
    },
  });

  // If no events in last 24h, check last 7 days
  if (allEvents.length === 0) {
    console.log('⚠️  No events in last 24 hours, checking last 7 days...\n');
    allEvents = await prisma.reflexEvent.findMany({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
      select: {
        id: true,
        type: true,
        source: true,
        sessionId: true,
        paymentIntent: true,
        payload: true,
        payloadHash: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        ctaSource: true,
        ctaType: true,
        referrer: true,
        campaignId: true,
        metadata: true,
      },
    });
  }

  const remCompliant: typeof allEvents = [];
  const nonCompliant: Array<{ event: typeof allEvents[0]; errors: string[] }> = [];

  allEvents.forEach((event) => {
    if (!event.payload) {
      nonCompliant.push({ event, errors: ['Missing payload'] });
      return;
    }
    try {
      const payload = JSON.parse(event.payload);
      // Use validateTrustEvent to properly check REM compliance
      const validation = validateTrustEvent(payload);
      if (validation.valid) {
        remCompliant.push(event);
      } else {
        nonCompliant.push({ event, errors: validation.errors });
      }
    } catch (error: any) {
      nonCompliant.push({ event, errors: [`JSON parse error: ${error.message}`] });
    }
  });

  const coverage = allEvents.length > 0 ? remCompliant.length / allEvents.length : 0;
  const timeWindow = allEvents.length > 0 && allEvents[0].createdAt < last24Hours ? '7 days' : '24h';

  console.log(`Total events (${timeWindow}): ${allEvents.length}`);
  console.log(`REM compliant: ${remCompliant.length}`);
  console.log(`Coverage: ${(coverage * 100).toFixed(2)}%`);
  console.log(`Target: ≥95%`);

  if (allEvents.length === 0) {
    console.log('\n⚠️  No events found in database');
    console.log('   This is expected if the application hasn\'t been used yet.');
    console.log('   REM coverage will be calculated once events are created.');
    console.log('\n✅ REM coverage check complete (no events to analyze)');
    process.exit(0);
  } else if (coverage >= 0.95) {
    console.log('\n✅ REM coverage meets target');
    process.exit(0);
  } else {
    console.log('\n❌ REM coverage below target');
    console.log(`   Need ${Math.ceil(allEvents.length * 0.95) - remCompliant.length} more REM-compliant events`);
    
    // Show details of non-compliant events
    if (nonCompliant.length > 0) {
      console.log('\n📋 Non-compliant events:');
      nonCompliant.forEach((item, index) => {
        console.log(`\n   ${index + 1}. Event ID: ${item.event.id}`);
        console.log(`      Type: ${item.event.type}`);
        console.log(`      Created: ${item.event.createdAt.toISOString()}`);
        console.log(`      Errors:`);
        item.errors.forEach(err => console.log(`         - ${err}`));
        if (item.event.payload) {
          try {
            const payload = JSON.parse(item.event.payload);
            console.log(`      Payload preview: ${JSON.stringify(payload).substring(0, 100)}...`);
          } catch {
            console.log(`      Payload: ${item.event.payload.substring(0, 100)}...`);
          }
        }
      });
    }
    
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

