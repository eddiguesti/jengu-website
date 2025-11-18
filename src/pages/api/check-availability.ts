import type { APIRoute } from 'astro';

interface AvailabilityRequest {
  date: string;
}

interface MicrosoftAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body',
          bookedHours: []
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { date }: AvailabilityRequest = requestData;

    // Check if calendar is configured
    if (!import.meta.env.MICROSOFT_CLIENT_ID ||
        !import.meta.env.MICROSOFT_TENANT_ID ||
        !import.meta.env.MICROSOFT_CLIENT_SECRET ||
        import.meta.env.MICROSOFT_CALENDAR_ID === 'your_outlook_email@outlook.com') {
      // Return all slots as available if calendar not configured
      return new Response(
        JSON.stringify({
          success: true,
          bookedHours: [],
          message: 'Calendar not configured - showing all slots as available'
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

    // Get events for the selected date
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(9, 0, 0, 0); // Business hours start at 9 AM

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(20, 0, 0, 0); // Business hours end at 8 PM

    const eventsResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${import.meta.env.MICROSOFT_CALENDAR_ID}/calendar/calendarView?startDateTime=${startOfDay.toISOString()}&endDateTime=${endOfDay.toISOString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!eventsResponse.ok) {
      const error = await eventsResponse.text();
      console.error('Calendar view error:', error);
      throw new Error('Failed to fetch calendar events');
    }

    const eventsData = await eventsResponse.json();

    // Extract booked hours (9 AM - 8 PM in hourly increments)
    const bookedHours = new Set<number>();

    eventsData.value.forEach((event: any) => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Mark all hours that overlap with this event as booked
      for (let hour = 9; hour < 20; hour++) {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(selectedDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Check if event overlaps with this time slot
        if (eventStart < slotEnd && eventEnd > slotStart) {
          bookedHours.add(hour);
        }
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        bookedHours: Array.from(bookedHours),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Availability check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check availability',
        bookedHours: [], // Return empty array on error to prevent blocking
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
