import { Resend } from 'resend';

// Initialize Resend only if API key is available
let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.error('[Email Retention] Failed to initialize Resend:', error);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Hookah+ <noreply@hookahplus.net>';

export interface RetentionEmailParams {
  to: string;
  triggerType: string;
  template: string;
  subject: string;
  metadata?: Record<string, any>;
}

/**
 * Send retention email
 */
export async function sendEmail(params: RetentionEmailParams) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('[Email Retention] RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const { to, triggerType, template, subject, metadata = {} } = params;

  try {
    const html = generateEmailTemplate(template, metadata);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: to.includes('@') ? to : `${to}@example.com`, // In production, lookup customer email
      subject: subject,
      html: html,
    });

    console.log(`[Email Retention] ${triggerType} email sent:`, result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email Retention] Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate email template HTML
 */
function generateEmailTemplate(template: string, metadata: Record<string, any>): string {
  const templates: Record<string, (meta: Record<string, any>) => string> = {
    churn_risk: (meta) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">We Miss You!</h2>
          <p>Hi there,</p>
          <p>It's been ${meta.daysSinceLastVisit || 30} days since your last visit. We'd love to see you again!</p>
          <p>As a thank you for being a valued customer, here's <strong>15% off</strong> your next visit.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Claim Your Discount
            </a>
          </div>
          <p>See you soon!</p>
          <p>The Hookah+ Team</p>
        </body>
      </html>
    `,
    win_back: (meta) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Welcome Back!</h2>
          <p>Hi there,</p>
          <p>We've missed you! It's been ${meta.daysSinceLastVisit || 60} days since your last visit.</p>
          <p>To welcome you back, here's <strong>20% off</strong> your next visit.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Claim Your Discount
            </a>
          </div>
          <p>We can't wait to see you again!</p>
          <p>The Hookah+ Team</p>
        </body>
      </html>
    `,
    re_engagement: (meta) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Try Something New!</h2>
          <p>Hi there,</p>
          <p>We noticed you haven't visited in a while. How about trying our premium flavors?</p>
          <p>Get <strong>10% off</strong> premium flavors on your next visit.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Explore Premium Flavors
            </a>
          </div>
          <p>Looking forward to seeing you!</p>
          <p>The Hookah+ Team</p>
        </body>
      </html>
    `,
    loyalty_milestone: (meta) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">You're Almost There!</h2>
          <p>Hi there,</p>
          <p>Great news! You're just <strong>${meta.pointsNeeded || 0} points</strong> away from reaching <strong>${meta.nextTier || 'the next tier'}</strong>!</p>
          <p>Current tier: <strong>${meta.currentTier || 'Bronze'}</strong><br>
          Current points: <strong>${meta.currentPoints || 0}</strong></p>
          <p>Visit us soon to unlock exclusive benefits!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}" 
               style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Visit Now
            </a>
          </div>
          <p>Keep earning points!</p>
          <p>The Hookah+ Team</p>
        </body>
      </html>
    `,
    abandoned_cart: (meta) => `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Complete Your Order</h2>
          <p>Hi there,</p>
          <p>You started an order but didn't complete it. Don't worry, we saved it for you!</p>
          <p>Complete your order now and get <strong>10% off</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}" 
               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Order
            </a>
          </div>
          <p>This offer expires in 24 hours.</p>
          <p>The Hookah+ Team</p>
        </body>
      </html>
    `
  };

  const templateFn = templates[template] || templates.churn_risk;
  return templateFn(metadata);
}

