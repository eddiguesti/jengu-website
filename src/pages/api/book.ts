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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Confirmed - Jengu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f3f4f6;
      padding: 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(255, 185, 90, 0.15), transparent 60%);
      pointer-events: none;
    }
    .header h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      position: relative;
      z-index: 1;
    }
    .header .emoji {
      font-size: 48px;
      display: block;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
      background: white;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .intro {
      color: #4b5563;
      margin-bottom: 30px;
      font-size: 16px;
    }
    .card {
      background: #f9fafb;
      padding: 24px;
      margin: 24px 0;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .card h2 {
      color: #111827;
      font-size: 20px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .card h2 .icon {
      font-size: 24px;
    }
    .meeting-detail {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .meeting-detail:last-child {
      border-bottom: none;
    }
    .meeting-detail strong {
      min-width: 100px;
      color: #6b7280;
      font-weight: 500;
      font-size: 14px;
    }
    .meeting-detail span {
      color: #111827;
      font-weight: 600;
      font-size: 15px;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(255, 185, 90, 0.1), rgba(255, 200, 117, 0.05));
      border-left: 4px solid #FFB95A;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .highlight-box p {
      color: #1f2937;
      font-size: 15px;
      margin: 0;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 16px 0 0 0;
    }
    li {
      padding: 12px 0;
      padding-left: 32px;
      position: relative;
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
    }
    li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    li strong {
      color: #111827;
      display: block;
      margin-bottom: 4px;
    }
    .resources-list {
      margin-top: 16px;
    }
    .resources-list li::before {
      content: '→';
      color: #FFB95A;
    }
    .resources-list a {
      color: #FFB95A;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .resources-list a:hover {
      color: #FFC875;
      text-decoration: underline;
    }
    .cta-button {
      display: inline-block;
      background: #FFB95A;
      color: #050816;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
      margin: 30px 0;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(255, 185, 90, 0.3);
    }
    .cta-button:hover {
      background: #FFC875;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 185, 90, 0.4);
    }
    .cta-center {
      text-align: center;
    }
    .signature {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
      color: #4b5563;
      font-size: 15px;
    }
    .signature strong {
      color: #111827;
      font-size: 16px;
    }
    .signature a {
      color: #FFB95A;
      text-decoration: none;
      font-weight: 600;
    }
    .signature a:hover {
      text-decoration: underline;
    }
    .footer {
      background: #f9fafb;
      text-align: center;
      padding: 30px;
      color: #6b7280;
      font-size: 13px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
    .footer-links a:hover {
      color: #FFB95A;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
      .card { padding: 20px; }
      .cta-button { width: 100%; text-align: center; }
      .meeting-detail { flex-direction: column; gap: 4px; }
      .meeting-detail strong { min-width: auto; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <span class="emoji">🎉</span>
      <h1>Meeting Confirmed!</h1>
    </div>

    <div class="content">
      <p class="greeting">Hi ${name},</p>

      <p class="intro">Thank you for booking a consultation with Jengu! We're excited to connect with you and explore how AI automation can transform your business operations.</p>

      <div class="card">
        <h2><span class="icon">📅</span> Your Meeting Details</h2>
        <div class="meeting-detail">
          <strong>Date:</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="meeting-detail">
          <strong>Time:</strong>
          <span>${formattedTime}</span>
        </div>
        <div class="meeting-detail">
          <strong>Duration:</strong>
          <span>30 minutes</span>
        </div>
        <div class="meeting-detail">
          <strong>Platform:</strong>
          <span>${contactMethod}</span>
        </div>
      </div>

      <div class="highlight-box">
        <p><strong>📧 Calendar Invite Sent</strong></p>
        <p>You'll receive a separate calendar invitation with all meeting details. Please check your inbox and add it to your calendar.</p>
      </div>

      <div class="card">
        <h2><span class="icon">✅</span> How to Prepare</h2>
        <p style="color: #4b5563; margin-bottom: 8px;">To make the most of our time together:</p>
        <ul>
          <li>
            <strong>Review your workflows</strong>
            Think about repetitive tasks that take up your team's time
          </li>
          <li>
            <strong>Identify pain points</strong>
            What processes are bottlenecks in your operations?
          </li>
          <li>
            <strong>Define your goals</strong>
            What would success look like for your business?
          </li>
          <li>
            <strong>Prepare questions</strong>
            Come with any questions about AI automation - we're here to help!
          </li>
        </ul>
      </div>

      <div class="card">
        <h2><span class="icon">📚</span> Helpful Resources</h2>
        <p style="color: #4b5563; margin-bottom: 8px;">Get a head start by exploring:</p>
        <ul class="resources-list">
          <li><a href="https://jengu.ai/case-studies">Case Studies</a> - See real results from our clients</li>
          <li><a href="https://jengu.ai/services">Our Services</a> - Discover what we can do for you</li>
          <li><a href="https://jengu.ai/blog">Blog & Insights</a> - Learn about AI automation trends</li>
        </ul>
      </div>

      <div class="cta-center">
        <a href="https://jengu.ai" class="cta-button">Visit Our Website</a>
      </div>

      <div class="signature">
        <p><strong>Looking forward to our conversation!</strong></p>
        <p style="margin-top: 16px;">If you need to reschedule or have any questions, just reply to this email or reach out anytime.</p>
        <p style="margin-top: 24px;">
          Best regards,<br>
          <strong>The Jengu Team</strong>
        </p>
        <p style="margin-top: 12px;">
          <a href="mailto:hello@jengu.ai">hello@jengu.ai</a><br>
          <a href="https://jengu.ai">jengu.ai</a>
        </p>
      </div>
    </div>

    <div class="footer">
      <p>You're receiving this email because you booked a consultation at <a href="https://jengu.ai" style="color: #FFB95A; text-decoration: none;">jengu.ai</a></p>
      <div class="footer-links">
        <a href="https://jengu.ai/privacy">Privacy Policy</a>
        <a href="https://jengu.ai/terms">Terms of Service</a>
      </div>
      <p style="margin-top: 16px;">&copy; 2025 Jengu. All rights reserved.</p>
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
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get environment variables - supports both local dev and Cloudflare Pages
    const runtime = locals.runtime as any;
    const env = runtime?.env || import.meta.env;

    const TENANT_ID = env.TENANT_ID;
    const CLIENT_ID = env.CLIENT_ID;
    const CLIENT_SECRET = env.CLIENT_SECRET;
    const GRAPH_USER = env.GRAPH_USER;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
      console.error('Missing environment variables - API not configured for production use');
      console.error('Available env keys:', Object.keys(env || {}));
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
