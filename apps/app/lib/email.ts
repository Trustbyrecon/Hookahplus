import { Resend } from 'resend';

// Initialize Resend only if API key is available
let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.error('[Email] Failed to initialize Resend:', error);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Hookah+ <noreply@hookahplus.net>';

/**
 * Send new lead notification email to admin
 */
export async function sendNewLeadNotification(leadData: {
  businessName: string;
  ownerName?: string;
  email: string;
  phone?: string;
  location?: string;
  source?: string;
  stage?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping lead notification email');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
  const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE || '470-2269219';

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🎯 New Lead: ${leadData.businessName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Lead Notification</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
                </div>
                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">🎯 New Lead Received!</h1>
              </div>
              
              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Lead Details</h2>
                <table style="width: 100%; color: #d4d4d4; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Business Name:</td>
                    <td style="padding: 8px 0;">${leadData.businessName}</td>
                  </tr>
                  ${leadData.ownerName ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Owner/Manager:</td>
                    <td style="padding: 8px 0;">${leadData.ownerName}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${leadData.email}" style="color: #14b8a6; text-decoration: none;">${leadData.email}</a></td>
                  </tr>
                  ${leadData.phone ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Phone:</td>
                    <td style="padding: 8px 0;"><a href="tel:${leadData.phone}" style="color: #14b8a6; text-decoration: none;">${leadData.phone}</a></td>
                  </tr>
                  ` : ''}
                  ${leadData.location ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Location:</td>
                    <td style="padding: 8px 0;">${leadData.location}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Source:</td>
                    <td style="padding: 8px 0;">${leadData.source || 'website'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #fff;">Stage:</td>
                    <td style="padding: 8px 0;">${leadData.stage || 'new-leads'}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/admin/operator-onboarding" 
                   style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  View Lead in Dashboard →
                </a>
              </div>

              <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                <p>Hookah+ Operator Onboarding Management</p>
                <p>This is an automated notification. Reply to this email to contact the lead.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[Email] New lead notification sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send lead notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

