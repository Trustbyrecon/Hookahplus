import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

/**
 * POST /api/webhooks/email
 * 
 * Webhook endpoint for email CTA tracking
 * Receives emails forwarded from hookahplusconnector@gmail.com
 * 
 * Setup Options:
 * 1. Email forwarding service (SendGrid, Mailgun, etc.) - Recommended
 * 2. Gmail API polling (requires service account)
 * 3. Manual email parsing endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'email-webhook';

    // Parse email payload (format depends on email service provider)
    let payload: any;
    
    try {
      payload = await req.json();
    } catch {
      // If JSON parsing fails, try text parsing
      const text = await req.text();
      try {
        payload = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Invalid payload format' },
          { status: 400 }
        );
      }
    }
    
    // Support multiple email service formats
    // SendGrid format
    if (payload.from && payload.text) {
      await processEmailPayload(payload, ip, userAgent, 'sendgrid');
      return NextResponse.json({ success: true });
    }
    
    // Mailgun format
    if (payload['sender'] && payload['body-plain']) {
      await processEmailPayload(payload, ip, userAgent, 'mailgun');
      return NextResponse.json({ success: true });
    }
    
    // Generic format
    if (payload.email || payload.from || payload.sender) {
      await processEmailPayload(payload, ip, userAgent, 'generic');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid email payload format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Email Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Email processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Process email payload and create CTA event
 */
async function processEmailPayload(
  payload: any,
  ip: string,
  userAgent: string,
  provider: 'sendgrid' | 'mailgun' | 'generic'
) {
  // Extract email data based on provider
  let emailData: {
    from: string;
    to: string;
    subject: string;
    body: string;
    name?: string;
  };

  switch (provider) {
    case 'sendgrid':
      emailData = {
        from: payload.from || '',
        to: payload.to || '',
        subject: payload.subject || '',
        body: payload.text || payload.html || '',
        name: payload.from_name || extractNameFromEmail(payload.from)
      };
      break;
    
    case 'mailgun':
      emailData = {
        from: payload.sender || '',
        to: payload.recipient || '',
        subject: payload.subject || '',
        body: payload['body-plain'] || payload['body-html'] || '',
        name: payload['sender-name'] || extractNameFromEmail(payload.sender)
      };
      break;
    
    default:
      emailData = {
        from: payload.from || payload.sender || payload.email || '',
        to: payload.to || payload.recipient || '',
        subject: payload.subject || '',
        body: payload.body || payload.text || payload.html || '',
        name: payload.name || extractNameFromEmail(payload.from || payload.sender)
      };
  }

  // Parse email body for lead information
  const leadInfo = parseEmailForLeadInfo(emailData.body, emailData.subject);

  // Determine CTA type based on email content
  let ctaType: 'demo_request' | 'onboarding_signup' | 'contact_form' = 'contact_form';
  const bodyLower = emailData.body.toLowerCase();
  const subjectLower = emailData.subject.toLowerCase();
  
  if (bodyLower.includes('demo') || subjectLower.includes('demo')) {
    ctaType = 'demo_request';
  } else if (bodyLower.includes('onboard') || bodyLower.includes('signup') || bodyLower.includes('get started')) {
    ctaType = 'onboarding_signup';
  }

  // Create CTA event
  const eventPayload = {
    ctaSource: 'email',
    ctaType,
    data: {
      name: leadInfo.name || emailData.name,
      email: emailData.from,
      phone: leadInfo.phone,
      businessName: leadInfo.businessName,
      location: leadInfo.location,
      message: emailData.body.substring(0, 500) // First 500 chars
    },
    metadata: {
      emailProvider: provider,
      emailSubject: emailData.subject,
      emailTo: emailData.to,
      parsedFields: leadInfo
    },
    timestamp: new Date().toISOString()
  };

  const payloadStr = JSON.stringify(eventPayload);
  const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 64);

  // Check for duplicates (same email + subject in last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicate = await prisma.reflexEvent.findFirst({
    where: {
      type: `cta.${ctaType}`,
      ctaSource: 'email',
      payloadHash,
      createdAt: { gt: oneDayAgo }
    }
  });

  if (!duplicate) {
    await prisma.reflexEvent.create({
      data: {
        type: `cta.${ctaType}`,
        source: 'email',
        payload: payloadStr,
        payloadHash,
        ctaSource: 'email',
        ctaType,
        metadata: JSON.stringify(eventPayload.metadata),
        userAgent,
        ip
      }
    });

    console.log(`[Email Webhook] Created CTA event for email from ${emailData.from}`);
  } else {
    console.log(`[Email Webhook] Duplicate email detected, skipping`);
  }
}

/**
 * Extract name from email address
 */
function extractNameFromEmail(email: string): string | undefined {
  const match = email.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Parse email body for lead information
 */
function parseEmailForLeadInfo(body: string, subject: string): {
  name?: string;
  phone?: string;
  businessName?: string;
  location?: string;
} {
  const info: any = {};
  
  // Try to extract name
  const nameMatch = body.match(/(?:name|contact):\s*([^\n]+)/i) || 
                    body.match(/hi,?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (nameMatch) {
    info.name = nameMatch[1].trim();
  }

  // Try to extract phone
  const phoneMatch = body.match(/(?:phone|tel|mobile):\s*([\d\s\-\(\)\+]+)/i) ||
                     body.match(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    info.phone = phoneMatch[1].trim();
  }

  // Try to extract business name
  const businessMatch = body.match(/(?:business|lounge|venue|company):\s*([^\n]+)/i);
  if (businessMatch) {
    info.businessName = businessMatch[1].trim();
  }

  // Try to extract location
  const locationMatch = body.match(/(?:location|city|address):\s*([^\n]+)/i);
  if (locationMatch) {
    info.location = locationMatch[1].trim();
  }

  return info;
}

/**
 * GET /api/webhooks/email
 * 
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'email-webhook',
    supportedProviders: ['sendgrid', 'mailgun', 'generic'],
    email: 'hookahplusconnector@gmail.com'
  });
}

