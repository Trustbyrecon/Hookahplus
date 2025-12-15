# Email Forwarding Configuration Quick Reference

## Quick Setup Guide

Use this document as a quick reference when configuring email forwarding rules in your email management interface.

---

## Email Aliases to Configure

Configure forwarding rules for the following email addresses to forward to **both** `clark.dwayne@gmail.com` and `hookahplusconnector@gmail.com`:

### Priority 1: Customer-Facing Contact Addresses

| Email Address | Forward To | Status |
|--------------|------------|--------|
| `founder@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ✅ Already configured (add second destination) |
| `support@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ❌ **Needs configuration** |
| `legal@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ❌ **Needs configuration** |
| `privacy@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ❌ **Needs configuration** |
| `pos-integration@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ❌ **Needs configuration** |

### Priority 2: System Addresses (Optional)

| Email Address | Forward To | Status | Notes |
|--------------|------------|--------|-------|
| `noreply@hookahplus.net` | `clark.dwayne@gmail.com`<br>`hookahplusconnector@gmail.com` | ⚠️ Optional | Sender address - only forward if you want bounce/reply notifications |

---

## Configuration Steps

### For Each Email Alias:

1. **Log into your email management interface** (where you configured `founder@hookahplus.net`)

2. **Click "ADD RULE"** (or equivalent button)

3. **Configure the forwarding rule:**
   - **FROM:** `[email-address]@hookahplus.net`
   - **TO:** 
     - Primary: `clark.dwayne@gmail.com`
     - Secondary: `hookahplusconnector@gmail.com`
   - **Note:** If your system supports dual forwarding, enable it. Otherwise, create two separate rules.

4. **Save the rule**

5. **Test the configuration:**
   - Send a test email to the alias
   - Verify both destination addresses receive the email

---

## Email Addresses by Use Case

### Investor Relations
- `founder@hookahplus.net` ✅ (configured, add second destination)

### Customer Support
- `support@hookahplus.net` ❌ (needs configuration)

### Legal & Compliance
- `legal@hookahplus.net` ❌ (needs configuration)
- `privacy@hookahplus.net` ❌ (needs configuration)

### Business Development
- `pos-integration@hookahplus.net` ❌ (needs configuration)

### System/Transactional
- `noreply@hookahplus.net` ⚠️ (optional - sender address)

---

## Checklist

Use this checklist when configuring forwarding rules:

- [ ] `founder@hookahplus.net` → Add `hookahplusconnector@gmail.com` as second destination
- [ ] `support@hookahplus.net` → Configure forwarding to both addresses
- [ ] `legal@hookahplus.net` → Configure forwarding to both addresses
- [ ] `privacy@hookahplus.net` → Configure forwarding to both addresses
- [ ] `pos-integration@hookahplus.net` → Configure forwarding to both addresses
- [ ] `noreply@hookahplus.net` → Optional: Configure if bounce/reply notifications needed
- [ ] Test each alias by sending a test email
- [ ] Verify both destination addresses receive forwarded emails

---

## Testing

After configuring each forwarding rule:

1. Send a test email from an external address to the alias
2. Check `clark.dwayne@gmail.com` inbox
3. Check `hookahplusconnector@gmail.com` inbox
4. Verify the email appears in both inboxes
5. Mark as complete in the checklist above

---

## Notes

- **Dual Forwarding:** If your email system supports forwarding to multiple addresses in a single rule, use that. Otherwise, create separate rules for each destination.

- **noreply@hookahplus.net:** This is primarily a sender address for automated emails. You may not need to forward this unless you want to receive bounce notifications or replies.

- **Test Emails:** The following addresses are used for testing/demo and should NOT be configured:
  - `admin@hookahplus.com`
  - `support@hookahplus.com` (note: `.com` not `.net`)
  - Any `@hookahplus.com` addresses (these are demo data)

---

## Support

If you encounter issues configuring forwarding rules:

1. Check your email provider's documentation for forwarding setup
2. Verify DNS records are properly configured for `hookahplus.net`
3. Ensure the destination email addresses (`clark.dwayne@gmail.com` and `hookahplusconnector@gmail.com`) are valid and accessible

---

**Last Updated:** December 2024  
**Status:** Ready for configuration

