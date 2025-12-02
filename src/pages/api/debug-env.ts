import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = locals.runtime;

  return new Response(
    JSON.stringify({
      hasRuntime: !!runtime,
      hasEnv: !!runtime?.env,
      envKeys: runtime?.env ? Object.keys(runtime.env) : [],
      localsKeys: Object.keys(locals),
      runtimeType: typeof runtime,
      envType: typeof runtime?.env,
    }, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
