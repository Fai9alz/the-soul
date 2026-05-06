"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDES = [
  "/design/interior-1.jpeg",
  "/design/interior-2.jpeg",
  "/design/interior-3-new.jpeg",
];

const ROTATION_MS = 6000;

/**
 * Hero — Claude Design "The Soul"
 * Fullscreen interior slideshow with crossfade + slow Ken-Burns zoom,
 * dark luxury overlay, top meta strip, wordmark, lede, dual CTA,
 * slide indicator (numeric + bars) and animated scroll cue.
 */
export default function Hero() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (SLIDES.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 780,
        overflow: "hidden",
        color: "var(--beige)",
        background: "var(--ink)",
      }}
    >
      {/* Slides */}
      <div style={{ position: "absolute", inset: 0 }}>
        {SLIDES.map((src, i) => (
          <div
            key={src}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1)" : "scale(1.04)",
              transition: "opacity 1.6s ease, transform 8s ease",
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              quality={100}
              style={{
                objectFit: "cover",
                filter: "brightness(.78) saturate(.92)",
              }}
            />
            {/* dark gradient overlay */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(15,11,8,.55) 0%, rgba(15,11,8,.25) 35%, rgba(15,11,8,.55) 75%, rgba(15,11,8,.92) 100%)",
              }}
            />
            {/* warm corner glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(120% 80% at 80% 20%, rgba(123,66,39,.18), transparent 60%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Top meta strip */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.7,
            lineHeight: 1.8,
          }}
        >
          {isAr ? "الرياض · المملكة العربية السعودية" : "Riyadh · KSA"}
          <br />
          {isAr ? "إقامة طويلة الأمد · 2026" : "Long-term residences · 2026"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.7,
            textAlign: isAr ? "left" : "right",
          }}
        >
          {isAr ? "أسلوب حياة منتقى" : "A curated way of living"}
        </div>
      </div>

      {/* Foreground content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 24px 88px",
        }}
      >
        <div style={{ width: "auto" }}>
          <Image
            src="/design/logo-thesoul-uploaded.png"
            alt="The Soul"
            width={1400}
            height={420}
            quality={100}
            priority
            style={{
              width: "clamp(280px, 38vw, 560px)",
              height: "auto",
              maxHeight: 280,
              objectFit: "contain",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 48,
            gap: 60,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              maxWidth: 420,
              fontSize: 15,
              lineHeight: 1.6,
              color: "rgba(214,205,187,.85)",
              fontWeight: 300,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isAr
              ? "مجتمع سكني طويل الأمد منتقى بعناية — مصمم لمن يؤمن أن البيت رفيق هادئ، في ثلاث من أكثر أحياء الرياض اعتبارًا."
              : "A curated long-term living community for those who believe a home is a quiet companion — designed for the way you actually live, in three of Riyadh's most considered districts."}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link href="#apply" className="soul-btn">
              {isAr ? "قدّم للسكن" : "Apply to live"}{" "}
              <span className="arrow">→</span>
            </Link>
            <Link href="#residences" className="soul-btn is-ghost">
              {isAr ? "استكشف المساكن" : "Explore residences"}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicator */}
      <div
        style={{
          position: "absolute",
          left: 24,
          bottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 14,
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            opacity: 0.7,
          }}
        >
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(SLIDES.length).padStart(2, "0")}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {SLIDES.map((_, i) => (
            <span
              key={`${i}-${i === active ? active : "off"}`}
              className={`soul-bar${i === active ? " is-active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: 0.6,
          zIndex: 5,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{isAr ? "اكتشف" : "Scroll"}</span>
        <span className="soul-cue-line" />
      </div>
    </section>
  );
}
