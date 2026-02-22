export function isRefererAllowed(
  request: Request,
  allowedReferers: string,
): boolean {
  if (!allowedReferers.trim()) return true;

  const referer = request.headers.get("Referer");
  if (!referer) return true;

  let hostname: string;
  try {
    hostname = new URL(referer).hostname;
  } catch {
    return false;
  }

  const allowed = allowedReferers.split(",").map((r) => r.trim());
  return allowed.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain),
  );
}
