import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// KTL4 alerts schema
const alertsSchema = z.object({
  priority: z.string(),
  flowName: z.string(),
  alertType: z.string(),
  message: z.string(),
  details: z.object({
    sessionId: z.string()
  }),
  operatorId: z.string(),
  newState: z.string().optional(),
  timestamp: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = alertsSchema.parse(body);
    
    const { priority, flowName, alertType, message, details, operatorId, newState, timestamp } = validatedData;
    
    // Log the alert for debugging
    console.log(`KTL4 Alert: ${alertType}`, {
      priority,
      flowName,
      message,
      details,
      operatorId,
      newState,
      timestamp
    });
    
    // Simulate alert escalation
    const response = {
      success: true,
      alert: {
        priority,
        flowName,
        alertType,
        message,
        details,
        operatorId,
        newState,
        timestamp,
        idempotencyKey: `alert_${details.sessionId}_${Date.now()}`,
        escalationStatus: 'escalated_to_management',
        estimatedResponseTime: '5-15 minutes',
        assignedTo: 'management_team'
      },
      message: `Alert escalated for session ${details.sessionId}`
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('KTL4 alerts error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to escalate alert'
      }, 
      { status: 500 }
    );
  }
}