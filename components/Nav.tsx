"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Top navigation — Claude Design "The Soul" homepage.
 * Visual: fixed, transparent at top of hero, blurred dark when scrolled.
 * Existing routes preserved (#about, #residences/locations, /soul-hittin, #apply).
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { locale, setLocale } = useLanguage();

  // Hash links auto-prefix with `/` on inner pages
  const h = (href: string) =>
    href.startsWith("#") && !isHome ? `/${href}` : href;

  // Reuse existing CTA route (#apply anchor) and existing residences route
  const links = [
    { label: locale === "ar" ? "المواقع"   : "Locations",  href: "#locations"  },
    { label: locale === "ar" ? "نبذة"      : "About",      href: "#about"      },
    { label: locale === "ar" ? "المساكن"   : "Residences", href: "#residences" },
    { label: locale === "ar" ? "تقديم"     : "Apply",      href: "#apply"      },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fixed nav style
  const navStyle: React.CSSProperties = {
    background:      scrolled || !isHome ? "rgba(15,11,8,0.78)" : "transparent",
    backdropFilter:  scrolled || !isHome ? "blur(14px)" : "none",
    WebkitBackdropFilter: scrolled || !isHome ? "blur(14px)" : "none",
    borderBottom:    `1px solid ${scrolled || !isHome ? "var(--line)" : "transparent"}`,
    transition:      "background .5s ease, backdrop-filter .5s ease, border-color .5s ease",
  };

  const linkStyle: React.CSSProperties = {
    fontFamily:     "var(--font-sans)",
    color:          "var(--beige)",
    fontSize:       "12.5px",
    letterSpacing:  "0.18em",
    textTransform:  "uppercase",
    textDecoration: "none",
    opacity:        0.78,
    transition:     "opacity 0.3s",
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{ ...navStyle, padding: "22px 24px" }}
      >
        {/* Logo */}
        <Link
          href={isHome ? "#hero" : "/"}
          aria-label="The Soul"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Image
            src="/design/logo-thesoul-uploaded.png"
            alt="The Soul — The Rhythm of Living"
            width={1400}
            height={420}
            priority
            quality={100}
            style={{ height: 46, width: "auto", objectFit: "contain", filter: "brightness(1.05)" }}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center md:flex" style={{ gap: 38 }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={h(l.href)}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.78")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden items-center md:flex" style={{ gap: 22 }}>
          {/* Lang toggle */}
          <div
            style={{
              display:        "flex",
              gap:            10,
              fontSize:       11,
              letterSpacing:  "0.18em",
              color:          "var(--beige)",
              opacity:        0.6,
              fontFamily:     "var(--font-sans)",
            }}
          >
            <button
              onClick={() => setLocale("en")}
              style={{
                background: "none",
                border:     "none",
                color:      "var(--beige)",
                opacity:    locale === "en" ? 1 : 0.6,
                cursor:     "pointer",
                fontFamily: "inherit",
                letterSpacing: "inherit",
                fontSize:   "inherit",
                padding:    0,
              }}
            >
              EN
            </button>
            <span>·</span>
            <button
              onClick={() => setLocale("ar")}
              style={{
                background: "none",
                border:     "none",
                color:      "var(--beige)",
                opacity:    locale === "ar" ? 1 : 0.6,
                cursor:     "pointer",
                fontFamily: "inherit",
                letterSpacing: "inherit",
                fontSize:   "inherit",
                padding:    0,
              }}
            >
              AR
            </button>
          </div>

          <Link href={h("#apply")} className="soul-btn">
            {locale === "ar" ? "قدّم للسكن" : "Apply to live"}
            <span className="arrow">→</span>
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
                backgroundColor: "var(--beige)",
                transform:
                  open && i === 0 ? "rotate(45deg) translateY(5px)"
                  : open && i === 2 ? "rotate(-45deg) translateY(-5px)"
                  : "none",
                opacity: open && i === 1 ? 0 : 0.85,
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{ backgroundColor: "var(--ink)", gap: 28 }}
          onClick={() => setOpen(false)}
        >
          {links.map((l) => (
            <Link key={l.href} href={h(l.href)} style={{ ...linkStyle, fontSize: 14, opacity: 0.92 }}>
              {l.label}
            </Link>
          ))}
          <div style={{ width: 24, height: 1, backgroundColor: "var(--line)" }} />
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setLocale("en")}
              style={{
                background: "none", border: "none", color: "var(--beige)",
                opacity: locale === "en" ? 1 : 0.6, cursor: "pointer",
                fontSize: 12, letterSpacing: "0.18em",
              }}
            >EN</button>
            <span style={{ color: "var(--beige)", opacity: 0.4 }}>·</span>
            <button
              onClick={() => setLocale("ar")}
              style={{
                background: "none", border: "none", color: "var(--beige)",
                opacity: locale === "ar" ? 1 : 0.6, cursor: "pointer",
                fontSize: 12, letterSpacing: "0.18em",
              }}
            >AR</button>
          </div>
          <Link href={h("#apply")} className="soul-btn">
            {locale === "ar" ? "قدّم للسكن" : "Apply to live"}
            <span className="arrow">→</span>
          </Link>
        </div>
      )}
    </>
  );
}
