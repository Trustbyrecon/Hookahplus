import { NextResponse } from 'next/server';
import { query } from '../db';

function mapRow(row: any) {
  return {
    id: row.id,
    table: row.table_name,
    flavors: row.flavors,
    startTime: new Date(row.start_time).getTime(),
    refills: row.refills,
    notes: row.notes,
  };
}

export async function GET() {
  const { rows } = await query('SELECT * FROM sessions ORDER BY id');
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(req: Request) {
  const data = await req.json();
  const result = await query(
    'INSERT INTO sessions (table_name, flavors, start_time, refills, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [data.table, data.flavors, new Date(data.start_time), data.refills, data.notes]
  );
  return NextResponse.json(mapRow(result.rows[0]), { status: 201 });
}

export async function PUT(req: Request) {
  const data = await req.json();
  const result = await query(
    'UPDATE sessions SET refills=$2, notes=$3, start_time=$4 WHERE id=$1 RETURNING *',
    [data.id, data.refills, data.notes, new Date(data.start_time)]
  );
  return NextResponse.json(mapRow(result.rows[0]));
}
