"use client";

// ─── /apply-now ──────────────────────────────────────────────────────────────
// Dedicated public landing route for marketing campaigns. Auto-opens the
// global ApplicationForm via ApplyContext on mount, with no unit selected
// (general application). When the user closes the form, returns to home.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApply } from "@/contexts/ApplyContext";

export default function ApplyNowPage() {
  const router            = useRouter();
  const { openApply, isOpen } = useApply();
  const wasOpenRef        = useRef(false);

  // Open the form immediately on mount (general application — no unit).
  useEffect(() => {
    openApply();
  }, [openApply]);

  // Track when the form has actually been open, then redirect home only
  // after the user closes it. Avoids a race where the redirect fires before
  // the open state has propagated.
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      router.replace("/");
    }
  }, [isOpen, router]);

  // The ApplicationForm renders itself as a fixed full-screen overlay via
  // ApplyProvider, so this page only needs a neutral backdrop underneath.
  return (
    <main
      style={{
        minHeight:       "100vh",
        background:      "#f2ede5",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
      }}
    >
      <p
        style={{
          fontFamily:    "var(--font-sans)",
          fontSize:      "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          color:         "rgba(42,32,24,0.5)",
        }}
      >
        The Soul · Application
      </p>
    </main>
  );
}
