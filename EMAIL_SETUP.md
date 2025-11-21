# Email Notification System Setup

Your website now has a complete email notification system! When users fill out forms on your site, you'll receive a notification email and they'll automatically get a beautiful thank-you email.

## ✅ What's Already Set Up

1. **Contact Form API** (`/api/contact`)
   - Validates all form submissions
   - Sends you a notification with customer details
   - Sends customers a beautiful thank-you email
   - Works with English, French, and Spanish contact pages

2. **Booking Modal** (`/api/book`)
   - Already integrated with Microsoft Graph API
   - Creates Outlook calendar events
   - Sends beautiful confirmation emails with meeting prep guide

3. **Beautiful Email Templates**
   - Match your website's dark gradient style (#000000, #6366f1, #818cf8)
   - Fully responsive (mobile-friendly)
   - Professional and modern design

## 🚀 Next Steps: Connect to Email Service

Currently, emails are just logged to the console. To actually send emails, you need to connect to an email service. Here are your options:

### Option 1: Resend (Recommended - Easiest)

**Why Resend:**
- Simple API
- Free tier: 3,000 emails/month
- Great for transactional emails
- Fast setup

**Setup:**
1. Sign up at https://resend.com
2. Verify your domain or use their test domain
3. Get your API key
4. Add to environment variables:
   ```
   RESEND_API_KEY=re_xxxxx
   ```

5. Update `/src/pages/api/contact.ts` - Replace the `sendAdminNotification` and `sendCustomerThankYou` functions with:

```typescript
import { Resend } from 'resend';

async function sendAdminNotification(data: any) {
  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Jengu Website <noreply@your-domain.com>',
      to: ['info@jengu.ai'], // Your email
      subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
      html: htmlContent // (existing template)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

async function sendCustomerThankYou(data: { firstName: string; email: string }) {
  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Jengu AI <hello@your-domain.com>',
      to: [data.email],
      subject: 'Thank you for contacting Jengu AI!',
      html: htmlContent // (existing template)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
```

6. Install Resend package:
   ```bash
   npm install resend
   ```

### Option 2: SendGrid

**Why SendGrid:**
- Free tier: 100 emails/day
- Enterprise-grade
- More features (analytics, A/B testing)

**Setup:**
1. Sign up at https://sendgrid.com
2. Create an API key
3. Verify sender email
4. Add to environment variables:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   ```

5. Install SendGrid:
   ```bash
   npm install @sendgrid/mail
   ```

6. Update the send functions similar to Resend example

### Option 3: Keep Using Microsoft Graph (Current Setup)

Your booking emails already use Microsoft Graph! You can use the same setup for contact form emails:

**Pros:**
- Already configured
- Free (included with Microsoft 365)
- All emails in your Outlook sent folder

**Cons:**
- More complex setup
- Requires Microsoft 365 account

To use Graph for contact emails, you can reuse the `sendConfirmationEmail` pattern from `/src/pages/api/book.ts`

## 📧 Email Addresses Used

Make sure these email addresses are set up:

- **info@jengu.ai** - Receives all contact form submissions
- **hello@jengu.ai** - Sends booking confirmations and calendar invites

## 🎨 Email Templates

Both email templates match your website design:

### Admin Notification Email
- Dark gradient background
- Customer info card (purple gradient)
- Business details card (indigo gradient)
- Message card (green gradient)
- Quick reply button
- Professional footer

### Customer Thank You Email
- Friendly robot emoji 🤖
- Welcoming header with gradient
- What happens next (3-step timeline)
- CTA to ROI calculator
- Helpful links (services, blog, etc.)
- Professional footer

## 🧪 Testing

To test the emails locally:

1. Fill out the contact form at http://localhost:4321/contact
2. Check your browser console - you'll see:
   ```
   📧 Admin email would be sent to: info@jengu.ai
   📧 Customer email would be sent to: customer@email.com
   ```
3. The HTML email templates are logged to console
4. Once you connect an email service, real emails will be sent!

## 🔒 Security Features

All form submissions include:
- Email validation
- Input sanitization (prevents XSS)
- Rate limiting (recommended to add)
- HTTPS only (in production)

## 📱 Forms That Send Emails

1. **/contact** - English contact form
2. **/fr/contact** - French contact form
3. **/es/contact** - Spanish contact form
4. **Booking Modal** - Calendar booking (already sends emails!)

## ⚙️ Environment Variables

Add these to your `.env` file and Cloudflare dashboard:

```bash
# Email Service (choose one)
RESEND_API_KEY=re_xxxxx
# OR
SENDGRID_API_KEY=SG.xxxxx

# Microsoft Graph (already configured for bookings)
TENANT_ID=xxxxx
CLIENT_ID=xxxxx
CLIENT_SECRET=xxxxx
GRAPH_USER=hello@jengu.ai
```

## 🎯 Next Steps

1. Choose an email service (Resend recommended)
2. Sign up and get API key
3. Add API key to environment variables
4. Update the send functions in `/src/pages/api/contact.ts`
5. Install the email package (`npm install resend` or `npm install @sendgrid/mail`)
6. Test on localhost
7. Deploy to production!

---

Need help? The email templates are fully customizable in:
- `/src/pages/api/contact.ts` (contact form emails)
- `/src/pages/api/book.ts` (booking confirmation emails)
