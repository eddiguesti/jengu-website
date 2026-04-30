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
 * Format a customer-supplied (date, time, timezone) triple into human-readable
 * strings that match exactly what the customer saw when booking. The raw
 * `time` is treated as a wall-clock string, never round-tripped through Date.
 */
function formatMeetingDateTime(date: string, time: string, timezone: string) {
  const [yyyy, mm, dd] = date.split('-').map(Number);
  const [h24, min] = time.split(':').map(Number);

  // Render the date label by anchoring on noon UTC of the chosen day, then
  // formatting in the customer's timezone — this avoids any midnight rollover
  // edge case while still printing the correct weekday.
  const dateAnchor = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0));
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone
  }).format(dateAnchor);

  // Time: format directly from the raw HH:MM the customer picked.
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const tzLabel =
    new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(dateAnchor)
      .find((p) => p.type === 'timeZoneName')?.value || timezone;
  const formattedTime = `${h12}:${String(min).padStart(2, '0')} ${ampm} ${tzLabel}`;

  return { formattedDate, formattedTime };
}

/**
 * Send notification email to admin when a new booking is made
 */
async function sendAdminNotification(token: string, payload: any, env: any) {
  const GRAPH_USER = env.GRAPH_USER;
  const { name, email, company, phone, date, time, timezone, contactMethod, extraInfo } = payload;

  // The customer's `date` and `time` are already wall-clock values in their
  // chosen `timezone`. Formatting them against any Date object would re-apply a
  // timezone offset and shift the displayed value. Format the raw strings
  // directly so the admin sees the exact same time the customer picked.
  const { formattedDate, formattedTime } = formatMeetingDateTime(date, time, timezone);

  const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Booking - ${name}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="height: 4px; background: linear-gradient(90deg, #f59e0b 0%, #eab308 50%, #f59e0b 100%);"></td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; color: #111827;">🗓️ New Booking Received</h1>
        <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280;">Someone just booked a consultation call</p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
              <p style="margin: 0 0 16px; font-size: 18px; color: #111827; font-weight: 600;">${formattedDate} at ${formattedTime}</p>

              <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Platform</p>
              <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">${contactMethod}</p>
            </td>
          </tr>
        </table>

        <h2 style="margin: 0 0 16px; font-size: 16px; color: #111827; font-weight: 600;">Contact Details</h2>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Name:</span>
              <span style="color: #111827; font-size: 14px; font-weight: 500; float: right;">${name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Email:</span>
              <span style="color: #111827; font-size: 14px; font-weight: 500; float: right;"><a href="mailto:${email}" style="color: #f59e0b; text-decoration: none;">${email}</a></span>
            </td>
          </tr>
          ${company ? `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Company:</span>
              <span style="color: #111827; font-size: 14px; font-weight: 500; float: right;">${company}</span>
            </td>
          </tr>` : ''}
          ${phone ? `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Phone:</span>
              <span style="color: #111827; font-size: 14px; font-weight: 500; float: right;">${phone}</span>
            </td>
          </tr>` : ''}
        </table>

        ${extraInfo ? `
        <div style="margin-top: 24px; padding: 16px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Additional Notes</p>
          <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.5;">${extraInfo}</p>
        </div>
        ` : ''}

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">This booking has been added to your Outlook calendar.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Notify both Edd (mailbox owner) and Chris on every new booking. We
  // dedupe addresses case-insensitively so GRAPH_USER=chris@jengu.ai wouldn't
  // produce two copies.
  const adminRecipients = [GRAPH_USER, 'chris@jengu.ai']
    .filter((addr, i, arr) => arr.findIndex((a) => a.toLowerCase() === addr.toLowerCase()) === i)
    .map((address) => ({ emailAddress: { address, name: 'Jengu Team' } }));

  const emailMessage = {
    message: {
      subject: `🗓️ New Booking: ${name} - ${formattedDate} at ${formattedTime}`,
      body: {
        contentType: 'HTML',
        content: emailBody
      },
      from: { emailAddress: { address: 'hello@jengu.ai', name: 'Jengu' } },
      toRecipients: adminRecipients
    },
    saveToSentItems: false
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
    throw new Error(`Admin notification email failed: ${res.status} ${text}`);
  }
}

/**
 * Send confirmation email to the attendee
 */
async function sendConfirmationEmail(token: string, payload: any, eventDetails: any, env: any) {
  const GRAPH_USER = env.GRAPH_USER;
  const { name, email, date, time, timezone } = payload;

  // See note in sendAdminNotification: format the raw wall-clock strings so the
  // customer sees the time they actually picked, in the timezone they picked.
  const { formattedDate, formattedTime } = formatMeetingDateTime(date, time, timezone);

  const calendarNoticeBody = "Your calendar invitation is on its way — it includes your Microsoft Teams join link. We'll also send a reminder one hour before the call.";

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
              <img src="https://www.jengu.ai/images/logo.webp" alt="Jengu" width="100" style="display: block; margin: 0 auto; height: auto;">
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
                          <p style="margin: 0; font-size: 15px; color: #374151; font-weight: 600;">Microsoft Teams</p>
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
                    <p style="margin: 0; font-size: 14px; color: #a16207; line-height: 1.5;">${calendarNoticeBody}</p>
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
      from: { emailAddress: { address: 'hello@jengu.ai', name: 'Jengu' } },
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
// Custom property GUID we attach to every Jengu booking so the reminder cron
// can identify our events and dedupe sends. Graph requires a valid UUID for
// the property-set namespace.
const JENGU_PROPERTY_SET_ID = '{c4d8f2a0-1a3b-4e7c-9d11-bf3e2a8c7e10}';

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEvent(payload: any) {
  const { date, time, timezone, name, email, company, phone, extraInfo } = payload;

  // 30-minute slot in the customer's selected IANA timezone.
  // dateTime is a naive wall-clock string; Graph applies the timeZone field
  // to convert it to the correct UTC instant.
  const startIso = `${date}T${time}:00`;
  const [hours, minutes] = time.split(':').map(Number);
  const endMinutes = (hours * 60 + minutes + 30) % 1440;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endIso = `${date}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

  const subject = `Jengu Discovery Call — ${name}`;

  // HTML body for the calendar event. Outlook auto-appends the Teams join
  // block (URL, meeting ID, passcode) below this content.
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = company ? escapeHtml(company) : '';
  const safePhone = phone ? escapeHtml(phone) : '';
  const safeNotes = extraInfo ? escapeHtml(extraInfo).replace(/\n/g, '<br>') : '';

  const bodyHtml = `
<div style="font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.55;max-width:640px;">

  <div style="background:linear-gradient(90deg,#fef3c7,#fde68a);padding:14px 18px;border-radius:8px;margin-bottom:18px;border-left:4px solid #f59e0b;">
    <p style="margin:0;font-size:15px;color:#78350f;">
      <strong>Jengu Discovery Call</strong> · 30 minutes · Microsoft Teams
    </p>
    <p style="margin:6px 0 0;font-size:13px;color:#92400e;">
      Looking forward to meeting you, ${safeName}. The Teams join link is at the bottom of this invite.
    </p>
  </div>

  <h3 style="margin:0 0 10px;font-size:14px;color:#111827;text-transform:uppercase;letter-spacing:0.04em;">Your details</h3>
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="padding:4px 14px 4px 0;color:#6b7280;">Name</td><td style="padding:4px 0;color:#111827;font-weight:500;">${safeName}</td></tr>
    <tr><td style="padding:4px 14px 4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;color:#111827;font-weight:500;">${safeEmail}</td></tr>
    ${safeCompany ? `<tr><td style="padding:4px 14px 4px 0;color:#6b7280;">Company</td><td style="padding:4px 0;color:#111827;font-weight:500;">${safeCompany}</td></tr>` : ''}
    ${safePhone ? `<tr><td style="padding:4px 14px 4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;color:#111827;font-weight:500;">${safePhone}</td></tr>` : ''}
  </table>

  ${safeNotes ? `
  <h3 style="margin:0 0 10px;font-size:14px;color:#111827;text-transform:uppercase;letter-spacing:0.04em;">Notes from ${safeName}</h3>
  <div style="background:#f9fafb;border-left:3px solid #f59e0b;padding:12px 14px;border-radius:6px;margin-bottom:20px;color:#374151;">
    ${safeNotes}
  </div>` : ''}

  <h3 style="margin:0 0 10px;font-size:14px;color:#111827;text-transform:uppercase;letter-spacing:0.04em;">What we'll cover</h3>
  <ol style="margin:0 0 20px;padding-left:22px;color:#374151;">
    <li style="margin-bottom:6px;">Your current operations &amp; bottlenecks</li>
    <li style="margin-bottom:6px;">Where AI automation can save hours or drive revenue</li>
    <li style="margin-bottom:6px;">A clear next-step plan with realistic ROI</li>
  </ol>

  <h3 style="margin:0 0 10px;font-size:14px;color:#111827;text-transform:uppercase;letter-spacing:0.04em;">A few tips before we meet</h3>
  <ul style="margin:0 0 20px;padding-left:22px;color:#374151;">
    <li style="margin-bottom:6px;">Bring 1–2 specific tasks you'd love to automate</li>
    <li style="margin-bottom:6px;">Rough numbers help — booking volume, hours/week on repetitive work, support tickets</li>
    <li style="margin-bottom:6px;">Test your Teams audio &amp; camera 5 minutes before</li>
  </ul>

  <p style="margin:0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;padding-top:14px;">
    Need to reschedule or cancel? Reply to this invite or email
    <a href="mailto:hello@jengu.ai" style="color:#f59e0b;text-decoration:none;font-weight:500;">hello@jengu.ai</a>.
  </p>

</div>
`.trim();

  const event: any = {
    subject,
    body: { contentType: 'HTML', content: bodyHtml },
    start: { dateTime: startIso, timeZone: timezone },
    end: { dateTime: endIso, timeZone: timezone },
    attendees: [
      {
        emailAddress: { address: email, name: name },
        type: 'required'
      }
    ],
    location: { displayName: 'Microsoft Teams' },
    responseRequested: true,
    allowNewTimeProposals: false,
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',

    // Tag the event so the reminder cron can identify Jengu bookings and
    // mark which ones already had their reminder sent.
    singleValueExtendedProperties: [
      {
        id: `String ${JENGU_PROPERTY_SET_ID} Name JenguBooking`,
        value: 'true'
      },
      {
        id: `String ${JENGU_PROPERTY_SET_ID} Name JenguReminderSent`,
        value: 'false'
      },
      {
        id: `String ${JENGU_PROPERTY_SET_ID} Name JenguAttendeeTimezone`,
        value: timezone
      }
    ]
  };

  return event;
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

    // Validate timezone: must be a real IANA zone, not "local" or empty.
    // A stale "local" value here would silently shift the calendar entry by
    // the customer's UTC offset, so reject it explicitly.
    if (!payload.timezone || payload.timezone === 'local') {
      return new Response(
        JSON.stringify({
          error: 'Invalid Timezone',
          message: 'Your timezone could not be detected. Please refresh the page and pick a timezone before booking.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    try {
      // Throws RangeError on invalid IANA zone names.
      new Intl.DateTimeFormat('en-US', { timeZone: payload.timezone });
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid Timezone',
          message: `The timezone "${payload.timezone}" is not recognized. Please refresh the page and try again.`
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

    // Send admin notification email
    let adminNotificationSent = false;
    let adminNotificationError = null;
    try {
      await sendAdminNotification(token, payload, envVars);
      console.log('Admin notification email sent successfully to:', GRAPH_USER);
      adminNotificationSent = true;
    } catch (err: any) {
      console.error('Failed to send admin notification email:', err.message);
      adminNotificationError = err.message;
      // Don't fail the whole request if admin notification fails
    }

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
        emailError,
        adminNotificationSent,
        adminNotificationError
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
