import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Refill request schema
const refillSchema = z.object({
  sessionId: z.string(),
  newState: z.string().optional(),
  operatorId: z.string(),
  workflow: z.string(),
  businessLogic: z.string(),
  timestamp: z.string()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = refillSchema.parse(body);
    
    const { sessionId, newState, operatorId, workflow, businessLogic, timestamp } = validatedData;
    
    // Log the refill request for debugging
    console.log(`Refill Request: ${sessionId}`, {
      operatorId,
      workflow,
      businessLogic,
      newState,
      timestamp
    });
    
    // Simulate successful refill request
    const response = {
      success: true,
      sessionId,
      refillRequest: {
        operatorId,
        workflow,
        businessLogic,
        timestamp,
        idempotencyKey: `refill_${sessionId}_${Date.now()}`,
        estimatedPrepTime: '5-7 minutes',
        status: 'queued_for_boh'
      },
      message: `Refill request for session ${sessionId} has been queued for BOH`
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Refill request error:', error);
    
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
        message: 'Failed to process refill request'
      }, 
      { status: 500 }
    );
  }
}
