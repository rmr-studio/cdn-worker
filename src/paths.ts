export function resolveObjectKey(
  pathname: string,
  pathPrefix: string,
): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded.includes("..") || decoded.includes("\\") || decoded.includes("\0")) {
    return null;
  }

  let key = decoded.replace(/\/\/+/g, "/").replace(/^\/+|\/+$/g, "");

  if (pathPrefix) {
    const prefix = pathPrefix.replace(/^\/+|\/+$/g, "");
    if (!key.startsWith(prefix)) {
      return null;
    }
    key = key.slice(prefix.length).replace(/^\/+/, "");
  }

  return key || null;
}
