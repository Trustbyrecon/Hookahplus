# Resend Email Integration Setup

## Overview

Resend email service has been integrated for:
- ✅ Contact form confirmations
- ✅ Newsletter signup confirmations (with free resources)
- ✅ Demo request confirmations

## Setup Instructions

### 1. Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### 2. Get Your API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Hookah+ Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Your Domain (Recommended)

For production, you should verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Add `hookahplus.net`
4. Follow DNS setup instructions:
   - Add TXT record for domain verification
   - Add SPF record
   - Add DKIM records
5. Wait for verification (usually a few minutes)

**Note**: Until domain is verified, you can use Resend's test domain (`onboarding@resend.dev`) for testing.

### 4. Add Environment Variables

Add to `apps/site/.env.local`:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Hookah+ <noreply@hookahplus.net>
```

**For development/testing** (before domain verification):
```env
RESEND_FROM_EMAIL=Hookah+ <onboarding@resend.dev>
```

### 5. Add to Production Environment

Add the same environment variables to:
- **Vercel**: Project Settings → Environment Variables
- **Other hosting**: Add to your production `.env` file

## Email Templates

All emails use HTML templates with:
- Dark theme matching Hookah+ branding
- Responsive design
- Links to resources (case study, ROI calculator, operations checklist)
- Professional formatting

### Contact Confirmation Email
- Sent when contact form is submitted
- Includes links to operations checklist and ROI calculator
- 24-hour response guarantee messaging

### Newsletter Confirmation Email
- Sent when user subscribes to newsletter
- Includes free resources (operations checklist, ROI template)
- Links to case study PDF
- Unsubscribe link

### Demo Request Confirmation Email
- Sent when demo request is submitted
- Includes links to case study and ROI calculator
- 24-hour response guarantee messaging

## Testing

### Test Contact Form
1. Go to `/contact`
2. Fill out and submit the form
3. Check email inbox for confirmation

### Test Newsletter Signup
1. Go to any page with newsletter signup
2. Enter email and submit
3. Check email inbox for confirmation with free resources

### Test Demo Request
1. Go to `/contact` or any demo request form
2. Submit demo request
3. Check email inbox for confirmation

## Monitoring

### Resend Dashboard
- View sent emails: [Resend Dashboard](https://resend.com/emails)
- Check delivery status
- View bounce/complaint rates
- Monitor API usage

### Logs
Email sending is logged in the application:
- Success: `[Email] Contact confirmation sent: {...}`
- Failure: `[Email] Failed to send contact confirmation: {...}`

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Check Domain**: If using custom domain, ensure it's verified
3. **Check Logs**: Look for error messages in application logs
4. **Check Resend Dashboard**: View delivery status and any errors

### Common Issues

**"Email service not configured"**
- `RESEND_API_KEY` is missing or invalid
- Check `.env.local` file

**"Domain not verified"**
- Use `onboarding@resend.dev` for testing
- Or verify your domain in Resend dashboard

**"Rate limit exceeded"**
- Free tier: 3,000 emails/month
- Check usage in Resend dashboard
- Upgrade plan if needed

## Cost

- **Free Tier**: 3,000 emails/month
- **Pro Plan**: $20/month for 50,000 emails
- **Business Plan**: Custom pricing

For Hookah+ usage (estimated 200-800 emails/month), the free tier is sufficient.

## Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to `.env.local`
3. ✅ Test email sending
4. ⏳ Verify domain (for production)
5. ⏳ Update `RESEND_FROM_EMAIL` to use verified domain
6. ⏳ Add to production environment variables

## Files Modified

- `apps/site/lib/email.ts` - Email sending functions
- `apps/site/app/api/demo-requests/route.ts` - Contact/demo email integration
- `apps/site/app/api/newsletter/subscribe/route.ts` - Newsletter email integration
- `apps/site/components/NewsletterSignup.tsx` - Updated to call API

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Resend Status: https://status.resend.com

