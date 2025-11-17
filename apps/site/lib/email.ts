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

