"use client";

// ─── The Soul — Language Switcher ─────────────────────────────────────────────
// Minimal AR / EN toggle that matches the luxury nav aesthetic.
// Drop it anywhere inside <LanguageProvider>.
// ─────────────────────────────────────────────────────────────────────────────

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const base: React.CSSProperties = {
    fontFamily:    "var(--font-sans)",
    fontSize:      "0.6rem",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    background:    "none",
    border:        "none",
    cursor:        "pointer",
    padding:       "2px 0",
    color:         "var(--bg)",
    lineHeight:    1,
    transition:    "opacity 0.2s",
  };

  return (
    <div
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "7px",
      }}
    >
      <button
        onClick={() => setLocale("ar")}
        style={{ ...base, opacity: locale === "ar" ? 0.88 : 0.28 }}
        aria-label="Switch to Arabic"
        aria-pressed={locale === "ar"}
      >
        AR
      </button>

      <span
        aria-hidden
        style={{
          color:     "var(--bg)",
          opacity:   0.18,
          fontSize:  "0.5rem",
          lineHeight: 1,
        }}
      >
        |
      </span>

      <button
        onClick={() => setLocale("en")}
        style={{ ...base, opacity: locale === "en" ? 0.88 : 0.28 }}
        aria-label="Switch to English"
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
