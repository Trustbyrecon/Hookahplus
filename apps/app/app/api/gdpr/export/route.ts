import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GDPRService } from '../../../../lib/services/GDPRService';

const prisma = new PrismaClient();

/**
 * POST /api/gdpr/export
 * Export user data (GDPR Article 15)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, phone } = body;

    if (!userId && !email && !phone) {
      return NextResponse.json({
        success: false,
        error: 'Missing identifier: userId, email, or phone required'
      }, { status: 400 });
    }

    // Find user by identifier
    const identifier = userId || email || phone;

    const result = await GDPRService.exportUserData(identifier, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    // Return as JSON download
    return new NextResponse(JSON.stringify(result.data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-export-${identifier}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('[GDPR Export API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

