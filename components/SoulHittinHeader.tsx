"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SoulHittinHeader() {
  const { t } = useLanguage();

  return (
    <div
      className="relative flex flex-col items-center justify-end overflow-hidden"
      style={{
        minHeight: "52svh",
        background:
          "linear-gradient(160deg, #2a2018 0%, #3e2e1e 35%, #4a3825 65%, #332416 100%)",
        paddingTop: "64px",
      }}
    >
      {/* Bottom-heavy overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(16,11,7,0.88) 0%, rgba(16,11,7,0.2) 50%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center pb-14 text-center px-6">
        <p
          style={{
            fontFamily:    "var(--font-sans)",
            fontSize:      "0.52rem",
            textTransform: "uppercase",
            letterSpacing: "0.36em",
            color:         "var(--bg)",
            opacity:       0.38,
            marginBottom:  "18px",
          }}
        >
          {t.soulHittin.locationLabel}
        </p>

        <Image
          src="/logo-soul-hittin-transparent.png"
          alt={t.soulHittin.heading}
          width={1211}
          height={305}
          priority
          quality={100}
          unoptimized
          style={{
            width:        "clamp(220px, 38vw, 420px)",
            height:       "auto",
            objectFit:    "contain",
            marginBottom: "28px",
          }}
        />

        <div
          style={{
            height:          "1px",
            width:           "40px",
            backgroundColor: "var(--bg)",
            opacity:         0.2,
            marginBottom:    "20px",
          }}
        />

        <p
          style={{
            fontFamily:    "var(--font-sans)",
            fontSize:      "0.54rem",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            color:         "var(--bg)",
            opacity:       0.36,
          }}
        >
          {t.soulHittin.priceLabel}
        </p>
      </div>
    </div>
  );
}
