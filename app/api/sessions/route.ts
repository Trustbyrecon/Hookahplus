import { NextResponse } from 'next/server';
import { query } from '../db';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

function mapRow(row: any) {
  return {
    id: row.id,
    table: row.table_name,
    flavors: row.flavors,
    startTime: new Date(row.start_time).getTime(),
    endTime: row.end_time ? new Date(row.end_time).getTime() : null,
    refills: row.refills,
    notes: row.notes,
  };
}

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM sessions ORDER BY id');
    return NextResponse.json(rows.map(mapRow));
  } catch (error) {
    // Return empty array if database is not available during static build
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      'INSERT INTO sessions (table_name, flavors, start_time, end_time, refills, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [
        data.table,
        data.flavors,
        new Date(data.start_time),
        data.end_time ? new Date(data.end_time) : null,
        data.refills,
        data.notes,
      ]
    );
    return NextResponse.json(mapRow(result.rows[0]), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const result = await query(
      'UPDATE sessions SET refills=$2, notes=$3, start_time=$4, end_time=$5 WHERE id=$1 RETURNING *',
      [
        data.id,
        data.refills,
        data.notes,
        new Date(data.start_time),
        data.end_time ? new Date(data.end_time) : null,
      ]
    );
    return NextResponse.json(mapRow(result.rows[0]));
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
