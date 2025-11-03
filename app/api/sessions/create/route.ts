import { NextResponse } from 'next/server';
import { query } from '../../api/db';

// API endpoint to create session after payment success
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { checkoutSessionId, flavors, table } = data;

    // Create session in database
    const result = await query(
      'INSERT INTO sessions (table_name, flavors, start_time, refills, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        table || 'Unassigned',
        Array.isArray(flavors) ? flavors : [],
        new Date(),
        0,
        [`Checkout: ${checkoutSessionId}`]
      ]
    );

    return NextResponse.json({
      success: true,
      sessionId: result.rows[0].id,
      session: result.rows[0]
    });
  } catch (err: any) {
    console.error('Session creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
