"use client";

// ─── The Soul — Language Context ──────────────────────────────────────────────
// Provides locale, direction, and the full translation object to all client
// components via useLanguage().
//
// • Locale is persisted in localStorage under the key "soul-locale".
// • Switching locale instantly updates dir + lang on <html>.
// • Default is "en" (LTR). Arabic switches to "rtl".
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, type Locale, type TranslationDict } from "@/lib/i18n";

// ── Context shape ─────────────────────────────────────────────────────────────

interface LangCtx {
  locale:    Locale;
  setLocale: (l: Locale) => void;
  t:         TranslationDict;
  dir:       "ltr" | "rtl";
}

const LanguageContext = createContext<LangCtx | null>(null);

const STORAGE_KEY = "soul-locale";

// ── Provider ──────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // ── Read persisted preference on first mount ────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "ar" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      // localStorage may be blocked (SSR guard, privacy mode, etc.)
    }
  }, []);

  // ── Apply dir + lang to <html> whenever locale changes ─────────────────
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir  = dir;
  }, [locale]);

  // ── Public setter — persists to localStorage ────────────────────────────
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore write errors
    }
  };

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  const t: TranslationDict  = translations[locale] as unknown as TranslationDict;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLanguage(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage() must be used inside <LanguageProvider>");
  return ctx;
}
