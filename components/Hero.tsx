"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--hero-dark)" }}
    >
      {/* Eyebrow */}
      <p
        className="mb-10 text-[0.58rem] uppercase tracking-[0.38em]"
        style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.35 }}
      >
        {t.hero.eyebrow}
      </p>

      {/* Logo image — light version for dark background */}
      <Image
        src="/logo-light.png"
        alt="The Soul — The Rhythm of Living"
        width={3815}
        height={1126}
        priority
        quality={100}
        unoptimized
        style={{
          width:   "clamp(220px, 58vw, 420px)",
          height:  "auto",
          opacity: 0.92,
        }}
      />

      {/* Thin rule */}
      <div
        className="mb-9 mt-10 h-px w-12"
        style={{ backgroundColor: "var(--bg)", opacity: 0.15 }}
      />

      {/* Description */}
      <p
        className="max-w-[28ch] text-[0.76rem] font-light leading-[2.3] tracking-wide"
        style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.36 }}
      >
        {t.hero.description.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </p>

      {/* Scroll cue */}
      <a
        href="#locations"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <div className="h-8 w-px" style={{ backgroundColor: "var(--bg)", opacity: 0.18 }} />
        <span
          className="text-[0.5rem] uppercase tracking-[0.32em]"
          style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.22 }}
        >
          {t.hero.scroll}
        </span>
      </a>
    </section>
  );
}
