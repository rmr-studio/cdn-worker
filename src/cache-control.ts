const IMMUTABLE = "public, max-age=31536000, immutable";
const IMAGE = "public, max-age=86400, stale-while-revalidate=604800";
const HTML = "public, no-cache";
const DATA = "public, max-age=300, stale-while-revalidate=60";
const MEDIA = "public, max-age=86400";
const DEFAULT = "public, max-age=3600";

const EXT_MAP: Record<string, string> = {
  ".js": IMMUTABLE,
  ".css": IMMUTABLE,
  ".woff": IMMUTABLE,
  ".woff2": IMMUTABLE,
  ".ttf": IMMUTABLE,
  ".otf": IMMUTABLE,

  ".png": IMAGE,
  ".jpg": IMAGE,
  ".jpeg": IMAGE,
  ".gif": IMAGE,
  ".webp": IMAGE,
  ".avif": IMAGE,
  ".svg": IMAGE,
  ".ico": IMAGE,

  ".html": HTML,
  ".htm": HTML,

  ".json": DATA,
  ".xml": DATA,
  ".csv": DATA,

  ".mp4": MEDIA,
  ".webm": MEDIA,
  ".mp3": MEDIA,
  ".ogg": MEDIA,
};

export function getCacheControl(key: string): string {
  const dot = key.lastIndexOf(".");
  if (dot === -1) return DEFAULT;
  return EXT_MAP[key.slice(dot).toLowerCase()] ?? DEFAULT;
}
