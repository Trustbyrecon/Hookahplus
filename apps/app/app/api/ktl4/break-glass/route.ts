import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// KTL4 break-glass schema
const breakGlassSchema = z.object({
  actionType: z.string(),
  targetId: z.string(),
  operatorId: z.string(),
  reason: z.string(),
  newState: z.string().optional(),
  timestamp: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = breakGlassSchema.parse(body);
    
    const { actionType, targetId, operatorId, reason, newState, timestamp } = validatedData;
    
    // Log the break-glass action for debugging
    console.log(`KTL4 Break-Glass: ${actionType}`, {
      targetId,
      operatorId,
      reason,
      newState,
      timestamp
    });
    
    // Simulate break-glass resolution
    const response = {
      success: true,
      breakGlass: {
        actionType,
        targetId,
        operatorId,
        reason,
        newState,
        timestamp,
        idempotencyKey: `break_glass_${targetId}_${Date.now()}`,
        resolutionStatus: 'manual_override_applied',
        auditTrail: {
          operatorId,
          timestamp,
          action: 'manual_resolution',
          reason
        }
      },
      message: `Manual resolution applied for ${targetId}`
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('KTL4 break-glass error:', error);
    
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
        message: 'Failed to apply manual resolution'
      }, 
      { status: 500 }
    );
  }
}