import { NextRequest, NextResponse } from 'next/server';

// Mock scheduled notification storage (in production, this would be a database)
let scheduledNotifications: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, title, message, priority, type, scheduledFor, actionUrl } = body;

    // Validate required fields
    if (!title || !message || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, scheduledFor' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduledFor);
    if (scheduledTime <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Create scheduled notification object
    const notification = {
      id: `scheduled-${Date.now()}`,
      recipientId: recipientId || undefined,
      title,
      message,
      scheduledFor: scheduledTime.toISOString(),
      priority: priority || 'medium',
      type: type || 'message',
      actionUrl: actionUrl || undefined,
      delivered: false,
      createdAt: new Date().toISOString()
    };

    // Store scheduled notification
    scheduledNotifications.push(notification);
    
    // Keep only last 1000 scheduled notifications
    if (scheduledNotifications.length > 1000) {
      scheduledNotifications = scheduledNotifications.slice(0, 1000);
    }

    console.log('Scheduled Notification Created:', notification);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json(
      { error: 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}

