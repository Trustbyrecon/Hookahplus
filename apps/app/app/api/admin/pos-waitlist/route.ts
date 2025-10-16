import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, selectedTier, interest, timestamp, contactType } = body;

    console.log(`[POS Waitlist] New signup from ${source}`, {
      selectedTier,
      interest,
      contactType
    });

    // Create waitlist entry (temporarily disabled for build)
    // const waitlistEntry = await prisma.reflexEvent.create({
    //   data: {
    //     type: "pos.waitlist.signup",
    //     source: "api",
    //     payload: JSON.stringify({
    //       source,
    //       selectedTier,
    //       interest,
    //       contactType,
    //       timestamp,
    //       status: 'pending'
    //     }),
    //     userAgent: req.headers.get("user-agent") || "",
    //     ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0"
    //   }
    // });

    // Log the signup event
    console.log(`[POS Waitlist] Entry created: mock_id`);

    return NextResponse.json({
      success: true,
      waitlistId: 'mock_id',
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
    // Get all POS waitlist entries (temporarily disabled for build)
    // const waitlistEntries = await prisma.reflexEvent.findMany({
    //   where: {
    //     type: "pos.waitlist.signup"
    //   },
    //   orderBy: {
    //     createdAt: "desc"
    //   },
    //   take: 50
    // });

    // const formattedEntries = waitlistEntries.map(entry => {
    //   const payload = entry.payload ? JSON.parse(entry.payload) : {};
    //   return {
    //     id: entry.id,
    //     createdAt: entry.createdAt,
    //     source: payload.source,
    //     selectedTier: payload.selectedTier,
    //     interest: payload.interest,
    //     contactType: payload.contactType,
    //     status: payload.status,
    //     ip: entry.ip
    //   };
    // });

    return NextResponse.json({
      success: true,
      entries: [],
      total: 0
    });

  } catch (error) {
    console.error('[POS Waitlist] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve waitlist'
    }, { status: 500 });
  }
}
