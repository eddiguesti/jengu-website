/// <reference path="../.astro/types.d.ts" />

type CloudflareEnv = {
  TENANT_ID: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  GRAPH_USER: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {}
}