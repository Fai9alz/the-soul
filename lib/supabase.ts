import { createBrowserClient } from "@supabase/ssr";

// Browser (client-component) Supabase client.
// Uses cookie-based session storage so middleware can read the auth state.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);
