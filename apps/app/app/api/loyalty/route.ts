import { NextResponse } from 'next/server';
import { query } from '../db';

export async function GET() {
  const { rows } = await query('SELECT points, streak FROM wallet LIMIT 1');
  const row = rows[0] || { points: 0, streak: 0 };
  return NextResponse.json(row);
}

export async function POST(req: Request) {
  const data = await req.json();
  const result = await query(
    'UPDATE wallet SET points=$1, streak=$2 WHERE id=1 RETURNING points, streak',
    [data.points, data.streak]
  );
  return NextResponse.json(result.rows[0]);
}
