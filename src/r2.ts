export async function getObject(
  bucket: R2Bucket,
  key: string,
  request: Request,
): Promise<Response | null> {
  const object = await bucket.get(key, {
    onlyIf: request.headers,
    range: request.headers,
  });

  if (!object) return null;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  if (object.uploaded) {
    headers.set("last-modified", object.uploaded.toUTCString());
  }

  if (!("body" in object) || object.body === null) {
    return new Response(null, { status: 304, headers });
  }

  if (object.range) {
    const range = object.range as { offset: number; length: number };
    headers.set(
      "content-range",
      `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`,
    );
    return new Response(object.body, { status: 206, headers });
  }

  return new Response(object.body, { status: 200, headers });
}
