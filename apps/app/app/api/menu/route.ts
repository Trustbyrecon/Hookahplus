import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('[Menu API] 🍽️ Fetching menu data...');

    // Get categories with their items
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    // Get organization settings
    const settings = await prisma.orgSetting.findMany({
      where: { isActive: true }
    });

    const menuData = {
      categories,
      settings: settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>),
      timestamp: new Date().toISOString()
    };

    console.log(`[Menu API] ✅ Retrieved ${categories.length} categories with ${categories.reduce((sum, cat) => sum + cat.items.length, 0)} items`);

    return NextResponse.json({
      success: true,
      data: menuData
    });

  } catch (error) {
    console.error('[Menu API] ❌ Error fetching menu:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch menu data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log(`[Menu API] 📝 ${action} request received`);

    switch (action) {
      case 'updateItem':
        const { itemId, updates } = data;
        const updatedItem = await prisma.item.update({
          where: { id: itemId },
          data: updates
        });
        return NextResponse.json({ success: true, data: updatedItem });

      case 'toggleItemStatus':
        const { itemId: toggleItemId } = data;
        const currentItem = await prisma.item.findUnique({
          where: { id: toggleItemId }
        });
        if (!currentItem) {
          return NextResponse.json(
            { success: false, error: 'Item not found' },
            { status: 404 }
          );
        }
        const toggledItem = await prisma.item.update({
          where: { id: toggleItemId },
          data: { isActive: !currentItem.isActive }
        });
        return NextResponse.json({ success: true, data: toggledItem });

      case 'updateSetting':
        const { key, value } = data;
        const updatedSetting = await prisma.orgSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, category: 'menu' }
        });
        return NextResponse.json({ success: true, data: updatedSetting });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[Menu API] ❌ Error processing request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
