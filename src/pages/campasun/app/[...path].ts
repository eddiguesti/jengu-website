import type { APIRoute } from 'astro';
export const prerender = false;
const upstream = 'https://campasun-jengu-demo.edd-guest.workers.dev';
export const ALL: APIRoute = async ({request}) => {
  const url = new URL(request.url);
  const target = new URL(upstream);
  target.pathname = url.pathname.slice('/campasun/app'.length) || '/';
  target.search = url.search;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-campasun-base-path', '/campasun/app');
  const response = await fetch(target, {
    method: request.method, headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });
  return new Response(response.body, {status:response.status, headers:response.headers});
};
