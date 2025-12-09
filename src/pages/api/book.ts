import type { APIRoute } from 'astro';

export const prerender = false; // Ensure this route is server-rendered

/**
 * Booking API - Creates Outlook calendar events and sends confirmation emails
 * Requires environment variables: TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER
 * Updated: 2025-11-20 14:00
 */

/**
 * Get access token from Azure AD using client credentials flow
 */
async function getAccessToken(env: any): Promise<string> {
  const TENANT_ID = env.TENANT_ID;
  const CLIENT_ID = env.CLIENT_ID;
  const CLIENT_SECRET = env.CLIENT_SECRET;

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
async function sendConfirmationEmail(token: string, payload: any, eventDetails: any, env: any) {
  const GRAPH_USER = env.GRAPH_USER;
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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Consultation is Confirmed - Jengu AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; -webkit-font-smoothing: antialiased;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">

        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 640px;">

          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #f59e0b 0%, #eab308 50%, #f59e0b 100%);"></td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; background-color: #ffffff;">
              <img src="https://www.jengu.ai/images/email-logo.webp" alt="Jengu" width="100" style="display: block; margin: 0 auto; height: auto;">
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 0 48px;">

              <!-- Success Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #ecfdf5; border-radius: 100px; padding: 10px 24px;">
                          <span style="color: #059669; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">&#10004; Booking Confirmed</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 700; color: #111827; text-align: center; line-height: 1.2;">You're all set, ${name}!</h1>
              <p style="margin: 0 0 40px; font-size: 16px; color: #6b7280; text-align: center; line-height: 1.6;">Your AI consultation has been scheduled. We're looking forward to exploring how automation can transform your business.</p>

              <!-- Meeting Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fafafa; border-radius: 16px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 32px;">

                    <!-- Date & Time - Large Display -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Meeting</p>
                          <p style="margin: 0 0 4px; font-size: 24px; color: #111827; font-weight: 700;">${formattedDate}</p>
                          <p style="margin: 0; font-size: 20px; color: #f59e0b; font-weight: 600;">${formattedTime}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Details Grid -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50%" style="padding: 12px 0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                          <p style="margin: 0; font-size: 15px; color: #374151; font-weight: 600;">30 minutes</p>
                        </td>
                        <td width="50%" style="padding: 12px 0;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Platform</p>
                          <p style="margin: 0; font-size: 15px; color: #374151; font-weight: 600;">${contactMethod}</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Calendar Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 40px;">
                <tr>
                  <td style="background-color: #fffbeb; border-radius: 12px; padding: 20px 24px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 4px; font-size: 15px; color: #92400e; font-weight: 600;">&#128197; Calendar invite sent</p>
                    <p style="margin: 0; font-size: 14px; color: #a16207; line-height: 1.5;">Check your inbox for a calendar invitation with the meeting link.</p>
                  </td>
                </tr>
              </table>

              <!-- What We'll Cover -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 40px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #111827;">What We'll Cover</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 36px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">1</span>
                              </td>
                              <td>
                                <p style="margin: 0 0 2px; font-size: 15px; color: #111827; font-weight: 600;">Understand your challenges</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">We'll dive into your current workflows and pain points</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 36px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">2</span>
                              </td>
                              <td>
                                <p style="margin: 0 0 2px; font-size: 15px; color: #111827; font-weight: 600;">Identify automation opportunities</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Discover which processes can benefit most from AI</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="width: 36px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">3</span>
                              </td>
                              <td>
                                <p style="margin: 0 0 2px; font-size: 15px; color: #111827; font-weight: 600;">Map out next steps</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Get a clear roadmap with expected ROI and timeline</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Prepare Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 16px; margin-bottom: 48px;">
                <tr>
                  <td style="padding: 28px 32px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #111827;">Prepare for your call</h3>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 70%;">
                                <a href="https://www.jengu.ai/case-studies" style="color: #111827; font-size: 14px; font-weight: 600; text-decoration: none;">View Case Studies</a>
                                <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">See real results from businesses like yours</p>
                              </td>
                              <td style="width: 30%; text-align: right;">
                                <a href="https://www.jengu.ai/case-studies" style="color: #f59e0b; font-size: 20px; text-decoration: none; font-weight: 300;">&#8594;</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 70%;">
                                <a href="https://www.jengu.ai/calculator" style="color: #111827; font-size: 14px; font-weight: 600; text-decoration: none;">Try the ROI Calculator</a>
                                <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">Estimate your potential savings</p>
                              </td>
                              <td style="width: 30%; text-align: right;">
                                <a href="https://www.jengu.ai/calculator" style="color: #f59e0b; font-size: 20px; text-decoration: none; font-weight: 300;">&#8594;</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 70%;">
                                <a href="https://www.jengu.ai/blog" style="color: #111827; font-size: 14px; font-weight: 600; text-decoration: none;">Read Our Blog</a>
                                <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">Latest insights on AI automation</p>
                              </td>
                              <td style="width: 30%; text-align: right;">
                                <a href="https://www.jengu.ai/blog" style="color: #f59e0b; font-size: 20px; text-decoration: none; font-weight: 300;">&#8594;</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 48px; background-color: #111827; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 15px; color: #ffffff; font-weight: 600;">Questions before we meet?</p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #9ca3af;">Just reply to this email or reach out directly</p>
              <a href="mailto:hello@jengu.ai" style="display: inline-block; background-color: #f59e0b; color: #111827; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">hello@jengu.ai</a>
            </td>
          </tr>

          <!-- Legal -->
          <tr>
            <td style="padding: 24px 48px; background-color: #111827; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                <a href="https://www.jengu.ai/privacy" style="color: #9ca3af; text-decoration: none;">Privacy</a>
                <span style="color: #374151;">&nbsp;&nbsp;&#183;&nbsp;&nbsp;</span>
                <a href="https://www.jengu.ai/terms" style="color: #9ca3af; text-decoration: none;">Terms</a>
                <span style="color: #374151;">&nbsp;&nbsp;&#183;&nbsp;&nbsp;</span>
                <a href="https://www.jengu.ai" style="color: #9ca3af; text-decoration: none;">jengu.ai</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">&copy; 2025 Jengu AI</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

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
    // Get environment variables following Cloudflare adapter docs
    const runtime = locals.runtime;
    const { env } = runtime || {};

    // Access environment variables from Cloudflare runtime or fallback to import.meta.env for local dev
    const TENANT_ID = env?.TENANT_ID || import.meta.env.TENANT_ID;
    const CLIENT_ID = env?.CLIENT_ID || import.meta.env.CLIENT_ID;
    const CLIENT_SECRET = env?.CLIENT_SECRET || import.meta.env.CLIENT_SECRET;
    const GRAPH_USER = env?.GRAPH_USER || import.meta.env.GRAPH_USER;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
      console.error('Missing environment variables - API not configured for production use');
      console.error('runtime exists:', !!runtime);
      console.error('env exists:', !!env);
      console.error('Cloudflare env keys:', Object.keys(env || {}));
      console.error('import.meta.env keys:', Object.keys(import.meta.env || {}));
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
      const missingFields = [];
      if (!payload?.name) missingFields.push('name');
      if (!payload?.email) missingFields.push('email');
      if (!payload?.date) missingFields.push('date');
      if (!payload?.time) missingFields.push('time');

      return new Response(
        JSON.stringify({
          error: 'Missing Information',
          message: `Please fill in the following required fields: ${missingFields.join(', ')}. All fields are necessary to complete your booking.`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Email Address',
          message: `The email address "${payload.email}" is not valid. Please enter a valid email address (e.g., name@example.com) and try again.`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(payload.date)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Date Format',
          message: 'There was a problem with the date you selected. Please refresh the page and try selecting a date from the calendar again.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(payload.time)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Time Format',
          message: 'There was a problem with the time you selected. Please refresh the page and try selecting a time slot again.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate date is not in the past
    const selectedDate = new Date(`${payload.date}T${payload.time}:00`);
    if (selectedDate < new Date()) {
      return new Response(
        JSON.stringify({
          error: 'Date in the Past',
          message: 'The selected date and time has already passed. Please choose a future date and time for your meeting.'
        }),
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

    // Create env object with all variables for helper functions
    const envVars = { TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER };

    const token = await getAccessToken(envVars);
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
      console.error('Graph API error:', graphRes.status, text);

      // Parse the error to provide better user feedback
      let userMessage = 'We encountered an issue while creating your calendar event. Please try again in a few moments.';

      try {
        const errorData = JSON.parse(text);
        if (errorData.error?.message) {
          const apiError = errorData.error.message.toLowerCase();
          if (apiError.includes('mailbox')) {
            userMessage = 'There was a problem accessing the calendar. Please try again or contact support at hello@jengu.ai';
          } else if (apiError.includes('attendee') || apiError.includes('email')) {
            userMessage = 'There was an issue with the email address. Please check that you entered a valid email address and try again.';
          } else if (apiError.includes('invalid')) {
            userMessage = 'Some of the information provided was invalid. Please check your details and try again.';
          }
        }
      } catch (e) {
        // Keep default message if we can't parse the error
      }

      return new Response(
        JSON.stringify({
          error: 'Booking Failed',
          message: userMessage,
          details: graphRes.status === 401 ? 'Authentication error' : 'Calendar service error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const createdEvent = await graphRes.json();

    // Send confirmation email to the attendee
    let emailSent = false;
    let emailError = null;
    try {
      await sendConfirmationEmail(token, payload, createdEvent, envVars);
      console.log('Confirmation email sent successfully to:', payload.email);
      emailSent = true;
    } catch (err: any) {
      console.error('Failed to send confirmation email:', err.message);
      emailError = err.message;
      // Don't fail the whole request if email fails - event is already created
    }

    return new Response(
      JSON.stringify({
        ok: true,
        eventId: createdEvent.id,
        outlookEvent: createdEvent,
        emailSent,
        emailError
      }),
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
