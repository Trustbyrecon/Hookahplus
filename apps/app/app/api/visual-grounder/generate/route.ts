import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photos, loungeInfo } = body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock layout based on lounge info
    const generatedLayout = {
      id: 'layout_' + Date.now(),
      name: loungeInfo.name || 'Demo Lounge',
      address: loungeInfo.address || '123 Main St',
      capacity: parseInt(loungeInfo.capacity) || 50,
      zones: generateZonesFromInfo(loungeInfo),
      generatedAt: new Date().toISOString(),
      status: 'ready',
      photosProcessed: photos?.length || 0
    };

    return NextResponse.json({
      success: true,
      layout: generatedLayout
    });

  } catch (error) {
    console.error('Error generating layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate layout' },
      { status: 500 }
    );
  }
}

function generateZonesFromInfo(loungeInfo: any) {
  const zones = [];
  const seatingTypes = loungeInfo.seatingTypes || [];
  
  // Generate zones based on selected seating types
  if (seatingTypes.includes('Bar Counter')) {
    zones.push({
      id: 'bar_a',
      name: 'Bar A',
      type: 'Bar Counter',
      capacity: 10,
      occupied: 0,
      available: 10,
      color: 'orange',
      coordinates: { x: 50, y: 20, width: 200, height: 60 },
      sessions: 0
    });
  }

  if (seatingTypes.includes('Booth Seating')) {
    zones.push({
      id: 'booth_w',
      name: 'Booth W',
      type: 'Booth Seating',
      capacity: 8,
      occupied: 0,
      available: 8,
      color: 'blue',
      coordinates: { x: 300, y: 20, width: 150, height: 100 },
      sessions: 0
    });
  }

  if (seatingTypes.includes('Table Seating')) {
    zones.push({
      id: 'table_section',
      name: 'Table Section',
      type: 'Table Seating',
      capacity: 20,
      occupied: 0,
      available: 20,
      color: 'green',
      coordinates: { x: 50, y: 150, width: 300, height: 120 },
      sessions: 0
    });
  }

  if (seatingTypes.includes('VIP Section')) {
    zones.push({
      id: 'vip_area',
      name: 'VIP Area',
      type: 'VIP Section',
      capacity: 12,
      occupied: 0,
      available: 12,
      color: 'purple',
      coordinates: { x: 400, y: 150, width: 120, height: 100 },
      sessions: 0
    });
  }

  if (seatingTypes.includes('Patio Seating')) {
    zones.push({
      id: 'patio_area',
      name: 'Patio Area',
      type: 'Patio Seating',
      capacity: 16,
      occupied: 0,
      available: 16,
      color: 'teal',
      coordinates: { x: 50, y: 300, width: 200, height: 80 },
      sessions: 0
    });
  }

  if (seatingTypes.includes('Sectional Seating')) {
    zones.push({
      id: 'lounge_area',
      name: 'Lounge Area',
      type: 'Sectional Seating',
      capacity: 24,
      occupied: 0,
      available: 24,
      color: 'pink',
      coordinates: { x: 300, y: 300, width: 250, height: 100 },
      sessions: 0
    });
  }

  return zones;
}
