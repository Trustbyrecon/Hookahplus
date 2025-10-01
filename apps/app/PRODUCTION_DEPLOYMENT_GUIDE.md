# 🚀 Hookah+ Production Deployment Guide

## **Overview**

This guide covers the complete process of deploying the Hookah+ application to production using Vercel. The application is a Next.js-based hookah lounge management system with Stripe integration, staff management, and real-time monitoring.

## **Prerequisites**

- [ ] Node.js 18+ installed
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Git repository with all changes committed
- [ ] Stripe account with live keys
- [ ] Supabase project (optional, for database)
- [ ] Domain name (optional, for custom domain)

## **Step 1: Environment Setup**

### **1.1 Create Production Environment File**

```bash
# Copy the template
cp env.production.template .env.production

# Edit with your production values
nano .env.production
```

### **1.2 Required Environment Variables**

```bash
# Stripe Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_live_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Application URLs
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GUEST_URL=https://your-guest.vercel.app

# Feature Flags
NEXT_PUBLIC_PRETTY_THEME=1
NEXT_PUBLIC_ANALYTICS_ENABLED=1
NEXT_PUBLIC_DEBUG_MODE=0
```

## **Step 2: Pre-Deployment Checks**

### **2.1 Run Build Test**

```bash
npm run build
```

This should complete without errors. If it fails, fix the issues before proceeding.

### **2.2 Run Production Deployment Script**

```bash
node scripts/deploy-production.js
```

This script will:
- Check for uncommitted changes
- Verify you're on the main branch
- Validate production environment
- Run build tests
- Deploy to Vercel

## **Step 3: Vercel Deployment**

### **3.1 Manual Deployment (Alternative)**

If the script fails, you can deploy manually:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to configure your project
```

### **3.2 Configure Environment Variables in Vercel**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from your `.env.production` file
3. Make sure to set them for "Production" environment
4. Redeploy the project

## **Step 4: Stripe Configuration**

### **4.1 Configure Stripe Webhooks**

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to your environment variables

### **4.2 Test Stripe Integration**

1. Visit your deployed app
2. Navigate to the $1 test page
3. Complete a test transaction
4. Verify the webhook is received in Stripe Dashboard

## **Step 5: Domain Configuration (Optional)**

### **5.1 Add Custom Domain**

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate to be issued

### **5.2 Update Environment Variables**

Update your environment variables with the new domain:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://app.your-domain.com
```

## **Step 6: Monitoring Setup**

### **6.1 Health Check**

Your app includes a health check endpoint at `/api/health`. This provides:
- System status
- Service connectivity
- Memory usage
- Uptime information

### **6.2 Production Monitoring**

Access the monitoring dashboard at `/admin` (if implemented) to view:
- Real-time metrics
- Error rates
- Performance data
- Service status

## **Step 7: Post-Deployment Testing**

### **7.1 Functional Tests**

- [ ] Homepage loads correctly
- [ ] Pre-order flow works
- [ ] Staff panel is accessible
- [ ] Admin functions work
- [ ] Stripe payments process
- [ ] Webhooks are received

### **7.2 Performance Tests**

- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] No console errors
- [ ] Mobile responsiveness works

### **7.3 Security Tests**

- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] No sensitive data in client-side code
- [ ] API endpoints are protected

## **Step 8: Go Live Checklist**

### **8.1 Final Verification**

- [ ] All tests pass
- [ ] Stripe is in live mode
- [ ] Domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Monitoring is set up
- [ ] Backup strategy is in place

### **8.2 Launch**

- [ ] Announce to team
- [ ] Monitor for issues
- [ ] Have rollback plan ready
- [ ] Document any issues

## **Troubleshooting**

### **Common Issues**

1. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Deployment Failures**
   - Ensure you're logged into Vercel
   - Check Vercel project settings
   - Verify environment variables are set

3. **Stripe Issues**
   - Verify webhook endpoint is correct
   - Check webhook secret matches
   - Ensure Stripe keys are live (not test)

4. **Domain Issues**
   - Check DNS propagation
   - Verify SSL certificate is issued
   - Wait up to 24 hours for full propagation

### **Getting Help**

- Check Vercel deployment logs
- Review Stripe webhook logs
- Check browser console for errors
- Monitor the health endpoint

## **Maintenance**

### **Regular Tasks**

- Monitor system health
- Check error rates
- Update dependencies
- Review security settings
- Backup data regularly

### **Updates**

To deploy updates:
1. Make changes locally
2. Test thoroughly
3. Commit to main branch
4. Run deployment script
5. Verify in production

## **Security Considerations**

- Never commit `.env.production` to version control
- Use strong, unique secrets
- Regularly rotate API keys
- Monitor for security vulnerabilities
- Keep dependencies updated

---

**🎉 Congratulations! Your Hookah+ application is now live in production!**

For support or questions, refer to the Vercel documentation or contact the development team.
