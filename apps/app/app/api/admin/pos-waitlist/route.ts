import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, selectedTier, interest, timestamp, contactType, name, email, phone, loungeName, city, currentPOS, estimatedRevenue } = body;

    console.log(`[POS Waitlist] New signup from ${source}`, {
      selectedTier,
      interest,
      contactType,
      name,
      email,
      loungeName
    });

    // Create waitlist entry with lead data for Operator Onboarding
    const payload = {
      source,
      selectedTier,
      interest,
      contactType,
      timestamp,
      status: 'pending',
      // Lead data for Operator Onboarding
      businessName: loungeName || 'Unknown Business',
      ownerName: name || '',
      email: email || '',
      phone: phone || '',
      location: city || '',
      currentPOS: currentPOS || 'unknown',
      estimatedRevenue: estimatedRevenue || '0',
      stage: 'new-leads'
    };

    const waitlistEntry = await prisma.reflexEvent.create({
      data: {
        type: "pos.waitlist.signup",
        source: source || "api",
        payload: JSON.stringify(payload),
        ctaSource: source?.includes('website') ? 'website' : source?.includes('instagram') ? 'instagram' : source?.includes('linkedin') ? 'linkedin' : 'website',
        ctaType: 'demo_request',
        userAgent: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0"
      }
    });

    // Log the signup event
    console.log(`[POS Waitlist] Entry created: ${waitlistEntry.id}`);

    return NextResponse.json({
      success: true,
      waitlistId: waitlistEntry.id,
      message: 'Successfully added to POS integration waitlist',
      nextSteps: [
        'Our sales team will contact you within 24 hours',
        'We\'ll discuss your specific POS integration needs',
        'You\'ll receive priority access to new POS features'
      ]
    });

  } catch (error) {
    console.error('[POS Waitlist] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add to waitlist'
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Get all POS waitlist entries
    const waitlistEntries = await prisma.reflexEvent.findMany({
      where: {
        type: "pos.waitlist.signup"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    const formattedEntries = waitlistEntries.map(entry => {
      const payload = entry.payload ? JSON.parse(entry.payload) : {};
      return {
        id: entry.id,
        createdAt: entry.createdAt,
        source: payload.source,
        selectedTier: payload.selectedTier,
        interest: payload.interest,
        contactType: payload.contactType,
        status: payload.status,
        ip: entry.ip
      };
    });

    return NextResponse.json({
      success: true,
      entries: formattedEntries,
      total: formattedEntries.length
    });

  } catch (error) {
    console.error('[POS Waitlist] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve waitlist'
    }, { status: 500 });
  }
}
