"use client";

// ─── The Soul — /soul-hittin unit listing ─────────────────────────────────────
// All data comes directly from Supabase (`units` WHERE project = 'Soul Hittin').
// No static fallback — every admin change is visible on refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSoulHittinUnits, PublicUnit, UnitType } from "@/lib/public-units";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStatusLabel, getTypeLabel, TranslationDict } from "@/lib/i18n";

// ── Palette ───────────────────────────────────────────────────────────────────

const BG       = "#d6cbbb";
const CARD_BG  = "#cec5b4";
const DARK     = "#2a2018";
const MUTED_60 = "rgba(42,32,24,0.60)";
const MUTED_42 = "rgba(42,32,24,0.42)";
const MUTED_30 = "rgba(42,32,24,0.30)";
const DIVIDER  = "rgba(42,32,24,0.10)";
const GAP      = "rgba(42,32,24,0.08)";

// ── Filters ───────────────────────────────────────────────────────────────────
// "Studio" is omitted — the units table has no type column; Studio and
// 1 Bedroom are both derived as "1 Bedroom" (add a type column to restore it).

const ALL = "All" as const;
type Filter = typeof ALL | UnitType;

type FilterEntry = { value: Filter; labelKey: keyof TranslationDict["units"]["filters"] };

const FILTER_ENTRIES: FilterEntry[] = [
  { value: "All",        labelKey: "all"       },
  { value: "1 Bedroom",  labelKey: "bedroom1"  },
  { value: "2 Bedrooms", labelKey: "bedrooms2" },
  { value: "3 Bedrooms", labelKey: "bedrooms3" },
  { value: "Penthouse",  labelKey: "penthouse" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === "Available") return "#4a7a3e";
  if (status === "Reserved")  return "#c54e24";
  return "rgba(214,203,187,0.55)";
}

function formatPrice(price: number) {
  return price.toLocaleString("en-US") + " SAR / year";
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ backgroundColor: CARD_BG }}>
      <div
        style={{
          aspectRatio: "4 / 3",
          background: "linear-gradient(160deg, #2a2018 0%, #3e2e1e 40%, #332416 100%)",
          animation: "shu-pulse 1.6s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ height: 7,  width: "38%", background: DARK, opacity: 0.07, marginBottom: 10, animation: "shu-pulse 1.6s ease-in-out infinite 0.1s" }} />
        <div style={{ height: 17, width: "68%", background: DARK, opacity: 0.09, marginBottom: 14, animation: "shu-pulse 1.6s ease-in-out infinite 0.15s" }} />
        <div style={{ height: 7,  width: "55%", background: DARK, opacity: 0.06, marginBottom: 14, animation: "shu-pulse 1.6s ease-in-out infinite 0.2s" }} />
        <div style={{ height: 1,  background: DIVIDER, marginBottom: 14 }} />
        <div style={{ height: 10, width: "45%", background: DARK, opacity: 0.07, animation: "shu-pulse 1.6s ease-in-out infinite 0.25s" }} />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SoulHittinUnits() {
  const [allUnits, setAllUnits] = useState<PublicUnit[]>([]);
  const [filter,   setFilter]   = useState<Filter>("All");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const { t } = useLanguage();

  function load() {
    setLoading(true);
    setError(false);
    getSoulHittinUnits()
      .then(setAllUnits)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const units =
    filter === "All"
      ? allUnits
      : allUnits.filter((u) => u.type === filter);

  return (
    <div style={{ backgroundColor: BG }} className="min-h-screen">
      <style>{`@keyframes shu-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>

      {/* ── Filter tabs ──────────────────────────────────────────────────────── */}
      <div
        className="sticky top-16 z-10 overflow-x-auto"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${DIVIDER}` }}
      >
        <div className="flex px-6 md:px-10 lg:px-16 py-4 gap-1 min-w-max">
          {FILTER_ENTRIES.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                fontFamily: "var(--font-sans)",
                color: filter === value ? DARK : MUTED_30,
                background: "none",
                border: "none",
                borderBottom: filter === value
                  ? "1px solid rgba(42,32,24,0.45)"
                  : "1px solid transparent",
                cursor: "pointer",
                padding: "0 12px 6px",
                fontSize: "0.56rem",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                transition: "color 0.2s, border-color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {t.units.filters[labelKey]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ──────────────────────────────────────────────────── */}
      {loading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ backgroundColor: GAP }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "80px 24px",
          }}
        >
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.64rem", color: MUTED_42, textAlign: "center" }}>
            {t.units.loadError}
          </p>
          <button
            onClick={load}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.52rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: DARK,
              background: "none",
              border: "1px solid rgba(42,32,24,0.25)",
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            {t.units.retry}
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!loading && !error && units.length === 0 && (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.64rem", color: MUTED_42 }}>
            {allUnits.length === 0 ? t.units.noResidences : t.units.noMatch}
          </p>
        </div>
      )}

      {/* ── Unit grid ────────────────────────────────────────────────────────── */}
      {!loading && !error && units.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ backgroundColor: GAP }}
        >
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/soul-hittin/${unit.ref.toLowerCase()}`}
              className="group block"
              style={{ backgroundColor: CARD_BG, textDecoration: "none" }}
            >
              {/* Image / gradient placeholder */}
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: "4 / 3",
                  background: unit.image
                    ? `url(${unit.image}) center/cover no-repeat`
                    : "linear-gradient(160deg, #2a2018 0%, #3e2e1e 40%, #4a3825 70%, #332416 100%)",
                }}
              >
                {/* Status badge */}
                <div className="absolute top-4 left-4">
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      padding: "4px 10px",
                      backgroundColor: "rgba(16,11,7,0.72)",
                      color: statusColor(unit.status),
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {getStatusLabel(unit.status, t)}
                  </span>
                </div>

                {/* Ref */}
                <div className="absolute top-4 right-4">
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "rgba(214,203,187,0.35)",
                    }}
                  >
                    {unit.ref}
                  </span>
                </div>

                {/* Hover scrim */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: "rgba(16,11,7,0.18)" }}
                />
              </div>

              {/* Card body */}
              <div className="px-6 py-5">
                {/* Type label */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: MUTED_42,
                    marginBottom: "6px",
                  }}
                >
                  {getTypeLabel(unit.type, t)}
                </p>

                {/* Name */}
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.15rem",
                    letterSpacing: "0.02em",
                    color: DARK,
                    fontWeight: 400,
                    lineHeight: 1.25,
                    marginBottom: "16px",
                  }}
                >
                  {unit.name}
                </h3>

                {/* Specs */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "18px" }}>
                  {[
                    `${unit.bedrooms} ${t.units.specs.bed}`,
                    `${unit.bathrooms} ${t.units.specs.bath}`,
                    `${unit.area} ${t.units.specs.sqm}`,
                  ].map((spec) => (
                    <span
                      key={spec}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        color: MUTED_42,
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: DIVIDER, marginBottom: "14px" }} />

                {/* Price */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    color: MUTED_60,
                  }}
                >
                  {formatPrice(unit.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
