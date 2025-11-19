# Booking Modal Setup Guide

This guide will help you configure the Microsoft Graph API integration for the booking modal on your Jengu website.

## Overview

The booking modal allows visitors to schedule consultations directly from your website. When a user books a time slot, the system creates a calendar event in your Outlook calendar using the Microsoft Graph API.

## Prerequisites

- An Azure account with access to Azure Active Directory
- An Outlook/Microsoft 365 mailbox where calendar events will be created
- Admin access to create Azure AD app registrations

## Setup Steps

### 1. Create Azure AD App Registration

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure the registration:
   - **Name**: `Jengu Website Booking`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank (not needed for client credentials flow)
5. Click **Register**

### 2. Note Your Application IDs

After registration, you'll see the overview page. Copy these values:

- **Application (client) ID**: This is your `CLIENT_ID`
- **Directory (tenant) ID**: This is your `TENANT_ID`

You already have:
- `TENANT_ID`: `b7854b26-786a-4436-9bc2-6e8d9069a1e2`
- `CLIENT_ID`: `ffb8098e-b6c6-481b-b4d9-9781d4dbf387`

### 3. Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `Jengu Website Production`
4. Choose an expiration period (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately - you won't be able to see it again!
7. This value is your `CLIENT_SECRET`

### 4. Grant API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions** (not Delegated)
5. Search for and select: `Calendars.ReadWrite`
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Organization]**
8. Confirm by clicking **Yes**

### 5. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in your values:
   ```env
   TENANT_ID=b7854b26-786a-4436-9bc2-6e8d9069a1e2
   CLIENT_ID=ffb8098e-b6c6-481b-b4d9-9781d4dbf387
   CLIENT_SECRET=<paste your client secret here>
   GRAPH_USER=<your outlook email>
   ```

   - `GRAPH_USER` should be the email address of the mailbox where events will be created (e.g., `booking@jengu.com`)

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your website in a browser
3. Click "Book a Consultation"
4. Fill out the booking form and select a date/time
5. Submit the form
6. Check your Outlook calendar - you should see the new event!

## How It Works

### Authentication Flow

The booking system uses OAuth 2.0 **client credentials flow**:

1. When a booking is submitted, the frontend sends form data to `/api/book`
2. The API endpoint requests an access token from Azure AD using your app credentials
3. Azure AD validates the credentials and returns an access token
4. The API uses this token to call Microsoft Graph API
5. Microsoft Graph creates the calendar event in the specified mailbox

### API Endpoint

The booking API is located at: `src/pages/api/book.ts`

**Request format:**
```json
{
  "date": "2025-01-15",
  "time": "14:00",
  "timezone": "America/New_York",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "contactMethod": "Zoom",
  "extraInfo": "Looking to discuss AI implementation"
}
```

**Response format (success):**
```json
{
  "ok": true,
  "eventId": "AAMkAG...",
  "outlookEvent": { /* full event object */ }
}
```

### Security Considerations

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Rotate client secrets regularly** (every 6-24 months)
- **Use different credentials** for development and production environments
- **Monitor API usage** in the Azure Portal to detect anomalies
- **Limit permissions** to only what's needed (`Calendars.ReadWrite`)

## Troubleshooting

### Error: "Token request failed"
- Check that `TENANT_ID`, `CLIENT_ID`, and `CLIENT_SECRET` are correct
- Verify the client secret hasn't expired
- Ensure there are no extra spaces or quotes in your `.env` file

### Error: "Microsoft Graph error"
- Verify that admin consent was granted for `Calendars.ReadWrite`
- Check that `GRAPH_USER` is a valid email address in your organization
- Ensure the mailbox exists and is accessible

### Error: "Missing required fields"
- Check the browser console for the exact fields that are missing
- Verify the frontend form is sending all required data

### Events not appearing in calendar
- Check that you're looking at the correct mailbox (specified in `GRAPH_USER`)
- Verify the timezone is being handled correctly
- Check the date/time formatting in the API request

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Set environment variables in your hosting platform:
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site Settings > Build & Deploy > Environment

2. Use a production client secret (separate from development)

3. Consider implementing:
   - Rate limiting to prevent abuse
   - Email notifications when bookings are created
   - Calendar conflict detection
   - Booking confirmation emails to users

## Need Help?

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/user-post-events)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [OAuth 2.0 Client Credentials Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
