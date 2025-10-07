import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log(`[Print API] 🖨️ Print request received: ${type}`);

    switch (type) {
      case 'receipt':
        const { sessionId, items, total, paymentMethod } = data;
        
        // Get session details
        const session = await prisma.session.findUnique({
          where: { id: sessionId }
        });

        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        const receiptData = {
          sessionId,
          tableId: session.tableId,
          items,
          subtotal: total,
          tax: Math.round(total * 0.08), // 8% tax
          total: Math.round(total * 1.08),
          paymentMethod,
          timestamp: new Date().toISOString(),
          printedAt: new Date().toISOString()
        };

        // Log print action
        await prisma.sessionTransition.create({
          data: {
            sessionId,
            fromState: session.state,
            toState: session.state,
            transition: 'receipt_printed',
            userId: 'print_system',
            note: `Receipt printed for table ${session.tableId}`
          }
        });

        return NextResponse.json({ 
          success: true, 
          data: receiptData,
          printData: generateReceiptText(receiptData)
        });

      case 'kitchen_ticket':
        const { orderItems, tableId: kitchenTableId, specialRequests } = data;
        
        const kitchenTicket = {
          tableId: kitchenTableId,
          items: orderItems,
          specialRequests: specialRequests || '',
          timestamp: new Date().toISOString(),
          printedAt: new Date().toISOString()
        };

        return NextResponse.json({ 
          success: true, 
          data: kitchenTicket,
          printData: generateKitchenTicketText(kitchenTicket)
        });

      case 'session_summary':
        const { sessionId: summarySessionId } = data;
        
        const summarySession = await prisma.session.findUnique({
          where: { id: summarySessionId }
        });

        if (!summarySession) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        const summaryData = {
          sessionId: summarySessionId,
          tableId: summarySession.tableId,
          state: summarySession.state,
          duration: summarySession.durationSecs,
          total: summarySession.priceCents,
          startedAt: summarySession.startedAt,
          endedAt: summarySession.endedAt,
          timestamp: new Date().toISOString()
        };

        return NextResponse.json({ 
          success: true, 
          data: summaryData,
          printData: generateSessionSummaryText(summaryData)
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown print type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[Print API] ❌ Error processing print request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process print request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateReceiptText(data: any): string {
  const { sessionId, tableId, items, subtotal, tax, total, paymentMethod, timestamp } = data;
  
  let receipt = `
================================
    HOOKAH+ LOUNGE
    RECEIPT
================================
Table: ${tableId}
Session: ${sessionId}
Date: ${new Date(timestamp).toLocaleString()}
--------------------------------
`;

  items.forEach((item: any) => {
    receipt += `${item.name.padEnd(20)} $${(item.price / 100).toFixed(2)}\n`;
    if (item.quantity > 1) {
      receipt += `  x${item.quantity}\n`;
    }
  });

  receipt += `
--------------------------------
Subtotal:        $${(subtotal / 100).toFixed(2)}
Tax:             $${(tax / 100).toFixed(2)}
--------------------------------
TOTAL:           $${(total / 100).toFixed(2)}
--------------------------------
Payment: ${paymentMethod}
================================
Thank you for visiting Hookah+!
`;

  return receipt;
}

function generateKitchenTicketText(data: any): string {
  const { tableId, items, specialRequests, timestamp } = data;
  
  let ticket = `
================================
    KITCHEN TICKET
================================
Table: ${tableId}
Time: ${new Date(timestamp).toLocaleTimeString()}
--------------------------------
`;

  items.forEach((item: any) => {
    ticket += `${item.name}\n`;
    if (item.quantity > 1) {
      ticket += `  Qty: ${item.quantity}\n`;
    }
    if (item.specialInstructions) {
      ticket += `  Note: ${item.specialInstructions}\n`;
    }
    ticket += `\n`;
  });

  if (specialRequests) {
    ticket += `Special Requests:\n${specialRequests}\n`;
  }

  ticket += `================================`;

  return ticket;
}

function generateSessionSummaryText(data: any): string {
  const { sessionId, tableId, state, duration, total, startedAt, endedAt } = data;
  
  const durationMinutes = duration ? Math.round(duration / 60) : 0;
  
  return `
================================
    SESSION SUMMARY
================================
Session: ${sessionId}
Table: ${tableId}
Status: ${state}
Duration: ${durationMinutes} minutes
Total: $${(total / 100).toFixed(2)}
Started: ${startedAt ? new Date(startedAt).toLocaleString() : 'N/A'}
Ended: ${endedAt ? new Date(endedAt).toLocaleString() : 'N/A'}
================================
`;
}
