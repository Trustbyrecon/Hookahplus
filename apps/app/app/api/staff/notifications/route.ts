import { NextRequest, NextResponse } from 'next/server';

// Mock notification storage (in production, this would be a database)
let notifications: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredNotifications = notifications;

    // Filter by userId if provided
    if (userId) {
      filteredNotifications = notifications.filter(
        notif => !notif.recipientId || notif.recipientId === userId || notif.recipientId === 'all'
      );
    }

    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit results
    filteredNotifications = filteredNotifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      total: filteredNotifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, title, message, priority, type, actionUrl } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message' },
        { status: 400 }
      );
    }

    // Create notification object
    const notification = {
      id: `notif-${Date.now()}`,
      recipientId: recipientId || undefined,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: priority || 'medium',
      type: type || 'message',
      actionUrl: actionUrl || undefined,
      delivered: true
    };

    // Store notification
    notifications.unshift(notification);
    
    // Keep only last 500 notifications
    if (notifications.length > 500) {
      notifications = notifications.slice(0, 500);
    }

    console.log('Notification Created:', notification);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

