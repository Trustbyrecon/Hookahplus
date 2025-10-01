import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for layouts (in production, use database)
let layouts: Array<{
  id: string;
  name: string;
  address: string;
  zones: any[];
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
  metadata: any;
}> = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredLayouts = layouts;

    if (status) {
      filteredLayouts = layouts.filter(layout => layout.status === status);
    }

    // Sort by updatedAt descending
    const sortedLayouts = filteredLayouts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);

    console.log(`[Visual Grounder] 📋 Retrieved ${sortedLayouts.length} layouts`);

    return NextResponse.json({
      success: true,
      layouts: sortedLayouts,
      total: layouts.length,
      filtered: filteredLayouts.length
    });

  } catch (error) {
    console.error('[Visual Grounder] ❌ Error retrieving layouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve layouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, zones, totalCapacity, metadata } = body;

    const newLayout = {
      id: `layout_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: name || 'Untitled Layout',
      address: address || '',
      zones: zones || [],
      totalCapacity: totalCapacity || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft' as const,
      version: '1.0.0',
      metadata: metadata || {}
    };

    layouts.push(newLayout);

    console.log(`[Visual Grounder] ✅ Created layout: ${newLayout.id}`);

    return NextResponse.json({
      success: true,
      layout: newLayout
    });

  } catch (error) {
    console.error('[Visual Grounder] ❌ Error creating layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create layout' },
      { status: 500 }
    );
  }
}
