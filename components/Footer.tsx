// ─── The Soul — Footer ────────────────────────────────────────────────────────
// Center-aligned, minimal footer shown at the bottom of all public pages.
// Styling mirrors the editorial palette already used elsewhere on the site.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import FalLicenseBadge from "@/components/FalLicenseBadge";

export default function Footer() {
  return (
    <footer
      className="px-6 py-14 sm:px-10 sm:py-16 lg:px-16"
      style={{
        backgroundColor: "var(--bg)",
        borderTop:       "1px solid rgba(42,32,24,0.1)",
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">

        {/* Address */}
        <address
          className="not-italic text-[0.78rem] sm:text-[0.82rem] font-light leading-loose"
          style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
        >
          Building 2195, Prince Muhammad Ibn Abdulaziz Street
          <br />
          North Mather District
          <br />
          Riyadh 12314
          <br />
          Kingdom of Saudi Arabia
        </address>

        {/* FAL License */}
        <div className="mt-9">
          <FalLicenseBadge />
        </div>

        {/* Divider */}
        <div
          className="mt-10 h-px w-16"
          style={{ backgroundColor: "rgba(42,32,24,0.18)" }}
        />

        {/* Copyright */}
        <p
          className="mt-8 text-[0.7rem] sm:text-[0.72rem] font-light tracking-wide"
          style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
        >
          Copyright © 2025 OHG | All Rights Reserved
        </p>

        {/* Legal links */}
        <nav
          className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:gap-4"
          aria-label="Legal"
        >
          <Link
            href="/terms"
            className="text-[0.7rem] sm:text-[0.72rem] font-light uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
          >
            Terms and Conditions
          </Link>
          <span
            className="hidden sm:inline text-[0.7rem]"
            style={{ color: "rgba(42,32,24,0.3)" }}
            aria-hidden="true"
          >
            |
          </span>
          <Link
            href="/privacy"
            className="text-[0.7rem] sm:text-[0.72rem] font-light uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-sans)", color: "var(--muted)" }}
          >
            Privacy Policy
          </Link>
        </nav>

      </div>
    </footer>
  );
}
