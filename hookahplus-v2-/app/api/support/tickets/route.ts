import { NextRequest, NextResponse } from 'next/server';

interface SupportTicket {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  trustLockVerified: boolean;
  timestamp: string;
}

// In-memory storage for demo (replace with database in production)
const supportTickets: SupportTicket[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, priority, trustLockVerified, timestamp } = body;

    // Check if this is a sensitive issue that requires Trust-Lock verification
    const isSensitiveIssue = subject.toLowerCase().includes('payment') ||
                            subject.toLowerCase().includes('account') ||
                            subject.toLowerCase().includes('refund') ||
                            priority === 'critical';

    // Only require Trust-Lock verification for sensitive issues
    if (isSensitiveIssue && !trustLockVerified) {
      return NextResponse.json(
        { success: false, error: 'Trust-Lock verification required for sensitive issues' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket: SupportTicket = {
      name,
      email,
      subject,
      message,
      priority: priority || 'medium',
      trustLockVerified: isSensitiveIssue ? trustLockVerified : false,
      timestamp: timestamp || new Date().toISOString()
    };

    // Generate ticket ID
    const ticketId = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store ticket (in production, save to database)
    supportTickets.push({ ...ticket, id: ticketId });

    // Log ticket creation
    console.log('🎫 Support ticket created:', {
      ticketId,
      subject,
      priority,
      isSensitiveIssue,
      trustLockVerified: isSensitiveIssue ? trustLockVerified : 'Not required',
      timestamp: new Date().toISOString()
    });

    // In production, send email notification to support team
    // await sendSupportNotification(ticketId, ticket);

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId,
        status: 'open',
        isSensitiveIssue,
        requiresVerification: isSensitiveIssue,
        estimatedResponseTime: getEstimatedResponseTime(priority),
        createdAt: timestamp
      }
    });

  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Filter tickets by email (in production, query database)
    const userTickets = supportTickets.filter(ticket => ticket.email === email);

    return NextResponse.json({
      success: true,
      data: {
        tickets: userTickets.map(ticket => ({
          id: ticket.id || 'unknown',
          subject: ticket.subject,
          priority: ticket.priority,
          status: 'open',
          createdAt: ticket.timestamp,
          trustLockVerified: ticket.trustLockVerified,
          isSensitiveIssue: ticket.subject.toLowerCase().includes('payment') ||
                           ticket.subject.toLowerCase().includes('account') ||
                           ticket.subject.toLowerCase().includes('refund') ||
                           ticket.priority === 'critical'
        }))
      }
    });

  } catch (error) {
    console.error('Support tickets retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve support tickets' },
      { status: 500 }
    );
  }
}

function getEstimatedResponseTime(priority: string): string {
  switch (priority) {
    case 'critical':
      return '15 minutes';
    case 'high':
      return '1 hour';
    case 'medium':
      return '2 hours';
    case 'low':
      return '24 hours';
    default:
      return '2 hours';
  }
}

// In production, implement these functions:
// async function sendSupportNotification(ticketId: string, ticket: SupportTicket) {
//   // Send email to support team
//   // Send Slack notification
//   // Create internal ticket in support system
// }