import { NextResponse } from 'next/server';
import { query } from '../db';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const { rows } = await query('SELECT points, streak FROM wallet LIMIT 1');
    const row = rows[0] || { points: 0, streak: 0 };
    return NextResponse.json(row);
  } catch (error) {
    // Return default values if database is not available during static build
    return NextResponse.json({ points: 0, streak: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      'UPDATE wallet SET points=$1, streak=$2 WHERE id=1 RETURNING points, streak',
      [data.points, data.streak]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
