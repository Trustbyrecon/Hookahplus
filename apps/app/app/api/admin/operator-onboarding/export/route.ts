import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { requireRole, getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/admin/operator-onboarding/export
 * 
 * Simple CSV export of all leads for backup/alternative systems
 * Exports to CSV format that can be imported into Google Sheets, Notion, etc.
 */
export async function GET(req: NextRequest) {
  try {
    // Auth + tenant selection (bypass in dev mode)
    let tenantId: string | null = null;
    if (process.env.NODE_ENV === 'production') {
      try {
        const { user, role } = await requireRole(req, ['owner', 'admin']);
        tenantId = await getCurrentTenant(req);
      } catch (authError) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required',
          details: authError instanceof Error ? authError.message : 'Unknown auth error'
        }, { status: 401 });
      }
    } else {
      console.log('[Operator Onboarding Export] DEV mode - skipping auth checks');
    }

    // Query all ReflexEvent records (same as debug endpoint but simpler)
    let events;
    try {
      const whereClause: any = {
        NOT: {
          type: 'admin.operator_onboarding.update'
        }
      };

      // Multi-tenant filter in production only
      if (tenantId && process.env.NODE_ENV === 'production') {
        whereClause.tenantId = tenantId;
      }

      events = await prisma.reflexEvent.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 10000, // Large limit for export
        select: {
          id: true,
          type: true,
          source: true,
          ctaSource: true,
          payload: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (queryError: any) {
      console.error('[Operator Onboarding Export] Query error:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError?.message || 'Unknown query error'
      }, { status: 503 });
    }

    // Parse events and extract lead data
    const leads = events.map(event => {
      let payload: any = {};
      try {
        payload = event.payload ? JSON.parse(event.payload) : {};
      } catch (e) {
        // Skip if payload can't be parsed
      }

      // Extract lead information from various payload formats
      let data: any = {};
      if (payload.behavior && payload.behavior.payload) {
        data = { ...payload, ...payload.behavior.payload };
      } else if (payload.lead) {
        data = { ...payload, ...payload.lead };
      } else {
        data = payload.data || payload;
      }

      return {
        id: event.id,
        type: event.type,
        source: event.source || '',
        ctaSource: event.ctaSource || '',
        businessName: data.businessName || data.loungeName || '',
        ownerName: data.ownerName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || data.city || '',
        stage: data.stage || '',
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
    });

    // Generate CSV
    const headers = [
      'ID',
      'Type',
      'Source',
      'CTA Source',
      'Business Name',
      'Owner Name',
      'Email',
      'Phone',
      'Location',
      'Stage',
      'Created At',
      'Updated At'
    ];

    const csvRows = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.id}"`,
        `"${lead.type}"`,
        `"${lead.source}"`,
        `"${lead.ctaSource}"`,
        `"${lead.businessName.replace(/"/g, '""')}"`,
        `"${lead.ownerName.replace(/"/g, '""')}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.location.replace(/"/g, '""')}"`,
        `"${lead.stage}"`,
        `"${lead.createdAt}"`,
        `"${lead.updatedAt}"`
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    // Return as CSV download
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hookahplus-leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('[Operator Onboarding Export] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export leads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

