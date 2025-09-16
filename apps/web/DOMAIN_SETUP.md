# 🌐 Hookah+ Domain Setup Guide

## **Migration from Netlify to Vercel**

### **Step 1: DNS Configuration**

#### **A. Remove Netlify DNS Records**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Remove any Netlify-specific DNS records:
   - `CNAME` records pointing to Netlify
   - `A` records pointing to Netlify IPs

#### **B. Add Vercel DNS Records**
Add these DNS records in your domain registrar:

```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### **Step 2: Vercel Domain Configuration**

#### **A. Add Domain in Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `hookahplus` project
3. Go to **Settings** → **Domains**
4. Add domains:
   - `hookahplus.net`
   - `www.hookahplus.net`

#### **B. Verify Domain Ownership**
1. Vercel will provide DNS verification records
2. Add the verification TXT record to your DNS
3. Wait for verification (usually 5-10 minutes)

### **Step 3: SSL Certificate**

✅ **Automatic**: Vercel automatically provisions SSL certificates for custom domains
- **Let's Encrypt** certificates
- **Auto-renewal** every 90 days
- **HTTPS redirect** enabled by default

### **Step 4: Environment Variables**

Set these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
TRUSTLOCK_SECRET=your_trustlock_secret_32_chars_or_more
DATABASE_URL=postgresql://your_supabase_connection_string
```

### **Step 5: Webhook Configuration**

#### **A. Stripe Webhook Endpoint**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL: `https://hookahplus.net/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret and update Vercel environment

#### **B. Test Webhook**
```bash
# Test webhook endpoint
curl -X POST https://hookahplus.net/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### **Step 6: Verification Checklist**

- [ ] DNS records updated
- [ ] Domain added to Vercel
- [ ] Domain verified
- [ ] SSL certificate active (green lock)
- [ ] Environment variables set
- [ ] Webhook endpoint configured
- [ ] Site loads at https://hookahplus.net
- [ ] www.hookahplus.net redirects to hookahplus.net

### **Step 7: Post-Migration**

#### **A. Update External References**
- Update any hardcoded URLs in your code
- Update social media links
- Update email signatures
- Update business cards/marketing materials

#### **B. Monitor Performance**
- Check Vercel Analytics
- Monitor Core Web Vitals
- Test all functionality
- Verify Stripe payments work

## **🚨 Important Notes**

1. **DNS Propagation**: Can take up to 48 hours globally
2. **SSL Certificate**: May take 5-10 minutes after DNS verification
3. **Backup**: Keep Netlify deployment as backup during transition
4. **Testing**: Test thoroughly before announcing the new domain

## **🆘 Troubleshooting**

### **Domain Not Loading**
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct
- Wait for propagation (up to 48 hours)

### **SSL Issues**
- Check domain verification status in Vercel
- Ensure DNS records are correct
- Contact Vercel support if needed

### **Webhook Issues**
- Verify webhook URL is correct
- Check Stripe webhook logs
- Test with Stripe CLI: `stripe listen --forward-to https://hookahplus.net/api/webhooks/stripe`
