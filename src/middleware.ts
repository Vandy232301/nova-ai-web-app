import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://calendar.google.com https://calendar.app.google https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.vandy.ro",
      "frame-src https://calendar.google.com https://calendar.app.google https://js.stripe.com https://checkout.stripe.com",
    ].join("; ")
  );
  
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff|woff2)$/)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", "99");
  }

  // Supabase session refresh + auth redirects
  const supabaseResponse = await updateSession(request, response);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
