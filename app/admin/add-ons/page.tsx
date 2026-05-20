"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddOnsPanel from "@/components/admin/AddOnsPanel";

// ─────────────────────────────────────────────────────────────────────────────
// /admin/add-ons — protected by existing middleware (handles auth + redirect).
// Standalone admin route for the Add-ons CRUD panel. Mirrors the top nav of
// the main /admin dashboard, with the Add-ons tab highlighted as active.
// ─────────────────────────────────────────────────────────────────────────────

const SIBLING_TABS: { key: string; label: string }[] = [
  { key: "units",        label: "Units"         },
  { key: "map",          label: "Map Locations" },
  { key: "applications", label: "Applications"  },
];

export default function AdminAddOnsPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Sticky shell — mirrors /admin top nav ─────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">

        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-11 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            The Soul — Admin
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Log out
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex overflow-x-auto scrollbar-none">
          {SIBLING_TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/admin?tab=${key}`}
              className="shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/admin/add-ons"
            className="shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors border-gray-900 text-gray-900"
            aria-current="page"
          >
            Add-ons
          </Link>
          <Link
            href="/admin/add-on-requests"
            className="shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          >
            Add-ons Requests
          </Link>
        </div>
      </div>

      {/* ── Panel content ──────────────────────────────────────────────────── */}
      <AddOnsPanel />
    </div>
  );
}
