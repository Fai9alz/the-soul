// ─── The Soul — Server-Side Supabase Client ───────────────────────────────────
// Uses createServerClient from @supabase/ssr so it can be called from
// Next.js Server Components, generateMetadata, and Route Handlers.
//
// The cookie helpers are required by @supabase/ssr but session mutation is
// not needed for public data fetching — setAll silently ignores write errors
// that occur from Server Component context.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies }            from "next/headers";

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookie writes are not possible.
            // Safe to ignore; we only need reads for public data.
          }
        },
      },
    },
  );
}
