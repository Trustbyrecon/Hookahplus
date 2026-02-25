import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../../../../lib/db';
import { getHIDSalt } from '../../../../lib/env';

const BodySchema = z
  .object({
    memberId: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(80).optional().nullable(),
    email: z.string().trim().max(120).optional().nullable(),
    instagramHandle: z.string().trim().max(60).optional().nullable(),
  })
  .refine((v) => Boolean((v.phone || '').trim()) || Boolean((v.email || '').trim()), {
    message: 'phone or email is required',
    path: ['phone'],
  });

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPII(value: string): string {
  const salt = getHIDSalt();
  return createHash('sha256').update(value + salt).digest('hex');
}

async function attachPiiLink(args: { hid: string; piiType: 'phone' | 'email'; piiHash: string }) {
  const existing = await prisma.networkPIILink.findUnique({
    where: { piiType_piiHash: { piiType: args.piiType, piiHash: args.piiHash } },
    select: { hid: true },
  });

  if (existing && existing.hid !== args.hid) {
    return { ok: false as const, conflict: true as const };
  }

  if (!existing) {
    await prisma.networkPIILink.create({
      data: {
        hid: args.hid,
        piiType: args.piiType,
        piiHash: args.piiHash,
        verified: false,
      },
    });
  }

  return { ok: true as const, conflict: false as const };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { memberId, phone, email, instagramHandle } = parsed.data;

    const profile = await prisma.networkProfile.findUnique({
      where: { hid: memberId },
      select: { hid: true },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const normalizedPhone = phone && phone.trim() ? normalizePhone(phone) : null;
    const normalizedEmail = email && email.trim() ? normalizeEmail(email) : null;

    const phoneHash = normalizedPhone ? hashPII(normalizedPhone) : null;
    const emailHash = normalizedEmail ? hashPII(normalizedEmail) : null;

    if (phoneHash) {
      const res = await attachPiiLink({ hid: memberId, piiType: 'phone', piiHash: phoneHash });
      if (!res.ok && res.conflict) {
        return NextResponse.json(
          { error: 'Phone is already attached to another member' },
          { status: 409 }
        );
      }
    }

    if (emailHash) {
      const res = await attachPiiLink({ hid: memberId, piiType: 'email', piiHash: emailHash });
      if (!res.ok && res.conflict) {
        return NextResponse.json(
          { error: 'Email is already attached to another member' },
          { status: 409 }
        );
      }
    }

    // Best-effort mirror into NetworkProfile for easier KPI queries
    await prisma.networkProfile.update({
      where: { hid: memberId },
      data: {
        phoneHash: phoneHash || undefined,
        emailHash: emailHash || undefined,
      },
    });

    if (instagramHandle && instagramHandle.trim()) {
      const existingPrefs = await prisma.networkPreference.findUnique({
        where: { hid: memberId },
        select: { devicePrefs: true },
      });
      const prevDevicePrefs = (existingPrefs?.devicePrefs as any) || {};
      const prevCodigo = (prevDevicePrefs.codigo && typeof prevDevicePrefs.codigo === 'object')
        ? prevDevicePrefs.codigo
        : {};
      const nextDevicePrefs = {
        ...prevDevicePrefs,
        codigo: {
          ...prevCodigo,
          instagramHandle: instagramHandle.trim(),
          updatedAt: new Date().toISOString(),
        },
      };

      await prisma.networkPreference.upsert({
        where: { hid: memberId },
        create: { hid: memberId, devicePrefs: nextDevicePrefs },
        update: { devicePrefs: nextDevicePrefs },
      });
    }

    return NextResponse.json(
      {
        success: true,
        memberId,
        attached: {
          phone: Boolean(phoneHash),
          email: Boolean(emailHash),
          instagramHandle: Boolean(instagramHandle && instagramHandle.trim()),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CODIGO Profile] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

