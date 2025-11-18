# Booking System Setup

## Microsoft Calendar Integration

The booking modal integrates with Microsoft Outlook Calendar via Microsoft Graph API.

### Prerequisites

1. Azure account with access to Azure Portal
2. Outlook/Office 365 account for calendar bookings

### Setup Steps

1. **Register App in Azure Portal**
   - Go to https://portal.azure.com
   - Navigate to "App registrations" -> "New registration"
   - Name: "Jengu Calendar"
   - Supported account types: "Single tenant"
   - Register the application

2. **Configure API Permissions**
   - In your app, go to "API permissions"
   - Add permission -> Microsoft Graph -> Application permissions
   - Add: `Calendars.ReadWrite`
   - Grant admin consent for your organization

3. **Create Client Secret**
   - Go to "Certificates & secrets"
   - "New client secret"
   - Save the secret value (you'll need it for .env)

4. **Get Required IDs**
   - Application (client) ID - from Overview page
   - Directory (tenant) ID - from Overview page
   - Client Secret - from step 3

5. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials:
     - MICROSOFT_CLIENT_ID
     - MICROSOFT_TENANT_ID
     - MICROSOFT_CLIENT_SECRET
     - MICROSOFT_CALENDAR_ID (your Outlook email)

6. **Restart Dev Server**
   - The server will auto-reload when .env changes

### API Endpoints

- `POST /api/check-availability` - Check available time slots for a date
- `POST /api/book-meeting` - Create a calendar event

### Features

- Real-time availability checking
- Automatic calendar event creation
- Email invitations to attendees
- Microsoft Teams meeting links (when Teams is selected)
- 30-minute discovery call bookings
- Business hours: 9 AM - 8 PM

### Security

- Environment variables are git-ignored
- Client credentials flow (server-side only)
- No user authentication required for booking

### Troubleshooting

If bookings fail:
1. Check .env variables are correct
2. Verify API permissions in Azure Portal
3. Ensure admin consent is granted
4. Check MICROSOFT_CALENDAR_ID matches your Outlook email
5. Review browser console for error messages
