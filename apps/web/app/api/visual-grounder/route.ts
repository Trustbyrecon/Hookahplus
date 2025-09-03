// apps/web/app/api/visual-grounder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { visualGrounder } from '../../../lib/visualGrounder';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photos = formData.getAll('photos') as File[];
    const seedData = formData.get('seed') as string;
    
    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No photos provided' },
        { status: 400 }
      );
    }

    if (!seedData) {
      return NextResponse.json(
        { success: false, error: 'No seed data provided' },
        { status: 400 }
      );
    }

    const seed = JSON.parse(seedData);
    
    // Process photos and generate seating map
    const result = await visualGrounder.processPhotos(photos, seed);
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Visual Grounder API error:', error);
    return NextResponse.json(
      { success: false, error: 'Visual Grounder processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'knowledge_pack':
        const knowledgePack = visualGrounder.exportKnowledgePack();
        return NextResponse.json({
          success: true,
          data: knowledgePack
        });

      case 'detection_classes':
        return NextResponse.json({
          success: true,
          data: {
            classes: [
              'bar_counter', 'back_bar', 'service_counter', 'hostess_stand',
              'table_round_low', 'table_square_low', 'table_high', 'communal_table',
              'stool', 'chair', 'booth_single', 'booth_double', 'banquette', 'sofa', 'lounge_chair', 'ottoman',
              'aisle', 'accessible_route', 'turning_circle', 'ramp', 'door', 'exit_sign',
              'bar_zone', 'lounge_zone', 'booth_zone', 'vip_zone', 'patio_zone',
              'accessible_table', 'lowered_counter', 'obstruction'
            ]
          }
        });

      case 'seating_patterns':
        return NextResponse.json({
          success: true,
          data: {
            patterns: [
              {
                name: 'Bar Counter + Stools',
                type: 'bar_counter',
                description: '40-42" bar height with 28-33" stools, 6-8" spacing'
              },
              {
                name: 'Booth Wall',
                type: 'booth_wall',
                description: '24" depth single booths, 48" depth double booths'
              },
              {
                name: 'High-top Tables',
                type: 'high_top',
                description: '42" height tables with 4-person capacity'
              },
              {
                name: 'Lounge Cluster',
                type: 'lounge_cluster',
                description: 'Sofas, club chairs, ottomans for longer stays'
              }
            ]
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Reflex Visual Grounder API active',
            endpoints: ['knowledge_pack', 'detection_classes', 'seating_patterns'],
            description: 'Photo-to-seating-map conversion with ADA compliance checking'
          }
        });
    }
  } catch (error) {
    console.error('Visual Grounder API error:', error);
    return NextResponse.json(
      { success: false, error: 'Visual Grounder API error' },
      { status: 500 }
    );
  }
}
