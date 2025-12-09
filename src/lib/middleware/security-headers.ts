import { NextResponse } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.scdn.co https://www.youtube.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https://www.youtube.com https://omegaperps.omeganetwork.co; media-src 'self' https: blob:",
};

/**
 * Appends the default security headers to a given Next.js response instance.
 * Useful for API routes that need additional protection beyond the global
 * headers configured in `next.config.ts`.
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Applies cache headers that leverage CDN edge caching with a stale-while-revalidate policy.
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number,
  staleWhileRevalidate: number = maxAge * 2
): NextResponse {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  response.headers.set("Vary", "Accept-Encoding");
  return response;
}

/**
 * Generates a JSON response that automatically includes the Omega Terminal
 * security headers. Additional headers can be supplied for route-specific
 * requirements such as CORS.
 */
export function createSecureResponse(
  data: unknown,
  status = 200,
  additionalHeaders?: Record<string, string>,
  cacheOptions?: { maxAge: number; staleWhileRevalidate?: number }
): NextResponse {
  const response = NextResponse.json(data, { status });

  addSecurityHeaders(response);

  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  if (cacheOptions) {
    addCacheHeaders(
      response,
      cacheOptions.maxAge,
      cacheOptions.staleWhileRevalidate ?? cacheOptions.maxAge * 2
    );
  } else if (status >= 400) {
    addCacheHeaders(response, 0);
  } else {
    addCacheHeaders(response, 60, 120);
  }

  return response;
}

export { SECURITY_HEADERS };
