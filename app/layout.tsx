import type { Metadata } from "next";
import {
  Playfair_Display,
  Inter,
  Great_Vibes,
  Tajawal,
  Cairo,
} from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// ── Latin / script fonts ──────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets:  ["latin"],
  weight:   ["400", "500"],
  style:    ["normal", "italic"],
  variable: "--font-serif",
  display:  "swap",
});

const inter = Inter({
  subsets:  ["latin"],
  weight:   ["300", "400"],
  variable: "--font-sans",
  display:  "swap",
});

const greatVibes = Great_Vibes({
  subsets:  ["latin"],
  weight:   ["400"],
  variable: "--font-script",
  display:  "swap",
});

// ── Arabic fonts ──────────────────────────────────────────────────────────────
// --font-arabic-sans   (Tajawal) → replaces Inter in RTL
// --font-arabic-serif  (Cairo)   → replaces Playfair Display in RTL

const tajawal = Tajawal({
  subsets:  ["arabic"],
  weight:   ["300", "400", "500", "700"],
  variable: "--font-arabic-sans",
  display:  "swap",
});

const cairo = Cairo({
  subsets:  ["arabic"],
  weight:   ["400", "500", "600"],
  variable: "--font-arabic-serif",
  display:  "swap",
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       "The Soul — Curated Living in Riyadh",
  description: "A carefully curated long-term living community in Riyadh for those who value stillness, quality, and a life lived with intention.",
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={[
        playfair.variable,
        inter.variable,
        greatVibes.variable,
        tajawal.variable,
        cairo.variable,
      ].join(" ")}
    >
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
