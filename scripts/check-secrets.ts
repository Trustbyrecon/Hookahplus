/**
 * Secret Scanner - Check for Accidental Key Exposure
 * 
 * Scans repository for accidentally committed Stripe keys and other secrets.
 * 
 * Usage:
 *   npx tsx scripts/check-secrets.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LIVE_STRIPE_SECRET_PATTERN = /sk_live_[a-zA-Z0-9]{24,}/g;
const LIVE_STRIPE_PUBLISHABLE_PATTERN = /pk_live_[a-zA-Z0-9]{24,}/g;
const WEBHOOK_SECRET_PATTERN = /whsec_[a-zA-Z0-9]{24,}/g;
const TEST_STRIPE_SECRET_PATTERN = /sk_test_[a-zA-Z0-9]{24,}/g;

interface SecretFinding {
  file: string;
  line: number;
  type: 'live_secret' | 'live_publishable' | 'webhook_secret' | 'test_secret';
  preview: string;
}

function scanFile(filePath: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  
  if (!existsSync(filePath)) {
    return findings;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for live secret key
      if (LIVE_STRIPE_SECRET_PATTERN.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          type: 'live_secret',
          preview: line.trim().substring(0, 50) + '...',
        });
      }

      // Check for live publishable key
      if (LIVE_STRIPE_PUBLISHABLE_PATTERN.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          type: 'live_publishable',
          preview: line.trim().substring(0, 50) + '...',
        });
      }

      // Check for webhook secret
      if (WEBHOOK_SECRET_PATTERN.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          type: 'webhook_secret',
          preview: line.trim().substring(0, 50) + '...',
        });
      }

      // Check for test keys (warn but not critical)
      if (TEST_STRIPE_SECRET_PATTERN.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          type: 'test_secret',
          preview: line.trim().substring(0, 50) + '...',
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }

  return findings;
}

function scanRepository(): {
  critical: SecretFinding[];
  warnings: SecretFinding[];
} {
  console.log('🔍 Scanning repository for exposed secrets...\n');

  const critical: SecretFinding[] = [];
  const warnings: SecretFinding[] = [];

  // Get list of tracked files (excluding .gitignore patterns)
  try {
    const gitFiles = execSync('git ls-files', { encoding: 'utf-8' })
      .split('\n')
      .filter(line => line.trim().length > 0);

    console.log(`📁 Scanning ${gitFiles.length} tracked files...\n`);

    for (const file of gitFiles) {
      // Skip binary files and common ignore patterns
      if (
        file.includes('node_modules') ||
        file.includes('.next') ||
        file.includes('.git') ||
        file.endsWith('.png') ||
        file.endsWith('.jpg') ||
        file.endsWith('.jpeg') ||
        file.endsWith('.gif') ||
        file.endsWith('.ico') ||
        file.endsWith('.pdf')
      ) {
        continue;
      }

      const findings = scanFile(file);
      
      for (const finding of findings) {
        if (finding.type === 'test_secret') {
          warnings.push(finding);
        } else {
          critical.push(finding);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error scanning repository:', error);
  }

  return { critical, warnings };
}

function main() {
  console.log('🔒 Secret Scanner - Checking for Exposed Keys\n');
  console.log('='.repeat(60));

  const { critical, warnings } = scanRepository();

  // Report critical findings
  if (critical.length > 0) {
    console.log('\n🚨 CRITICAL: Live Stripe Keys Found in Repository!\n');
    console.log('⚠️  These keys are EXPOSED and should be revoked immediately!\n');

    critical.forEach((finding, index) => {
      console.log(`${index + 1}. ${finding.file}:${finding.line}`);
      console.log(`   Type: ${finding.type}`);
      console.log(`   Preview: ${finding.preview}`);
      console.log('');
    });

    console.log('🔧 Immediate Actions Required:');
    console.log('   1. Revoke these keys in Stripe Dashboard');
    console.log('   2. Generate new keys');
    console.log('   3. Remove keys from repository');
    console.log('   4. Update Vercel environment variables');
    console.log('   5. Add file to .gitignore if not already');
    console.log('');
  } else {
    console.log('\n✅ No live Stripe keys found in repository!');
  }

  // Report warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings: Test Keys Found (Less Critical)\n');
    warnings.forEach((finding, index) => {
      console.log(`${index + 1}. ${finding.file}:${finding.line}`);
      console.log(`   Preview: ${finding.preview}`);
      console.log('');
    });
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   🚨 Critical Issues: ${critical.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);

  if (critical.length === 0 && warnings.length === 0) {
    console.log('\n✅ Repository is clean - No secrets found!');
    process.exit(0);
  } else if (critical.length > 0) {
    console.log('\n❌ CRITICAL: Live keys exposed - Action required!');
    process.exit(1);
  } else {
    console.log('\n⚠️  Test keys found - Consider removing');
    process.exit(0);
  }
}

main();

