import { createBrowserClient } from "@supabase/ssr";

// ── Lazy singleton ────────────────────────────────────────────────────────────
// createBrowserClient MUST NOT be called at module load time because Next.js
// evaluates every imported module during static prerendering (build time).
// When env vars are absent from the build environment the call throws:
//   "@supabase/ssr: Your project's URL and API key are required."
//
// The Proxy below defers client creation until the first property access,
// which only happens in the browser (inside useEffect / event handlers).
// All existing callers (`supabase.from(…)`, `supabase.auth.signIn(…)`, …)
// continue to work without any changes.
// ─────────────────────────────────────────────────────────────────────────────

let _client: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop: string | symbol) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    // Bind methods so `this` is the real client, not the empty proxy target.
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
