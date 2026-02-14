import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { layoutId, layoutData } = body;

    console.log(`[Visual Grounder Integration] 🔗 Integrating layout: ${layoutId}`);

    // Convert Visual Grounder zones to table management format
    const integratedTables = layoutData.zones.map((zone: any, index: number) => ({
      id: `T-${String(index + 1).padStart(3, '0')}`,
      name: zone.name,
      type: mapZoneTypeToTableType(zone.type),
      capacity: zone.capacity,
      availability: 'available' as const,
      location: `${zone.coordinates.x},${zone.coordinates.y}`,
      description: zone.features?.join(', ') || zone.type,
      icon: getTableIcon(zone.type),
      color: zone.color,
      priceMultiplier: getPriceMultiplier(zone.type),
      // Visual Grounder specific data
      zoneId: zone.id,
      coordinates: zone.coordinates,
      aiConfidence: zone.aiConfidence,
      features: zone.features || [],
      // Integration metadata
      integratedAt: new Date().toISOString(),
      layoutId: layoutId,
      version: '1.0.0'
    }));

    // Generate integration report
    const integrationReport = {
      layoutId,
      totalZones: layoutData.zones.length,
      totalCapacity: layoutData.totalCapacity,
      tableTypes: Array.from(new Set(integratedTables.map((t: any) => t.type))),
      integrationStatus: 'success',
      integratedAt: new Date().toISOString(),
      tables: integratedTables
    };

    console.log(`[Visual Grounder Integration] ✅ Integrated ${integratedTables.length} tables from ${layoutData.zones.length} zones`);

    return NextResponse.json({
      success: true,
      report: integrationReport,
      tables: integratedTables,
      message: `Successfully integrated ${integratedTables.length} tables from Visual Grounder layout`
    });

  } catch (error) {
    console.error('[Visual Grounder Integration] ❌ Error integrating layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to integrate layout' },
      { status: 500 }
    );
  }
}

function mapZoneTypeToTableType(zoneType: string): string {
  const typeMap: { [key: string]: string } = {
    'Bar Counter': 'bar',
    'Booth Seating': 'booth',
    'Table Seating': 'table',
    'Patio Seating': 'patio',
    'VIP Section': 'vip',
    'Sectional Seating': 'sectional',
    'High Top Tables': 'table',
    'Lounge Chairs': 'sectional',
    'Circulation': 'walkway'
  };
  return typeMap[zoneType] || 'table';
}

function getTableIcon(zoneType: string): string {
  const iconMap: { [key: string]: string } = {
    'Bar Counter': '🍺',
    'Booth Seating': '🪑',
    'Table Seating': '🪑',
    'Patio Seating': '🌿',
    'VIP Section': '👑',
    'Sectional Seating': '🛋️',
    'High Top Tables': '🪑',
    'Lounge Chairs': '🛋️',
    'Circulation': '🚶'
  };
  return iconMap[zoneType] || '🪑';
}

function getPriceMultiplier(zoneType: string): number {
  const multiplierMap: { [key: string]: number } = {
    'Bar Counter': 1.0,
    'Booth Seating': 1.2,
    'Table Seating': 1.0,
    'Patio Seating': 1.1,
    'VIP Section': 1.5,
    'Sectional Seating': 1.3,
    'High Top Tables': 1.1,
    'Lounge Chairs': 1.2,
    'Circulation': 0.0
  };
  return multiplierMap[zoneType] || 1.0;
}
