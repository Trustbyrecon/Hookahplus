import { NextResponse } from "next/server";

export async function GET(
  _: Request, 
  { params }: { params: { partnerId: string } }
) {
  try {
    // TODO: Replace with real database queries
    // This is a safe stub that returns realistic demo data
    const demo = {
      partnerId: params.partnerId,
      totalReferrals: 17,
      activeLounges: 12,
      referralsLast30d: 6,
      qualityScore: 12 / 17, // active / total
      estimatedEarnings: 1250.50,
      nextPayout: "2025-02-01",
      tier: "silver",
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(demo);
  } catch (error) {
    console.error('Partner stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner stats' },
      { status: 500 }
    );
  }
}
