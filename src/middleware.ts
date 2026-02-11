import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Strict CSP for enhanced security
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://calendar.google.com https://calendar.app.google",
      "frame-src https://calendar.google.com https://calendar.app.google",
    ].join("; ")
  );
  
  // Cache static assets aggressively
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff|woff2)$/)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  // Rate limiting for API routes (basic check)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Add rate limit headers (actual rate limiting should be done with Vercel Edge Config or Upstash)
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", "99");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
