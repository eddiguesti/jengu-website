import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Calculator Custom Inquiry API - Sends notification emails using Microsoft Graph API
 * Handles "Specialized Software or AI Agents" requests from the ROI calculator
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get environment variables
    const runtime = locals.runtime;
    const { env } = runtime || {};

    const TENANT_ID = env?.TENANT_ID || import.meta.env.TENANT_ID;
    const CLIENT_ID = env?.CLIENT_ID || import.meta.env.CLIENT_ID;
    const CLIENT_SECRET = env?.CLIENT_SECRET || import.meta.env.CLIENT_SECRET;
    const GRAPH_USER = env?.GRAPH_USER || import.meta.env.GRAPH_USER;

    const data = await request.json();
    const { fullName, companyName, email, phone, businessChallenge, currentSystems, desiredOutcome, timeline, budget } = data;

    // Validate required fields
    if (!fullName || !companyName || !email || !businessChallenge) {
      return new Response(
        JSON.stringify({ error: 'Please fill in all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitize = (str: string) => str.replace(/[<>]/g, '').trim().substring(0, 1000);
    const sanitizedData = {
      fullName: sanitize(fullName),
      companyName: sanitize(companyName),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : '',
      businessChallenge: sanitize(businessChallenge),
      currentSystems: currentSystems ? sanitize(currentSystems) : '',
      desiredOutcome: desiredOutcome ? sanitize(desiredOutcome) : '',
      timeline: timeline || 'Not specified',
      budget: budget || 'Not specified'
    };

    // Create env object
    const envVars = { TENANT_ID, CLIENT_ID, CLIENT_SECRET, GRAPH_USER };

    // Check if Microsoft Graph is configured
    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !GRAPH_USER) {
      console.warn('Microsoft Graph not configured - emails will not be sent');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAccessToken(envVars);

    // Send email to admin (you)
    try {
      await sendAdminNotification(token, sanitizedData, envVars);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send thank you email to customer
    try {
      await sendCustomerThankYou(token, sanitizedData, envVars);
    } catch (emailError) {
      console.error('Failed to send customer email:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calculator inquiry error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again or email us directly at info@jengu.ai' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function sendAdminNotification(token: string, data: any, env: any) {
  const GRAPH_USER = env.GRAPH_USER;

  const timelineLabels: { [key: string]: string } = {
    'urgent': 'Urgent (ASAP)',
    '1-2-months': '1-2 Months',
    '3-6-months': '3-6 Months',
    'flexible': 'Flexible'
  };

  const budgetLabels: { [key: string]: string } = {
    'under-5k': 'Under £5,000',
    '5k-15k': '£5,000 - £15,000',
    '15k-30k': '£15,000 - £30,000',
    '30k-plus': '£30,000+'
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Specialized Software/AI Agent Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);">
  <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 80px rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); padding: 40px 32px; text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);"></div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; position: relative; z-index: 1;">
        🤖 New Specialized Software/AI Agent Inquiry
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; position: relative; z-index: 1;">From ROI Calculator - Custom Solution Request</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">

      <!-- Contact Info -->
      <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">👤</span>
          Contact Information
        </h2>

        <div style="display: grid; gap: 16px;">
          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Name</div>
            <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.fullName}</div>
          </div>

          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Company/Property</div>
            <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.companyName}</div>
          </div>

          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Email</div>
            <div style="color: #818cf8; font-size: 16px; font-weight: 500;">
              <a href="mailto:${data.email}" style="color: #818cf8; text-decoration: none;">${data.email}</a>
            </div>
          </div>

          ${data.phone ? `
          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Phone</div>
            <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${data.phone}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Business Challenge -->
      <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #dc2626, #991b1b); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">⚠️</span>
          Business Challenge
        </h2>
        <div style="color: #d1d5db; font-size: 15px; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 12px; border-left: 3px solid #dc2626;">
          ${data.businessChallenge.replace(/\n/g, '<br>')}
        </div>
      </div>

      <!-- Current Systems -->
      ${data.currentSystems ? `
      <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #eab308, #ca8a04); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">⚙️</span>
          Current Systems
        </h2>
        <div style="color: #d1d5db; font-size: 15px; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 12px; border-left: 3px solid #eab308;">
          ${data.currentSystems.replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}

      <!-- Desired Outcome -->
      ${data.desiredOutcome ? `
      <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">🎯</span>
          Desired Outcome
        </h2>
        <div style="color: #d1d5db; font-size: 15px; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 12px; border-left: 3px solid #22c55e;">
          ${data.desiredOutcome.replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}

      <!-- Project Details -->
      <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;">📊</span>
          Project Details
        </h2>

        <div style="display: grid; gap: 16px;">
          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Timeline</div>
            <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${timelineLabels[data.timeline] || data.timeline}</div>
          </div>

          <div>
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Budget</div>
            <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${budgetLabels[data.budget] || data.budget}</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="mailto:${data.email}?subject=Re: Your Specialized Software/AI Agent Inquiry"
           style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 999px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4); transition: all 0.3s;">
          📧 Reply to ${data.fullName.split(' ')[0]}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: rgba(0, 0, 0, 0.3); padding: 24px 32px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.2);">
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Sent from your Jengu AI ROI Calculator
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const emailMessage = {
    message: {
      subject: `🤖 New Specialized Software/AI Agent Inquiry from ${data.fullName}`,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      from: {
        emailAddress: {
          address: 'hello@jengu.ai',
          name: 'Jengu ROI Calculator'
        }
      },
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

async function sendCustomerThankYou(token: string, data: any, env: any) {
  const GRAPH_USER = env.GRAPH_USER;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Jengu AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);">
  <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 80px rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); padding: 48px 32px; text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);"></div>
      <div style="font-size: 64px; margin-bottom: 16px; position: relative; z-index: 1;">🚀</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; position: relative; z-index: 1;">
        We're Excited to Build With You!
      </h1>
      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; position: relative; z-index: 1;">Thanks for reaching out about specialized software and AI agents</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">

      <!-- Main Message -->
      <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 28px; margin-bottom: 28px;">
        <p style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 600; line-height: 1.6;">
          Hi ${data.fullName.split(' ')[0]},
        </p>
        <p style="margin: 0; color: #d1d5db; font-size: 16px; line-height: 1.7;">
          We've received your inquiry about building custom AI solutions for <strong style="color: #818cf8;">${data.companyName}</strong>.
          Our team is reviewing your requirements and will get back to you within <strong style="color: #818cf8;">24 hours</strong> with next steps!
        </p>
      </div>

      <!-- What Happens Next -->
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 20px; font-weight: 600;">
          What happens next?
        </h2>

        <div style="display: grid; gap: 16px;">
          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">1</div>
            <div>
              <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 4px;">Requirements Analysis</div>
              <div style="color: #9ca3af; font-size: 14px; line-height: 1.5;">Our technical team will analyze your challenge and current systems.</div>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">2</div>
            <div>
              <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 4px;">Solution Design Call</div>
              <div style="color: #9ca3af; font-size: 14px; line-height: 1.5;">We'll schedule a call to discuss the best AI solution architecture for your needs.</div>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">3</div>
            <div>
              <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 4px;">Custom Proposal</div>
              <div style="color: #9ca3af; font-size: 14px; line-height: 1.5;">Receive a detailed proposal with technical specs, timeline, and pricing.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 28px;">
        <p style="margin: 0; color: #d1d5db; font-size: 15px; line-height: 1.6;">
          💡 <strong style="color: #ffffff;">Pro Tip:</strong> While you wait, check out our case studies to see how we've built custom AI solutions for other businesses in tourism and hospitality!
        </p>
      </div>

      <!-- Help Section -->
      <div style="text-align: center; padding-top: 12px;">
        <p style="margin: 0 0 12px; color: #9ca3af; font-size: 14px;">
          Have questions in the meantime?
        </p>
        <p style="margin: 0;">
          <a href="mailto:info@jengu.ai" style="color: #818cf8; text-decoration: none; font-weight: 600;">info@jengu.ai</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: rgba(0, 0, 0, 0.3); padding: 32px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.2);">
      <p style="margin: 0 0 8px; color: #ffffff; font-size: 16px; font-weight: 600;">
        Jengu AI
      </p>
      <p style="margin: 0 0 16px; color: #9ca3af; font-size: 13px;">
        AI Automation for Tourism & Hospitality
      </p>
      <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 16px;">
        <a href="https://jengu.ai" style="color: #818cf8; text-decoration: none; font-size: 13px;">Website</a>
        <span style="color: #4b5563;">•</span>
        <a href="https://jengu.ai/services" style="color: #818cf8; text-decoration: none; font-size: 13px;">Services</a>
        <span style="color: #4b5563;">•</span>
        <a href="https://jengu.ai/case-studies" style="color: #818cf8; text-decoration: none; font-size: 13px;">Case Studies</a>
      </div>
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} Jengu AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const emailMessage = {
    message: {
      subject: 'We\'re excited to build your custom AI solution!',
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      from: {
        emailAddress: {
          address: 'hello@jengu.ai',
          name: 'Jengu AI'
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: data.email,
            name: data.fullName
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
