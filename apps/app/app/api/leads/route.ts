import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../ghost-log/route';

// In-memory storage for leads (in production, this would be a database)
let leads: Array<{
  id: string;
  email: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ref_code?: string;
  created_at: string;
  deduped?: boolean;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, utm_source, utm_medium, utm_campaign, ref_code } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for duplicates
    const existingLead = leads.find(lead => lead.email === email);
    if (existingLead) {
      // Mark as deduped but don't create new entry
      existingLead.deduped = true;
      
      // Log duplicate submission
      await createGhostLogEntry({
        kind: 'guest.event.waitlist_submitted',
        email,
        utm_source,
        utm_medium,
        utm_campaign,
        ref_code,
        duplicate_suppressed: true,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        lead: existingLead,
        message: 'Lead already exists (deduped)'
      });
    }

    // Create new lead
    const lead = {
      id: `lead_${Date.now()}`,
      email,
      utm_source,
      utm_medium,
      utm_campaign,
      ref_code,
      created_at: new Date().toISOString(),
      deduped: false
    };

    leads.push(lead);

    // Log lead creation
    await createGhostLogEntry({
      kind: 'app.lead.created',
      lead_id: lead.id,
      email,
      utm_source,
      utm_medium,
      utm_campaign,
      ref_code,
      timestamp: lead.created_at
    });

    return NextResponse.json({ 
      success: true, 
      lead,
      message: 'Lead created successfully'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (email) {
      const lead = leads.find(l => l.email === email);
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json({ lead });
    }

    // Return all leads if no email specified
    return NextResponse.json({ leads });

  } catch (error) {
    console.error('Error retrieving leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
