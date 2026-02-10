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
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net';
/** App dashboard URL (operator-onboarding lives here; do not use SITE_URL for dashboard links). */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';

/**
 * Send contact form confirmation email
 */
export async function sendContactConfirmation(email: string, name: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'We received your message!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Message Received</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
                </div>
                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">Message Received!</h1>
              </div>
              
              <div style="color: #d4d4d4; margin-bottom: 30px;">
                <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
                <p style="font-size: 16px; margin-bottom: 16px;">Thank you for reaching out to Hookah+! We've received your message and will respond within 24 hours.</p>
              </div>

              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">What Happens Next?</h2>
                <ul style="color: #d4d4d4; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 12px;">Our team will review your inquiry</li>
                  <li style="margin-bottom: 12px;">We'll respond via email within 24 hours</li>
                  <li style="margin-bottom: 12px;">We'll provide detailed information about how Hookah+ can help your lounge</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${SITE_URL}/resources/operations-checklist" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-right: 12px;">Download Operations Checklist</a>
                <a href="${SITE_URL}/#roi-calculator" style="display: inline-block; background-color: transparent; color: #14b8a6; text-decoration: none; padding: 14px 28px; border: 2px solid #14b8a6; border-radius: 8px; font-weight: 600;">Try ROI Calculator</a>
              </div>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
                <p style="margin: 0;">Questions? Email us at <a href="mailto:hookahplusconnector@gmail.com" style="color: #14b8a6; text-decoration: none;">hookahplusconnector@gmail.com</a></p>
                <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[Email] Contact confirmation sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send contact confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send newsletter confirmation email with free resources
 */
export async function sendNewsletterConfirmation(email: string, name?: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const displayName = name || 'there';

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Hookah+ Newsletter! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Hookah+ Newsletter</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
                </div>
                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">You're Subscribed! 🎉</h1>
              </div>
              
              <div style="color: #d4d4d4; margin-bottom: 30px;">
                <p style="font-size: 16px; margin-bottom: 16px;">Hi ${displayName},</p>
                <p style="font-size: 16px; margin-bottom: 16px;">Thank you for joining the Hookah+ newsletter! You'll receive weekly tips, industry insights, and exclusive updates.</p>
              </div>

              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Your Free Resources</h2>
                <p style="color: #d4d4d4; margin-bottom: 20px;">As a thank you, here are some resources to help you optimize your lounge operations:</p>
                <div style="margin-bottom: 16px;">
                  <a href="${SITE_URL}/resources/operations-checklist" style="display: block; background-color: #14b8a6; color: white; text-decoration: none; padding: 14px 20px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 12px;">📋 Download Operations Checklist</a>
                  <a href="${SITE_URL}/resources/roi-template" style="display: block; background-color: transparent; color: #14b8a6; text-decoration: none; padding: 14px 20px; border: 2px solid #14b8a6; border-radius: 8px; font-weight: 600; text-align: center;">📊 Download ROI Template</a>
                </div>
              </div>

              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">What to Expect</h2>
                <ul style="color: #d4d4d4; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 12px;">Weekly tips for improving lounge operations</li>
                  <li style="margin-bottom: 12px;">Industry insights and best practices</li>
                  <li style="margin-bottom: 12px;">Exclusive updates on new Hookah+ features</li>
                  <li style="margin-bottom: 12px;">Case studies and success stories</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${SITE_URL}/case-study-hookahplus-transformation.pdf" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Download Case Study (PDF)</a>
              </div>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
                <p style="margin: 0;">No longer interested? <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #14b8a6; text-decoration: none;">Unsubscribe</a></p>
                <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[Email] Newsletter confirmation sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send newsletter confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send new lead notification email to admin/connector
 */
export async function sendHopeLeadNotification(leadData: {
  email: string;
  source?: string;
  submissionTime?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping lead notification email');
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
  const connectorEmail = 'hookahplusconnector@gmail.com';

  const submissionTime = leadData.submissionTime || new Date().toLocaleString();

  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Hope Global Forum Lead</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">🎯 New Lead from Hope Global Forum</h1>
          </div>
          
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Lead Details</h2>
            <table style="width: 100%; color: #d4d4d4; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${leadData.email}" style="color: #14b8a6; text-decoration: none;">${leadData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Source:</td>
                <td style="padding: 8px 0;">${leadData.source || 'Hope Global Forum'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Submitted:</td>
                <td style="padding: 8px 0;">${submissionTime}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${APP_URL}/admin/operator-onboarding?source=hope_global_forum" 
               style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Lead in Dashboard →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
            <p style="margin: 0;">This lead was submitted from the Hope Global Forum landing page.</p>
            <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const results = [];

  // Send to admin email
  try {
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🎯 New Hope Global Forum Lead: ${leadData.email}`,
      html: emailContent,
    });
    results.push({ recipient: adminEmail, success: true, id: adminResult.data?.id });
    console.log('[Email] Hope lead notification sent to admin:', adminEmail);
  } catch (error) {
    console.error('[Email] Failed to send Hope lead notification to admin:', error);
    results.push({ recipient: adminEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  // Send to connector email
  try {
    const connectorResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: connectorEmail,
      subject: `🎯 New Hope Global Forum Lead: ${leadData.email}`,
      html: emailContent,
    });
    results.push({ recipient: connectorEmail, success: true, id: connectorResult.data?.id });
    console.log('[Email] Hope lead notification sent to connector:', connectorEmail);
  } catch (error) {
    console.error('[Email] Failed to send Hope lead notification to connector:', error);
    results.push({ recipient: connectorEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  const allSuccess = results.every(r => r.success);
  return { 
    success: allSuccess, 
    results,
    error: allSuccess ? undefined : 'Some emails failed to send'
  };
}

/**
 * Send demo request confirmation email
 */
export async function sendDemoRequestConfirmation(email: string, name: string, loungeName?: string) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Demo Request Received - Let\'s Schedule Your Walkthrough',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Demo Request Received</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
                </div>
                <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">Demo Request Received!</h1>
              </div>
              
              <div style="color: #d4d4d4; margin-bottom: 30px;">
                <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
                <p style="font-size: 16px; margin-bottom: 16px;">Thank you for requesting a demo of Hookah+${loungeName ? ` for ${loungeName}` : ''}! We're excited to show you how our platform can transform your lounge operations.</p>
              </div>

              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">What Happens Next?</h2>
                <ul style="color: #d4d4d4; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 12px;">Our team will contact you within 24 hours</li>
                  <li style="margin-bottom: 12px;">We'll coordinate a time that works for you</li>
                  <li style="margin-bottom: 12px;">You'll see Hookah+ in action with a personalized walkthrough</li>
                  <li style="margin-bottom: 12px;">We'll discuss how Hookah+ can meet your specific needs</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${SITE_URL}/case-study-hookahplus-transformation.pdf" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-right: 12px;">Download Case Study</a>
                <a href="${SITE_URL}/#roi-calculator" style="display: inline-block; background-color: transparent; color: #14b8a6; text-decoration: none; padding: 14px 28px; border: 2px solid #14b8a6; border-radius: 8px; font-weight: 600;">Try ROI Calculator</a>
              </div>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
                <p style="margin: 0;">Questions? Email us at <a href="mailto:hookahplusconnector@gmail.com" style="color: #14b8a6; text-decoration: none;">hookahplusconnector@gmail.com</a></p>
                <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('[Email] Demo request confirmation sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send demo request confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send World Shisha 2026 lead notification
 */
export async function sendWorldShishaLeadNotification(data: {
  email: string;
  source?: string;
  exhibitor?: string | null;
  campaign?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const connectorEmail = 'hookahplusconnector@gmail.com';
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
  const submissionTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New World Shisha 2026 Lead</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">🎯 New World Shisha 2026 Lead</h1>
          </div>
          
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Lead Details</h2>
            <table style="width: 100%; color: #d4d4d4; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #14b8a6; text-decoration: none;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Source:</td>
                <td style="padding: 8px 0;">${data.source || 'World Shisha 2026 Landing'}</td>
              </tr>
              ${data.exhibitor ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Exhibitor:</td>
                <td style="padding: 8px 0;">${data.exhibitor}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Submitted:</td>
                <td style="padding: 8px 0;">${submissionTime}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${APP_URL}/admin/operator-onboarding?source=world_shisha_2026" 
               style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Lead in Dashboard →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
            <p style="margin: 0;">This lead was submitted from the World Shisha 2026 landing page.</p>
            <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const results = [];

  // Send to connector email (primary)
  try {
    const connectorResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: connectorEmail,
      subject: `🎯 New World Shisha 2026 Lead: ${data.email}`,
      html: emailContent,
    });
    results.push({ recipient: connectorEmail, success: true, id: connectorResult.data?.id });
    console.log('[Email] World Shisha lead notification sent to connector:', connectorEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha lead notification to connector:', error);
    results.push({ recipient: connectorEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  // Send to admin email (fallback)
  try {
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🎯 New World Shisha 2026 Lead: ${data.email}`,
      html: emailContent,
    });
    results.push({ recipient: adminEmail, success: true, id: adminResult.data?.id });
    console.log('[Email] World Shisha lead notification sent to admin:', adminEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha lead notification to admin:', error);
    results.push({ recipient: adminEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  const allSuccess = results.every(r => r.success);
  return { 
    success: allSuccess, 
    results,
    error: allSuccess ? undefined : 'Some emails failed to send'
  };
}

/**
 * Send World Shisha 2026 brief download notification
 */
export async function sendWorldShishaBriefDownloadNotification(data: {
  email: string;
  name?: string;
  exhibitor?: string | null;
  campaign?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const connectorEmail = 'hookahplusconnector@gmail.com';
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
  const submissionTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>World Shisha 2026 Brief Download</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">📥 Smart Lounge Playbook Downloaded</h1>
          </div>
          
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Download Details</h2>
            <table style="width: 100%; color: #d4d4d4; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #14b8a6; text-decoration: none;">${data.email}</a></td>
              </tr>
              ${data.name ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Name:</td>
                <td style="padding: 8px 0;">${data.name}</td>
              </tr>
              ` : ''}
              ${data.exhibitor ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Exhibitor:</td>
                <td style="padding: 8px 0;">${data.exhibitor}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Downloaded:</td>
                <td style="padding: 8px 0;">${submissionTime}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${APP_URL}/admin/operator-onboarding?source=world_shisha_2026&type=brief_download" 
               style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Lead in Dashboard →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
            <p style="margin: 0;">Smart Lounge Playbook 2026 download from World Shisha 2026 campaign.</p>
            <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const results = [];

  // Send to connector email (primary)
  try {
    const connectorResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: connectorEmail,
      subject: `📥 World Shisha 2026: Brief Downloaded by ${data.email}`,
      html: emailContent,
    });
    results.push({ recipient: connectorEmail, success: true, id: connectorResult.data?.id });
    console.log('[Email] World Shisha brief download notification sent to connector:', connectorEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha brief download notification to connector:', error);
    results.push({ recipient: connectorEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  // Send to admin email (fallback)
  try {
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `📥 World Shisha 2026: Brief Downloaded by ${data.email}`,
      html: emailContent,
    });
    results.push({ recipient: adminEmail, success: true, id: adminResult.data?.id });
    console.log('[Email] World Shisha brief download notification sent to admin:', adminEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha brief download notification to admin:', error);
    results.push({ recipient: adminEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  const allSuccess = results.every(r => r.success);
  return { 
    success: allSuccess, 
    results,
    error: allSuccess ? undefined : 'Some emails failed to send'
  };
}

/**
 * Send World Shisha 2026 Pilot Pack signup notification
 */
export async function sendWorldShishaPilotPackSignupNotification(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  currentPOS?: string;
  numberOfLocations?: string;
  exhibitor?: string | null;
  referralCode?: string | null;
  campaign?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const connectorEmail = 'hookahplusconnector@gmail.com';
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'clark.dwayne@gmail.com';
  const submissionTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>World Shisha 2026 Pilot Pack Signup</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #0a0a0a; border-radius: 12px; padding: 40px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 20px;">H+</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">🚀 New Pilot Pack Signup!</h1>
          </div>
          
          <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <h2 style="color: #14b8a6; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Business Details</h2>
            <table style="width: 100%; color: #d4d4d4; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Business Name:</td>
                <td style="padding: 8px 0;">${data.businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Owner Name:</td>
                <td style="padding: 8px 0;">${data.ownerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #14b8a6; text-decoration: none;">${data.email}</a></td>
              </tr>
              ${data.phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Phone:</td>
                <td style="padding: 8px 0;">${data.phone}</td>
              </tr>
              ` : ''}
              ${data.city || data.country ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Location:</td>
                <td style="padding: 8px 0;">${[data.city, data.country].filter(Boolean).join(', ') || data.location || 'Not provided'}</td>
              </tr>
              ` : ''}
              ${data.currentPOS ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Current POS:</td>
                <td style="padding: 8px 0;">${data.currentPOS}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Number of Locations:</td>
                <td style="padding: 8px 0;">${data.numberOfLocations || '1'}</td>
              </tr>
              ${data.exhibitor ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">How They Heard:</td>
                <td style="padding: 8px 0;">${data.exhibitor}</td>
              </tr>
              ` : ''}
              ${data.referralCode ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Referral Code:</td>
                <td style="padding: 8px 0;">${data.referralCode}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #fff;">Submitted:</td>
                <td style="padding: 8px 0;">${submissionTime}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${APP_URL}/admin/operator-onboarding?source=world_shisha_2026&type=pilot_pack" 
               style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Lead in Dashboard →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #2a2a2a; color: #737373; font-size: 14px; text-align: center;">
            <p style="margin: 0;">World Shisha 2026 Pilot Pack signup - 60-day pilot requested.</p>
            <p style="margin: 16px 0 0 0;">© ${new Date().getFullYear()} HookahPlus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const results = [];

  // Send to connector email (primary)
  try {
    const connectorResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: connectorEmail,
      subject: `🚀 World Shisha 2026: Pilot Pack Signup - ${data.businessName}`,
      html: emailContent,
    });
    results.push({ recipient: connectorEmail, success: true, id: connectorResult.data?.id });
    console.log('[Email] World Shisha pilot pack signup notification sent to connector:', connectorEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha pilot pack signup notification to connector:', error);
    results.push({ recipient: connectorEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  // Send to admin email (fallback)
  try {
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🚀 World Shisha 2026: Pilot Pack Signup - ${data.businessName}`,
      html: emailContent,
    });
    results.push({ recipient: adminEmail, success: true, id: adminResult.data?.id });
    console.log('[Email] World Shisha pilot pack signup notification sent to admin:', adminEmail);
  } catch (error) {
    console.error('[Email] Failed to send World Shisha pilot pack signup notification to admin:', error);
    results.push({ recipient: adminEmail, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  const allSuccess = results.every(r => r.success);
  return { 
    success: allSuccess, 
    results,
    error: allSuccess ? undefined : 'Some emails failed to send'
  };
}

