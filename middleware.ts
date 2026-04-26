import { createServerClient } from "@supabase/ssr";
import { NextResponse }        from "next/server";
import type { NextRequest }    from "next/server";

export async function middleware(request: NextRequest) {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "[middleware] Missing required environment variables. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (Vercel project settings or .env.local).",
    );
  }

  // Start with a passthrough response so cookies can be forwarded correctly.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagate any updated auth cookies to both the request and response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always call getUser() — this refreshes the session token when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // Authenticated user visiting the login page → send straight to dashboard.
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Unauthenticated user visiting any protected admin route → login.
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  // Run on every /admin route, including subroutes and the login page itself.
  matcher: ["/admin/:path*"],
};
