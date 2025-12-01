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
}, customRecipient?: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping lead notification email');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = customRecipient || process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
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
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding" 
                   style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Complete Your Setup →
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 12px;">
                  We'll send you a test link within 24-48 hours to review your personalized dashboard.
                </p>
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

/**
 * Send test link email to an operator lead
 */
export async function sendTestLinkEmail(params: {
  email: string;
  businessName?: string;
  ownerName?: string;
  testLink: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping test link email');
    return { success: false, error: 'Email service not configured' };
  }

  const { email, businessName, ownerName, testLink } = params;
  const displayName = ownerName || businessName || 'there';

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Hookah+ test link is ready',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Hookah+ Test Link</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #e5e5e5; max-width: 640px; margin: 0 auto; padding: 24px; background-color: #050509;">
            <div style="background: radial-gradient(circle at top left, #14b8a6 0, #020617 45%), #020617; border-radius: 16px; padding: 32px 28px; color: #e5e5e5;">
              <div style="text-align: center; margin-bottom: 28px;">
                <div style="display: inline-flex; width: 52px; height: 52px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 18px;">
                  <span style="color: white; font-weight: 800; font-size: 22px;">H+</span>
                </div>
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #f9fafb;">Your Hookah+ test link is live</h1>
              </div>

              <p style="font-size: 15px; margin: 0 0 16px 0; color: #e5e5e5;">
                Hi ${displayName},
              </p>
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #d4d4d8;">
                We&apos;ve configured a demo Fire Session Dashboard for your lounge. Your staff can click through tonight&apos;s
                flow in under 15 minutes and see how Hookah+ feels on your floor.
              </p>

              <div style="margin: 24px 0; text-align: center;">
                <a href="${testLink}"
                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: #0b1120; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">
                  Open your test link →
                </a>
                <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                  If the button doesn&apos;t work, paste this into your browser:<br />
                  <span style="word-break: break-all; color: #e5e5e5;">${testLink}</span>
                </p>
              </div>

              <div style="background-color: #020617; border: 1px solid #1f2937; border-radius: 12px; padding: 18px 18px 14px 18px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px 0; font-size: 15px; color: #e5e5e5;">How to try it with your team</h2>
                <ol style="margin: 0 0 10px 18px; padding: 0; font-size: 13px; color: #d4d4d8;">
                  <li style="margin-bottom: 6px;">Open the link on a FOH or BOH tablet during a quiet window.</li>
                  <li style="margin-bottom: 6px;">Run 2–3 fake sessions from New → Close using your tables &amp; flavors.</li>
                  <li>Ask the team if it makes their night feel smoother or not—no filters.</li>
                </ol>
              </div>

              <p style="font-size: 13px; margin: 0; color: #9ca3af;">
                If you have any questions or want us on a quick call while your team tests it, just reply to this email and
                we&apos;ll line it up.
              </p>

              <p style="font-size: 13px; margin: 16px 0 0 0; color: #6b7280;">
                — The Hookah+ team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[Email] Test link email sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send test link email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


