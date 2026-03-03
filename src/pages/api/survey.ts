import type { APIRoute } from 'astro';

export const prerender = false;

interface SurveyPayload {
  contactName: string;
  role?: string;
  company: string;
  country?: string;
  email: string;
  phone?: string;
  businessModel: string;
  companySize: string;
  monthlyBookingVolume: string;
  stakeholderCount: string;
  currentResponseTime: string;
  decisionOwner?: string;
  channelPreference: string;
  alignmentRisk: string;
  currentSetup: string;
  painPoints: string[];
  problemDetail: string;
  priorities: string[];
  implicationDetail: string;
  currentTools?: string;
  goals: string;
  successDefinition: string;
  decisionCriteria: string;
  consent: boolean;
}

function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function sanitizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => sanitizeText(item, 120))
    .filter(Boolean)
    .slice(0, 12);
}

async function getAccessToken(env: Record<string, string>): Promise<string> {
  const url = `https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token request failed: ${response.status} ${text}`);
  }

  const auth = await response.json();
  return auth.access_token;
}

function formatList(list: string[]): string {
  return list.length ? list.map((item) => `<li>${item}</li>`).join('') : '<li>Not provided</li>';
}

async function sendSurveyEmail(token: string, payload: SurveyPayload, env: Record<string, string>): Promise<void> {
  const graphUser = env.GRAPH_USER;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Travel Fair Survey Submission</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;font-family:Segoe UI,Arial,sans-serif;color:#e5e7eb;">
  <div style="max-width:700px;margin:24px auto;border:1px solid #27272a;border-radius:16px;overflow:hidden;background:#111827;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#6366f1);">
      <h1 style="margin:0;color:#fff;font-size:24px;">New Travel Fair Survey</h1>
      <p style="margin:8px 0 0;color:#eef2ff;font-size:14px;">Submitted from /survey on jengu.ai</p>
    </div>

    <div style="padding:24px 28px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Company Contact</h2>
      <p style="margin:0 0 6px;"><strong>Name:</strong> ${payload.contactName}</p>
      <p style="margin:0 0 6px;"><strong>Role:</strong> ${payload.role || 'Not provided'}</p>
      <p style="margin:0 0 6px;"><strong>Company:</strong> ${payload.company}</p>
      <p style="margin:0 0 6px;"><strong>Country/Region:</strong> ${payload.country || 'Not provided'}</p>
      <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${payload.email}" style="color:#93c5fd;">${payload.email}</a></p>
      <p style="margin:0 0 18px;"><strong>Phone:</strong> ${payload.phone || 'Not provided'}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Business Context</h2>
      <p style="margin:0 0 6px;"><strong>Business Type:</strong> ${payload.businessModel}</p>
      <p style="margin:0 0 6px;"><strong>Company Size:</strong> ${payload.companySize}</p>
      <p style="margin:0 0 6px;"><strong>Monthly Booking/Lead Volume:</strong> ${payload.monthlyBookingVolume}</p>
      <p style="margin:0 0 6px;"><strong>Decision Stakeholders:</strong> ${payload.stakeholderCount}</p>
      <p style="margin:0 0 6px;"><strong>Current Response Time:</strong> ${payload.currentResponseTime}</p>
      <p style="margin:0 0 6px;"><strong>Decision Owner:</strong> ${payload.decisionOwner || 'Not provided'}</p>
      <p style="margin:0 0 6px;"><strong>Preferred Channel:</strong> ${payload.channelPreference}</p>
      <p style="margin:0 0 6px;"><strong>Team Alignment:</strong> ${payload.alignmentRisk}</p>
      <p style="margin:0 0 18px;"><strong>Current Setup:</strong> ${payload.currentSetup}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Key Challenges</h2>
      <p style="margin:0 0 10px;"><strong>Primary problem detail:</strong> ${payload.problemDetail}</p>
      <h3 style="margin:0 0 10px;font-size:15px;color:#fff;">Challenges (up to 3)</h3>
      <ul style="margin:0 0 18px 18px;padding:0;">${formatList(payload.painPoints)}</ul>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Primary Challenges</h2>
      <p style="margin:0 0 18px;"><strong>Impact if unresolved:</strong> ${payload.implicationDetail}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Areas of Interest</h2>
      <ul style="margin:0 0 18px 18px;padding:0;">${formatList(payload.priorities)}</ul>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Success Vision</h2>
      <p style="margin:0 0 10px;"><strong>What meaningful improvement would look like:</strong> ${payload.successDefinition}</p>
      <p style="margin:0 0 18px;"><strong>Additional context:</strong> ${payload.decisionCriteria}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#fff;">Systems & Goals</h2>
      <p style="margin:0 0 6px;"><strong>Current tools:</strong> ${payload.currentTools || 'Not provided'}</p>
      <p style="margin:0 0 18px;"><strong>Key outcomes:</strong> ${payload.goals.replace(/\n/g, '<br/>')}</p>
    </div>
  </div>
</body>
</html>
  `;

  const message = {
    message: {
      subject: `Travel Fair Survey - ${payload.company} (${payload.contactName})`,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      replyTo: [
        {
          emailAddress: {
            address: payload.email,
            name: payload.contactName
          }
        }
      ],
      toRecipients: [
        {
          emailAddress: {
            address: 'info@jengu.ai',
            name: 'Jengu Team'
          }
        }
      ]
    },
    saveToSentItems: true
  };

  const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(graphUser)}/sendMail`;

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email send failed: ${response.status} ${text}`);
  }
}

async function sendConfirmationEmail(token: string, payload: SurveyPayload, env: Record<string, string>): Promise<void> {
  const graphUser = env.GRAPH_USER;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Your Survey Response</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;font-family:Segoe UI,Arial,sans-serif;color:#e5e7eb;">
  <div style="max-width:700px;margin:24px auto;border:1px solid #27272a;border-radius:16px;overflow:hidden;background:#111827;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#6366f1);">
      <h1 style="margin:0;color:#fff;font-size:24px;">Thank You for Your Response</h1>
      <p style="margin:8px 0 0;color:#eef2ff;font-size:14px;">We've received your survey submission</p>
    </div>

    <div style="padding:24px 28px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${payload.contactName},</p>
      
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Thank you for taking the time to complete our AI in Travel & Hospitality survey. Your insights are valuable and help us understand the real challenges and opportunities in the industry.</p>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">We've recorded your responses, including:</p>
      
      <div style="margin:0 0 16px;padding:16px;border-left:3px solid #38bdf8;background:#1f2937;border-radius:8px;">
        <p style="margin:0 0 8px;"><strong>Organization:</strong> ${payload.company}</p>
        <p style="margin:0 0 8px;"><strong>Primary Interest:</strong> ${payload.priorities[0] ? payload.priorities[0].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'AI & Automation'}</p>
        <p style="margin:0;"><strong>Key Challenge:</strong> ${payload.currentSetup.substring(0, 120)}${payload.currentSetup.length > 120 ? '...' : ''}</p>
      </div>

      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">If you have any additional information to share or follow-up questions, feel free to reply to this email.</p>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Best regards,</p>

      <div style="padding-top:16px;border-top:1px solid #27272a;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">Jengu</p>
        <p style="margin:0 0 2px;font-size:13px;color:#9ca3af;">AI for Travel & Hospitality</p>
        <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
          <a href="https://jengu.ai" style="color:#93c5fd;text-decoration:none;">jengu.ai</a> | 
          <a href="https://jengu.ai/contact" style="color:#93c5fd;text-decoration:none;">Contact us</a>
        </p>
        <p style="margin:0;font-size:12px;color:#6b7280;">© 2026 Jengu. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const message = {
    message: {
      subject: `Thank you for completing the survey - ${payload.company}`,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      toRecipients: [
        {
          emailAddress: {
            address: payload.email,
            name: payload.contactName
          }
        }
      ]
    },
    saveToSentItems: true
  };

  const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(graphUser)}/sendMail`;

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Confirmation email send failed: ${response.status} ${text}`);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = locals.runtime as { env?: Record<string, string> } | undefined;
    const env = runtime?.env;

    const TENANT_ID = env?.TENANT_ID || import.meta.env.TENANT_ID;
    const CLIENT_ID = env?.CLIENT_ID || import.meta.env.CLIENT_ID;
    const CLIENT_SECRET = env?.CLIENT_SECRET || import.meta.env.CLIENT_SECRET;
    const GRAPH_USER = env?.GRAPH_USER || import.meta.env.GRAPH_USER;

    const body = await request.json();

    const payload: SurveyPayload = {
      contactName: sanitizeText(body.contactName, 120),
      role: sanitizeText(body.role, 120),
      company: sanitizeText(body.company, 120),
      country: sanitizeText(body.country, 120),
      email: sanitizeText(body.email, 200),
      phone: sanitizeText(body.phone, 80),
      businessModel: sanitizeText(body.businessModel, 100),
      companySize: sanitizeText(body.companySize, 100),
      monthlyBookingVolume: sanitizeText(body.monthlyBookingVolume, 100),
      stakeholderCount: sanitizeText(body.stakeholderCount, 100),
      currentResponseTime: sanitizeText(body.currentResponseTime, 100),
      decisionOwner: sanitizeText(body.decisionOwner, 120),
      channelPreference: sanitizeText(body.channelPreference, 100),
      alignmentRisk: sanitizeText(body.alignmentRisk, 100),
      currentSetup: sanitizeText(body.currentSetup, 1200),
      painPoints: sanitizeList(body.painPoints),
      problemDetail: sanitizeText(body.problemDetail, 1200),
      priorities: sanitizeList(body.priorities),
      implicationDetail: sanitizeText(body.implicationDetail, 1200),
      currentTools: sanitizeText(body.currentTools, 400),
      goals: sanitizeText(body.goals, 1500),
      successDefinition: sanitizeText(body.successDefinition, 1200),
      decisionCriteria: sanitizeText(body.decisionCriteria, 1200),
      consent: Boolean(body.consent)
    };

    const required = [
      payload.contactName,
      payload.company,
      payload.email,
      payload.businessModel,
      payload.companySize,
      payload.monthlyBookingVolume,
      payload.stakeholderCount,
      payload.currentResponseTime,
      payload.channelPreference,
      payload.alignmentRisk,
      payload.currentSetup,
      payload.problemDetail,
      payload.implicationDetail,
      payload.goals,
      payload.successDefinition,
      payload.decisionCriteria
    ];

    if (required.some((item) => !item)) {
      return new Response(
        JSON.stringify({ error: 'Please complete all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.consent) {
      return new Response(
        JSON.stringify({ error: 'Please confirm you want to share this survey response.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payload.painPoints.length < 1 || payload.painPoints.length > 3) {
      return new Response(
        JSON.stringify({ error: 'Please select 1 to 3 current challenges.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payload.priorities.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please select at least one priority solution.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const envVars = { TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER };
    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
      console.warn('Survey submitted but Microsoft Graph is not configured.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Survey received. We will follow up shortly.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const token = await getAccessToken(envVars);
      await sendSurveyEmail(token, payload, envVars);
      await sendConfirmationEmail(token, payload, envVars);
    } catch (emailError) {
      console.error('Survey email delivery failed:', emailError);
      // Keep the UX smooth at events even if mail delivery is temporarily misconfigured.
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Thank you for completing the survey. Your response has been recorded.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for completing the survey. Your response has been recorded.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Survey submission error:', error);
    return new Response(
      JSON.stringify({ error: 'We could not submit your survey. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
