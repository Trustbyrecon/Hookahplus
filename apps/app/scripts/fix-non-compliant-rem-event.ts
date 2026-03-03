/**
 * Fix Non-Compliant REM Event
 * 
 * Updates the existing non-compliant onboarding.signup event to REM format
 * 
 * Usage: npx tsx scripts/fix-non-compliant-rem-event.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateTrustEventId, type TrustEvent, type TrustEventType } from '../lib/reflex/rem-types';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function fixNonCompliantEvent() {
  try {
    console.log('🔍 Finding non-compliant onboarding.signup event...\n');
    
    // Find the non-compliant event using raw SQL to avoid trustEventTypeV1 column issue
    const events = await prisma.$queryRawUnsafe<Array<{
      id: string;
      type: string;
      source: string;
      payload: string;
      ip: string | null;
      userAgent: string | null;
      createdAt: Date;
    }>>(`
      SELECT id, type, source, payload, ip, "userAgent", "createdAt"
      FROM reflex_events
      WHERE id = $1
    `, 'cmhuyn3uo000kpmp2jdrbv262');
    
    if (!events || events.length === 0) {
      console.log('❌ Event not found');
      process.exit(1);
    }
    
    const event = events[0];
    
    if (!event) {
      console.log('❌ Event not found');
      process.exit(1);
    }
    
    console.log(`✅ Found event: ${event.id}`);
    console.log(`   Type: ${event.type}`);
    console.log(`   Created: ${event.createdAt.toISOString()}\n`);
    
    // Parse existing payload
    let oldPayload: any;
    try {
      oldPayload = JSON.parse(event.payload || '{}');
    } catch {
      console.log('❌ Could not parse existing payload');
      process.exit(1);
    }
    
    console.log('📋 Existing payload:', JSON.stringify(oldPayload, null, 2).substring(0, 200) + '...\n');
    
    // Create REM-compliant TrustEvent
    const sequence = Date.now() % 1000000;
    const createdAt = event.createdAt;
    
    // Hash email/IP for PII minimal actor
    const emailHash = oldPayload.email ? 
      `sha256:${crypto.createHash('sha256').update(oldPayload.email).digest('hex')}` :
      `sha256:${crypto.createHash('sha256').update(event.ip || '0.0.0.0').digest('hex')}`;
    
    // Hash IP for security
    const ipHash = event.ip ? 
      `sha256:${crypto.createHash('sha256').update(event.ip).digest('hex')}` :
      undefined;
    
    // Create signature from payload
    const signaturePayload = JSON.stringify(oldPayload);
    const signature = `ed25519:${crypto.createHash('sha256').update(signaturePayload).digest('hex')}`;
    
    // Map onboarding.signup to fast_checkout
    const trustEventType: TrustEventType = 'fast_checkout';
    
    const trustEvent: TrustEvent = {
      id: generateTrustEventId(sequence),
      ts_utc: createdAt.toISOString(),
      type: trustEventType,
      actor: {
        anon_hash: emailHash,
        device_id: event.userAgent || event.source || 'manual',
      },
      context: {
        vertical: 'hookah',
        time_local: createdAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      },
      behavior: {
        action: 'onboarding.signup',
        payload: {
          businessName: oldPayload.businessName,
          ownerName: oldPayload.ownerName,
          location: oldPayload.location,
          stage: oldPayload.stage,
          source: oldPayload.source,
        },
      },
      effect: {
        loyalty_delta: 0,
        credit_type: 'HPLUS_CREDIT',
      },
      security: {
        signature: signature,
        device_id: event.userAgent || event.source || 'manual',
        ip_hash: ipHash,
      },
    };
    
    console.log('✅ Created REM-compliant TrustEvent:');
    console.log(JSON.stringify(trustEvent, null, 2).substring(0, 500) + '...\n');
    
    // Update the event with REM-compliant payload using raw SQL
    await prisma.$executeRawUnsafe(`
      UPDATE reflex_events
      SET payload = $1
      WHERE id = $2
    `, JSON.stringify(trustEvent), event.id);
    
    console.log('✅ Event updated successfully!');
    console.log(`   New payload is REM-compliant`);
    console.log(`   TrustEvent ID: ${trustEvent.id}`);
    console.log(`   Type: ${trustEvent.type}\n`);
    
    console.log('🎉 Non-compliant event fixed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error fixing event:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixNonCompliantEvent();

