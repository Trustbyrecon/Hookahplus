import { NextRequest, NextResponse } from 'next/server';

// Mock scheduled notification storage (in production, this would be a database)
let scheduledNotifications: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let filteredNotifications = scheduledNotifications;

    // Filter by userId if provided
    if (userId) {
      filteredNotifications = scheduledNotifications.filter(
        notif => !notif.recipientId || notif.recipientId === userId || notif.recipientId === 'all'
      );
    }

    // Filter out already delivered notifications
    filteredNotifications = filteredNotifications.filter(notif => !notif.delivered);

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      total: filteredNotifications.length
    });

  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled notifications' },
      { status: 500 }
    );
  }
}

