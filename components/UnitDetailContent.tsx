"use client";

import Link from "next/link";
import UnitCTAs         from "@/components/UnitCTAs";
import UnitImageGallery from "@/components/UnitImageGallery";
import UnitHeroBg       from "@/components/UnitHeroBg";
import { useLanguage }  from "@/contexts/LanguageContext";
import { getStatusLabel, getTypeLabel } from "@/lib/i18n";

// ── Palette ────────────────────────────────────────────────────────────────────
const BG      = "#d6cdbb";
const DARK    = "#2a2018";
const HEADING = "#7b4227";
const MUTED60 = "rgba(42,32,24,0.60)";
const MUTED42 = "rgba(42,32,24,0.42)";
const MUTED28 = "rgba(42,32,24,0.28)";
const DIVIDER = "rgba(42,32,24,0.10)";

function statusColor(status: string) {
  if (status === "Available") return "#4a7a3e";
  if (status === "Reserved")  return "#c54e24";
  return "rgba(214,203,187,0.55)";
}

function formatPrice(price: number) {
  return price.toLocaleString("en-US") + " SAR / year";
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  id:               string;
  name:             string;
  unitRef:          string;
  type:             string;
  bedrooms:         number;
  bathrooms:        number;
  area:             number;
  floor:            number;
  price:            number;
  status:           string;
  description:      string;
  homeFeatures:     string[];
  buildingFeatures: string[];
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function UnitDetailContent({
  name, unitRef, type, bedrooms, bathrooms, area, floor, price, status,
  description, homeFeatures, buildingFeatures,
}: Props) {
  const { t } = useLanguage();
  const ud     = t.unitDetail;

  const heroBg =
    "linear-gradient(160deg, #2a2018 0%, #3e2e1e 35%, #4a3825 65%, #332416 100%)";

  return (
    <>
      {/* ── Hero (dark) ──────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-start justify-end overflow-hidden"
        style={{ minHeight: "65svh", background: heroBg, paddingTop: "64px" }}
      >
        {/* Real photo — fetched client-side, fades in over the gradient */}
        <UnitHeroBg unitRef={unitRef} />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(16,11,7,0.93) 0%, rgba(16,11,7,0.35) 55%, transparent 100%)",
          }}
        />

        {/* Back link */}
        <div
          className="absolute z-10"
          style={{ top: "88px", left: "clamp(24px, 5vw, 64px)" }}
        >
          <Link
            href="/soul-hittin"
            style={{
              fontFamily:     "var(--font-sans)",
              fontSize:       "0.52rem",
              textTransform:  "uppercase",
              letterSpacing:  "0.28em",
              color:          "var(--bg)",
              opacity:        0.45,
              textDecoration: "none",
            }}
          >
            {ud.backLink}
          </Link>
        </div>

        {/* Hero text */}
        <div
          className="relative z-10 w-full max-w-3xl"
          style={{ padding: "0 clamp(24px, 5vw, 64px) 56px" }}
        >
          {/* Status + Ref */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}
          >
            <span
              style={{
                fontFamily:      "var(--font-sans)",
                fontSize:        "0.5rem",
                textTransform:   "uppercase",
                letterSpacing:   "0.22em",
                padding:         "4px 10px",
                backgroundColor: "rgba(16,11,7,0.72)",
                color:           statusColor(status),
                backdropFilter:  "blur(4px)",
              }}
            >
              {getStatusLabel(status, t)}
            </span>
            <span
              style={{
                fontFamily:    "var(--font-sans)",
                fontSize:      "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color:         "rgba(214,203,187,0.32)",
              }}
            >
              {unitRef}
            </span>
          </div>

          {/* Breadcrumb */}
          <p
            style={{
              fontFamily:    "var(--font-sans)",
              fontSize:      "0.52rem",
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              color:         "var(--bg)",
              opacity:       0.38,
              marginBottom:  "14px",
            }}
          >
            {getTypeLabel(type, t)} · {t.soulHittin.heading} · {t.soulHittin.locationLabel}
          </p>

          {/* Unit name */}
          <h1
            style={{
              fontFamily:    "var(--font-serif)",
              fontWeight:    400,
              lineHeight:    1,
              color:         "var(--bg)",
              fontSize:      "clamp(2.2rem, 7vw, 4rem)",
              letterSpacing: "0.03em",
            }}
          >
            {name}
          </h1>
        </div>
      </div>

      {/* ── Body (light) ─────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "880px",
          margin:   "0 auto",
          padding:  "clamp(48px, 8vw, 80px) clamp(24px, 5vw, 64px)",
          color:    DARK,
        }}
      >

        {/* ── Gallery ────────────────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom:  "52px",
            paddingBottom: "40px",
            borderBottom:  `1px solid ${DIVIDER}`,
          }}
        >
          <UnitImageGallery unitRef={unitRef} />
        </div>

        {/* ── Annual rent ────────────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom:  "52px",
            paddingBottom: "40px",
            borderBottom:  `1px solid ${DIVIDER}`,
          }}
        >
          <p
            style={{
              fontFamily:    "var(--font-sans)",
              fontSize:      "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color:         MUTED42,
              marginBottom:  "10px",
            }}
          >
            {ud.annualRent}
          </p>
          <p
            style={{
              fontFamily:    "var(--font-serif)",
              fontSize:      "clamp(1.8rem, 5vw, 2.6rem)",
              letterSpacing: "0.02em",
              color:         HEADING,
            }}
          >
            {formatPrice(price)}
          </p>
        </div>

        {/* ── Specs grid ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap:                 "28px 48px",
            marginBottom:        "52px",
            paddingBottom:       "40px",
            borderBottom:        `1px solid ${DIVIDER}`,
          }}
          className="sm:grid-cols-4"
        >
          {[
            { label: ud.bedrooms,  value: String(bedrooms)  },
            { label: ud.bathrooms, value: String(bathrooms) },
            { label: ud.area,      value: `${area} ${t.units.specs.sqm}` },
            { label: ud.floor,     value: String(floor)     },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  color:         MUTED42,
                  marginBottom:  "8px",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily:    "var(--font-serif)",
                  fontSize:      "1.6rem",
                  color:         HEADING,
                  letterSpacing: "0.02em",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── About this residence ───────────────────────────────────────────── */}
        {(description || homeFeatures.length > 0 || buildingFeatures.length > 0) && (
          <div
            style={{
              marginBottom:  "52px",
              paddingBottom: "40px",
              borderBottom:  `1px solid ${DIVIDER}`,
            }}
          >
            {/* Section label */}
            <p
              style={{
                fontFamily:    "var(--font-sans)",
                fontSize:      "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color:         MUTED42,
                marginBottom:  "20px",
              }}
            >
              {ud.aboutResidence}
            </p>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontFamily:   "var(--font-sans)",
                  fontSize:     "0.875rem",
                  lineHeight:   1.9,
                  color:        MUTED60,
                  maxWidth:     "56ch",
                  marginBottom: (homeFeatures.length > 0 || buildingFeatures.length > 0) ? "36px" : 0,
                }}
              >
                {description}
              </p>
            )}

            {/* Home Features */}
            {homeFeatures.length > 0 && (
              <div style={{ marginBottom: buildingFeatures.length > 0 ? "32px" : 0 }}>
                <p
                  style={{
                    fontFamily:    "var(--font-sans)",
                    fontSize:      "0.48rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.26em",
                    color:         MUTED28,
                    marginBottom:  "16px",
                  }}
                >
                  {ud.homeFeatures}
                </p>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: "14px 48px" }}
                >
                  {homeFeatures.map((feat) => (
                    <div
                      key={feat}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, color: MUTED42 }}>
                        <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span
                        style={{
                          fontFamily:    "var(--font-sans)",
                          fontSize:      "0.6rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.16em",
                          color:         MUTED60,
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Building Features */}
            {buildingFeatures.length > 0 && (
              <div>
                <p
                  style={{
                    fontFamily:    "var(--font-sans)",
                    fontSize:      "0.48rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.26em",
                    color:         MUTED28,
                    marginBottom:  "16px",
                  }}
                >
                  {ud.buildingFeatures}
                </p>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: "14px 48px" }}
                >
                  {buildingFeatures.map((feat) => (
                    <div
                      key={feat}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, color: MUTED42 }}>
                        <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span
                        style={{
                          fontFamily:    "var(--font-sans)",
                          fontSize:      "0.6rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.16em",
                          color:         MUTED60,
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CTAs ───────────────────────────────────────────────────────────── */}
        <UnitCTAs unitName={name} unitRef={unitRef} />

      </div>
    </>
  );
}
