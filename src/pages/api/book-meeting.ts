import type { APIRoute } from 'astro';

interface BookingRequest {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  platform: 'zoom' | 'teams' | 'phone';
  message: string;
  date: string;
  time: number;
  timezone: string;
}

interface MicrosoftAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body with error handling
    let bookingData: BookingRequest;
    try {
      bookingData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if calendar is configured
    if (!import.meta.env.MICROSOFT_CLIENT_ID ||
        !import.meta.env.MICROSOFT_TENANT_ID ||
        !import.meta.env.MICROSOFT_CLIENT_SECRET ||
        import.meta.env.MICROSOFT_CALENDAR_ID === 'your_outlook_email@outlook.com') {
      console.log('Calendar not configured - booking simulated:', bookingData);
      return new Response(
        JSON.stringify({
          success: true,
          eventId: 'simulated-' + Date.now(),
          message: 'Calendar not configured - booking simulated (check console for details)',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get Microsoft Graph access token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${import.meta.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.MICROSOFT_CLIENT_ID,
          scope: 'https://graph.microsoft.com/.default',
          client_secret: import.meta.env.MICROSOFT_CLIENT_SECRET,
          grant_type: 'client_credentials',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token error:', error);
      throw new Error('Failed to authenticate with Microsoft Graph');
    }

    const authData: MicrosoftAuthResponse = await tokenResponse.json();

    // Create the event date/time
    const eventDate = new Date(bookingData.date);
    eventDate.setHours(bookingData.time, 0, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // 30-minute meeting

    // Platform-specific meeting details
    let meetingDetails = '';
    let location = '';

    switch (bookingData.platform) {
      case 'teams':
        location = 'Microsoft Teams';
        meetingDetails = 'Microsoft Teams meeting link will be sent via calendar invite';
        break;
      case 'zoom':
        location = 'Zoom';
        meetingDetails = 'Zoom meeting link will be sent separately';
        break;
      case 'phone':
        location = 'Phone Call';
        meetingDetails = `Phone: ${bookingData.phone}`;
        break;
    }

    // Create calendar event
    const calendarEvent = {
      subject: `Discovery Call with ${bookingData.fullName}`,
      body: {
        contentType: 'HTML',
        content: `
          <h2>Discovery Call Details</h2>
          <p><strong>Client:</strong> ${bookingData.fullName}</p>
          <p><strong>Company:</strong> ${bookingData.company}</p>
          <p><strong>Email:</strong> ${bookingData.email}</p>
          <p><strong>Phone:</strong> ${bookingData.phone}</p>
          <p><strong>Platform:</strong> ${location}</p>
          <p><strong>Timezone:</strong> ${bookingData.timezone}</p>

          <h3>Message from client:</h3>
          <p>${bookingData.message || 'No message provided'}</p>

          <hr>
          <p><em>${meetingDetails}</em></p>
        `,
      },
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: bookingData.timezone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: bookingData.timezone,
      },
      location: {
        displayName: location,
      },
      attendees: [
        {
          emailAddress: {
            address: bookingData.email,
            name: bookingData.fullName,
          },
          type: 'required',
        },
      ],
      isOnlineMeeting: bookingData.platform === 'teams',
      onlineMeetingProvider: bookingData.platform === 'teams' ? 'teamsForBusiness' : undefined,
    };

    // Create event in Outlook Calendar
    const calendarResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${import.meta.env.MICROSOFT_CALENDAR_ID}/calendar/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error('Calendar error:', error);
      throw new Error('Failed to create calendar event');
    }

    const eventData = await calendarResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        eventId: eventData.id,
        webLink: eventData.webLink,
        message: 'Booking confirmed successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
