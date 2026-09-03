/**
 * POST /api/estimate — emails a calculator estimate to the visitor and a copy
 * to info@jengu.ai. Uses the same Microsoft Graph credentials as the other
 * mail endpoints. Numbers are re-validated here; nothing from the client is
 * trusted as-is.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

interface EstimatePayload {
  kind: 'estimate';
  fullName: string;
  email: string;
  companyName?: string;
  symbol?: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const text = (v: unknown, max = 200): string => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);
const money = (v: unknown, symbol: string): string => {
  const n = Number(v);
  return Number.isFinite(n) ? `${symbol}${Math.round(n).toLocaleString('en-GB')}` : 'n/a';
};
const hours = (v: unknown): string => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(n >= 10 ? 0 : 1) : 'n/a';
};
const SYMBOLS = new Set(['£', '€', '$']);

async function getAccessToken(env: Record<string, string>): Promise<string> {
  const url = `https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Token response had no access_token');
  return data.access_token;
}

async function sendMail(token: string, env: Record<string, string>, to: string, subject: string, html: string): Promise<void> {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.GRAPH_USER)}/sendMail`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: { subject, body: { contentType: 'HTML', content: html }, toRecipients: [{ emailAddress: { address: to } }] },
      saveToSentItems: true,
    }),
  });
  if (!res.ok) throw new Error(`sendMail failed: ${res.status}`);
}

function summaryHtml(p: EstimatePayload, symbol: string): string {
  const i = p.inputs;
  const r = p.results;
  const agents = (i.agents ?? {}) as Record<string, boolean>;
  const chosen = Object.entries(agents)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .join(', ');
  const row = (k: string, v: string): string =>
    `<tr><td style="padding:6px 12px 6px 0;color:#666">${k}</td><td style="padding:6px 0;font-weight:600">${v}</td></tr>`;
  return `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0c;max-width:560px">
      <h2 style="font-weight:600;letter-spacing:-0.02em">Your Jengu estimate</h2>
      <p>Built from the numbers you entered on jengu.ai. It is an estimate, not a quote.</p>
      <table style="border-collapse:collapse;font-size:15px">
        ${row('Property', `${text(i.propertyType)} · ${text(i.units)} units · ${money(i.nightlyRate, symbol)}/night · ${text(i.occupancy)}% occupancy`)}
        ${row('Volumes', `${text(i.messagesPerDay)} messages/day · ${text(i.callsPerDay)} calls/day · ${text(i.adminHoursPerWeek)} h/week admin`)}
        ${row('Staff cost', `${money(i.hourlyCost, symbol)}/hour`)}
        ${row('Agents', text(chosen) || 'none')}
        ${row('Hours back per week', `${hours(r.hoursPerWeek)} h`)}
        ${row('Staff cost saved per month', money(r.costSavedPerMonth, symbol))}
        ${row('Revenue per month', money(r.revenuePerMonth, symbol))}
        ${row('Monthly benefit before fees', money(r.monthlyBenefit, symbol))}
        ${row('Indicative monthly fee', money(r.monthlyFee, symbol))}
        ${row('Indicative setup', money(r.setupFee, symbol))}
        ${row('Net gain per month', money(r.netMonthly, symbol))}
        ${row('Payback on setup', r.paybackMonths === null ? 'n/a' : `${text(r.paybackMonths)} months`)}
      </table>
      <p style="margin-top:20px">Want to check the assumptions together? Reply to this email or book a call at
        <a href="https://www.jengu.ai/book">jengu.ai/book</a>.</p>
      <p style="color:#666;font-size:13px">Jengu · info@jengu.ai</p>
    </div>`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
    const env = runtime?.env ?? {};
    const creds: Record<string, string> = {
      TENANT_ID: env.TENANT_ID || import.meta.env.TENANT_ID || '',
      CLIENT_ID: env.CLIENT_ID || import.meta.env.CLIENT_ID || '',
      CLIENT_SECRET: env.CLIENT_SECRET || import.meta.env.CLIENT_SECRET || '',
      GRAPH_USER: env.GRAPH_USER || import.meta.env.GRAPH_USER || '',
    };

    const payload = (await request.json()) as Partial<EstimatePayload>;
    if (payload.kind !== 'estimate' || !payload.inputs || !payload.results) return json({ error: 'Bad request.' }, 400);
    const fullName = text(payload.fullName, 120);
    const email = text(payload.email, 200);
    const companyName = text(payload.companyName, 160);
    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'A name and a valid email are needed.' }, 400);
    const symbol = SYMBOLS.has(String(payload.symbol)) ? String(payload.symbol) : '£';

    if (!creds.TENANT_ID || !creds.CLIENT_ID || !creds.CLIENT_SECRET || !creds.GRAPH_USER) {
      console.error('estimate: mail credentials are not configured; estimate not sent');
      return json({ error: 'Email is not configured on this server.' }, 503);
    }

    const clean: EstimatePayload = { kind: 'estimate', fullName, email, companyName, symbol, inputs: payload.inputs, results: payload.results };
    const html = summaryHtml(clean, symbol);
    const token = await getAccessToken(creds);
    await sendMail(token, creds, email, 'Your Jengu estimate', html);
    const adminHtml = `<p><b>${fullName}</b> (${email}${companyName ? `, ${companyName}` : ''}) asked for a calculator estimate.</p>${html}`;
    await sendMail(token, creds, 'info@jengu.ai', `Calculator estimate for ${fullName}`, adminHtml);
    return json({ success: true });
  } catch (error) {
    console.error('estimate error:', error);
    return json({ error: 'Could not send the estimate. Email info@jengu.ai instead.' }, 500);
  }
};
