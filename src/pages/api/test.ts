import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const envCheck = {
    hasTenantId: !!import.meta.env.TENANT_ID,
    hasClientId: !!import.meta.env.CLIENT_ID,
    hasClientSecret: !!import.meta.env.CLIENT_SECRET,
    hasGraphUser: !!import.meta.env.GRAPH_USER,
    tenantIdLength: import.meta.env.TENANT_ID?.length || 0,
    clientIdLength: import.meta.env.CLIENT_ID?.length || 0,
    timestamp: new Date().toISOString(),
    adapter: 'cloudflare'
  };

  return new Response(JSON.stringify(envCheck, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
