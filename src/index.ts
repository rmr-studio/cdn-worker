import type { Env } from "./types";
import { resolveObjectKey } from "./paths";
import { getCacheControl } from "./cache-control";
import { applySecurityHeaders, handleCors } from "./headers";
import { isRefererAllowed } from "./hotlink";
import { getObject } from "./r2";

function errorResponse(status: number, message: string): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  applySecurityHeaders(headers);
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return errorResponse(405, "Method not allowed");
    }

    const responseHeaders = new Headers();
    applySecurityHeaders(responseHeaders);
    const corsResponse = handleCors(request, responseHeaders, env.ALLOWED_ORIGINS);
    if (corsResponse) return corsResponse;

    if (!isRefererAllowed(request, env.ALLOWED_REFERERS)) {
      return errorResponse(403, "Forbidden");
    }

    const url = new URL(request.url);
    const key = resolveObjectKey(url.pathname, env.PATH_PREFIX);
    if (!key) {
      return errorResponse(400, "Invalid path");
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const objectResponse = await getObject(env.BUCKET, key, request);
    if (!objectResponse) {
      return errorResponse(404, "Not found");
    }

    objectResponse.headers.set("cache-control", getCacheControl(key));
    applySecurityHeaders(objectResponse.headers);
    handleCors(request, objectResponse.headers, env.ALLOWED_ORIGINS);

    if (objectResponse.status === 200) {
      ctx.waitUntil(cache.put(cacheKey, objectResponse.clone()));
    }

    if (request.method === "HEAD") {
      return new Response(null, {
        status: objectResponse.status,
        headers: objectResponse.headers,
      });
    }

    return objectResponse;
  },
} satisfies ExportedHandler<Env>;
