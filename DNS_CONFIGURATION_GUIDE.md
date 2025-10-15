# 🌐 DNS Configuration Guide for hookahplus.net

## **Step 3: Configure domain DNS (hookahplus.net)**

### **3.1 Primary Domain Configuration**

#### **A Record (Root Domain)**
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
```
*Points hookahplus.net to Vercel's IP address*

#### **CNAME Record (WWW Subdomain)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```
*Points www.hookahplus.net to Vercel*

### **3.2 Monorepo Subdomain Configuration**

#### **App Build (Main Application)**
```
Type: CNAME
Name: app
Value: hookahplus-app-prod.vercel.app
TTL: 3600
```
*Points app.hookahplus.net to the main app build*

#### **Guest Build (Customer Portal)**
```
Type: CNAME
Name: guest
Value: hookahplus-guest-prod.vercel.app
TTL: 3600
```
*Points guest.hookahplus.net to the guest build*

#### **Site Build (Marketing Site)**
```
Type: CNAME
Name: site
Value: hookahplus-site-prod.vercel.app
TTL: 3600
```
*Points site.hookahplus.net to the site build*

### **3.3 API Subdomain (Optional)**
```
Type: CNAME
Name: api
Value: hookahplus-app-prod.vercel.app
TTL: 3600
```
*Points api.hookahplus.net to the main app for API calls*

### **3.4 Vercel Domain Configuration**

#### **In Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add the following domains:
   - `hookahplus.net` (primary)
   - `www.hookahplus.net`
   - `app.hookahplus.net`
   - `guest.hookahplus.net`
   - `site.hookahplus.net`
   - `api.hookahplus.net` (optional)

#### **Domain Verification:**
1. Vercel will provide DNS records to verify domain ownership
2. Add the verification TXT record to your DNS
3. Wait for verification (usually 5-10 minutes)

### **3.5 DNS Propagation Check**

#### **Check DNS Propagation:**
```bash
# Check A record
dig hookahplus.net A

# Check CNAME records
dig app.hookahplus.net CNAME
dig guest.hookahplus.net CNAME
dig site.hookahplus.net CNAME

# Check from different locations
nslookup hookahplus.net 8.8.8.8
nslookup hookahplus.net 1.1.1.1
```

#### **Online DNS Checkers:**
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://whatsmydns.net/)
- [DNS Propagation Checker](https://dnspropagation.net/)

### **3.6 SSL Certificate Configuration**

SSL certificates are automatically handled by Vercel:
1. **Automatic Provisioning**: Vercel automatically requests Let's Encrypt certificates
2. **Auto-Renewal**: Certificates are automatically renewed
3. **HTTPS Redirect**: HTTP traffic is automatically redirected to HTTPS
4. **HSTS Headers**: Security headers are automatically added

### **3.7 Testing Domain Configuration**

#### **Test Script:**
```bash
#!/bin/bash
echo "Testing DNS Configuration..."

# Test primary domain
echo "Testing hookahplus.net..."
curl -I https://hookahplus.net

# Test subdomains
echo "Testing app.hookahplus.net..."
curl -I https://app.hookahplus.net

echo "Testing guest.hookahplus.net..."
curl -I https://guest.hookahplus.net

echo "Testing site.hookahplus.net..."
curl -I https://site.hookahplus.net

echo "DNS configuration test complete!"
```

### **3.8 Common DNS Issues & Solutions**

#### **Issue: Domain not resolving**
- **Cause**: DNS propagation delay
- **Solution**: Wait 24-48 hours for full propagation

#### **Issue: SSL certificate not working**
- **Cause**: DNS not properly configured
- **Solution**: Verify DNS records and wait for certificate provisioning

#### **Issue: Subdomain not working**
- **Cause**: CNAME record not created
- **Solution**: Add CNAME record in DNS management

#### **Issue: WWW redirect not working**
- **Cause**: CNAME record missing
- **Solution**: Add CNAME record for www subdomain

### **3.9 DNS Provider Specific Instructions**

#### **Cloudflare:**
1. Add domain to Cloudflare
2. Update nameservers at domain registrar
3. Add DNS records in Cloudflare dashboard
4. Enable "Proxied" (orange cloud) for better performance

#### **GoDaddy:**
1. Go to DNS Management
2. Add A record for root domain
3. Add CNAME records for subdomains
4. Save changes

#### **Namecheap:**
1. Go to Advanced DNS
2. Add A record for root domain
3. Add CNAME records for subdomains
4. Save changes

### **3.10 Monitoring DNS Health**

#### **Set up monitoring:**
1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **DNS Monitoring**: Monitor DNS resolution from multiple locations
3. **SSL Monitoring**: Monitor SSL certificate expiration
4. **Performance Monitoring**: Monitor response times

#### **Alert Configuration:**
- DNS resolution failures
- SSL certificate expiration warnings
- Domain expiration warnings
- High response times

---

## **🚨 Important Notes**

1. **DNS Propagation**: Can take up to 48 hours globally
2. **SSL Certificates**: May take 5-10 minutes to provision
3. **Backup Plan**: Keep Vercel subdomain as backup
4. **Testing**: Test from multiple locations and devices
5. **Monitoring**: Set up alerts for DNS/SSL issues

---

## **📋 DNS Configuration Checklist**

- [ ] A record for hookahplus.net → 76.76.19.61
- [ ] CNAME record for www.hookahplus.net → cname.vercel-dns.com
- [ ] CNAME record for app.hookahplus.net → hookahplus-app-prod.vercel.app
- [ ] CNAME record for guest.hookahplus.net → hookahplus-guest-prod.vercel.app
- [ ] CNAME record for site.hookahplus.net → hookahplus-site-prod.vercel.app
- [ ] Add domains in Vercel dashboard
- [ ] Verify domain ownership
- [ ] Test DNS propagation
- [ ] Test SSL certificates
- [ ] Set up monitoring
