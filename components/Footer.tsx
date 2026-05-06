"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Footer — Claude Design "The Soul"
// Dark 4-column footer: brand + 3 link columns + bottom bar.

export default function Footer() {
  const { locale, setLocale } = useLanguage();
  const isAr = locale === "ar";

  const colHeader: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(214,205,187,.5)",
    marginBottom: 22,
  };

  const linkStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    lineHeight: 2,
    color: "var(--beige)",
    opacity: 0.78,
    textDecoration: "none",
    fontFamily: "var(--font-sans)",
    transition: "opacity .3s, color .3s",
  };

  return (
    <footer
      style={{
        background: "#0c0907",
        color: "var(--beige)",
        padding: "80px 0 36px",
      }}
    >
      <div
        className="soul-footer-top"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: 60,
          padding: "0 24px 60px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <Link href="/" aria-label="The Soul" style={{ display: "inline-block" }}>
            <Image
              src="/design/logo-thesoul-uploaded.png"
              alt="The Soul"
              width={1400}
              height={420}
              quality={100}
              style={{ height: 42, width: "auto", objectFit: "contain" }}
            />
          </Link>
          <p
            style={{
              marginTop: 24,
              fontSize: 14,
              lineHeight: 1.7,
              opacity: 0.6,
              maxWidth: 340,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isAr
              ? "مجتمع سكني طويل الأمد في الرياض. يُدار بهدوء، ويُصمَّم بنية، ويسكنه من يلاحظ التفاصيل."
              : "A long-term living community in Riyadh. Operated quietly, designed deliberately, occupied by people who notice."}
          </p>
        </div>

        <div>
          <h5 style={colHeader}>{isAr ? "المساكن" : "Residences"}</h5>
          <Link href="/soul-hittin" style={linkStyle}>
            {isAr ? "سول حطين" : "Soul Hittin"}
          </Link>
          <Link href="#apply" style={linkStyle}>
            {isAr ? "سول كافد" : "Soul KAFD"}
          </Link>
          <Link href="#apply" style={linkStyle}>
            {isAr ? "سول الوادي" : "Soul Alwadi"}
          </Link>
          <Link href="#residences" style={linkStyle}>
            {isAr ? "المخططات" : "Floor plans"}
          </Link>
        </div>

        <div>
          <h5 style={colHeader}>{isAr ? "الشركة" : "Company"}</h5>
          <Link href="#about" style={linkStyle}>{isAr ? "نبذة" : "About"}</Link>
          <Link href="#about" style={linkStyle}>{isAr ? "التشغيل" : "Operations"}</Link>
          <Link href="#about" style={linkStyle}>{isAr ? "إعلام" : "Press"}</Link>
          <Link href="#about" style={linkStyle}>{isAr ? "الوظائف" : "Careers"}</Link>
          <Link href="#apply" style={linkStyle}>{isAr ? "تواصل" : "Contact"}</Link>
        </div>

        <div>
          <h5 style={colHeader}>{isAr ? "تواصل معنا" : "Get in touch"}</h5>
          <a href="mailto:Reservations_AH@oaktree.sa" style={linkStyle}>Reservations_AH@oaktree.sa</a>
          <a
            href="https://www.instagram.com/thesoulksa?igsh=ZXY5YTRteTYxYzQy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, marginTop: 12 }}
          >
            Instagram
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div
        className="soul-footer-bot"
        style={{
          padding: "32px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          flexWrap: "wrap",
          gap: 20,
          fontFamily: "var(--font-mono)",
        }}
      >
        <div>{isAr ? "© ٢٠٢٦ · ذا سول · جميع الحقوق محفوظة" : "© 2026 · The Soul · All rights reserved"}</div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <Link href="#about" style={{ color: "inherit", textDecoration: "none" }}>
            {isAr ? "الخصوصية" : "Privacy"}
          </Link>
          <Link href="#about" style={{ color: "inherit", textDecoration: "none" }}>
            {isAr ? "الشروط" : "Terms"}
          </Link>
          <button
            type="button"
            onClick={() => setLocale(isAr ? "en" : "ar")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontFamily: "inherit",
              fontSize: "inherit",
              letterSpacing: "inherit",
              textTransform: "inherit",
              padding: 0,
            }}
          >
            EN · AR
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.soul-footer-top) {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 560px) {
          :global(.soul-footer-top) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
