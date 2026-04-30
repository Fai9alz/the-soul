"use client";

// ─── FAL License Badge ────────────────────────────────────────────────────────
// Displays the FAL + REGA logo and license number.
// Place the logo image at: /public/fal-rega-logo.png
// ─────────────────────────────────────────────────────────────────────────────

export default function FalLicenseBadge() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* FAL + REGA logo */}
      <img
        src="/fal-rega-logo.png"
        alt="FAL — REGA Real Estate General Authority"
        style={{ height: 52, width: "auto", objectFit: "contain" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />

      {/* License number */}
      <p
        style={{
          fontFamily:    "var(--font-sans)",
          color:         "var(--muted)",
          fontSize:      "0.72rem",
          letterSpacing: "0.04em",
          fontWeight:    300,
          direction:     "rtl",
        }}
      >
        رخصة فال رقم: 1200012219
      </p>
    </div>
  );
}
