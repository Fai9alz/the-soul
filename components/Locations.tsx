"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const locationData = [
  {
    name:   "Soul Hittin",
    logo:   "/logo-soul-hittin-transparent.png",
    status: "available" as const,
    bg:     "linear-gradient(160deg, #2a2018 0%, #3e2e1e 35%, #4a3825 65%, #332416 100%)",
  },
  {
    name:   "Soul Al-Wadi",
    logo:   "/logo-soul-alwadi-transparent.png",
    status: "coming-soon" as const,
    bg:     "linear-gradient(160deg, #1a1e18 0%, #26301e 35%, #2e3a24 65%, #202816 100%)",
  },
];

export default function Locations() {
  const { t } = useLanguage();

  // Localised area labels aligned with locationData indices
  const areaLabels = [
    t.soulHittin.locationLabel,  // "Hittin · Riyadh" / "حطين · الرياض"
    "Al Wadi · Riyadh",          // static for now
  ];

  return (
    <section id="locations">
      {locationData.map((loc, i) => (
        <div
          key={loc.name}
          className="relative flex flex-col items-center justify-end overflow-hidden"
          style={{ minHeight: "100svh", background: loc.bg }}
        >
          {/* Top label — only on first block */}
          {i === 0 && (
            <div className="absolute top-10 left-0 right-0 flex justify-center">
              <p
                className="text-[0.55rem] uppercase tracking-[0.35em]"
                style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.3 }}
              >
                {t.locations.sectionLabel}
              </p>
            </div>
          )}

          {/* Index number — top right */}
          <div className="absolute top-10 right-8 md:right-12">
            <span
              className="text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.22 }}
            >
              0{i + 1} / 02
            </span>
          </div>

          {/* Dark gradient — bottom-heavy for legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(16,11,7,0.88) 0%, rgba(16,11,7,0.22) 45%, transparent 100%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center pb-20 text-center px-6 md:pb-28">
            {/* Area */}
            <p
              className="mb-5 text-[0.54rem] uppercase tracking-[0.36em]"
              style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.45 }}
            >
              {areaLabels[i]}
            </p>

            {/* Logo */}
            <Image
              src={loc.logo}
              alt={loc.name}
              width={1278}
              height={301}
              className="mb-7"
              quality={100}
              unoptimized
              style={{
                width:     "clamp(220px, 38vw, 420px)",
                height:    "auto",
                objectFit: "contain",
              }}
            />

            {/* Thin rule */}
            <div
              className="mb-7 h-px w-10"
              style={{ backgroundColor: "var(--bg)", opacity: 0.2 }}
            />

            {/* CTA or status */}
            {loc.status === "available" ? (
              <Link
                href="/soul-hittin"
                className="cta-location"
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "0.6rem",
                  fontWeight:    500,
                  textTransform: "uppercase",
                }}
              >
                {t.locations.exploreResidences}
              </Link>
            ) : (
              <span
                className="text-[0.54rem] uppercase tracking-[0.36em]"
                style={{ fontFamily: "var(--font-sans)", color: "var(--bg)", opacity: 0.3 }}
              >
                {t.locations.comingSoon}
              </span>
            )}
          </div>

          {/* Scroll hint on first block */}
          {i === 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="h-6 w-px" style={{ backgroundColor: "var(--bg)", opacity: 0.15 }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
