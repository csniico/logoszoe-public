import { NextRequest, NextResponse } from "next/server";

// Server-side only - never sent to the browser
const BACKEND = process.env.API_URL ?? "http://localhost:3001";

// Forward every method to the backend
async function handler(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const url = `${BACKEND}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host"); // don't forward the Next.js host header

  const res = await fetch(url, {
    method:  request.method,
    headers,
    body:    request.method !== "GET" && request.method !== "HEAD"
               ? await request.arrayBuffer()
               : undefined,
    // Don't follow redirects - pass them straight back to the client
    redirect: "manual",
  });

  // Stream the response back, forwarding status + headers
  const responseHeaders = new Headers(res.headers);
  // Remove hop-by-hop headers that aren't valid in a proxied response.
  responseHeaders.delete("transfer-encoding");
  // Node's fetch auto-decodes compressed bodies, so the body we forward is
  // already plain text/JSON. Strip these to prevent the browser from trying
  // to decompress what is already decoded (ERR_CONTENT_DECODING_FAILED).
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length"); // decoded length differs from compressed

  return new NextResponse(res.body, {
    status:  res.status,
    headers: responseHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;
