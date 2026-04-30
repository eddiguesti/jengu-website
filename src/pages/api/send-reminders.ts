import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Reminder Cron Endpoint
 *
 * Designed to be hit on a 5-minute cadence by an external scheduler
 * (Cloudflare Cron, cron-job.org, GitHub Actions, etc.). Each invocation:
 *   1. Authenticates via Bearer token (REMINDER_CRON_SECRET)
 *   2. Queries Microsoft Graph for upcoming Jengu bookings on edd@jengu.ai's
 *      calendar starting in the next 55-65 minutes
 *   3. Skips any event whose JenguReminderSent property is "true"
 *   4. Emails the attendee a styled reminder containing the Teams join link
 *   5. Marks the event as JenguReminderSent=true so it won't fire again
 */

const JENGU_PROPERTY_SET_ID = '{c4d8f2a0-1a3b-4e7c-9d11-bf3e2a8c7e10}';
const REMINDER_PROP_ID = `String ${JENGU_PROPERTY_SET_ID} Name JenguReminderSent`;
const TZ_PROP_ID = `String ${JENGU_PROPERTY_SET_ID} Name JenguAttendeeTimezone`;
const BOOKING_PROP_ID = `String ${JENGU_PROPERTY_SET_ID} Name JenguBooking`;

async function getAccessToken(env: any): Promise<string> {
  const url = `https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTimeInZone(utcInstant: Date, timezone: string) {
  const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(utcInstant);
  return formatted;
}

function buildReminderEmailHtml(opts: {
  name: string;
  formattedTime: string;
  joinUrl: string;
}) {
  const { name, formattedTime, joinUrl } = opts;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your Jengu call starts in 1 hour</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;">

        <tr><td style="height:4px;background:linear-gradient(90deg,#f59e0b 0%,#eab308 50%,#f59e0b 100%);"></td></tr>

        <tr><td style="padding:36px 36px 12px;text-align:center;">
          <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Starting in 1 hour</span>
        </td></tr>

        <tr><td style="padding:0 36px 8px;text-align:center;">
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#111827;">See you soon, ${escapeHtml(name)}</h1>
        </td></tr>

        <tr><td style="padding:0 36px 28px;text-align:center;">
          <p style="margin:0;font-size:16px;color:#6b7280;">${escapeHtml(formattedTime)}</p>
        </td></tr>

        <tr><td style="padding:0 36px 28px;text-align:center;">
          <a href="${escapeHtml(joinUrl)}" style="display:inline-block;background:#5059c9;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 36px;border-radius:8px;box-shadow:0 4px 12px rgba(80,89,201,0.3);">
            Join Microsoft Teams
          </a>
          <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;word-break:break-all;">
            Or copy this link:<br>
            <a href="${escapeHtml(joinUrl)}" style="color:#9ca3af;text-decoration:underline;">${escapeHtml(joinUrl)}</a>
          </p>
        </td></tr>

        <tr><td style="padding:0 36px 28px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fafafa;border-radius:12px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 14px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Quick prep</p>
              <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
                <li>Test your Teams audio &amp; camera</li>
                <li>Have 1–2 specific tasks you'd like to automate in mind</li>
                <li>Any rough numbers (volume, hours, tickets) help us shape advice</li>
              </ul>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 36px 36px;text-align:center;border-top:1px solid #e5e7eb;padding-top:20px;">
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Something came up? Email <a href="mailto:hello@jengu.ai" style="color:#f59e0b;text-decoration:none;font-weight:500;">hello@jengu.ai</a> and we'll find another time.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

async function sendReminder(token: string, env: any, opts: {
  to: string; toName: string; subject: string; html: string;
}) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.GRAPH_USER)}/sendMail`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: opts.subject,
        body: { contentType: 'HTML', content: opts.html },
        from: { emailAddress: { address: 'hello@jengu.ai', name: 'Jengu' } },
        toRecipients: [{ emailAddress: { address: opts.to, name: opts.toName } }]
      },
      saveToSentItems: true
    })
  });
  if (!res.ok) throw new Error(`Reminder send failed: ${res.status} ${await res.text()}`);
}

async function markReminderSent(token: string, env: any, eventId: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.GRAPH_USER)}/calendar/events/${eventId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      singleValueExtendedProperties: [{ id: REMINDER_PROP_ID, value: 'true' }]
    })
  });
  if (!res.ok) throw new Error(`Mark-sent PATCH failed: ${res.status} ${await res.text()}`);
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  const env = (runtime as any)?.env || {};
  const TENANT_ID = env.TENANT_ID || import.meta.env.TENANT_ID;
  const CLIENT_ID = env.CLIENT_ID || import.meta.env.CLIENT_ID;
  const CLIENT_SECRET = env.CLIENT_SECRET || import.meta.env.CLIENT_SECRET;
  const GRAPH_USER = env.GRAPH_USER || import.meta.env.GRAPH_USER;
  const REMINDER_CRON_SECRET = env.REMINDER_CRON_SECRET || import.meta.env.REMINDER_CRON_SECRET;

  // Authenticate the cron caller. Without a secret, the endpoint refuses.
  const auth = request.headers.get('Authorization') || '';
  if (!REMINDER_CRON_SECRET || auth !== `Bearer ${REMINDER_CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
    return new Response(JSON.stringify({ error: 'Graph credentials not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }

  const envVars = { TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER };

  try {
    const token = await getAccessToken(envVars);

    // Look at events starting in the next 55-65 minutes (UTC). The 10-min
    // window absorbs a 5-min cron cadence with margin.
    const now = Date.now();
    const start = new Date(now + 55 * 60 * 1000).toISOString();
    const end = new Date(now + 65 * 60 * 1000).toISOString();

    const calUrl =
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(GRAPH_USER)}` +
      `/calendar/calendarView?startDateTime=${start}&endDateTime=${end}` +
      `&$expand=singleValueExtendedProperties($filter=` +
      `id eq '${REMINDER_PROP_ID}' or id eq '${TZ_PROP_ID}' or id eq '${BOOKING_PROP_ID}')`;

    const calRes = await fetch(calUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!calRes.ok) {
      throw new Error(`calendarView failed: ${calRes.status} ${await calRes.text()}`);
    }
    const cal = await calRes.json();
    const events: any[] = cal.value || [];

    const results = {
      checked: events.length,
      jenguEvents: 0,
      sent: [] as Array<{ eventId: string; to: string }>,
      skipped: [] as Array<{ eventId: string; reason: string }>,
      errors: [] as Array<{ eventId: string; error: string }>
    };

    for (const event of events) {
      const props = (event.singleValueExtendedProperties || []) as Array<{ id: string; value: string }>;
      const isJengu = props.find((p) => p.id === BOOKING_PROP_ID)?.value === 'true';
      if (!isJengu) continue;
      results.jenguEvents++;

      const reminderSent = props.find((p) => p.id === REMINDER_PROP_ID)?.value === 'true';
      if (reminderSent) {
        results.skipped.push({ eventId: event.id, reason: 'already-sent' });
        continue;
      }

      const attendeeTz = props.find((p) => p.id === TZ_PROP_ID)?.value || 'UTC';
      const joinUrl = event.onlineMeeting?.joinUrl as string | undefined;
      if (!joinUrl) {
        results.skipped.push({ eventId: event.id, reason: 'no-join-url' });
        continue;
      }

      const attendee = (event.attendees || [])[0];
      const to = attendee?.emailAddress?.address;
      const toName = attendee?.emailAddress?.name || 'there';
      if (!to) {
        results.skipped.push({ eventId: event.id, reason: 'no-attendee' });
        continue;
      }

      // Customer's perceived start time = the event's UTC start, rendered in
      // their stored IANA zone.
      const startUtc = new Date(event.start.dateTime + 'Z'); // Graph returns naive UTC strings
      const formattedTime = formatTimeInZone(startUtc, attendeeTz);

      try {
        await sendReminder(token, envVars, {
          to,
          toName,
          subject: 'Your Jengu call starts in 1 hour',
          html: buildReminderEmailHtml({ name: toName, formattedTime, joinUrl })
        });
        await markReminderSent(token, envVars, event.id);
        results.sent.push({ eventId: event.id, to });
      } catch (err: any) {
        results.errors.push({ eventId: event.id, error: err.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Friendly GET so a manual browser hit doesn't 405. No auth required for the
// health response — it doesn't expose anything.
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ ok: true, message: 'POST with Authorization: Bearer <REMINDER_CRON_SECRET> to fire reminders.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
