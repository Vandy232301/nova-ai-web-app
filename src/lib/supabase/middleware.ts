import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Extract locale from path (e.g., /en/dashboard -> en)
  const localeMatch = pathname.match(/^\/(en|ro|fr|de|es|it|ru|zh|ja)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";

  // Protected routes that require authentication
  const protectedPaths = ["/build", "/dashboard", "/order"];
  const isProtected = protectedPaths.some((p) =>
    pathname.replace(`/${locale}`, "").startsWith(p)
  );

  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/auth/login", "/auth/signup"];
  const isAuthPage = authPaths.some((p) =>
    pathname.replace(`/${locale}`, "").startsWith(p)
  );

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}
