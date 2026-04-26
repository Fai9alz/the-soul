"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useLanguage();

  // On inner pages, hash links navigate back to home first
  function h(href: string) {
    if (href.startsWith("#") && !isHome) return `/${href}`;
    return href;
  }

  const logoHref = isHome ? "#hero" : "/";

  const hashLinks = [
    { label: t.nav.locations, href: "#locations" },
    { label: t.nav.about,     href: "#about"     },
    { label: t.nav.faq,       href: "#faq"       },
  ];

  const linkStyle: React.CSSProperties = {
    fontFamily:     "var(--font-sans)",
    color:          "var(--bg)",
    fontSize:       "0.68rem",
    textTransform:  "uppercase",
    textDecoration: "none",
    opacity:        0.7,
    transition:     "opacity 0.2s",
  };

  return (
    <>
      {/* ── Fixed nav bar ─────────────────────────────────────────────────── */}
      {/*
        On inner pages the content below the hero becomes light (beige).
        A persistent dark backdrop keeps the beige nav text readable at all
        scroll positions without a JS scroll listener.
      */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 lg:px-16"
        style={
          isHome
            ? undefined
            : { backgroundColor: "rgba(42,32,24,0.92)", backdropFilter: "blur(8px)" }
        }
      >

        {/* Logo */}
        <Link href={logoHref} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image
            src="/logo-light.png"
            alt="The Soul — The Rhythm of Living"
            width={3815}
            height={1126}
            priority
            quality={100}
            unoptimized
            style={{
              width:   "clamp(80px, 14vw, 108px)",
              height:  "auto",
              opacity: 0.9,
            }}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {hashLinks.map((l) => (
            <Link
              key={l.href}
              href={h(l.href)}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.35")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              {l.label}
            </Link>
          ))}

          {/* Residences — desktop */}
          <Link
            href="/soul-hittin"
            style={{
              ...linkStyle,
              opacity: pathname?.startsWith("/soul-hittin") ? 1 : 0.7,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.35")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = pathname?.startsWith("/soul-hittin") ? "1" : "0.7")
            }
          >
            {t.nav.residences}
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Apply to Live */}
          <Link
            href={h("#apply")}
            style={{
              ...linkStyle,
              color:         "var(--brand)",
              opacity:       1,
              borderBottom:  "1px solid var(--brand)",
              paddingBottom: "2px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.55")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t.nav.apply}
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 p-1 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-px w-5 transition-all duration-300"
              style={{
                backgroundColor: "var(--bg)",
                transform:
                  open && i === 0 ? "rotate(45deg) translateY(5px)"
                  : open && i === 2 ? "rotate(-45deg) translateY(-5px)"
                  : "none",
                opacity: open && i === 1 ? 0 : 0.7,
              }}
            />
          ))}
        </button>
      </nav>

      {/* ── Mobile fullscreen menu ─────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{ backgroundColor: "var(--hero-dark)", gap: "32px" }}
          onClick={() => setOpen(false)}
        >
          {/* Hash links */}
          {hashLinks.map((l) => (
            <Link
              key={l.href}
              href={h(l.href)}
              style={{
                fontFamily:     "var(--font-sans)",
                color:          "var(--bg)",
                fontSize:       "0.875rem",
                textTransform:  "uppercase",
                textDecoration: "none",
                opacity:        0.68,
              }}
            >
              {l.label}
            </Link>
          ))}

          {/* Thin rule */}
          <div style={{ width: "24px", height: "1px", backgroundColor: "rgba(214,203,187,0.15)" }} />

          {/* Soul Hittin Units */}
          <Link
            href="/soul-hittin"
            style={{
              fontFamily:     "var(--font-sans)",
              color:          "var(--bg)",
              fontSize:       "0.875rem",
              textTransform:  "uppercase",
              textDecoration: "none",
              opacity:        0.88,
            }}
          >
            {t.nav.soulHittinUnits}
          </Link>

          {/* Soul Al Wadi — Coming Soon */}
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              style={{
                fontFamily:    "var(--font-sans)",
                color:         "var(--bg)",
                fontSize:      "0.875rem",
                textTransform: "uppercase",
                opacity:       0.28,
              }}
            >
              {t.nav.soulAlWadiUnits}
            </span>
            <span
              style={{
                fontFamily:    "var(--font-sans)",
                color:         "var(--bg)",
                fontSize:      "0.48rem",
                textTransform: "uppercase",
                opacity:       0.2,
              }}
            >
              {t.nav.comingSoon}
            </span>
          </div>

          {/* Thin rule */}
          <div style={{ width: "24px", height: "1px", backgroundColor: "rgba(214,203,187,0.15)" }} />

          {/* Language switcher */}
          <div onClick={(e) => e.stopPropagation()}>
            <LanguageSwitcher />
          </div>

          {/* Apply to Live */}
          <Link
            href={h("#apply")}
            style={{
              fontFamily:     "var(--font-sans)",
              color:          "var(--brand)",
              fontSize:       "0.875rem",
              textTransform:  "uppercase",
              textDecoration: "none",
            }}
          >
            {t.nav.apply}
          </Link>
        </div>
      )}
    </>
  );
}
