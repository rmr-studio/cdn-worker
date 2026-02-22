export function applySecurityHeaders(headers: Headers): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
}

export function handleCors(
  request: Request,
  headers: Headers,
  allowedOrigins: string,
): Response | null {
  const origin = request.headers.get("Origin");

  if (allowedOrigins.trim() === "*") {
    headers.set("Access-Control-Allow-Origin", "*");
  } else if (origin) {
    const allowed = allowedOrigins.split(",").map((o) => o.trim());
    if (allowed.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.append("Vary", "Origin");
    }
  }

  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Range, If-None-Match, If-Modified-Since",
    );
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }

  return null;
}
