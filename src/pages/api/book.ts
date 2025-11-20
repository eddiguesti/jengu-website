import type { APIRoute } from 'astro';

export const prerender = false; // Ensure this route is server-rendered

/**
 * Booking API - Creates Outlook calendar events and sends confirmation emails
 * Requires environment variables: TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER
 */

/**
 * Get access token from Azure AD using client credentials flow
 */
async function getAccessToken(): Promise<string> {
  const TENANT_ID = import.meta.env.TENANT_ID;
  const CLIENT_ID = import.meta.env.CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.CLIENT_SECRET;

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Send confirmation email to the attendee
 */
async function sendConfirmationEmail(token: string, payload: any, eventDetails: any) {
  const GRAPH_USER = import.meta.env.GRAPH_USER;
  const { name, email, date, time, contactMethod } = payload;

  // Format date nicely
  const dateObj = new Date(`${date}T${time}:00`);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px 20px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #6366f1; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .highlight { color: #6366f1; font-weight: 600; }
    ul { padding-left: 20px; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Meeting Confirmed! 🎉</h1>
    </div>

    <div class="content">
      <p>Hi ${name},</p>

      <p>Thank you for booking a consultation with Jengu! We're excited to meet you and discuss how AI automation can transform your business.</p>

      <div class="card">
        <h2>📅 Meeting Details</h2>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Duration:</strong> 30 minutes</p>
        <p><strong>Platform:</strong> ${contactMethod}</p>
      </div>

      <div class="card">
        <h2>✅ How to Prepare</h2>
        <p>To make the most of our meeting, please:</p>
        <ul>
          <li><strong>Review your current workflows</strong> - Think about repetitive tasks that could be automated</li>
          <li><strong>Identify pain points</strong> - What processes are slowing down your team?</li>
          <li><strong>Set clear goals</strong> - What would success look like for your business?</li>
          <li><strong>Prepare questions</strong> - We're here to help! Come with any questions about AI automation</li>
        </ul>
      </div>

      <div class="card">
        <h2>🔗 Helpful Resources</h2>
        <p>Check out these resources before our meeting:</p>
        <ul>
          <li><a href="https://jengu.ai/case-studies" class="highlight">View our case studies</a> to see real results</li>
          <li><a href="https://jengu.ai/services" class="highlight">Explore our services</a> to understand what we offer</li>
          <li><a href="https://jengu.ai/blog" class="highlight">Read our blog</a> for AI automation insights</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://jengu.ai" class="button">Visit Our Website</a>
      </div>

      <p><strong>Looking forward to meeting you!</strong></p>

      <p>If you need to reschedule or have any questions before our meeting, please don't hesitate to reach out.</p>

      <p>Best regards,<br>
      <strong>The Jengu Team</strong><br>
      <a href="mailto:hello@jengu.ai">hello@jengu.ai</a><br>
      <a href="https://jengu.ai">jengu.ai</a></p>
    </div>

    <div class="footer">
      <p>This email was sent because you booked a consultation at jengu.ai</p>
      <p>&copy; 2025 Jengu. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailMessage = {
    message: {
      subject: `Meeting Confirmed: ${formattedDate} at ${formattedTime}`,
      body: {
        contentType: 'HTML',
        content: emailBody
      },
      from: {
        emailAddress: {
          address: 'hello@jengu.ai',
          name: 'Jengu'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: email,
            name: name
          }
        }
      ]
    },
    saveToSentItems: true
  };

  const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(GRAPH_USER)}/sendMail`;

  const res = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailMessage)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email send failed: ${res.status} ${text}`);
  }
}

/**
 * Convert widget payload into Graph event body
 */
function buildEvent(payload: any) {
  const { date, time, timezone, name, email, company, phone, contactMethod, extraInfo } = payload;

  // date: "YYYY-MM-DD", time: "HH:MM"
  // Create a 30-min slot
  const startIso = `${date}T${time}:00`;
  const [hours, minutes] = time.split(':').map(Number);
  const endMinutes = (hours * 60 + minutes + 30) % 1440; // Add 30 minutes
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endIso = `${date}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

  // Map "local" to UTC; otherwise just pass the string through.
  const graphTimeZone = timezone === 'local' ? 'UTC' : timezone;

  const subject = `Meeting with ${name}`;
  const bodyText =
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    (company ? `Company: ${company}\n` : '') +
    (phone ? `Phone: ${phone}\n` : '') +
    `Preferred platform: ${contactMethod}\n\n` +
    (extraInfo ? `Notes:\n${extraInfo}\n` : '');

  return {
    subject,
    body: {
      contentType: 'Text',
      content: bodyText
    },
    start: {
      dateTime: startIso,
      timeZone: graphTimeZone
    },
    end: {
      dateTime: endIso,
      timeZone: graphTimeZone
    },
    attendees: [
      {
        emailAddress: {
          address: email,
          name: name
        },
        type: 'required'
      }
    ],
    location: {
      displayName: contactMethod === 'Phone call' ? 'Phone call' : contactMethod
    }
  };
}

/**
 * API endpoint the widget calls
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Validate environment variables
    const TENANT_ID = import.meta.env.TENANT_ID;
    const CLIENT_ID = import.meta.env.CLIENT_ID;
    const CLIENT_SECRET = import.meta.env.CLIENT_SECRET;
    const GRAPH_USER = import.meta.env.GRAPH_USER;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
      console.error('Missing environment variables - API not configured for production use');
      return new Response(
        JSON.stringify({
          error: 'Booking system not configured',
          message: 'The booking system is currently being configured. Please contact us directly at hello@jengu.ai to schedule a meeting.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body with better error handling
    let payload;
    const contentType = request.headers.get('content-type');
    console.log('Request content-type:', contentType);

    try {
      payload = await request.json();
      console.log('Request body:', JSON.stringify(payload));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!payload || !payload.date || !payload.time || !payload.name || !payload.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: date, time, name, and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(payload.date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Expected YYYY-MM-DD' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(payload.time)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time format. Expected HH:MM' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date is not in the past
    const selectedDate = new Date(`${payload.date}T${payload.time}:00`);
    if (selectedDate < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cannot book meetings in the past' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize string inputs to prevent injection attacks
    const sanitize = (str: string) => str.replace(/[<>]/g, '').trim().substring(0, 500);
    payload.name = sanitize(payload.name);
    payload.email = sanitize(payload.email);
    if (payload.company) payload.company = sanitize(payload.company);
    if (payload.phone) payload.phone = sanitize(payload.phone);
    if (payload.contactMethod) payload.contactMethod = sanitize(payload.contactMethod);
    if (payload.extraInfo) payload.extraInfo = sanitize(payload.extraInfo);

    const token = await getAccessToken();
    const eventBody = buildEvent(payload);

    const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      GRAPH_USER
    )}/calendar/events`;

    const graphRes = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    if (!graphRes.ok) {
      const text = await graphRes.text();
      console.error('Graph error:', text);
      return new Response(
        JSON.stringify({ error: 'Microsoft Graph error', details: text }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const createdEvent = await graphRes.json();

    // Send confirmation email to the attendee
    try {
      await sendConfirmationEmail(token, payload, createdEvent);
      console.log('Confirmation email sent successfully');
    } catch (emailError: any) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the whole request if email fails - event is already created
    }

    return new Response(
      JSON.stringify({ ok: true, eventId: createdEvent.id, outlookEvent: createdEvent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
