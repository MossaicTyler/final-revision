# Email Deliverability Configuration

To ensure emails sent via Resend reach the inbox and not spam, follow these steps:

## 1. Domain Authentication (Required)

### Add DNS Records to Your Domain

Log into your domain registrar (e.g., Cloudflare, GoDaddy, Namecheap) and add the following DNS records:

#### SPF Record
\`\`\`
Type: TXT
Name: notifiers.reknur.com (or @)
Value: v=spf1 include:_spf.resend.com ~all
\`\`\`

#### DKIM Records
Get these from your Resend Dashboard under Domains → notifiers.reknur.com → DNS Records
\`\`\`
Type: CNAME
Name: resend._domainkey.notifiers.reknur.com
Value: [Provided by Resend]
\`\`\`

#### DMARC Record
\`\`\`
Type: TXT
Name: _dmarc.notifiers.reknur.com
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@reknur.com; ruf=mailto:dmarc-failures@reknur.com; pct=100
\`\`\`

Start with `p=none` to monitor, then move to `p=quarantine` or `p=reject` after confirming SPF and DKIM pass.

## 2. Verify Domain in Resend

1. Go to Resend Dashboard: https://resend.com/domains
2. Add domain: `notifiers.reknur.com`
3. Verify all DNS records are properly configured
4. Wait for verification (can take up to 48 hours)

## 3. Best Practices Implemented

✅ Using subdomain (notifiers.reknur.com) for email sending
✅ Proper from addresses: auth@notifiers.reknur.com, orders@notifiers.reknur.com
✅ Plain text versions included in all emails
✅ Unsubscribe links in all emails
✅ List-Unsubscribe headers
✅ Emails under 102KB
✅ No tracking pixels for transactional emails
✅ Professional email templates with proper structure

## 4. Additional Recommendations

- **Warm up your domain**: Start with low volume and gradually increase
- **Monitor bounces**: Check Resend dashboard for bounce rates
- **Maintain list hygiene**: Remove bounced/invalid emails
- **Test emails**: Send to Gmail, Outlook, Yahoo to check inbox placement
- **Monitor DMARC reports**: Review reports sent to dmarc-reports@reknur.com

## 5. Troubleshooting

If emails still go to spam:
1. Verify all DNS records are correct in Resend dashboard
2. Check DMARC reports for failures
3. Ensure sender reputation is good (check with mail-tester.com)
4. Contact Resend support for deliverability assistance
